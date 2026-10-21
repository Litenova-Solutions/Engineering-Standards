using System;
using System.Collections.Immutable;
using System.Text;
using System.Text.RegularExpressions;
using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;

namespace LiteSpec.Analyzers.Rules.Domain;

/// <summary>LS1011: every public Domain type and member carries XML documentation.</summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class DomainDocumentationAnalyzer : LayerAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        ImmutableArray.Create(Descriptors.LS1011);

    private protected override bool AppliesTo(Layer layer) => layer == Layer.Domain;

    private protected override void Register(CompilationStartAnalysisContext context) =>
        context.RegisterSyntaxNodeAction(
            Analyze,
            SyntaxKind.ClassDeclaration,
            SyntaxKind.StructDeclaration,
            SyntaxKind.InterfaceDeclaration,
            SyntaxKind.RecordDeclaration,
            SyntaxKind.RecordStructDeclaration,
            SyntaxKind.EnumDeclaration,
            SyntaxKind.DelegateDeclaration,
            SyntaxKind.MethodDeclaration,
            SyntaxKind.PropertyDeclaration,
            SyntaxKind.EventDeclaration,
            SyntaxKind.EventFieldDeclaration,
            SyntaxKind.FieldDeclaration,
            SyntaxKind.ConstructorDeclaration);

    private static void Analyze(SyntaxNodeAnalysisContext context)
    {
        switch (context.Node)
        {
            case TypeDeclarationSyntax type:
                CheckSymbol(type.Identifier, context.SemanticModel.GetDeclaredSymbol(type), type, context);
                break;
            case EnumDeclarationSyntax @enum:
                CheckSymbol(@enum.Identifier, context.SemanticModel.GetDeclaredSymbol(@enum), @enum, context);
                break;
            case DelegateDeclarationSyntax @delegate:
                CheckSymbol(@delegate.Identifier, context.SemanticModel.GetDeclaredSymbol(@delegate), @delegate, context);
                break;
            case MethodDeclarationSyntax method:
                CheckSymbol(method.Identifier, context.SemanticModel.GetDeclaredSymbol(method), method, context);
                break;
            case PropertyDeclarationSyntax property:
                CheckSymbol(property.Identifier, context.SemanticModel.GetDeclaredSymbol(property), property, context);
                break;
            case EventDeclarationSyntax @event:
                CheckSymbol(@event.Identifier, context.SemanticModel.GetDeclaredSymbol(@event), @event, context);
                break;
            case EventFieldDeclarationSyntax eventField:
                foreach (var variable in eventField.Declaration.Variables)
                {
                    CheckSymbol(variable.Identifier, context.SemanticModel.GetDeclaredSymbol(variable), eventField, context);
                }

                break;
            case FieldDeclarationSyntax field:
                foreach (var variable in field.Declaration.Variables)
                {
                    CheckSymbol(variable.Identifier, context.SemanticModel.GetDeclaredSymbol(variable), field, context);
                }

                break;
            case ConstructorDeclarationSyntax constructor:
                CheckSymbol(constructor.Identifier, context.SemanticModel.GetDeclaredSymbol(constructor), constructor, context);
                break;
        }
    }

    private static void CheckSymbol(SyntaxToken identifier, ISymbol? symbol, SyntaxNode documentation, SyntaxNodeAnalysisContext context)
    {
        if (identifier.IsMissing || symbol is null || !RequiresDocumentation(symbol))
        {
            return;
        }

        if (!HasDocumentation(documentation, identifier))
        {
            context.ReportDiagnostic(Diagnostic.Create(Descriptors.LS1011, identifier.GetLocation(), identifier.ValueText));
        }
    }

    private static bool RequiresDocumentation(ISymbol symbol)
    {
        if (symbol is INamedTypeSymbol type)
        {
            return IsPubliclyVisible(type);
        }

        if (symbol.ContainingType is null || !IsPubliclyVisible(symbol.ContainingType))
        {
            return false;
        }

        if (symbol.DeclaredAccessibility is not (Accessibility.Public or Accessibility.Protected or Accessibility.ProtectedOrInternal))
        {
            return false;
        }

        switch (symbol)
        {
            case IMethodSymbol method:
                return !method.IsOverride
                    && method.ExplicitInterfaceImplementations.Length == 0
                    && method.MethodKind is MethodKind.Ordinary or MethodKind.Constructor;
            case IPropertySymbol property:
                return !property.IsOverride && property.ExplicitInterfaceImplementations.Length == 0;
            case IEventSymbol @event:
                return !@event.IsOverride && @event.ExplicitInterfaceImplementations.Length == 0;
            case IFieldSymbol:
                return true;
            default:
                return false;
        }
    }

    private static bool IsPubliclyVisible(INamedTypeSymbol type)
    {
        for (var current = type; current is not null; current = current.ContainingType)
        {
            if (current.DeclaredAccessibility != Accessibility.Public)
            {
                return false;
            }
        }

        return true;
    }

    private static bool HasDocumentation(SyntaxNode node, SyntaxToken identifier)
    {
        // Without a documentation file the compiler parses "///" as ordinary comments, so those
        // lines are gathered and read as text; with one, the structured comment is read.
        StringBuilder? plain = null;
        foreach (var trivia in node.DescendantTrivia(descendIntoTrivia: false))
        {
            if (trivia.Span.Start >= identifier.Span.Start)
            {
                break;
            }

            if ((trivia.IsKind(SyntaxKind.SingleLineDocumentationCommentTrivia)
                || trivia.IsKind(SyntaxKind.MultiLineDocumentationCommentTrivia))
                && Documents(trivia))
            {
                return true;
            }

            if (trivia.IsKind(SyntaxKind.SingleLineCommentTrivia))
            {
                var text = trivia.ToString();
                if (text.StartsWith("///", StringComparison.Ordinal))
                {
                    (plain ??= new StringBuilder()).Append(text, 3, text.Length - 3).Append('\n');
                }
            }
        }

        return plain is not null && DocumentsPlain(plain.ToString());
    }

    private static readonly Regex FilledSummary = new(@"<summary>\s*\S[\s\S]*?</summary>", RegexOptions.Compiled);

    private static bool DocumentsPlain(string text) =>
        text.IndexOf("<inheritdoc", StringComparison.Ordinal) >= 0 || FilledSummary.IsMatch(text);

    private static bool Documents(SyntaxTrivia trivia)
    {
        if (trivia.GetStructure() is not DocumentationCommentTriviaSyntax comment)
        {
            return false;
        }

        foreach (var content in comment.Content)
        {
            switch (content)
            {
                case XmlElementSyntax element when IsName(element.StartTag.Name, "summary"):
                    if (!string.IsNullOrWhiteSpace(element.Content.ToFullString()))
                    {
                        return true;
                    }

                    break;
                case XmlElementSyntax element when IsName(element.StartTag.Name, "inheritdoc"):
                    return true;
                case XmlEmptyElementSyntax empty when IsName(empty.Name, "inheritdoc"):
                    return true;
            }
        }

        return false;
    }

    private static bool IsName(XmlNameSyntax name, string expected) =>
        name.LocalName.ValueText.Equals(expected, StringComparison.Ordinal);
}
