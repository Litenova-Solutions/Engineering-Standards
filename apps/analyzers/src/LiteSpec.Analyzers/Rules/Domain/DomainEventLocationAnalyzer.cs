using System;
using System.Collections.Immutable;
using System.IO;
using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Diagnostics;

namespace LiteSpec.Analyzers.Rules.Domain;

/// <summary>LS1013: a domain event is declared in a file under its aggregate's Events folder.</summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class DomainEventLocationAnalyzer : LayerAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        ImmutableArray.Create(Descriptors.LS1013);

    private protected override bool AppliesTo(Layer layer) => layer == Layer.Domain;

    private protected override void Register(CompilationStartAnalysisContext context) =>
        context.RegisterSymbolAction(Analyze, SymbolKind.NamedType);

    private static void Analyze(SymbolAnalysisContext context)
    {
        var type = (INamedTypeSymbol)context.Symbol;
        if (type.TypeKind == TypeKind.Interface || !ImplementsDomainEvent(type))
        {
            return;
        }

        var filePath = LocationPath(type);
        if (filePath.Length == 0 || IsUnderEventsFolder(filePath))
        {
            return;
        }

        context.ReportDiagnostic(Diagnostic.Create(
            Descriptors.LS1013, type.Locations[0], type.Name, Path.GetFileName(filePath)));
    }

    private static bool ImplementsDomainEvent(INamedTypeSymbol type)
    {
        foreach (var contract in type.AllInterfaces)
        {
            if (contract.Name == "IDomainEvent")
            {
                return true;
            }
        }

        return false;
    }

    private static string LocationPath(INamedTypeSymbol type)
    {
        if (type.Locations.Length == 0)
        {
            return string.Empty;
        }

        return type.Locations[0].SourceTree?.FilePath ?? string.Empty;
    }

    private static bool IsUnderEventsFolder(string filePath)
    {
        foreach (var segment in filePath.Split('/', '\\'))
        {
            if (segment.Equals("Events", StringComparison.Ordinal))
            {
                return true;
            }
        }

        return false;
    }
}
