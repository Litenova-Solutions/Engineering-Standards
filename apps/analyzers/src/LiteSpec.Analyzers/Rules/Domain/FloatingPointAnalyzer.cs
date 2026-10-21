using System.Collections.Immutable;
using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;

namespace LiteSpec.Analyzers.Rules.Domain;

/// <summary>LS1008: Domain keeps double and float out of exact quantities.</summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class FloatingPointAnalyzer : LayerAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        ImmutableArray.Create(Descriptors.LS1008);

    private protected override bool AppliesTo(Layer layer) => layer == Layer.Domain;

    private protected override void Register(CompilationStartAnalysisContext context) =>
        context.RegisterSyntaxNodeAction(
            Analyze,
            SyntaxKind.VariableDeclaration,
            SyntaxKind.PropertyDeclaration,
            SyntaxKind.IndexerDeclaration,
            SyntaxKind.MethodDeclaration,
            SyntaxKind.LocalFunctionStatement,
            SyntaxKind.DelegateDeclaration,
            SyntaxKind.OperatorDeclaration,
            SyntaxKind.ConversionOperatorDeclaration,
            SyntaxKind.Parameter,
            SyntaxKind.ForEachStatement,
            SyntaxKind.DeclarationExpression,
            SyntaxKind.DeclarationPattern);

    private static void Analyze(SyntaxNodeAnalysisContext context)
    {
        var target = Target(context.Node);
        if (target.Type is null || target.Name is not string name || name.Length == 0)
        {
            return;
        }

        ReportFloatingPoint(target.Type, name, context);
    }

    private static (TypeSyntax? Type, string? Name) Target(SyntaxNode node)
    {
        switch (node)
        {
            case VariableDeclarationSyntax declaration:
                return declaration.Variables.Count == 0
                    ? (null, null)
                    : (declaration.Type, declaration.Variables[0].Identifier.ValueText);
            case PropertyDeclarationSyntax property:
                return (property.Type, property.Identifier.ValueText);
            case IndexerDeclarationSyntax indexer:
                return (indexer.Type, "this");
            case MethodDeclarationSyntax method:
                return (method.ReturnType, method.Identifier.ValueText);
            case LocalFunctionStatementSyntax local:
                return (local.ReturnType, local.Identifier.ValueText);
            case DelegateDeclarationSyntax delegateDeclaration:
                return (delegateDeclaration.ReturnType, delegateDeclaration.Identifier.ValueText);
            case OperatorDeclarationSyntax @operator:
                return (@operator.ReturnType, @operator.OperatorToken.Text);
            case ConversionOperatorDeclarationSyntax conversion:
                return (conversion.Type, conversion.ImplicitOrExplicitKeyword.Text);
            case ParameterSyntax parameter:
                return (parameter.Type, parameter.Identifier.ValueText);
            case ForEachStatementSyntax forEach:
                return (forEach.Type, forEach.Identifier.ValueText);
            case DeclarationExpressionSyntax expression:
                return DesignationName(expression.Designation) is string expressionName
                    ? (expression.Type, expressionName)
                    : (null, null);
            case DeclarationPatternSyntax pattern:
                return DesignationName(pattern.Designation) is string patternName
                    ? (pattern.Type, patternName)
                    : (null, null);
            default:
                return (null, null);
        }
    }

    private static string? DesignationName(VariableDesignationSyntax designation) =>
        designation is SingleVariableDesignationSyntax single
            ? single.Identifier.ValueText
            : null;

    private static void ReportFloatingPoint(TypeSyntax type, string name, SyntaxNodeAnalysisContext context)
    {
        if (IsFloatingPoint(type, context))
        {
            context.ReportDiagnostic(Diagnostic.Create(Descriptors.LS1008, type.GetLocation(), name, type.ToString()));
            return;
        }

        foreach (var node in type.DescendantNodes(descendIntoTrivia: false))
        {
            if (node is TypeSyntax nested && node.Parent is not NameSyntax && IsFloatingPoint(nested, context))
            {
                context.ReportDiagnostic(Diagnostic.Create(Descriptors.LS1008, nested.GetLocation(), name, nested.ToString()));
            }
        }
    }

    private static bool IsFloatingPoint(TypeSyntax node, SyntaxNodeAnalysisContext context)
    {
        if (node is IdentifierNameSyntax identifier && identifier.IsVar)
        {
            return false;
        }

        var type = context.SemanticModel.GetTypeInfo(node).Type;
        return type is not null
            && (type.SpecialType == SpecialType.System_Double || type.SpecialType == SpecialType.System_Single);
    }
}
