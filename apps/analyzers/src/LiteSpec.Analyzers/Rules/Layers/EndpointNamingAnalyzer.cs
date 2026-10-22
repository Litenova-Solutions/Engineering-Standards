using System;
using System.Collections.Immutable;
using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Diagnostics;

namespace LiteSpec.Analyzers.Rules.Layers;

/// <summary>LS2006: an endpoint implementation ends in Endpoint.</summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class EndpointNamingAnalyzer : LayerAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        ImmutableArray.Create(Descriptors.LS2006);

    private protected override bool AppliesTo(Layer layer) => layer == Layer.WebApi;

    private protected override void Register(CompilationStartAnalysisContext context) =>
        context.RegisterSymbolAction(Analyze, SymbolKind.NamedType);

    private static void Analyze(SymbolAnalysisContext context)
    {
        var type = (INamedTypeSymbol)context.Symbol;
        if (type.TypeKind != TypeKind.Class || !ImplementsEndpoint(type))
        {
            return;
        }

        if (!type.Name.EndsWith("Endpoint", StringComparison.Ordinal))
        {
            context.ReportDiagnostic(Diagnostic.Create(Descriptors.LS2006, type.Locations[0], type.Name));
        }
    }

    private static bool ImplementsEndpoint(INamedTypeSymbol type)
    {
        foreach (var contract in type.AllInterfaces)
        {
            if (contract.Name == "IEndpoint")
            {
                return true;
            }
        }

        return false;
    }
}
