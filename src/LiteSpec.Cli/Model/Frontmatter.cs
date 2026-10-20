using System.Text.Json;

namespace LiteSpec.Model;

/// <summary>
///     The JSON frontmatter a record page carries between two fence lines.
/// </summary>
static class Frontmatter
{
    /// <summary>
    ///     The parsed fences: the object, the body after it, and the body's first line.
    /// </summary>
    /// <param name="Root">The frontmatter object.</param>
    /// <param name="Body">The text after the closing fence.</param>
    /// <param name="BodyStartLine">The body's first line, 1-based.</param>
    public sealed record Parsed(JsonElement Root, string Body, int BodyStartLine);

    /// <summary>
    ///     Parses the frontmatter when the file starts with a fence line.
    /// </summary>
    /// <param name="text">The file's text.</param>
    /// <param name="parsed">The fences.</param>
    /// <param name="error">Why parsing failed.</param>
    /// <returns>Whether the file carries readable frontmatter.</returns>
    public static bool TryParse(string text, out Parsed parsed, out string error)
    {
        parsed = null!;
        error = "";

        var lines = text.Split('\n');

        if (lines.Length < 3 || lines[0].TrimEnd('\r') != "---")
        {
            error = "no frontmatter fence";
            return false;
        }

        var closing = -1;

        for (var index = 1; index < lines.Length; index++)
        {
            if (lines[index].TrimEnd('\r') == "---")
            {
                closing = index;
                break;
            }
        }

        if (closing < 0)
        {
            error = "frontmatter never closes";
            return false;
        }

        var json = string.Join('\n', lines[1..closing]);

        try
        {
            using var document = JsonDocument.Parse(json);
            var body = string.Join('\n', lines[(closing + 1)..]);

            parsed = new Parsed(document.RootElement.Clone(), body, closing + 2);
            return true;
        }
        catch (JsonException exception)
        {
            error = $"frontmatter is not JSON: {exception.Message}";
            return false;
        }
    }
}
