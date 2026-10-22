using Record = LiteSpec.Model.Record;
using System.Text.Json;
using LiteSpec.Model;

namespace LiteSpec.Tests.Model.Checks;

/// <summary>Builds project models by hand for check tests.</summary>
static class TestModel
{
    /// <summary>A config rooted at the folder, reading its declaration when one exists.</summary>
    public static ConsumerConfig Config(string root) => ConsumerConfig.Load(root);

    /// <summary>A record of the type and id, with the JSON fields.</summary>
    public static Record Record(string type, string id, string file, string json) =>
        Record(type, id, file, 1, json);

    /// <summary>A record of the type and id at the file and line, with the JSON fields.</summary>
    public static Record Record(string type, string id, string file, int line, string json)
    {
        using var document = JsonDocument.Parse(json);
        var raw = document.RootElement.Clone();

        return new Record
        {
            Type = type,
            Id = id,
            Title = id,
            Owner = StringField(raw, "owner") ?? "lending-team",
            Status = StringField(raw, "status") ?? "approved",
            Decider = StringField(raw, "decider"),
            DecideBy = StringField(raw, "decideBy"),
            File = file,
            Line = line,
            Raw = raw,
        };
    }

    /// <summary>A model holding the records, with empty code, screens and tests.</summary>
    public static ProjectModel Model(ConsumerConfig config, params Record[] records)
    {
        var model = new ProjectModel { Config = config };
        model.Records.AddRange(records);
        return model;
    }

    /// <summary>The codes of the findings the check reports.</summary>
    public static List<string> Codes(ProjectModel model) =>
        Checker.Check(model).Findings.Select(finding => finding.Code).ToList();

    static string? StringField(JsonElement element, string name) =>
        element.ValueKind == JsonValueKind.Object
        && element.TryGetProperty(name, out var value)
        && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;
}
