using System;
using System.Collections.Immutable;
using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Diagnostics;

namespace LiteSpec.Analyzers.Rules.Layers;

/// <summary>LS2001: Application, Infrastructure and WebApi keep implementation types internal sealed.</summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class ImplementationVisibilityAnalyzer : LayerAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        ImmutableArray.Create(Descriptors.LS2001);

    private protected override bool AppliesTo(Layer layer) =>
        layer == Layer.Application || layer == Layer.Infrastructure || layer == Layer.WebApi;

    private protected override void Register(CompilationStartAnalysisContext context) =>
        context.RegisterSymbolAction(Analyze, SymbolKind.NamedType);

    private static void Analyze(SymbolAnalysisContext context)
    {
        var type = (INamedTypeSymbol)context.Symbol;
        if (type.TypeKind != TypeKind.Class || type.IsAbstract)
        {
            return;
        }

        if (!IsImplementation(type) || (type.IsSealed && IsHidden(type)))
        {
            return;
        }

        context.ReportDiagnostic(Diagnostic.Create(Descriptors.LS2001, type.Locations[0], type.Name));
    }

    private static bool IsImplementation(INamedTypeSymbol type)
    {
        if (HasImplementationSuffix(type.Name))
        {
            return true;
        }

        foreach (var contract in type.AllInterfaces)
        {
            if (contract.Name is "IEndpoint" or "ICommandHandler" or "IQueryHandler" or "IEventHandler" or "IValidator")
            {
                return true;
            }
        }

        return false;
    }

    private static bool HasImplementationSuffix(string name) =>
        name.EndsWith("Handler", StringComparison.Ordinal)
        || name.EndsWith("PostHandler", StringComparison.Ordinal)
        || name.EndsWith("PreHandler", StringComparison.Ordinal)
        || name.EndsWith("Validator", StringComparison.Ordinal)
        || name.EndsWith("Endpoint", StringComparison.Ordinal)
        || name.EndsWith("Definition", StringComparison.Ordinal)
        || name.EndsWith("Repository", StringComparison.Ordinal)
        || name.EndsWith("Configuration", StringComparison.Ordinal)
        || name.EndsWith("Projection", StringComparison.Ordinal);

    private static bool IsHidden(INamedTypeSymbol type) =>
        type.DeclaredAccessibility is Accessibility.Private
            or Accessibility.Internal
            or Accessibility.ProtectedAndInternal
            or Accessibility.NotApplicable;
}
