using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace LiteSpec.Model.Readers.Dotnet;

/// <summary>
///     Reads the backend through the parser: handlers by folder, reactions and jobs
///     by interface, events by name, failure codes as literals, and comments as text.
/// </summary>
sealed class DotnetBackendReader : IBackendReader
{
    /// <summary>Reads every configured source root, parsing each file once.</summary>
    public CodeModel Read(ConsumerConfig config)
    {
        var model = new CodeModel();

        ReadHandlers(config, model);

        var files = new List<string>();

        foreach (var root in new[] { config.ApplicationRoot, config.ApplicationRoot + ".Abstractions", config.DomainRoot, config.WebApiRoot, config.InfrastructureRoot })
        {
            files.AddRange(SourceTree.Files(root, ".cs"));
        }

        var merged = new CodeModel();
        var gate = new object();

        System.Threading.Tasks.Parallel.ForEach(
            files,
            () => new CodeModel(),
            (file, _, local) =>
            {
                ReadFile(config, file, local);

                return local;
            },
            local =>
            {
                lock (gate)
                {
                    merged.Handlers.AddRange(local.Handlers);
                    merged.Reactions.AddRange(local.Reactions);
                    merged.Events.AddRange(local.Events);
                    merged.Literals.AddRange(local.Literals);
                    merged.Comments.AddRange(local.Comments);
                    merged.Endpoints.AddRange(local.Endpoints);
                }
            });

        model.Reactions.AddRange(merged.Reactions
            .OrderBy(reaction => reaction.File, StringComparer.Ordinal)
            .ThenBy(reaction => reaction.Line)
            .ThenBy(reaction => reaction.Class, StringComparer.Ordinal));
        model.Events.AddRange(merged.Events
            .OrderBy(domainEvent => domainEvent.File, StringComparer.Ordinal)
            .ThenBy(domainEvent => domainEvent.Line)
            .ThenBy(domainEvent => domainEvent.Class, StringComparer.Ordinal));
        model.Literals.AddRange(merged.Literals
            .OrderBy(literal => literal.File, StringComparer.Ordinal)
            .ThenBy(literal => literal.Line)
            .ThenBy(literal => literal.Value, StringComparer.Ordinal));
        model.Comments.AddRange(merged.Comments
            .OrderBy(comment => comment.File, StringComparer.Ordinal)
            .ThenBy(comment => comment.Line));
        model.Endpoints.AddRange(merged.Endpoints
            .OrderBy(endpoint => endpoint.File, StringComparer.Ordinal)
            .ThenBy(endpoint => endpoint.Operation, StringComparer.Ordinal)
            .ThenBy(endpoint => endpoint.Route, StringComparer.Ordinal));

        return model;
    }

    private static void ReadHandlers(ConsumerConfig config, CodeModel model)
    {
        foreach (var file in SourceTree.Files(config.ApplicationRoot, ".cs"))
        {
            var name = Path.GetFileName(file);

            if (!name.EndsWith("Handler.cs", StringComparison.Ordinal))
            {
                continue;
            }

            var parts = Path.GetRelativePath(config.ApplicationRoot, file)
                            .Split(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);

            if (parts.Length < 4)
            {
                continue;
            }

            var module = Naming.Kebab(parts[0]);
            var operation = parts[2];

            model.Handlers.Add(new HandlerInfo(
                $"use-case/{module}.{Naming.Kebab(operation)}",
                module,
                Naming.Kebab(operation),
                operation,
                name.EndsWith("QueryHandler.cs", StringComparison.Ordinal) ? "query" : "command",
                file));
        }

        model.Handlers.Sort((left, right) => string.Compare(left.UseCaseId, right.UseCaseId, StringComparison.Ordinal));
    }

    private static void ReadFile(ConsumerConfig config, string file, CodeModel model)
    {
        SyntaxTree tree;

        try
        {
            tree = CSharpSyntaxTree.ParseText(SourceTree.Read(file), new CSharpParseOptions(LanguageVersion.Preview), file);
        }
        catch (IOException)
        {
            return;
        }

        var root = tree.GetRoot();
        var classes = root.DescendantNodes().OfType<BaseTypeDeclarationSyntax>().ToList();

        ReadEvent(config, file, tree, classes, model);
        ReadEndpoint(config, file, root, model);

        foreach (var token in root.DescendantTokens())
        {
            if (LiteralText(token) is { } literal)
            {
                foreach (System.Text.RegularExpressions.Match match in Identifiers.RefusalCode().Matches(literal))
                {
                    model.Literals.Add(new CodeLiteral(
                        match.Value,
                        file,
                        tree.GetLineSpan(token.Span).StartLinePosition.Line + 1,
                        EnclosingClass(token)));
                }
            }

            foreach (var trivia in token.LeadingTrivia.Concat(token.TrailingTrivia))
            {
                if (trivia.Kind() is SyntaxKind.SingleLineCommentTrivia
                    or SyntaxKind.MultiLineCommentTrivia
                    or SyntaxKind.SingleLineDocumentationCommentTrivia
                    or SyntaxKind.MultiLineDocumentationCommentTrivia)
                {
                    var span = tree.GetLineSpan(trivia.Span);

                    model.Comments.Add(new CodeComment(
                        trivia.ToString(), file, span.StartLinePosition.Line + 1));
                }
            }
        }

        foreach (var declared in classes)
        {
            var bases = declared is TypeDeclarationSyntax typed && typed.BaseList is not null
                ? typed.BaseList.Types.Select(type => BaseName(type.Type)).ToList()
                : [];

            var kind = Classify(declared.Identifier.ValueText, bases);

            if (kind is not null)
            {
                var tags = Identifiers.ImplementsTag()
                    .Matches(declared.GetLeadingTrivia().ToString())
                    .Cast<System.Text.RegularExpressions.Match>()
                    .Select(match => match.Groups["id"].Value)
                    .ToList();

                model.Reactions.Add(new ReactionInfo(
                    declared.Identifier.ValueText,
                    file,
                    tree.GetLineSpan(declared.Span).StartLinePosition.Line + 1,
                    kind,
                    tags.FirstOrDefault()));
            }
        }
    }

