using System.Collections.Immutable;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Diagnostics;
using Microsoft.CodeAnalysis.Text;

namespace LiteSpec.Analyzers.Tests.Support;

/// <summary>
///     Runs one analyzer over C# sources and compares its diagnostics with the spans the
///     sources mark. A marked span reads <c>{|LS1002:Status|}</c>: the diagnostic ID, then
///     the exact text the diagnostic must cover.
/// </summary>
internal static partial class Verify
{
    private static readonly ImmutableArray<MetadataReference> References = LoadReferences();

    /// <summary>Asserts the analyzer reports exactly the marked spans in one file.</summary>
    public static Task AnalyzerAsync<TAnalyzer>(
        string source, string assemblyName = "Shop.Domain", string? layer = null, bool documentationFile = true)
        where TAnalyzer : DiagnosticAnalyzer, new() =>
        AnalyzerAsync<TAnalyzer>([("Source.cs", source)], assemblyName, layer, documentationFile);

    /// <summary>
    ///     Asserts the analyzer reports exactly the marked spans across several files.
    ///     <paramref name="documentationFile"/> false parses as a build without a documentation
    ///     file does, where <c>///</c> lines are ordinary comments.
    /// </summary>
    public static async Task AnalyzerAsync<TAnalyzer>(
        IReadOnlyList<(string Path, string Source)> files,
        string assemblyName = "Shop.Domain",
        string? layer = null,
        bool documentationFile = true)
        where TAnalyzer : DiagnosticAnalyzer, new()
    {
        var expected = new List<string>();
        var trees = new List<SyntaxTree>();
        foreach (var (path, marked) in files)
        {
            var (text, spans) = ParseMarkup(marked);
            var parseOptions = new CSharpParseOptions(
                LanguageVersion.Latest, documentationFile ? DocumentationMode.Parse : DocumentationMode.None);
            var tree = CSharpSyntaxTree.ParseText(SourceText.From(text, Encoding.UTF8), parseOptions, path);
            trees.Add(tree);
            expected.AddRange(spans.Select(span => Describe(span.Id, tree.GetLineSpan(span.Span))));
        }

        var compilation = CSharpCompilation.Create(
            assemblyName,
            trees,
            References,
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, nullableContextOptions: NullableContextOptions.Enable));

        var errors = compilation.GetDiagnostics().Where(d => d.Severity == DiagnosticSeverity.Error).ToList();
        Assert.True(errors.Count == 0, "The test source does not compile:\n" + string.Join("\n", errors));

        var options = new AnalyzerOptions([], new GlobalOptionsProvider(layer));
        var diagnostics = await compilation
            .WithAnalyzers([new TAnalyzer()], options)
            .GetAnalyzerDiagnosticsAsync(TestContext.Current.CancellationToken);

        var actual = diagnostics.Select(d => Describe(d.Id, d.Location.GetLineSpan())).ToList();
        expected.Sort(StringComparer.Ordinal);
        actual.Sort(StringComparer.Ordinal);
        Assert.Equal(expected, actual);
    }

    private static string Describe(string id, FileLinePositionSpan span) =>
        $"{id} {span.Path}({span.StartLinePosition.Line + 1},{span.StartLinePosition.Character + 1})-({span.EndLinePosition.Line + 1},{span.EndLinePosition.Character + 1})";

    private static (string Text, List<(string Id, TextSpan Span)> Spans) ParseMarkup(string marked)
    {
        var text = new StringBuilder();
        var spans = new List<(string Id, TextSpan Span)>();
        var last = 0;
        foreach (Match match in Markup().Matches(marked))
        {
            text.Append(marked, last, match.Index - last);
            var start = text.Length;
            text.Append(match.Groups["text"].Value);
            spans.Add((match.Groups["id"].Value, TextSpan.FromBounds(start, text.Length)));
            last = match.Index + match.Length;
        }

        text.Append(marked, last, marked.Length - last);
        return (text.ToString(), spans);
    }

    [GeneratedRegex(@"\{\|(?<id>LS\d{4}):(?<text>.*?)\|\}", RegexOptions.Singleline)]
    private static partial Regex Markup();

    /// <summary>The running .NET's own assemblies, enough to compile any BCL-only test source.</summary>
    private static ImmutableArray<MetadataReference> LoadReferences()
    {
        var paths = ((string)AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES")!).Split(Path.PathSeparator);
        return [.. paths
            .Where(path => Path.GetFileName(path) is var name
                && (name.StartsWith("System.", StringComparison.Ordinal) || name is "System.dll" or "netstandard.dll" or "mscorlib.dll"))
            .Select(path => (MetadataReference)MetadataReference.CreateFromFile(path))];
    }

    /// <summary>Supplies <c>build_property.LiteSpecLayer</c> when a test sets a layer.</summary>
    private sealed class GlobalOptionsProvider(string? layer) : AnalyzerConfigOptionsProvider
    {
        public override AnalyzerConfigOptions GlobalOptions { get; } = new Options(layer);

        public override AnalyzerConfigOptions GetOptions(SyntaxTree tree) => GlobalOptions;

        public override AnalyzerConfigOptions GetOptions(AdditionalText textFile) => GlobalOptions;

        private sealed class Options(string? layer) : AnalyzerConfigOptions
        {
            public override bool TryGetValue(string key, out string value)
            {
                value = layer ?? string.Empty;
                return layer is not null && key == "build_property.LiteSpecLayer";
            }
        }
    }
}
