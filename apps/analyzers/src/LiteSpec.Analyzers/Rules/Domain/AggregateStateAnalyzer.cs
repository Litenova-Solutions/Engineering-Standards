using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Diagnostics;

namespace LiteSpec.Analyzers.Rules.Domain;

/// <summary>LS1003 and LS1004: an aggregate exposes one State property over an abstract state record with sealed cases.</summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class AggregateStateAnalyzer : LayerAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        ImmutableArray.Create(Descriptors.LS1003, Descriptors.LS1004);

    private protected override bool AppliesTo(Layer layer) => layer == Layer.Domain;

    private protected override void Register(CompilationStartAnalysisContext context) =>
        context.RegisterCompilationEndAction(Analyze);

    private static void Analyze(CompilationAnalysisContext context)
    {
        var types = new List<INamedTypeSymbol>();
        CollectTypes(context.Compilation.Assembly.GlobalNamespace, types);

        var aggregates = new List<INamedTypeSymbol>();
        foreach (var type in types)
        {
            if (IsAggregate(type))
            {
                aggregates.Add(type);
            }
        }

        if (aggregates.Count == 0)
        {
            return;
        }

        var stateBases = FindStateBases(types, aggregates);
        foreach (var aggregate in aggregates)
        {
            if (!HasAbstractRecordState(aggregate))
            {
                context.ReportDiagnostic(Diagnostic.Create(Descriptors.LS1003, aggregate.Locations[0], aggregate.Name));
            }
        }

        foreach (var type in types)
        {
            var stateBase = UnsealedCaseBase(type, stateBases);
            if (stateBase != null)
            {
                context.ReportDiagnostic(Diagnostic.Create(
                    Descriptors.LS1004, type.Locations[0], type.Name, stateBase.Name));
            }
        }
    }

    private static void CollectTypes(INamespaceSymbol space, List<INamedTypeSymbol> types)
    {
        foreach (var member in space.GetTypeMembers())
        {
            CollectType(member, types);
        }

        foreach (var child in space.GetNamespaceMembers())
        {
            CollectTypes(child, types);
        }
    }

    private static void CollectType(INamedTypeSymbol type, List<INamedTypeSymbol> types)
    {
        types.Add(type);
        foreach (var nested in type.GetTypeMembers())
        {
            CollectType(nested, types);
        }
    }

    private static bool IsAggregate(INamedTypeSymbol type)
    {
        if (!IsDeclaredInSource(type) || type.TypeKind != TypeKind.Class || type.IsAbstract)
        {
            return false;
        }

        for (var current = type.BaseType; current != null; current = current.BaseType)
        {
            var definition = current.OriginalDefinition;
            if (definition.TypeKind == TypeKind.Class && definition.Arity == 1 && definition.Name == "AggregateRoot")
            {
                return true;
            }
        }

        return false;
    }

    private static bool HasAbstractRecordState(INamedTypeSymbol aggregate)
    {
        var property = FindStateProperty(aggregate);
        return property != null
            && property.Type is INamedTypeSymbol state
            && state.IsRecord
            && state.TypeKind == TypeKind.Class
            && state.IsAbstract;
    }

    private static IPropertySymbol? FindStateProperty(INamedTypeSymbol aggregate)
    {
        for (var current = aggregate; current != null; current = current.BaseType)
        {
            var definition = current.OriginalDefinition;
            if (definition.TypeKind == TypeKind.Class && definition.Arity == 1 && definition.Name == "AggregateRoot")
            {
                break;
            }

            foreach (var member in current.GetMembers("State"))
            {
                if (!SymbolEqualityComparer.Default.Equals(member.ContainingType, current))
                {
                    continue;
                }

                if (member is IPropertySymbol property)
                {
                    return property;
                }
            }
        }

        return null;
    }

    private static HashSet<INamedTypeSymbol> FindStateBases(
        List<INamedTypeSymbol> types, List<INamedTypeSymbol> aggregates)
    {
        var expectedNames = new HashSet<string>(StringComparer.Ordinal);
        foreach (var aggregate in aggregates)
        {
            expectedNames.Add(aggregate.Name + "State");
        }

        var propertyTypes = new HashSet<INamedTypeSymbol>(SymbolEqualityComparer.Default);
        foreach (var aggregate in aggregates)
        {
            var property = FindStateProperty(aggregate);
            if (property != null
                && property.Type is INamedTypeSymbol state
                && state.IsRecord
                && state.TypeKind == TypeKind.Class
                && state.IsAbstract)
            {
                propertyTypes.Add(state);
            }
        }

        var bases = new HashSet<INamedTypeSymbol>(SymbolEqualityComparer.Default);
        foreach (var type in types)
        {
            if (type.IsRecord
                && type.TypeKind == TypeKind.Class
                && type.IsAbstract
                && type.Name.EndsWith("State", StringComparison.Ordinal)
                && (expectedNames.Contains(type.Name) || propertyTypes.Contains(type)))
            {
                bases.Add(type);
            }
        }

        return bases;
    }

    private static INamedTypeSymbol? UnsealedCaseBase(INamedTypeSymbol type, HashSet<INamedTypeSymbol> stateBases)
    {
        if (!IsDeclaredInSource(type) || type.TypeKind != TypeKind.Class || type.IsAbstract || type.IsSealed)
        {
            return null;
        }

        var baseType = type.BaseType;
        return baseType != null && stateBases.Contains(baseType) ? baseType : null;
    }

    private static bool IsDeclaredInSource(INamedTypeSymbol type) => type.DeclaringSyntaxReferences.Length != 0;
}
