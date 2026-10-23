using System.Text.RegularExpressions;

namespace LiteSpec.Model;

/// <summary>
///     Identifier shapes and citation matching.
/// </summary>
static partial class Identifiers
{
    /// <summary>A citation of a project record.</summary>
    public static readonly Regex Citation = BuildCitation();

    /// <summary>A citation of a shared standards provision: litespec/&lt;page&gt;#&lt;slug&gt;.</summary>
    [GeneratedRegex(@"\blitespec/[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*#[a-z0-9]+(?:-[a-z0-9]+)*")]
    public static partial Regex SharedCitation();

    /// <summary>A whole event record id, such as <c>event/expense.submitted</c>.</summary>
    [GeneratedRegex(@"^event/[a-z0-9]+(?:-[a-z0-9]+)*.[a-z0-9]+(?:-[a-z0-9]+)*$")]
    public static partial Regex EventId();

    /// <summary>A refusal code in identifier form: module and name in kebab-case.</summary>
    [GeneratedRegex(@"\b[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z0-9]+(?:-[a-z0-9]+)*\b")]
    public static partial Regex RefusalCode();

    /// <summary>A written anchor on a reaction or job.</summary>
    [GeneratedRegex(@"<implements>\s*(?<id>use-case/[A-Za-z0-9][A-Za-z0-9._-]*)\s*</implements>")]
    public static partial Regex ImplementsTag();

    /// <summary>A test's claim of the scenario or rule it proves.</summary>
    [GeneratedRegex(@"<proves>\s*(?<id>(?:scenario|rule)/[A-Za-z0-9][A-Za-z0-9._-]*)\s*</proves>")]
    public static partial Regex ProvesTag();

    /// <summary>A shared provision carried as a heading, which holds no ID text.</summary>
    [GeneratedRegex(@"^###\s+(?<heading>.+?)\s*$")]
    public static partial Regex ProvisionHeading();

    private static Regex BuildCitation()
    {
        var kinds = string.Join(
            "|",
            RecordTypes.All.OrderBy(kind => kind, StringComparer.Ordinal).Select(Regex.Escape));

        return new Regex(
            $@"(?<![A-Za-z0-9_./-])(?:{kinds})/[A-Za-z0-9][A-Za-z0-9._-]*",
            RegexOptions.Compiled);
    }

    /// <summary>
    ///     Splits an identifier into its prefix, home and name.
    /// </summary>
    public static bool TrySplit(string id, out string prefix, out string? home, out string name)
    {
        prefix = "";
        home = null;
        name = "";

        var slash = id.IndexOf('/', StringComparison.Ordinal);

        if (slash <= 0 || slash == id.Length - 1)
        {
            return false;
        }

        prefix = id[..slash];

        var rest = id[(slash + 1)..];
        var dot = rest.IndexOf('.', StringComparison.Ordinal);

        if (dot < 0)
        {
            name = rest;
            return true;
        }

        home = rest[..dot];
        name = rest[(dot + 1)..];

        return home.Length > 0 && name.Length > 0 && !name.Contains('.');
    }

    /// <summary>
    ///     Whether the name follows the name rules: one to six lowercase words,
    ///     digits allowed inside a word or as a word, never as the whole name.
    /// </summary>
    public static bool ValidName(string name, bool decision)
    {
        var words = name.Split('-', StringSplitOptions.RemoveEmptyEntries);

        if (words.Length < 1 || words.Length > 6 || string.Join("-", words) != name)
        {
            return false;
        }

        if (decision)
        {
            if (words.Length < 2 || !AllDigits(words[0]))
            {
                return false;
            }
        }

        foreach (var word in words)
        {
            if (word.Length == 0
                || word.Any(character => !char.IsAsciiLetterOrDigit(character))
                || word.Any(char.IsUpper))
            {
                return false;
            }
        }

        return !decision || words[1..].Any(word => !AllDigits(word));
    }

    /// <summary>Whether the whole name is digits, which no name may be.</summary>
    public static bool AllDigitsName(string name) =>
        name.Length > 0 && name.Replace("-", "").All(char.IsDigit);

    private static bool AllDigits(string word) =>
        word.Length > 0 && word.All(char.IsDigit);

    /// <summary>
    ///     Splits a journey step link of the form journey/name#step into the journey id and the step.
    /// </summary>
    public static bool TrySplitStep(string id, out string journey, out string step)
    {
        journey = "";
        step = "";

        var hash = id.IndexOf('#', StringComparison.Ordinal);

        if (hash <= 0 || hash == id.Length - 1)
        {
            return false;
        }

        journey = id[..hash];
        step = id[(hash + 1)..];

        return journey.StartsWith("journey/", StringComparison.Ordinal) && step.Length > 0;
    }

    /// <summary>
    ///     The link without its number-sign fragment: a journey step resolves through its
    ///     journey, and an external-system operation through its system.
    /// </summary>
    public static string BaseId(string id)
    {
        var hash = id.IndexOf('#', StringComparison.Ordinal);

        return hash < 0 ? id : id[..hash];
    }

    /// <summary>
    ///     Trims prose punctuation from a matched citation.
    /// </summary>
    public static string TrimCitation(string match) =>
        match.TrimEnd('.', ',', ';', ':', '!', '?', ')', ']', '"', '\'', '`');
}
