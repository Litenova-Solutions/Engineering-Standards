using System.Collections.Immutable;
using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Diagnostics;

namespace LiteSpec.Analyzers.Rules.Domain;

/// <summary>LS1002: Domain models a closed set as a record hierarchy, never an enum.</summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class DomainEnumAnalyzer : LayerAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        ImmutableArray.Create(Descriptors.LS1002);

    private protected override bool AppliesTo(Layer layer) => layer == Layer.Domain;

    private protected override void Register(CompilationStartAnalysisContext context) =>
        context.RegisterSymbolAction(Analyze, SymbolKind.NamedType);

    private static void Analyze(SymbolAnalysisContext context)
    {
        var type = (INamedTypeSymbol)context.Symbol;
        if (type.TypeKind == TypeKind.Enum)
        {
            context.ReportDiagnostic(Diagnostic.Create(Descriptors.LS1002, type.Locations[0], type.Name));
        }
    }
}
