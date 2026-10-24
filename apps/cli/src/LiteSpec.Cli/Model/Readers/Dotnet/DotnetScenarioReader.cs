using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace LiteSpec.Model.Readers.Dotnet;

/// <summary>
///     Reads acceptance scenarios: the scenario each claims, the steps it runs,
///     the failure codes it asserts, and whether it asserts anything at all.
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
            var thenBodies = new List<SyntaxNode>();
            var body = (SyntaxNode?)method.Body ?? method.ExpressionBody;

            if (body is not null)
            {
                foreach (var lambda in body.DescendantNodes().OfType<SimpleLambdaExpressionSyntax>())
                {
                    AddStep(lambda.Parameter.Identifier.ValueText, lambda.Body, types, steps, statuses, thenBodies);
                }

                foreach (var lambda in body.DescendantNodes().OfType<ParenthesizedLambdaExpressionSyntax>())
                {
                    if (lambda.ParameterList.Parameters is [{ Identifier.ValueText: var phase }])
                    {
                        AddStep(phase, lambda.Body, types, steps, statuses, thenBodies);
                    }
                }
            }

            var codes = new SortedSet<string>(StringComparer.Ordinal);
            var identifiers = new HashSet<string>(StringComparer.Ordinal);
            var created = new HashSet<string>(StringComparer.Ordinal);
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
            var reached = ReachedInFile(scope, root);

            foreach (var node in reached)
            {
                foreach (var name in node.DescendantNodes().OfType<IdentifierNameSyntax>())
                {
                    identifiers.Add(name.Identifier.ValueText);
                }

                foreach (var construction in node.DescendantNodes().OfType<ObjectCreationExpressionSyntax>())
                {
                    identifiers.Add(construction.Type.ToString().Split('<', '.').Last());

                    if (QualifiedName(construction.Type) is { Length: > 0 } built)
                    {
                        created.Add(built);
                    }
                }

                // A fact that drives its use case through the host pins the message with
                // typeof instead of constructing it, so the pinned type counts as built.
                foreach (var pinned in node.DescendantNodes().OfType<TypeOfExpressionSyntax>())
                {
                    if (QualifiedName(pinned.Type) is { Length: > 0 } built)
                    {
                        created.Add(built);
                    }
                }
            }

            scenarios.Add(new ScenarioInfo(
                FullNameOf(method),
                containing?.Identifier.ValueText ?? "",
                file,
                tree.GetLineSpan(method.Span).StartLinePosition.Line + 1,
                claims,
                steps,
                [.. codes],
                AssertedStatuses(statuses, thenBodies, reached),
                identifiers,
                RoutesIn(scope, containing),
                AssertedCodes(thenBodies, reached),
                HasAssertion(reached),
                created,
                ResolvedServices(reached),
                StaticCalls(reached)));
        }
    }

    /// <summary>
    ///     The test's fully qualified name: its namespace, its containing types
    ///     joined with dots, and its method. Test runs are matched on this name,
    ///     so a renamed test matches nothing instead of another test's method.
    /// </summary>
    private static string FullNameOf(MethodDeclarationSyntax method)
    {
        var space = method.Ancestors().OfType<BaseNamespaceDeclarationSyntax>().FirstOrDefault()?.Name.ToString() ?? "";
        var holders = method.Ancestors().OfType<TypeDeclarationSyntax>().Reverse().Select(type => type.Identifier.ValueText);
        var parts = (space.Length > 0 ? new[] { space } : []).Concat(holders).Concat([method.Identifier.ValueText]);

        return string.Join('.', parts);
    }

    /// <summary>
    ///     The refusal codes the test asserts: codes inside its then steps, and codes
    ///     passed to an assertion call. A code mentioned anywhere else, such as in
    ///     setup or in an unused helper, proves no refusal.
    /// </summary>
    private static List<string> AssertedCodes(IReadOnlyList<SyntaxNode> thenBodies, IReadOnlyList<SyntaxNode> reached)
    {
        var asserted = new SortedSet<string>(StringComparer.Ordinal);

        foreach (var body in thenBodies)
        {
            foreach (var token in body.DescendantTokens())
            {
                AddCodes(token, asserted);
            }
        }

        foreach (var node in reached)
        {
            foreach (var invocation in node.DescendantNodesAndSelf().OfType<InvocationExpressionSyntax>())
            {
                if (!AssertsThrough(invocation))
                {
                    continue;
                }

                foreach (var token in invocation.ArgumentList.DescendantTokens())
                {
                    AddCodes(token, asserted);
                }
            }
        }

        return [.. asserted];
    }

    /// <summary>A client refusal code: upper snake case, such as the generated client's vocabulary.</summary>
    private static readonly System.Text.RegularExpressions.Regex ClientCode = new(
        @"(?<![A-Z0-9_])[A-Z][A-Z0-9]*(_[A-Z0-9]+)+(?![A-Z0-9_])",
        System.Text.RegularExpressions.RegexOptions.Compiled);

    private static void AddCodes(SyntaxToken token, SortedSet<string> asserted)
    {
        if (token.IsKind(SyntaxKind.StringLiteralToken) && token.Value is string text)
        {
            foreach (System.Text.RegularExpressions.Match match in Identifiers.RefusalCode().Matches(text))
            {
                asserted.Add(match.Value);
            }

            foreach (System.Text.RegularExpressions.Match match in ClientCode.Matches(text))
            {
                asserted.Add(match.Value);
            }
        }
    }

    /// <summary>
    ///     The HTTP statuses the test asserts: the LightBDD then-step statuses, an integer
    ///     status passed to an assertion call, and an <c>HttpStatusCode</c> member or a
    ///     <c>StatusCodes</c> constant named there. A status mentioned anywhere else, such
    ///     as in setup, proves no refusal.
    /// </summary>
    private static List<int> AssertedStatuses(
        IReadOnlyList<int> stepStatuses,
        IReadOnlyList<SyntaxNode> thenBodies,
        IReadOnlyList<SyntaxNode> reached)
    {
        var asserted = new SortedSet<int>(stepStatuses);

        foreach (var body in thenBodies)
        {
            foreach (var access in body.DescendantNodesAndSelf().OfType<MemberAccessExpressionSyntax>())
            {
                if (StatusOf(access) is { } status)
                {
                    asserted.Add(status);
                }
            }
        }

        foreach (var node in reached)
        {
            foreach (var invocation in node.DescendantNodesAndSelf().OfType<InvocationExpressionSyntax>())
            {
                if (!AssertsThrough(invocation))
                {
                    continue;
                }

                foreach (var token in invocation.ArgumentList.DescendantTokens())
                {
                    if (token.IsKind(SyntaxKind.NumericLiteralToken)
                        && token.Value is int status
                        && status is >= 400 and <= 599)
                    {
                        asserted.Add(status);
                    }
                }

                foreach (var access in invocation.ArgumentList.DescendantNodes().OfType<MemberAccessExpressionSyntax>())
                {
                    if (StatusOf(access) is { } status)
                    {
                        asserted.Add(status);
                    }
                }
            }
        }

        return [.. asserted];
    }

    /// <summary>
    ///     The HTTP status a member access names: an <c>HttpStatusCode</c> member, or a
    ///     <c>StatusCodes.StatusXXX</c> constant. Null when the access names neither.
    /// </summary>
    private static int? StatusOf(MemberAccessExpressionSyntax access)
    {
        var receiver = access.Expression.ToString();

        if (receiver is "HttpStatusCode" || receiver.EndsWith(".HttpStatusCode", StringComparison.Ordinal))
        {
            if (Enum.TryParse<System.Net.HttpStatusCode>(access.Name.Identifier.ValueText, out var code)
                && (int)code is >= 100 and <= 599)
            {
                return (int)code;
            }

            return null;
        }

        if ((receiver is "StatusCodes" || receiver.EndsWith(".StatusCodes", StringComparison.Ordinal))
            && access.Name.Identifier.ValueText is { } name
            && name.StartsWith("Status", StringComparison.Ordinal)
            && name.Length >= "Status".Length + 3
            && int.TryParse(name.AsSpan("Status".Length, 3), out var status)
            && status is >= 100 and <= 599)
        {
            return status;
        }

        return null;
    }

    /// <summary>
    ///     The service types the test resolves from the host: the type arguments of
    ///     <c>GetRequiredService</c>, <c>GetService</c> and <c>GetKeyedService</c>, or the
    ///     <c>typeof</c> a non-generic <c>GetService</c> call carries.
    /// </summary>
    private static HashSet<string> ResolvedServices(IReadOnlyList<SyntaxNode> reached)
    {
        var resolved = new HashSet<string>(StringComparer.Ordinal);

        foreach (var node in reached)
        {
            foreach (var invocation in node.DescendantNodesAndSelf().OfType<InvocationExpressionSyntax>())
            {
                var (name, arguments) = invocation.Expression switch
                {
                    MemberAccessExpressionSyntax member => (member.Name.Identifier.ValueText, TypeArguments(member.Name)),
                    GenericNameSyntax generic => (generic.Identifier.ValueText, TypeArguments(generic)),
                    IdentifierNameSyntax plain => (plain.Identifier.ValueText, new List<TypeSyntax>()),
                    _ => ((string?)null, new List<TypeSyntax>()),
                };

                if (name is not ("GetRequiredService" or "GetService" or "GetKeyedService"))
                {
                    continue;
                }

                if (arguments is [var first, ..] && TypeName(first) is { Length: > 0 } service)
                {
                    resolved.Add(service);
                }
                else if (invocation.ArgumentList.Arguments is [var only, ..]
                    && only.Expression is TypeOfExpressionSyntax pinned
                    && TypeName(pinned.Type) is { Length: > 0 } carried)
                {
                    resolved.Add(carried);
                }
            }
        }

        return resolved;
    }

    /// <summary>
    ///     The static calls the test body makes: each <c>Type.Method</c> invocation on a
    ///     type-like receiver, so a call onto an aggregate type counts for the test.
    /// </summary>
    private static HashSet<string> StaticCalls(IReadOnlyList<SyntaxNode> reached)
    {
        var calls = new HashSet<string>(StringComparer.Ordinal);

        foreach (var node in reached)
        {
            foreach (var invocation in node.DescendantNodesAndSelf().OfType<InvocationExpressionSyntax>())
            {
                if (invocation.Expression is MemberAccessExpressionSyntax member
                    && ReceiverName(member.Expression) is { Length: > 0 } receiver
                    && char.IsUpper(receiver[0]))
                {
                    calls.Add($"{receiver}.{member.Name.Identifier.ValueText}");
                }
            }
        }

        return calls;
    }

    /// <summary>The rightmost name of a call receiver: the type for a static call.</summary>
    private static string? ReceiverName(ExpressionSyntax expression) => expression switch
    {
        IdentifierNameSyntax plain => plain.Identifier.ValueText,
        GenericNameSyntax generic => generic.Identifier.ValueText,
        MemberAccessExpressionSyntax member => member.Name.Identifier.ValueText,
        _ => null,
    };

    /// <summary>The type arguments a call name carries, or none when it carries no list.</summary>
    private static List<TypeSyntax> TypeArguments(SimpleNameSyntax name) =>
        name is GenericNameSyntax generic
            ? [.. generic.TypeArgumentList.Arguments]
            : [];

    /// <summary>
    ///     Whether the test asserts anything: an assertion call in its own body or in
    ///     a helper declared in the same file. Assertion presence in other files, such
    ///     as inside a steps class, is the analyzer's check, not the reader's.
    /// </summary>
    private static bool HasAssertion(IReadOnlyList<SyntaxNode> reached) =>
        reached.Any(node => node.DescendantNodesAndSelf().OfType<InvocationExpressionSyntax>().Any(AssertsThrough));

    /// <summary>
    ///     Whether the call asserts: an <c>Assert</c> or <c>Should</c> call, a bare
    ///     <c>Expect</c> or <c>Verify</c> call, a call on an assert holder such as
    ///     <c>ClassicAssert</c>, or a call chained onto an assertion such as
    ///     <c>value.Should().Be(expected)</c>.
    /// </summary>
    private static bool AssertsThrough(InvocationExpressionSyntax invocation)
    {
        if (IsAssertion(invocation))
        {
            return true;
        }

        return invocation.Expression is MemberAccessExpressionSyntax member
            && member.Expression is InvocationExpressionSyntax inner
            && IsAssertion(inner);
    }

    private static bool IsAssertion(InvocationExpressionSyntax invocation)
    {
        var name = invocation.Expression switch
        {
            MemberAccessExpressionSyntax member => member.Name.Identifier.ValueText,
            IdentifierNameSyntax plain => plain.Identifier.ValueText,
            _ => null,
        };

        if (name is not null
            && (name.StartsWith("Assert", StringComparison.Ordinal)
                || name.StartsWith("Should", StringComparison.Ordinal)
                || name is "Expect" or "Verify"))
        {
            return true;
        }

        return invocation.Expression is MemberAccessExpressionSyntax access
            && access.Expression is IdentifierNameSyntax receiver
            && (receiver.Identifier.ValueText is "Assert"
                || receiver.Identifier.ValueText.EndsWith("Assert", StringComparison.Ordinal));
    }

    /// <summary>The constructed type's simple name, without arguments or qualification.</summary>
    private static string TypeName(TypeSyntax type) => type switch
    {
        GenericNameSyntax generic => generic.Identifier.ValueText,
        IdentifierNameSyntax plain => plain.Identifier.ValueText,
        QualifiedNameSyntax qualified => TypeName(qualified.Right),
        NullableTypeSyntax nullable => TypeName(nullable.ElementType),
        ArrayTypeSyntax array => TypeName(array.ElementType),
        _ => "",
    };

    /// <summary>
    ///     The constructed type's dotted name, without arguments: a nested value keeps its
    ///     holder, so <c>new OrderLineFulfillmentType.Membership(...)</c> never reads as
    ///     constructing the <c>Membership</c> aggregate.
    /// </summary>
    private static string QualifiedName(TypeSyntax type) => type switch
    {
        GenericNameSyntax generic => generic.Identifier.ValueText,
        IdentifierNameSyntax plain => plain.Identifier.ValueText,
        QualifiedNameSyntax qualified => $"{QualifiedName(qualified.Left)}.{QualifiedName(qualified.Right)}",
        NullableTypeSyntax nullable => QualifiedName(nullable.ElementType),
        ArrayTypeSyntax array => QualifiedName(array.ElementType),
        _ => "",
    };

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
        List<int> statuses,
        List<SyntaxNode> thenBodies)
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
                thenBodies.Add(lambdaBody);

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
