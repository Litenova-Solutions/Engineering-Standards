using System;
using System.Collections.Immutable;
using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Diagnostics;
using Microsoft.CodeAnalysis.Operations;

namespace LiteSpec.Analyzers.Rules.Domain;

/// <summary>LS1005 and LS1006: Domain rejects business violations with sealed DomainException subclasses.</summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class DomainExceptionAnalyzer : LayerAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        ImmutableArray.Create(Descriptors.LS1005, Descriptors.LS1006);

    private protected override bool AppliesTo(Layer layer) => layer == Layer.Domain;

    private protected override void Register(CompilationStartAnalysisContext context)
    {
        var compilation = context.Compilation;
        var exceptionType = compilation.GetTypeByMetadataName("System.Exception");
        var argumentExceptionType = compilation.GetTypeByMetadataName("System.ArgumentException");
        var unreachableExceptionType = compilation.GetTypeByMetadataName("System.Diagnostics.UnreachableException");

        context.RegisterSymbolAction(
            symbolContext => AnalyzeType(symbolContext, exceptionType),
            SymbolKind.NamedType);
        context.RegisterOperationAction(
            operationContext => AnalyzeThrow(operationContext, exceptionType, argumentExceptionType, unreachableExceptionType),
            OperationKind.Throw);
    }

    private static void AnalyzeType(SymbolAnalysisContext context, INamedTypeSymbol? exceptionType)
    {
        var type = (INamedTypeSymbol)context.Symbol;
        if (type.TypeKind != TypeKind.Class || type.IsAbstract)
        {
            return;
        }

        if (exceptionType is null || !HasDomainExceptionAncestor(type.BaseType, exceptionType))
        {
            return;
        }

        if (!type.IsSealed || !type.Name.EndsWith("Exception", StringComparison.Ordinal))
        {
            context.ReportDiagnostic(Diagnostic.Create(Descriptors.LS1006, type.Locations[0], type.Name));
        }
    }

    private static void AnalyzeThrow(
        OperationAnalysisContext context,
        INamedTypeSymbol? exceptionType,
        INamedTypeSymbol? argumentExceptionType,
        INamedTypeSymbol? unreachableExceptionType)
    {
        var thrown = ((IThrowOperation)context.Operation).Exception;
        if (thrown is null)
        {
            return;
        }

        while (thrown is IConversionOperation conversion)
        {
            thrown = conversion.Operand;
        }

        if (thrown is ILocalReferenceOperation || thrown is IParameterReferenceOperation)
        {
            return;
        }

        var thrownType = thrown.Type as INamedTypeSymbol;
        if (thrownType is null)
        {
            return;
        }

        if (exceptionType is not null && HasDomainExceptionAncestor(thrownType, exceptionType))
        {
            return;
        }

        if (DerivesFromOrEquals(thrownType, argumentExceptionType)
            || DerivesFromOrEquals(thrownType, unreachableExceptionType))
        {
            return;
        }

        context.ReportDiagnostic(Diagnostic.Create(Descriptors.LS1005, thrown.Syntax.GetLocation(), thrownType.Name));
    }

    private static bool HasDomainExceptionAncestor(INamedTypeSymbol? start, INamedTypeSymbol exceptionType)
    {
        for (var current = start; current is not null; current = current.BaseType)
        {
            if (current.Name == "DomainException" && DerivesFromOrEquals(current, exceptionType))
            {
                return true;
            }
        }

        return false;
    }

    private static bool DerivesFromOrEquals(ITypeSymbol? type, INamedTypeSymbol? baseType)
    {
        if (type is null || baseType is null)
        {
            return false;
        }

        for (var current = type as INamedTypeSymbol; current is not null; current = current.BaseType)
        {
            if (SymbolEqualityComparer.Default.Equals(current, baseType))
            {
                return true;
            }
        }

        return false;
    }
}
