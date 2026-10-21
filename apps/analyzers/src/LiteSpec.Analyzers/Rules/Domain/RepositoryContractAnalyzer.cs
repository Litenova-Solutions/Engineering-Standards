using System;
using System.Collections.Immutable;
using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;

namespace LiteSpec.Analyzers.Rules.Domain;

/// <summary>LS1010: a Domain repository exposes only aggregate and Domain types.</summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class RepositoryContractAnalyzer : LayerAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        ImmutableArray.Create(Descriptors.LS1010);

    private protected override bool AppliesTo(Layer layer) => layer == Layer.Domain;

    private protected override void Register(CompilationStartAnalysisContext context)
    {
        var queryable = context.Compilation.GetTypeByMetadataName("System.Linq.IQueryable");
        var genericQueryable = context.Compilation.GetTypeByMetadataName("System.Linq.IQueryable`1");
        var expression = context.Compilation.GetTypeByMetadataName("System.Linq.Expressions.Expression`1");
        context.RegisterSyntaxNodeAction(
            nodeContext => Analyze(nodeContext, queryable, genericQueryable, expression),
            SyntaxKind.InterfaceDeclaration);
    }

    private static void Analyze(
        SyntaxNodeAnalysisContext context,
        INamedTypeSymbol? queryable,
        INamedTypeSymbol? genericQueryable,
        INamedTypeSymbol? expression)
    {
        var declaration = (InterfaceDeclarationSyntax)context.Node;
        var type = context.SemanticModel.GetDeclaredSymbol(declaration, context.CancellationToken);
        if (type is null || !type.Name.EndsWith("Repository", StringComparison.Ordinal))
        {
            return;
        }

        // A partial interface is judged once as a whole, at its first declaration.
        var first = type.DeclaringSyntaxReferences[0];
        if (first.SyntaxTree == declaration.SyntaxTree && first.Span == declaration.Span && IsGenericRepository(type))
        {
            context.ReportDiagnostic(Diagnostic.Create(Descriptors.LS1010, type.Locations[0], type.Name, "generic repository"));
        }

        foreach (var member in type.GetMembers())
        {
            if (!SymbolEqualityComparer.Default.Equals(member.ContainingType, type))
            {
                continue;
            }

            AnalyzeMember(member, declaration, type.Name, context, queryable, genericQueryable, expression);
        }
    }

    private static bool IsGenericRepository(INamedTypeSymbol type)
    {
        if (!type.IsGenericType)
        {
            return false;
        }

        foreach (var parameter in type.TypeParameters)
        {
            foreach (var member in type.GetMembers())
            {
                if (MemberUses(member, parameter))
                {
                    return true;
                }
            }
        }

        return false;
    }

    private static bool MemberUses(ISymbol member, ITypeParameterSymbol parameter)
    {
        switch (member)
        {
            case IMethodSymbol method when method.MethodKind == MethodKind.Ordinary && method.AssociatedSymbol is null:
                if (Uses(method.ReturnType, parameter))
                {
                    return true;
                }

                foreach (var value in method.Parameters)
                {
                    if (Uses(value.Type, parameter))
                    {
                        return true;
                    }
                }

                return false;
            case IPropertySymbol property:
                return Uses(property.Type, parameter);
            default:
                return false;
        }
    }

    private static bool Uses(ITypeSymbol type, ITypeParameterSymbol parameter)
    {
        if (SymbolEqualityComparer.Default.Equals(type, parameter))
        {
            return true;
        }

        switch (type)
        {
            case INamedTypeSymbol named:
                foreach (var argument in named.TypeArguments)
                {
                    if (Uses(argument, parameter))
                    {
                        return true;
                    }
                }

                return false;
            case IArrayTypeSymbol array:
                return Uses(array.ElementType, parameter);
            default:
                return false;
        }
    }

    private static void AnalyzeMember(
        ISymbol member,
        InterfaceDeclarationSyntax declaration,
        string repository,
        SyntaxNodeAnalysisContext context,
        INamedTypeSymbol? queryable,
        INamedTypeSymbol? genericQueryable,
        INamedTypeSymbol? expression)
    {
        SyntaxNode? syntax = null;
        foreach (var reference in member.DeclaringSyntaxReferences)
        {
            if (reference.SyntaxTree == declaration.SyntaxTree && declaration.Span.Contains(reference.Span))
            {
                syntax = reference.GetSyntax(context.CancellationToken);
                break;
            }
        }

        if (syntax is null)
        {
            return;
        }

        var model = context.SemanticModel;

        switch (member)
        {
            case IMethodSymbol method when method.MethodKind == MethodKind.Ordinary && method.AssociatedSymbol is null:
                if (syntax is MethodDeclarationSyntax methodDeclaration)
                {
                    CheckType(methodDeclaration.ReturnType, isParameter: false, repository, model, queryable, genericQueryable, expression, context);
                    foreach (var parameter in methodDeclaration.ParameterList.Parameters)
                    {
                        if (parameter.Type is not null)
                        {
                            CheckType(parameter.Type, isParameter: true, repository, model, queryable, genericQueryable, expression, context);
                        }
                    }
                }

                break;
            case IPropertySymbol:
                if (syntax is PropertyDeclarationSyntax propertyDeclaration)
                {
                    CheckType(propertyDeclaration.Type, isParameter: false, repository, model, queryable, genericQueryable, expression, context);
                }
                else if (syntax is IndexerDeclarationSyntax indexerDeclaration)
                {
                    CheckType(indexerDeclaration.Type, isParameter: false, repository, model, queryable, genericQueryable, expression, context);
                    foreach (var parameter in indexerDeclaration.ParameterList.Parameters)
                    {
                        if (parameter.Type is not null)
                        {
                            CheckType(parameter.Type, isParameter: true, repository, model, queryable, genericQueryable, expression, context);
                        }
                    }
                }

                break;
            case IEventSymbol:
                if (syntax is EventDeclarationSyntax eventDeclaration)
                {
                    CheckType(eventDeclaration.Type, isParameter: false, repository, model, queryable, genericQueryable, expression, context);
                }
                else if (syntax is EventFieldDeclarationSyntax eventFieldDeclaration)
                {
                    CheckType(eventFieldDeclaration.Declaration.Type, isParameter: false, repository, model, queryable, genericQueryable, expression, context);
                }

                break;
        }
    }

    private static void CheckType(
        TypeSyntax type,
        bool isParameter,
        string repository,
        SemanticModel model,
        INamedTypeSymbol? queryable,
        INamedTypeSymbol? genericQueryable,
        INamedTypeSymbol? expression,
        SyntaxNodeAnalysisContext context)
    {
        if (type.IsMissing)
        {
            return;
        }

        if (Breaches(model.GetTypeInfo(type).Type, isParameter, queryable, genericQueryable, expression))
        {
            context.ReportDiagnostic(Diagnostic.Create(Descriptors.LS1010, type.GetLocation(), repository, type.ToString()));
            return;
        }

        foreach (var child in type.ChildNodes())
        {
            CheckNode(child, isParameter, repository, model, queryable, genericQueryable, expression, context);
        }
    }

    private static void CheckNode(
        SyntaxNode node,
        bool isParameter,
        string repository,
        SemanticModel model,
        INamedTypeSymbol? queryable,
        INamedTypeSymbol? genericQueryable,
        INamedTypeSymbol? expression,
        SyntaxNodeAnalysisContext context)
    {
        if (node is TypeSyntax type)
        {
            CheckType(type, isParameter, repository, model, queryable, genericQueryable, expression, context);
            return;
        }

        foreach (var child in node.ChildNodes())
        {
            CheckNode(child, isParameter, repository, model, queryable, genericQueryable, expression, context);
        }
    }

    private static bool Breaches(
        ITypeSymbol? type,
        bool isParameter,
        INamedTypeSymbol? queryable,
        INamedTypeSymbol? genericQueryable,
        INamedTypeSymbol? expression)
    {
        if (type is not INamedTypeSymbol named)
        {
            return false;
        }

        if (queryable is not null && SymbolEqualityComparer.Default.Equals(named, queryable))
        {
            return true;
        }

        if (genericQueryable is not null && SymbolEqualityComparer.Default.Equals(named.OriginalDefinition, genericQueryable))
        {
            return true;
        }

        foreach (var implemented in named.AllInterfaces)
        {
            if ((queryable is not null && SymbolEqualityComparer.Default.Equals(implemented, queryable))
                || (genericQueryable is not null && SymbolEqualityComparer.Default.Equals(implemented.OriginalDefinition, genericQueryable)))
            {
                return true;
            }
        }

        if (named.Name.EndsWith("Session", StringComparison.Ordinal)
            || named.Name.EndsWith("DbContext", StringComparison.Ordinal)
            || named.Name.EndsWith("DbSet", StringComparison.Ordinal))
        {
            return true;
        }

        return isParameter
            && expression is not null
            && named.TypeArguments.Length == 1
            && SymbolEqualityComparer.Default.Equals(named.OriginalDefinition, expression)
            && named.TypeArguments[0] is INamedTypeSymbol target
            && target.TypeKind == TypeKind.Delegate
            && target.Name == "Func"
            && target.ContainingNamespace is { Name: "System", ContainingNamespace.IsGlobalNamespace: true };
    }
}
