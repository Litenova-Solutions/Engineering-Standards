using System;
using System.Collections.Immutable;
using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Diagnostics;
using Microsoft.CodeAnalysis.Operations;

namespace LiteSpec.Analyzers.Rules.Tests;

/// <summary>LS4001: a test method contains at least one assertion.</summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class TestAssertionAnalyzer : LayerAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        ImmutableArray.Create(Descriptors.LS4001);

    private protected override bool AppliesTo(Layer layer) => layer == Layer.Test;

    private protected override void Register(CompilationStartAnalysisContext context) =>
        context.RegisterOperationBlockAction(Analyze);

    private static void Analyze(OperationBlockAnalysisContext context)
    {
        if (context.OwningSymbol is not IMethodSymbol method
            || !IsTestMethod(method)
            || ContainsAssertion(context))
        {
            return;
        }

        context.ReportDiagnostic(Diagnostic.Create(Descriptors.LS4001, method.Locations[0], method.Name));
    }

    private static bool IsTestMethod(IMethodSymbol method)
    {
        foreach (var attribute in method.GetAttributes())
        {
            if (IsTestAttribute(attribute.AttributeClass))
            {
                return true;
            }
        }

        return false;
    }

    private static bool IsTestAttribute(INamedTypeSymbol? attribute)
    {
        if (attribute is null)
        {
            return false;
        }

        var name = attribute.Name;
        const string suffix = "Attribute";
        if (name.EndsWith(suffix, StringComparison.Ordinal))
        {
            name = name.Substring(0, name.Length - suffix.Length);
        }

        return name is "Fact" or "Theory" or "Test" or "TestCase" or "TestCaseSource" or "TestMethod" or "DataTestMethod";
    }

    private static bool ContainsAssertion(OperationBlockAnalysisContext context)
    {
        foreach (var block in context.OperationBlocks)
        {
            foreach (var operation in block.Descendants())
            {
                if (operation is IInvocationOperation invocation && IsAssertion(invocation.TargetMethod))
                {
                    return true;
                }
            }
        }

        return false;
    }

    private static bool IsAssertion(IMethodSymbol target) =>
        target.ContainingType.Name == "Assert"
        || target.Name.StartsWith("Assert", StringComparison.Ordinal);
}