    private static void ReadEvent(
        ConsumerConfig config,
        string file,
        SyntaxTree tree,
        IReadOnlyList<BaseTypeDeclarationSyntax> classes,
        CodeModel model)
    {
        if (!IsUnder(config.DomainRoot, file)
            || !file.Contains($"{Path.DirectorySeparatorChar}Events{Path.DirectorySeparatorChar}", StringComparison.Ordinal))
        {
            return;
        }

        var name = Path.GetFileNameWithoutExtension(file);

        if (!name.EndsWith("Event", StringComparison.Ordinal) || name.Length <= 5)
        {
            return;
        }

        var declared = classes.FirstOrDefault();

        model.Events.Add(new DomainEventInfo(
            declared?.Identifier.ValueText ?? name,
            file,
            declared is null ? 1 : tree.GetLineSpan(declared.Span).StartLinePosition.Line + 1,
            null));
    }

    private static void ReadEndpoint(ConsumerConfig config, string file, SyntaxNode root, CodeModel model)
    {
        if (!Path.GetFileName(file).EndsWith("Endpoint.cs", StringComparison.Ordinal)
            || !IsUnder(config.WebApiRoot, file))
        {
            return;
        }

        var parts = Path.GetRelativePath(config.WebApiRoot, file)
                        .Split(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                        .SkipWhile(part => part == "Endpoints")
                        .ToArray();

        // Module/Aggregate/UseCase/XEndpoint.cs, or the single-aggregate flat form Module/UseCase/XEndpoint.cs.
        string useCase;

        if (parts.Length >= 4)
        {
            useCase = $"use-case/{Naming.Kebab(parts[0])}.{Naming.Kebab(parts[2])}";
        }
        else if (parts.Length == 3)
        {
            useCase = $"use-case/{Naming.Kebab(parts[0])}.{Naming.Kebab(parts[1])}";
        }
        else
        {
            return;
        }

        foreach (var invocation in root.DescendantNodes().OfType<InvocationExpressionSyntax>())
        {
            var called = CalledName(invocation);

            if (called == "WithName" && FirstLiteral(invocation) is { } operation)
            {
                model.Endpoints.Add(new EndpointOperation(operation, useCase, "", "", file));
            }
            else if (called is "MapGet" or "MapPost" or "MapPut" or "MapDelete" or "MapPatch"
                && FirstLiteral(invocation) is { } route)
            {
                model.Endpoints.Add(new EndpointOperation(
                    "", useCase, called["Map".Length..].ToUpperInvariant(), route, file));
            }
        }
    }

    private static bool IsUnder(string root, string file)
    {
        var relative = Path.GetRelativePath(root, file);

        return !relative.StartsWith("..", StringComparison.Ordinal)
            && !Path.IsPathRooted(relative);
    }

    private static string? LiteralText(SyntaxToken token) =>
        token.Kind() switch
        {
            SyntaxKind.StringLiteralToken
                or SyntaxKind.Utf8StringLiteralToken
                or SyntaxKind.SingleLineRawStringLiteralToken
                or SyntaxKind.MultiLineRawStringLiteralToken
                when token.Value is string text => text,
            SyntaxKind.InterpolatedStringTextToken => token.ValueText,
            _ => null,
        };

    private static string? Classify(string name, List<string> bases)
    {
        if (bases.Any(baseName =>
            baseName is "BackgroundService" or "IHostedService"
            || baseName.StartsWith("BackgroundService<", StringComparison.Ordinal)))
        {
            return "job";
        }

        if (name.EndsWith("Job", StringComparison.Ordinal)
            || name.EndsWith("Worker", StringComparison.Ordinal)
            || name.Contains("Recurring", StringComparison.Ordinal))
        {
            return "job";
        }

        if (bases.Any(baseName =>
            baseName.StartsWith("IEventHandler<", StringComparison.Ordinal)
            || baseName is "IDomainEventReaction"))
        {
            return "reaction";
        }

        if (name.EndsWith("Reaction", StringComparison.Ordinal))
        {
            return "reaction";
        }

        return null;
    }

    private static string BaseName(TypeSyntax type) => type switch
    {
        GenericNameSyntax generic => $"{generic.Identifier.ValueText}<{string.Join(",", generic.TypeArgumentList.Arguments)}>",
        IdentifierNameSyntax plain => plain.Identifier.ValueText,
        QualifiedNameSyntax qualified => qualified.Right.ToString(),
        _ => type.ToString(),
    };

    private static string? EnclosingClass(SyntaxToken token)
    {
        var parent = token.Parent;

        while (parent is not null && parent is not BaseTypeDeclarationSyntax)
        {
            parent = parent.Parent;
        }

        return (parent as BaseTypeDeclarationSyntax)?.Identifier.ValueText;
    }

    private static string? CalledName(InvocationExpressionSyntax invocation) =>
        invocation.Expression switch
        {
            MemberAccessExpressionSyntax member => member.Name.Identifier.ValueText,
            IdentifierNameSyntax plain => plain.Identifier.ValueText,
            _ => null,
        };

    private static string? FirstLiteral(InvocationExpressionSyntax invocation)
    {
        var first = invocation.ArgumentList.Arguments.FirstOrDefault();

        return first?.Expression is LiteralExpressionSyntax literal
            && literal.Token.Value is string text
                ? text
                : null;
    }
}
