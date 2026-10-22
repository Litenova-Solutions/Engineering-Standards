using System.Collections.Generic;
using System.Collections.Immutable;
using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Diagnostics;

namespace LiteSpec.Analyzers.Rules.Style;

/// <summary>LS3004: production C# seals every concrete class that nothing derives from.</summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class SealedClassAnalyzer : LayerAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        ImmutableArray.Create(Descriptors.LS3004);

    private protected override bool AppliesTo(Layer layer) => layer != Layer.None && layer != Layer.Test;

    private protected override void Register(CompilationStartAnalysisContext context) =>
        context.RegisterCompilationEndAction(Analyze);

    private static void Analyze(CompilationAnalysisContext context)
    {
        var types = new List<INamedTypeSymbol>();
        CollectTypes(context.Compilation.Assembly.GlobalNamespace, types);

        var derived = new HashSet<INamedTypeSymbol>(SymbolEqualityComparer.Default);
        foreach (var type in types)
        {
            if (type.TypeKind == TypeKind.Class && type.BaseType is not null)
            {
                derived.Add(type.BaseType.OriginalDefinition);
            }
        }

        foreach (var type in types)
        {
            if (IsSealableLeaf(type) && !derived.Contains(type.OriginalDefinition))
            {
                context.ReportDiagnostic(Diagnostic.Create(Descriptors.LS3004, type.Locations[0], type.Name));
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

    private static bool IsSealableLeaf(INamedTypeSymbol type)
    {
        if (type.DeclaringSyntaxReferences.Length == 0
            || type.TypeKind != TypeKind.Class
            || type.IsRecord
            || type.IsAbstract
            || type.IsStatic
            || type.IsSealed)
        {
            return false;
        }

        return !DesignedForExtension(type);
    }

    private static bool DesignedForExtension(INamedTypeSymbol type)
    {
        foreach (var member in type.GetMembers())
        {
            if (member.IsVirtual || (member.IsOverride && !member.IsSealed) || IsProtected(member))
            {
                return true;
            }
        }

        return false;
    }

    private static bool IsProtected(ISymbol member) =>
        member.DeclaredAccessibility == Accessibility.Protected
        || member.DeclaredAccessibility == Accessibility.ProtectedOrInternal
        || member.DeclaredAccessibility == Accessibility.ProtectedAndInternal;
}
