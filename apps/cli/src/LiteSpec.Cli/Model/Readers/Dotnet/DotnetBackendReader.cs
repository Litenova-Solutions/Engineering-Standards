using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace LiteSpec.Model.Readers.Dotnet;

/// <summary>
///     Reads the backend through the parser: handlers by folder, reactions and jobs
///     by interface, events by name, failure codes from Code members, and comments as text.
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

    /// <summary>
    ///     The use case whose Application folder holds a file: <c>&lt;Module&gt;/&lt;Aggregate&gt;/&lt;UseCase&gt;/</c>
    ///     names <c>use-case/&lt;module&gt;.&lt;use-case&gt;</c>, as for a handler. A reaction or job without an
    ///     implements tag belongs to the use case whose folder holds it; outside such a folder it belongs to none.
    /// </summary>
    private static string? UseCaseOfFolder(ConsumerConfig config, string file)
    {
        var relative = Path.GetRelativePath(config.ApplicationRoot, file);

        if (relative.StartsWith("..", StringComparison.Ordinal) || Path.IsPathRooted(relative))
        {
            return null;
        }

        var parts = relative.Split(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        return parts.Length < 4 ? null : $"use-case/{Naming.Kebab(parts[0])}.{Naming.Kebab(parts[2])}";
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
            var details = HandlerDetails(file);

            model.Handlers.Add(new HandlerInfo(
                $"use-case/{module}.{Naming.Kebab(operation)}",
                module,
                Naming.Kebab(operation),
                operation,
                name.EndsWith("QueryHandler.cs", StringComparison.Ordinal) ? "query" : "command",
                file,
                details.Class,
                details.Line,
                details.Repositories,
                details.Refusals,
                details.Thrown,
                details.Dispatches));
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
                // Every dotted literal is evidence that a recorded code is thrown, but only
                // a literal in a declaring position states a code of its own. Elsewhere a
                // dotted string is an audit name, a field key, a host or a file name.
                var declares = Declares(token);

                foreach (System.Text.RegularExpressions.Match match in Identifiers.RefusalCode().Matches(literal))
                {
                    model.Literals.Add(new CodeLiteral(
                        match.Value,
                        file,
                        tree.GetLineSpan(token.Span).StartLinePosition.Line + 1,
                        EnclosingClass(token),
                        declares && match.Value == literal));
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

            var tags = Identifiers.ImplementsTag()
                .Matches(declared.GetLeadingTrivia().ToString())
                .Cast<System.Text.RegularExpressions.Match>()
                .Select(match => match.Groups["id"].Value)
                .ToList();

            // A hosted service named for the host rather than the job still runs a use case
            // when its implements tag says so.
            var kind = Classify(declared.Identifier.ValueText, bases)
                ?? (tags.Count > 0 && bases.Any(baseName =>
                        baseName is "BackgroundService" or "IHostedService"
                        || baseName.StartsWith("BackgroundService<", StringComparison.Ordinal))
                    ? "job"
                    : null);

            if (kind is not null)
            {

                model.Reactions.Add(new ReactionInfo(
                    declared.Identifier.ValueText,
                    file,
                    tree.GetLineSpan(declared.Span).StartLinePosition.Line + 1,
                    kind,
                    tags.FirstOrDefault() ?? UseCaseOfFolder(config, file),
                    RecordTag(declared),
                    RepositoriesOf(declared, tree, file),
                    RefusalsOf(declared, tree, file),
                    ThrownOf(declared, tree, file),
                    DispatchesOf(declared, tree, file)));
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

        // An event class that states its record id in a string literal names its record
        // outright; the builder falls back to the class name when none is stated.
        var stated = declared?.DescendantTokens()
            .Select(LiteralText)
            .FirstOrDefault(text => text is not null && Identifiers.EventId().IsMatch(text));

        model.Events.Add(new DomainEventInfo(
            declared?.Identifier.ValueText ?? name,
            file,
            declared is null ? 1 : tree.GetLineSpan(declared.Span).StartLinePosition.Line + 1,
            stated));
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

    /// <summary>
    ///     Whether a literal sits where code declares a refusal code: inside a property, field or
    ///     constant named <c>Code</c>, as an argument of a <c>new ...Exception(...)</c>, or as a
    ///     value named <c>code</c> (a named argument, an anonymous object member or an assignment).
    /// </summary>
    private static bool Declares(SyntaxToken token)
    {
        foreach (var node in token.Parent?.AncestorsAndSelf() ?? [])
        {
            switch (node)
            {
                case PropertyDeclarationSyntax property:
                    return property.Identifier.ValueText == "Code" && RefusalType(property);
                case FieldDeclarationSyntax field:
                    return field.Declaration.Variables.Any(variable => variable.Identifier.ValueText == "Code") && RefusalType(field);
                case ArgumentSyntax { NameColon.Name.Identifier.ValueText: var name } when IsCodeName(name):
                    return true;
                case AnonymousObjectMemberDeclaratorSyntax { NameEquals.Name.Identifier.ValueText: var name }:
                    return IsCodeName(name);
                case AssignmentExpressionSyntax { Left: IdentifierNameSyntax or MemberAccessExpressionSyntax or ElementAccessExpressionSyntax } assignment:
                    return IsCodeName(LastName(assignment.Left));
                case BaseObjectCreationExpressionSyntax creation:
                    return creation is ObjectCreationExpressionSyntax { Type: var type }
                        && LastName(type).EndsWith("Exception", StringComparison.Ordinal);
                case StatementSyntax or MemberDeclarationSyntax:
                    return false;
            }
        }

        return false;

        // A Code member declares a refusal on a type named for one; on a closed set of
        // features or kinds the same member name holds a label instead.
        static bool RefusalType(SyntaxNode member) =>
            member.Parent is BaseTypeDeclarationSyntax type
            && (type.Identifier.ValueText.EndsWith("Exception", StringComparison.Ordinal)
                || type.Identifier.ValueText.EndsWith("Failure", StringComparison.Ordinal)
                || type.Identifier.ValueText.EndsWith("Refusal", StringComparison.Ordinal));

        static bool IsCodeName(string name) => string.Equals(name, "code", StringComparison.OrdinalIgnoreCase);

        static string LastName(SyntaxNode node) => node switch
        {
            GenericNameSyntax generic => generic.Identifier.ValueText,
            IdentifierNameSyntax identifier => identifier.Identifier.ValueText,
            QualifiedNameSyntax qualified => qualified.Right.Identifier.ValueText,
            MemberAccessExpressionSyntax access => access.Name.Identifier.ValueText,
            ElementAccessExpressionSyntax element => element.ArgumentList.Arguments.FirstOrDefault()?.Expression is LiteralExpressionSyntax key
                ? key.Token.ValueText
                : "",
            _ => "",
        };
    }

    private static string? Classify(string name, List<string> bases)
    {
        // A job is named as one. A hosted service that wires the host at startup (a schema
        // check, a topology, a probe) is plumbing, and a type that only mentions recurring
        // work (its options, its model) runs nothing.
        if (name.EndsWith("Job", StringComparison.Ordinal)
            || name.EndsWith("Worker", StringComparison.Ordinal))
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

    /// <summary>One class's collected details: its repositories, refusals, thrown types and dispatches.</summary>
    sealed record ClassDetails(
        string Class,
        int Line,
        List<CodeRepository> Repositories,
        List<CodeRefusal> Refusals,
        List<CodeThrown> Thrown,
        List<CodeDispatch> Dispatches);

    /// <summary>A written anchor on a reaction or job record.</summary>
    private static readonly System.Text.RegularExpressions.Regex RecordImplementsTag = new(
        @"<implements>\s*(?<id>(?:reaction|job)/[A-Za-z0-9][A-Za-z0-9._-]*)\s*</implements>",
        System.Text.RegularExpressions.RegexOptions.Compiled);

    /// <summary>The reaction or job record id a class's anchor tag names, or null when it names none.</summary>
    private static string? RecordTag(BaseTypeDeclarationSyntax declared) =>
        RecordImplementsTag.Match(declared.GetLeadingTrivia().ToString()) is { Success: true } match
            ? match.Groups["id"].Value
            : null;

    /// <summary>The collected details of a handler file's handler class, or empty details when none parses.</summary>
    private static ClassDetails HandlerDetails(string file)
    {
        SyntaxTree tree;

        try
        {
            tree = CSharpSyntaxTree.ParseText(SourceTree.Read(file), new CSharpParseOptions(LanguageVersion.Preview), file);
        }
        catch (IOException)
        {
            return new ClassDetails("", 1, [], [], [], []);
        }

        var declared = tree.GetRoot().DescendantNodes().OfType<BaseTypeDeclarationSyntax>()
            .FirstOrDefault(type => type.Identifier.ValueText.EndsWith("Handler", StringComparison.Ordinal));

        if (declared is null)
        {
            return new ClassDetails("", 1, [], [], [], []);
        }

        return new ClassDetails(
            declared.Identifier.ValueText,
            tree.GetLineSpan(declared.Span).StartLinePosition.Line + 1,
            RepositoriesOf(declared, tree, file),
            RefusalsOf(declared, tree, file),
            ThrownOf(declared, tree, file),
            DispatchesOf(declared, tree, file));
    }

    /// <summary>The repository interfaces a class takes in its primary or explicit constructors.</summary>
    private static List<CodeRepository> RepositoriesOf(BaseTypeDeclarationSyntax declared, SyntaxTree tree, string file)
    {
        var found = new List<CodeRepository>();

        foreach (var (type, line) in ConstructorTypes(declared, tree))
        {
            var simple = type.Contains('<') ? type[..type.IndexOf('<')] : type;

            if (simple.EndsWith("Repository", StringComparison.Ordinal))
            {
                found.Add(new CodeRepository(type, file, line));
            }
        }

        return found;
    }

    /// <summary>Every constructor parameter type with its line: the primary constructor first, then each explicit one.</summary>
    private static List<(string Type, int Line)> ConstructorTypes(BaseTypeDeclarationSyntax declared, SyntaxTree tree)
    {
        var found = new List<(string Type, int Line)>();

        if (declared is not TypeDeclarationSyntax typed)
        {
            return found;
        }

        if (typed.ParameterList is { } primary)
        {
            foreach (var parameter in primary.Parameters)
            {
                if (parameter.Type is not null)
                {
                    found.Add((SimpleTypeName(parameter.Type), tree.GetLineSpan(parameter.Span).StartLinePosition.Line + 1));
                }
            }
        }

        foreach (var constructor in typed.Members.OfType<ConstructorDeclarationSyntax>())
        {
            foreach (var parameter in constructor.ParameterList.Parameters)
            {
                if (parameter.Type is not null)
                {
                    found.Add((SimpleTypeName(parameter.Type), tree.GetLineSpan(parameter.Span).StartLinePosition.Line + 1));
                }
            }
        }

        return found;
    }

    /// <summary>The refusal codes a class produces in declaring positions, earliest line first.</summary>
    private static List<CodeRefusal> RefusalsOf(BaseTypeDeclarationSyntax declared, SyntaxTree tree, string file)
    {
        var found = new Dictionary<string, int>(StringComparer.Ordinal);

        foreach (var token in declared.DescendantTokens())
        {
            if (LiteralText(token) is not { } literal || !Declares(token))
            {
                continue;
            }

            foreach (System.Text.RegularExpressions.Match match in Identifiers.RefusalCode().Matches(literal))
            {
                if (match.Value == literal)
                {
                    found.TryAdd(match.Value, tree.GetLineSpan(token.Span).StartLinePosition.Line + 1);
                }
            }
        }

        return [.. found
            .OrderBy(entry => entry.Value)
            .ThenBy(entry => entry.Key, StringComparer.Ordinal)
            .Select(entry => new CodeRefusal(entry.Key, file, entry.Value))];
    }

    /// <summary>The exception and failure types a class constructs, earliest line first.</summary>
    private static List<CodeThrown> ThrownOf(BaseTypeDeclarationSyntax declared, SyntaxTree tree, string file)
    {
        var found = new Dictionary<string, int>(StringComparer.Ordinal);

        foreach (var creation in declared.DescendantNodes().OfType<ObjectCreationExpressionSyntax>())
        {
            var name = SimpleTypeName(creation.Type);
            var simple = name.Contains('<') ? name[..name.IndexOf('<')] : name;

            if (simple.EndsWith("Exception", StringComparison.Ordinal)
                || simple.EndsWith("Failure", StringComparison.Ordinal)
                || simple.EndsWith("Refusal", StringComparison.Ordinal))
            {
                found.TryAdd(simple, tree.GetLineSpan(creation.Span).StartLinePosition.Line + 1);
            }
        }

        return [.. found
            .OrderBy(entry => entry.Value)
            .ThenBy(entry => entry.Key, StringComparer.Ordinal)
            .Select(entry => new CodeThrown(entry.Key, file, entry.Value))];
    }

    /// <summary>
    ///     The dispatch calls a class makes: commands through <c>ICommandMediator</c>, events
    ///     through a publisher or the outbox, notifications through a messenger, notifier or
    ///     sender, and any other call on an injected interface as an external port call.
    /// </summary>
    private static List<CodeDispatch> DispatchesOf(BaseTypeDeclarationSyntax declared, SyntaxTree tree, string file)
    {
        var receivers = ReceiverTypes(declared);

        if (receivers.Count == 0)
        {
            return [];
        }

        var found = new List<CodeDispatch>();

        foreach (var invocation in declared.DescendantNodes().OfType<InvocationExpressionSyntax>())
        {
            if (invocation.Expression is not MemberAccessExpressionSyntax member)
            {
                continue;
            }

            var receiver = member.Expression switch
            {
                IdentifierNameSyntax plain => plain.Identifier.ValueText,
                MemberAccessExpressionSyntax { Expression: ThisExpressionSyntax } access => access.Name.Identifier.ValueText,
                _ => null,
            };

            if (receiver is null || !receivers.TryGetValue(receiver, out var type))
            {
                continue;
            }

            var kind = type.Contains('<') ? type[..type.IndexOf('<')] : type;
            var method = member.Name.Identifier.ValueText;
            var line = tree.GetLineSpan(invocation.Span).StartLinePosition.Line + 1;

            if (kind == "ICommandMediator" && method == "SendAsync")
            {
                if (MessageTarget(invocation, templateCounts: false) is { } issues)
                {
                    found.Add(new CodeDispatch("issues", issues.Target, "", file, line));
                }
            }
            else if (kind.EndsWith("Publisher", StringComparison.Ordinal)
                || kind.Contains("Outbox", StringComparison.Ordinal))
            {
                if (MessageTarget(invocation, templateCounts: false) is { } publishes)
                {
                    found.Add(new CodeDispatch("publishes", publishes.Target, "", file, line));
                }
            }
            else if (kind.Contains("Messenger", StringComparison.Ordinal)
                || kind.EndsWith("Notifier", StringComparison.Ordinal)
                || kind.EndsWith("Sender", StringComparison.Ordinal))
            {
                if (MessageTarget(invocation, templateCounts: true) is { } sends)
                {
                    found.Add(new CodeDispatch("sends", sends.Target, sends.Detail, file, line));
                }
            }
            else if (!ExcludedReceiver(kind))
            {
                found.Add(new CodeDispatch("calls", method, kind, file, line));
            }
        }

        found.Sort((left, right) =>
        {
            var line = left.Line.CompareTo(right.Line);
            return line != 0 ? line : string.Compare(left.Target, right.Target, StringComparison.Ordinal);
        });

        return found;
    }

    /// <summary>
    ///     The injected names a class may call: its constructor parameters plus the fields and
    ///     properties an explicit constructor assigns from them, each with its simple type name.
    /// </summary>
    private static Dictionary<string, string> ReceiverTypes(BaseTypeDeclarationSyntax declared)
    {
        var types = new Dictionary<string, string>(StringComparer.Ordinal);

        if (declared is not TypeDeclarationSyntax typed)
        {
            return types;
        }

        if (typed.ParameterList is { } primary)
        {
            foreach (var parameter in primary.Parameters)
            {
                AddParameter(parameter);
            }
        }

        foreach (var constructor in typed.Members.OfType<ConstructorDeclarationSyntax>())
        {
            foreach (var parameter in constructor.ParameterList.Parameters)
            {
                AddParameter(parameter);
            }

            if (constructor.Body is null)
            {
                continue;
            }

            foreach (var assignment in constructor.Body.DescendantNodes().OfType<AssignmentExpressionSyntax>())
            {
                if (assignment.Right is not IdentifierNameSyntax source
                    || !types.TryGetValue(source.Identifier.ValueText, out var type))
                {
                    continue;
                }

                var target = assignment.Left switch
                {
                    IdentifierNameSyntax plain => plain.Identifier.ValueText,
                    MemberAccessExpressionSyntax { Expression: ThisExpressionSyntax } member => member.Name.Identifier.ValueText,
                    _ => null,
                };

                if (target is not null)
                {
                    types.TryAdd(target, type);
                }
            }
        }

        return types;

        void AddParameter(ParameterSyntax parameter)
        {
            if (parameter.Type is not null && parameter.Identifier.ValueText.Length > 0)
            {
                types.TryAdd(parameter.Identifier.ValueText, SimpleTypeName(parameter.Type));
            }
        }
    }

    /// <summary>
    ///     The message a dispatch call carries: the constructed type, or the template key when
    ///     the call sends through the messenger. A topic or key first with the message second
    ///     reads the message. Null when the call names neither.
    /// </summary>
    private static (string Target, string Detail)? MessageTarget(InvocationExpressionSyntax invocation, bool templateCounts)
    {
        var args = invocation.ArgumentList.Arguments;

        if (args.Count == 0)
        {
            return null;
        }

        if (args.Count > 1
            && args[0].Expression is LiteralExpressionSyntax
            && ConstructionOf(args[1].Expression, invocation) is { } second)
        {
            return (second, "type");
        }

        if (ConstructionOf(args[0].Expression, invocation) is { } first)
        {
            return (first, "type");
        }

        if (templateCounts
            && args[0].Expression is LiteralExpressionSyntax literal
            && literal.Token.Value is string text
            && text.Length > 0)
        {
            return (text, "template");
        }

        return null;
    }

    /// <summary>The constructed type an argument carries, directly or through a local it names.</summary>
    private static string? ConstructionOf(ExpressionSyntax expression, InvocationExpressionSyntax invocation) =>
        expression switch
        {
            ObjectCreationExpressionSyntax creation => SimpleTypeName(creation.Type),
            IdentifierNameSyntax variable => LocalConstruction(invocation, variable.Identifier.ValueText),
            _ => null,
        };

    /// <summary>The type a local builds before the call, for a message held in a local.</summary>
    private static string? LocalConstruction(InvocationExpressionSyntax invocation, string name)
    {
        var scope = invocation.Ancestors().OfType<MemberDeclarationSyntax>().FirstOrDefault();

        if (scope is null)
        {
            return null;
        }

        foreach (var declarator in scope.DescendantNodes().OfType<VariableDeclaratorSyntax>())
        {
            if (declarator.Identifier.ValueText == name
                && declarator.Initializer?.Value is ObjectCreationExpressionSyntax creation)
            {
                return SimpleTypeName(creation.Type);
            }
        }

        return null;
    }

    /// <summary>The simple type name: unqualified, without nullability, keeping generic arguments.</summary>
    private static string SimpleTypeName(TypeSyntax type) => type switch
    {
        GenericNameSyntax generic => $"{generic.Identifier.ValueText}<{string.Join(",", generic.TypeArgumentList.Arguments.Select(argument => argument.ToString()))}>",
        IdentifierNameSyntax plain => plain.Identifier.ValueText,
        QualifiedNameSyntax qualified => SimpleTypeName(qualified.Right),
        NullableTypeSyntax nullable => SimpleTypeName(nullable.ElementType),
        ArrayTypeSyntax array => SimpleTypeName(array.ElementType),
        _ => type.ToString(),
    };

    /// <summary>
    ///     Whether an injected type is infrastructure rather than an external port: repositories,
    ///     mediators, publishers, messengers, sessions, clocks, loggers, validators and the rest
    ///     a handler takes without taking an edge to an external system.
    /// </summary>
    private static bool ExcludedReceiver(string type)
    {
        if (type.EndsWith("Repository", StringComparison.Ordinal)
            || type.EndsWith("Mediator", StringComparison.Ordinal)
            || type.EndsWith("Publisher", StringComparison.Ordinal)
            || type.Contains("Messenger", StringComparison.Ordinal)
            || type.EndsWith("Notifier", StringComparison.Ordinal)
            || type.EndsWith("Sender", StringComparison.Ordinal)
            || type.Contains("Outbox", StringComparison.Ordinal))
        {
            return true;
        }

        if (type is "IClock" or "Clock" or "TimeProvider"
            or "IQuerySession" or "IDocumentSession" or "IApplicationDbContext"
            or "IMapper" or "IConfiguration"
            or "ICurrentUser" or "IUserContext" or "ICurrentActor" or "IActorAccessor" or "IActorContext"
            or "IMemoryCache" or "IDistributedCache"
            or "IGuidGenerator" or "IGuidFactory" or "IIdGenerator"
            or "ISerializer" or "IJsonSerializer"
            or "IMetrics" or "IMeterFactory" or "ActivitySource")
        {
            return true;
        }

        return type.StartsWith("ILogger", StringComparison.Ordinal)
            || type.EndsWith("DbContext", StringComparison.Ordinal)
            || type.EndsWith("Validator", StringComparison.Ordinal)
            || type.StartsWith("IOptions", StringComparison.Ordinal)
            || type.EndsWith("Environment", StringComparison.Ordinal)
            || type.EndsWith("Accessor", StringComparison.Ordinal)
            || type.Contains("Localiz", StringComparison.Ordinal);
    }
}
