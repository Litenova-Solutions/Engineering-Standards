using System;
using System.Collections.Immutable;
using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Diagnostics;

namespace LiteSpec.Analyzers.Rules.Layers;

/// <summary>LS2007: a reaction names its triggering fact and a job names its schedule.</summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class ReactionNamingAnalyzer : LayerAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        ImmutableArray.Create(Descriptors.LS2007);

    private protected override bool AppliesTo(Layer layer) =>
        layer == Layer.Application || layer == Layer.Infrastructure;

    private protected override void Register(CompilationStartAnalysisContext context) =>
        context.RegisterSymbolAction(Analyze, SymbolKind.NamedType);

    private static void Analyze(SymbolAnalysisContext context)
    {
        var type = (INamedTypeSymbol)context.Symbol;
        if (type.TypeKind != TypeKind.Class)
        {
            return;
        }

        if (IsReaction(type) && !HasReactionName(type.Name))
        {
            context.ReportDiagnostic(Diagnostic.Create(
                Descriptors.LS2007, type.Locations[0], type.Name, "reaction", "*Reaction or *On*Handler"));
        }

        if (IsJob(type) && !HasJobName(type.Name))
        {
            context.ReportDiagnostic(Diagnostic.Create(
                Descriptors.LS2007, type.Locations[0], type.Name, "job", "*Job, *Worker, or *Recurring*"));
        }
    }

    private static bool IsReaction(INamedTypeSymbol type)
    {
        foreach (var contract in type.AllInterfaces)
        {
            if (contract.Name is "IEventHandler" or "IDomainEventReaction")
            {
                return true;
            }
        }

        return false;
    }

    private static bool IsJob(INamedTypeSymbol type)
    {
        for (var current = type.BaseType; current != null; current = current.BaseType)
        {
            if (current.Name == "BackgroundService")
            {
                return true;
            }
        }

        foreach (var contract in type.AllInterfaces)
        {
            if (contract.Name == "IHostedService")
            {
                return true;
            }
        }

        return false;
    }

    private static bool HasReactionName(string name)
    {
        if (name.EndsWith("Reaction", StringComparison.Ordinal))
        {
            return true;
        }

        // {Action}On{PastFact}Handler, such as NotifySubscribersOnPostPublishedHandler.
        const string suffix = "Handler";
        if (!name.EndsWith(suffix, StringComparison.Ordinal))
        {
            return false;
        }

        var marker = name.IndexOf("On", StringComparison.Ordinal);
        return marker > 0 && marker + "On".Length < name.Length - suffix.Length;
    }

    private static bool HasJobName(string name) =>
        name.EndsWith("Job", StringComparison.Ordinal)
        || name.EndsWith("Worker", StringComparison.Ordinal)
        || name.Contains("Recurring", StringComparison.Ordinal);
}
