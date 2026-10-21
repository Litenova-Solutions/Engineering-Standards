using System.Collections.Immutable;
using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;
using Microsoft.CodeAnalysis.Operations;

namespace LiteSpec.Analyzers.Rules.Domain;

/// <summary>LS1009: Domain receives time, randomness and new identifiers as arguments and reads no clock.</summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class NondeterministicReadAnalyzer : LayerAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        ImmutableArray.Create(Descriptors.LS1009);

    private protected override bool AppliesTo(Layer layer) => layer == Layer.Domain;

    private protected override void Register(CompilationStartAnalysisContext context)
    {
        var types = new WellKnownTypes(context.Compilation);
        context.RegisterOperationAction(types.AnalyzeProperty, OperationKind.PropertyReference);
        context.RegisterOperationAction(types.AnalyzeInvocation, OperationKind.Invocation);
        context.RegisterOperationAction(types.AnalyzeCreation, OperationKind.ObjectCreation);
    }

    private sealed class WellKnownTypes
    {
        private readonly INamedTypeSymbol? _dateTime;
        private readonly INamedTypeSymbol? _dateTimeOffset;
        private readonly INamedTypeSymbol? _timeProvider;
        private readonly INamedTypeSymbol? _guid;
        private readonly INamedTypeSymbol? _environment;
        private readonly INamedTypeSymbol? _stopwatch;
        private readonly INamedTypeSymbol? _random;
        private readonly INamedTypeSymbol? _randomNumberGenerator;

        public WellKnownTypes(Compilation compilation)
        {
            _dateTime = compilation.GetTypeByMetadataName("System.DateTime");
            _dateTimeOffset = compilation.GetTypeByMetadataName("System.DateTimeOffset");
            _timeProvider = compilation.GetTypeByMetadataName("System.TimeProvider");
            _guid = compilation.GetTypeByMetadataName("System.Guid");
            _environment = compilation.GetTypeByMetadataName("System.Environment");
            _stopwatch = compilation.GetTypeByMetadataName("System.Diagnostics.Stopwatch");
            _random = compilation.GetTypeByMetadataName("System.Random");
            _randomNumberGenerator = compilation.GetTypeByMetadataName("System.Security.Cryptography.RandomNumberGenerator");
        }

        public void AnalyzeProperty(OperationAnalysisContext context)
        {
            var reference = (IPropertyReferenceOperation)context.Operation;
            if (!IsNondeterministicProperty(reference.Property))
            {
                return;
            }

            Report(context, reference, MemberLocation(reference.Syntax));
        }

        public void AnalyzeInvocation(OperationAnalysisContext context)
        {
            var invocation = (IInvocationOperation)context.Operation;
            var method = invocation.TargetMethod;
            var containing = method.ContainingType;
            var name = method.Name;
            var nondeterministic =
                IsType(containing, _guid) && (name == "NewGuid" || name == "CreateVersion7")
                || IsType(containing, _stopwatch) && (name == "GetTimestamp" || name == "StartNew")
                || IsType(containing, _randomNumberGenerator);
            if (!nondeterministic)
            {
                return;
            }

            Report(context, invocation, InvocationLocation(invocation));
        }

        public void AnalyzeCreation(OperationAnalysisContext context)
        {
            var creation = (IObjectCreationOperation)context.Operation;
            if (!IsType(creation.Type, _random))
            {
                return;
            }

            Report(context, creation, CreationLocation(creation));
        }

        private bool IsNondeterministicProperty(IPropertySymbol property)
        {
            var containing = property.ContainingType;
            var name = property.Name;
            if (IsType(containing, _dateTime))
            {
                return name == "Now" || name == "UtcNow" || name == "Today";
            }

            if (IsType(containing, _dateTimeOffset))
            {
                return name == "Now" || name == "UtcNow";
            }

            if (IsType(containing, _timeProvider))
            {
                return name == "System";
            }

            if (IsType(containing, _environment))
            {
                return name == "TickCount" || name == "TickCount64";
            }

            if (IsType(containing, _random))
            {
                return name == "Shared";
            }

            return false;
        }

        private static bool IsType(ISymbol? candidate, INamedTypeSymbol? known) =>
            known is not null && SymbolEqualityComparer.Default.Equals(candidate, known);

        private static void Report(OperationAnalysisContext context, IOperation operation, Location location)
        {
            if (IsInsideNameof(operation.Syntax))
            {
                return;
            }

            context.ReportDiagnostic(Diagnostic.Create(Descriptors.LS1009, location, operation.Syntax.ToString()));
        }

        private static bool IsInsideNameof(SyntaxNode syntax)
        {
            for (var node = syntax.Parent; node is not null; node = node.Parent)
            {
                if (node is InvocationExpressionSyntax invocation
                    && invocation.Expression is IdentifierNameSyntax name
                    && name.Identifier.ValueText == "nameof")
                {
                    return true;
                }
            }

            return false;
        }

        private static Location MemberLocation(SyntaxNode syntax) =>
            syntax is MemberAccessExpressionSyntax access ? access.Name.GetLocation() : syntax.GetLocation();

        private static Location InvocationLocation(IInvocationOperation invocation) =>
            invocation.Syntax is InvocationExpressionSyntax syntax && syntax.Expression is MemberAccessExpressionSyntax access
                ? access.Name.GetLocation()
                : invocation.Syntax.GetLocation();

        private static Location CreationLocation(IObjectCreationOperation creation) =>
            creation.Syntax is ObjectCreationExpressionSyntax syntax && !syntax.Type.IsMissing
                ? syntax.Type.GetLocation()
                : creation.Syntax.GetLocation();
    }
}
