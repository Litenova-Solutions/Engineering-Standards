using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis.Diagnostics;

namespace LiteSpec.Analyzers.Rules;

/// <summary>
///     The base of every LiteSpec analyzer: resolves the compilation's layer once, skips
///     generated code, and registers the rule only in the layers it applies to.
/// </summary>
public abstract class LayerAnalyzer : DiagnosticAnalyzer
{
    /// <inheritdoc />
    public sealed override void Initialize(AnalysisContext context)
    {
        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.EnableConcurrentExecution();
        context.RegisterCompilationStartAction(start =>
        {
            var layer = LayerResolver.Resolve(start.Compilation, start.Options);
            if (layer != Layer.None && AppliesTo(layer))
            {
                Register(start);
            }
        });
    }

    /// <summary>Whether the rule runs in a project of this layer.</summary>
    private protected abstract bool AppliesTo(Layer layer);

    /// <summary>Registers the rule's actions for one compilation.</summary>
    private protected abstract void Register(CompilationStartAnalysisContext context);
}
