using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace LiteSpec;

/// <summary>
///     The JSON every command writes and reads: two-space indentation and no
///     escaping of quotes, apostrophes or angle brackets, so messages read the
///     same in JSON as in the human output.
/// </summary>
static class CliJson
{
    public static readonly JsonSerializerOptions Options = new()
    {
        WriteIndented = true,
        // A fixed line end, so output is byte-identical on every operating system.
        NewLine = "\n",
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    /// <summary>Serializes a value with <see cref="Options"/>.</summary>
    public static string Serialize<T>(T value) => JsonSerializer.Serialize(value, Options);

    /// <summary>Writes a value to standard output with <see cref="Options"/>.</summary>
    public static void Write<T>(T value) => Console.WriteLine(Serialize(value));

    /// <summary>Reads a JSON file, or returns null when it is missing or not JSON.</summary>
    public static JsonNode? TryRead(string file)
    {
        try
        {
            return File.Exists(file) ? JsonNode.Parse(File.ReadAllText(file), documentOptions: new JsonDocumentOptions { CommentHandling = JsonCommentHandling.Disallow }) : null;
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
