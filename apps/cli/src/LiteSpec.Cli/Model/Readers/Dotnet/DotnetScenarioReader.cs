using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace LiteSpec.Model.Readers.Dotnet;

/// <summary>
///     Reads acceptance scenarios: the case each claims, the steps it runs,
///     and the failure codes it asserts.
/// </summary>
sealed class DotnetScenarioReader : IScenarioReader
{
    /// <summary>Reads every scenario and comment under the test roots.</summary>
    public TestRead Read(ConsumerConfig config)
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
            var methods = type.Members.OfType<MethodDeclarationSyntax>().ToList();
            var direct = methods.ToDictionary(
                method => method,
                method => method.DescendantNodes().OfType<InvocationExpressionSyntax>()
                    .Select(invocation => invocation.Expression)
                    .OfType<MemberAccessExpressionSyntax>()
                    .Select(access => access.Name.Identifier.Text)
                    .Where(name => name.Length > "Async".Length && name.EndsWith("Async", StringComparison.Ordinal))
                    .Select(name => name[..^"Async".Length])
                    .ToHashSet(StringComparer.Ordinal));

            // A step often calls a private helper of its own class that makes the client call, so the
            // operations a helper calls count for every method of the class that invokes it.
            var helpers = methods.GroupBy(method => method.Identifier.Text, StringComparer.Ordinal)
                .ToDictionary(group => group.Key, group => group.ToList(), StringComparer.Ordinal);

            foreach (var method in methods)
            {
                var called = new HashSet<string>(direct[method], StringComparer.Ordinal);
                var seen = new HashSet<MethodDeclarationSyntax> { method };
                var pending = new Queue<MethodDeclarationSyntax>([method]);

                while (pending.Count > 0)
                {
                    foreach (var name in pending.Dequeue().DescendantNodes().OfType<InvocationExpressionSyntax>()
                                 .Select(invocation => invocation.Expression)
                                 .OfType<IdentifierNameSyntax>()
                                 .Select(identifier => identifier.Identifier.Text))
                    {
                        if (!helpers.TryGetValue(name, out var targets))
                        {
                            continue;
                        }

                        foreach (var target in targets.Where(seen.Add))
                        {
                            called.UnionWith(direct[target]);
                            pending.Enqueue(target);
                        }
                    }
                }

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
                    foreach (System.Text.RegularExpressions.Match match in Identifiers.RefusalCode().Matches(text))
                    {
                        codes.Add(match.Value);
                    }
                }
            }

            // An integration test often sends its message from a helper declared in the same file, on its own
            // class or on a world type nested beside it, so what those helpers name counts for the test.
            foreach (var reached in ReachedInFile(scope, root))
            {
                foreach (var name in reached.DescendantNodes().OfType<IdentifierNameSyntax>())
                {
                    identifiers.Add(name.Identifier.ValueText);
                }

                foreach (var created in reached.DescendantNodes().OfType<ObjectCreationExpressionSyntax>())
                {
                    identifiers.Add(created.Type.ToString().Split('<', '.').Last());
                }
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
                identifiers,
                RoutesIn(scope, containing)));
        }
    }

    /// <summary>
    ///     The test's own body and the body of every method declared in the same file that it calls,
    ///     directly or through a member access, followed transitively.
    /// </summary>
    private static List<SyntaxNode> ReachedInFile(SyntaxNode scope, SyntaxNode root)
    {
        var declared = root.DescendantNodes().OfType<MethodDeclarationSyntax>()
            .GroupBy(method => method.Identifier.ValueText, StringComparer.Ordinal)
            .ToDictionary(group => group.Key, group => group.ToList(), StringComparer.Ordinal);
        var reached = new List<SyntaxNode> { scope };
        var seen = new HashSet<SyntaxNode> { scope };
        var pending = new Queue<SyntaxNode>([scope]);

        while (pending.Count > 0)
        {
            foreach (var invocation in pending.Dequeue().DescendantNodes().OfType<InvocationExpressionSyntax>())
            {
                var name = invocation.Expression switch
                {
                    IdentifierNameSyntax identifier => identifier.Identifier.ValueText,
                    MemberAccessExpressionSyntax access => access.Name.Identifier.ValueText,
                    _ => null
                };

                if (name is null || !declared.TryGetValue(name, out var targets))
                {
                    continue;
                }

                foreach (var target in targets)
                {
                    var targetBody = (SyntaxNode?)target.Body ?? target.ExpressionBody;

                    if (targetBody is not null && seen.Add(targetBody))
                    {
                        reached.Add(targetBody);
                        pending.Enqueue(targetBody);
                    }
                }
            }
        }

        return reached;
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

    /// <summary>
    ///     The request paths a test names: string literals beginning with a slash, in the method or in its
    ///     class's constants, with each interpolation hole read as one path parameter.
    /// </summary>
    private static List<string> RoutesIn(SyntaxNode scope, TypeDeclarationSyntax? containing)
    {
        var routes = new SortedSet<string>(StringComparer.Ordinal);
        var nodes = scope.DescendantNodesAndSelf().ToList();

        if (containing is not null)
        {
            nodes.AddRange(containing.Members.OfType<FieldDeclarationSyntax>().SelectMany(field => field.DescendantNodes()));
        }

        foreach (var node in nodes)
        {
            var text = node switch
            {
                LiteralExpressionSyntax literal when literal.IsKind(SyntaxKind.StringLiteralExpression) => literal.Token.ValueText,
                InterpolatedStringExpressionSyntax interpolated => string.Concat(interpolated.Contents.Select(part =>
                    part is InterpolatedStringTextSyntax piece ? piece.TextToken.ValueText : "{}")),
                _ => null,
            };

            if (text is not null && text.StartsWith('/') && text.Length > 1 && !text.Contains(' '))
            {
                routes.Add(text.Split('?')[0]);
            }
        }

        return [.. routes];
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
