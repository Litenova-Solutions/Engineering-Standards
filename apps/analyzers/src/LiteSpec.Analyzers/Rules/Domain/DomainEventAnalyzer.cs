using System;
using System.Collections.Immutable;
using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Diagnostics;

namespace LiteSpec.Analyzers.Rules.Domain;

/// <summary>LS1007: Domain raises each fact as an immutable record named {Aggregate}{PastFact}Event.</summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class DomainEventAnalyzer : LayerAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        ImmutableArray.Create(Descriptors.LS1007);

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

        if (IsImmutableEventRecord(type))
        {
            return;
        }

        context.ReportDiagnostic(Diagnostic.Create(Descriptors.LS1007, type.Locations[0], type.Name));
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

    private static bool IsImmutableEventRecord(INamedTypeSymbol type)
    {
        if (type.TypeKind != TypeKind.Class || !type.IsRecord)
        {
            return false;
        }

        if (!type.Name.EndsWith("Event", StringComparison.Ordinal))
        {
            return false;
        }

        foreach (var member in type.GetMembers())
        {
            if (member is IPropertySymbol property
                && property.SetMethod is not null
                && !property.SetMethod.IsInitOnly)
            {
                return false;
            }

            if (member is IFieldSymbol field
                && !field.IsImplicitlyDeclared
                && !field.IsStatic
                && !field.IsReadOnly
                && !field.IsConst)
            {
                return false;
            }
        }

        return true;
    }
}
