using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.IO;
using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;

namespace LiteSpec.Analyzers.Rules.Style;

/// <summary>LS3003: a C# file holds one primary top-level type and takes its name.</summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class FileTypeNameAnalyzer : LayerAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        ImmutableArray.Create(Descriptors.LS3003);

    private protected override bool AppliesTo(Layer layer) => layer != Layer.None && layer != Layer.Test;

    private protected override void Register(CompilationStartAnalysisContext context) =>
        context.RegisterSyntaxTreeAction(Analyze);

    private static void Analyze(SyntaxTreeAnalysisContext context)
    {
        var fileName = Path.GetFileNameWithoutExtension(context.Tree.FilePath);
        if (fileName.Length == 0)
        {
            return;
        }

        var expected = fileName;
        var dot = fileName.IndexOf('.');
        if (dot >= 0)
        {
            expected = fileName.Substring(0, dot);
        }

        var found = new List<(string Name, int Arity, Location Location)>();
        var root = context.Tree.GetRoot(context.CancellationToken);
        foreach (var node in root.DescendantNodes())
        {
            var identifier = default(SyntaxToken);
            var arity = 0;
            if (node is BaseTypeDeclarationSyntax typeDeclaration && IsTopLevel(node))
            {
                identifier = typeDeclaration.Identifier;
                arity = typeDeclaration is TypeDeclarationSyntax parameterized
                    ? Count(parameterized.TypeParameterList)
                    : 0;
            }
            else if (node is DelegateDeclarationSyntax delegateDeclaration && IsTopLevel(node))
            {
                identifier = delegateDeclaration.Identifier;
                arity = Count(delegateDeclaration.TypeParameterList);
            }
            else
            {
                continue;
            }

            if (!identifier.IsMissing && !AlreadySeen(found, identifier.ValueText, arity))
            {
                found.Add((identifier.ValueText, arity, identifier.GetLocation()));
            }
        }

        if (found.Count == 0)
        {
            return;
        }

        if (found.Count == 1)
        {
            if (!found[0].Name.Equals(expected, StringComparison.Ordinal))
            {
                context.ReportDiagnostic(Diagnostic.Create(Descriptors.LS3003, found[0].Location, fileName));
            }

            return;
        }

        for (var i = 1; i < found.Count; i++)
        {
            context.ReportDiagnostic(Diagnostic.Create(Descriptors.LS3003, found[i].Location, fileName));
        }
    }

    private static bool IsTopLevel(SyntaxNode node) =>
        node.Parent is CompilationUnitSyntax || node.Parent is BaseNamespaceDeclarationSyntax;

    private static int Count(TypeParameterListSyntax? parameters) =>
        parameters is null ? 0 : parameters.Parameters.Count;

    private static bool AlreadySeen(List<(string Name, int Arity, Location Location)> found, string name, int arity)
    {
        foreach (var seen in found)
        {
            if (seen.Arity == arity && seen.Name == name)
            {
                return true;
            }
        }

        return false;
    }
}
