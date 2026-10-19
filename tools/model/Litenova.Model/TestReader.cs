using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace Litenova.Model;

/// <summary>One step call inside a scenario.</summary>
sealed record ScenarioStep(string Phase, string Receiver, string? ReceiverType, string Method);

/// <summary>One acceptance scenario and what it claims.</summary>
sealed record ScenarioInfo(
    string Name,
    string Class,
    string File,
    int Line,
    IReadOnlyList<string> Claims,
    IReadOnlyList<ScenarioStep> Steps,
    IReadOnlyList<string> Codes,
    IReadOnlyList<int> Statuses,
    IReadOnlySet<string> Identifiers);

/// <summary>What the test read found: scenarios and file comments.</summary>
sealed record TestRead(
    IReadOnlyList<ScenarioInfo> Scenarios,
    IReadOnlyList<CodeComment> Comments,
    IReadOnlyDictionary<string, IReadOnlySet<string>> StepCalls);

/// <summary>
///     Reads acceptance scenarios: the case each claims, the steps it runs,
///     and the failure codes it asserts.
/// </summary>
static class TestReader
{
    /// <summary>Reads every scenario and comment under the test roots.</summary>
    public static TestRead Read(ConsumerConfig config)
    {
        var files = new List<string>();

        foreach (var root in config.TestRoots)
        {
            files.AddRange(SourceTree.Files(root, ".cs"));
        }

        var scenarios = new List<ScenarioInfo>();
        var comments = new List<CodeComment>();
        var gate = new object();
        var stepCalls = new System.Collections.Concurrent.ConcurrentDictionary<string, IReadOnlySet<string>>(StringComparer.Ordinal);

        System.Threading.Tasks.Parallel.ForEach(
            files,
            () => (Scenarios: new List<ScenarioInfo>(), Comments: new List<CodeComment>()),
            (file, _, local) =>
            {
                ReadFile(file, local.Scenarios, local.Comments, stepCalls);

                return local;
            },
            local =>
            {
                lock (gate)
                {
                    scenarios.AddRange(local.Scenarios);
                    comments.AddRange(local.Comments);
                }
            });

        return new TestRead(
            [.. scenarios
                .OrderBy(scenario => scenario.File, StringComparer.Ordinal)
                .ThenBy(scenario => scenario.Line)],
            [.. comments
                .OrderBy(comment => comment.File, StringComparer.Ordinal)
                .ThenBy(comment => comment.Line)],
            stepCalls);
    }

    private static void ReadFile(
        string file,
        List<ScenarioInfo> scenarios,
        List<CodeComment> comments,
        System.Collections.Concurrent.ConcurrentDictionary<string, IReadOnlySet<string>> stepCalls)
    {
        SyntaxTree tree;

        try
        {
            tree = CSharpSyntaxTree.ParseText(File.ReadAllText(file), new CSharpParseOptions(LanguageVersion.Preview), file);
        }
        catch (IOException)
        {
            return;
        }

        var root = tree.GetRoot();

        // A steps method names the generated-client operations it calls, such as api.CompleteTicketResaleAsync,
        // so a scenario's when step is joined to the use case it really exercises.
        foreach (var type in root.DescendantNodes().OfType<ClassDeclarationSyntax>()
                     .Where(type => type.Identifier.Text.EndsWith("Steps", StringComparison.Ordinal)))
        {
            foreach (var method in type.Members.OfType<MethodDeclarationSyntax>())
            {
                var called = method.DescendantNodes().OfType<InvocationExpressionSyntax>()
                    .Select(invocation => invocation.Expression)
                    .OfType<MemberAccessExpressionSyntax>()
                    .Select(access => access.Name.Identifier.Text)
                    .Where(name => name.Length > "Async".Length && name.EndsWith("Async", StringComparison.Ordinal))
                    .Select(name => name[..^"Async".Length])
                    .ToHashSet(StringComparer.Ordinal);

                stepCalls.AddOrUpdate(
                    $"{type.Identifier.Text}.{method.Identifier.Text}",
                    called,
                    (_, known) => known.Concat(called).ToHashSet(StringComparer.Ordinal));
            }
        }

        foreach (var token in root.DescendantTokens())
        {
            foreach (var trivia in token.LeadingTrivia.Concat(token.TrailingTrivia))
            {
                if (trivia.Kind() is SyntaxKind.SingleLineCommentTrivia
                    or SyntaxKind.MultiLineCommentTrivia
                    or SyntaxKind.SingleLineDocumentationCommentTrivia
                    or SyntaxKind.MultiLineDocumentationCommentTrivia)
                {
                    var span = tree.GetLineSpan(trivia.Span);

                    comments.Add(new CodeComment(
                        trivia.ToString(), file, span.StartLinePosition.Line + 1));
                }
            }
        }

        foreach (var method in root.DescendantNodes().OfType<MethodDeclarationSyntax>())
        {
            var claims = Identifiers.ProvesTag()
                .Matches(method.GetLeadingTrivia().ToString())
                .Cast<System.Text.RegularExpressions.Match>()
                .Select(match => match.Groups["id"].Value)
                .Distinct(StringComparer.Ordinal)
                .ToList();

            if (claims.Count == 0)
            {
                continue;
            }

            var containing = method.Ancestors().OfType<TypeDeclarationSyntax>().FirstOrDefault();
            var types = containing is null ? new Dictionary<string, string>(StringComparer.Ordinal) : MemberTypes(containing);

            var steps = new List<ScenarioStep>();
            var statuses = new List<int>();
            var body = (SyntaxNode?)method.Body ?? method.ExpressionBody;

            if (body is not null)
            {
                foreach (var lambda in body.DescendantNodes().OfType<SimpleLambdaExpressionSyntax>())
                {
                    AddStep(lambda.Parameter.Identifier.ValueText, lambda.Body, types, steps, statuses);
                }

                foreach (var lambda in body.DescendantNodes().OfType<ParenthesizedLambdaExpressionSyntax>())
                {
                    if (lambda.ParameterList.Parameters is [{ Identifier.ValueText: var phase }])
                    {
                        AddStep(phase, lambda.Body, types, steps, statuses);
                    }
                }
            }

            var codes = new SortedSet<string>(StringComparer.Ordinal);
            var identifiers = new HashSet<string>(StringComparer.Ordinal);
            var scope = body ?? (SyntaxNode)method;

            foreach (var literal in scope.DescendantTokens())
            {
                if (literal.IsKind(SyntaxKind.StringLiteralToken)
                    && literal.Value is string text)
                {
                    foreach (System.Text.RegularExpressions.Match match in Identifiers.FailureCode().Matches(text))
                    {
                        codes.Add(match.Value);
                    }
                }
            }

            foreach (var name in scope.DescendantNodes().OfType<IdentifierNameSyntax>())
            {
                identifiers.Add(name.Identifier.ValueText);
            }

            foreach (var created in scope.DescendantNodes().OfType<ObjectCreationExpressionSyntax>())
            {
                identifiers.Add(created.Type.ToString().Split('<', '.').Last());
            }

            scenarios.Add(new ScenarioInfo(
                method.Identifier.ValueText,
                containing?.Identifier.ValueText ?? "",
                file,
                tree.GetLineSpan(method.Span).StartLinePosition.Line + 1,
                claims,
                steps,
                [.. codes],
                [.. statuses.Distinct().Order()],
                identifiers));
        }
    }

