using System;
using System.Collections.Immutable;
using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Diagnostics;

namespace LiteSpec.Analyzers.Rules.Layers;

/// <summary>LS2005: a command handler ends in CommandHandler and a query handler in QueryHandler.</summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class HandlerNamingAnalyzer : LayerAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        ImmutableArray.Create(Descriptors.LS2005);

    private protected override bool AppliesTo(Layer layer) =>
        layer == Layer.Application || layer == Layer.Infrastructure;

    private protected override void Register(CompilationStartAnalysisContext context) =>
        context.RegisterSymbolAction(Analyze, SymbolKind.NamedType);

    private static void Analyze(SymbolAnalysisContext context)
    {
        var type = (INamedTypeSymbol)context.Symbol;
        if (type.TypeKind != TypeKind.Class)
        {
            return;
        }

        foreach (var contract in type.AllInterfaces)
        {
            if (contract.Name == "ICommandHandler")
            {
                CheckSuffix(context, type, "ICommandHandler", "CommandHandler");
            }
            else if (contract.Name == "IQueryHandler")
            {
                CheckSuffix(context, type, "IQueryHandler", "QueryHandler");
            }
        }
    }

    private static void CheckSuffix(
        SymbolAnalysisContext context, INamedTypeSymbol type, string contract, string suffix)
    {
        if (!type.Name.EndsWith(suffix, StringComparison.Ordinal))
        {
            context.ReportDiagnostic(Diagnostic.Create(
                Descriptors.LS2005, type.Locations[0], type.Name, contract, suffix));
        }
    }
}
