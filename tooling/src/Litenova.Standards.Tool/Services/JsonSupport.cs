using System.Text.Json;
using System.Text.Json.Serialization;

namespace Litenova.Standards.Services;

internal static class JsonSupport
{
    public static JsonSerializerOptions ReadOptions { get; } = new()
    {
        PropertyNameCaseInsensitive = true,
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true,
    };

    public static JsonSerializerOptions WriteOptions { get; } = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public static T ReadRequired<T>(string path)
    {
        var content = File.ReadAllText(path);
        return JsonSerializer.Deserialize<T>(content, ReadOptions)
            ?? throw new InvalidDataException($"Could not parse {path}.");
    }

    public static string Serialize<T>(T value) =>
        JsonSerializer.Serialize(value, WriteOptions).Replace("\r\n", "\n") + "\n";
}