    private static void AddStep(
        string phase,
        CSharpSyntaxNode lambdaBody,
        IReadOnlyDictionary<string, string> types,
        List<ScenarioStep> steps,
        List<int> statuses)
    {
        if (phase is not ("given" or "when" or "then"))
        {
            return;
        }

        if (lambdaBody is InvocationExpressionSyntax invocation)
        {
            steps.Add(ReadStep(phase, invocation, types));

            if (phase == "then")
            {
                foreach (var argument in invocation.ArgumentList.Arguments)
                {
                    if (argument.Expression is LiteralExpressionSyntax literal
                        && literal.Token.Value is int status
                        && status is >= 400 and <= 599)
                    {
                        statuses.Add(status);
                    }
                }
            }
        }
    }

    private static ScenarioStep ReadStep(
        string phase,
        InvocationExpressionSyntax invocation,
        IReadOnlyDictionary<string, string> types)
    {
        if (invocation.Expression is MemberAccessExpressionSyntax member)
        {
            if (member.Expression is IdentifierNameSyntax receiver)
            {
                return new ScenarioStep(
                    phase,
                    receiver.Identifier.ValueText,
                    types.GetValueOrDefault(receiver.Identifier.ValueText),
                    member.Name.Identifier.ValueText);
            }

            if (member.Expression is ObjectCreationExpressionSyntax created)
            {
                return new ScenarioStep(
                    phase,
                    "",
                    created.Type.ToString(),
                    member.Name.Identifier.ValueText);
            }
        }

        return new ScenarioStep(phase, "", null, CalledName(invocation) ?? "");
    }

    private static Dictionary<string, string> MemberTypes(TypeDeclarationSyntax containing)
    {
        var types = new Dictionary<string, string>(StringComparer.Ordinal);

        foreach (var property in containing.Members.OfType<PropertyDeclarationSyntax>())
        {
            types.TryAdd(property.Identifier.ValueText, property.Type.ToString());
        }

        foreach (var field in containing.Members.OfType<FieldDeclarationSyntax>())
        {
            foreach (var variable in field.Declaration.Variables)
            {
                types.TryAdd(variable.Identifier.ValueText, field.Declaration.Type.ToString());
            }
        }

        return types;
    }

    private static string? CalledName(InvocationExpressionSyntax invocation) =>
        invocation.Expression switch
        {
            MemberAccessExpressionSyntax member => member.Name.Identifier.ValueText,
            IdentifierNameSyntax plain => plain.Identifier.ValueText,
            _ => null,
        };
}
