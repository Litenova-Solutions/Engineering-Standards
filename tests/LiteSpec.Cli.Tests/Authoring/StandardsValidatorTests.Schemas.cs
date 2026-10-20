using LiteSpec.Authoring;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Authoring;

/// <summary>Schema, template-index, and template cases, each asserting its diagnostic codes.</summary>
public sealed partial class StandardsValidatorTests
{
    static readonly string OneOfSchema =
        "{\"$schema\":\"https://json-schema.org/draft/2020-12/schema\"," +
        "\"type\":\"object\"," +
        "\"properties\":{\"selectedExtensions\":{\"type\":\"array\",\"items\":{\"oneOf\":[" +
        "{\"type\":\"string\",\"pattern\":\"^[a-z][a-z0-9-]*$\"}," +
        "{\"type\":\"object\",\"additionalProperties\":false,\"required\":[\"id\",\"criterion\",\"reviewBy\"]," +
        "\"properties\":{\"id\":{\"type\":\"string\"},\"criterion\":{\"type\":\"string\"},\"reviewBy\":{\"type\":\"string\"}}}" +
        "]}}}}";

    [Fact(DisplayName = "schema id naming another home or release")]
    public void SchemaIdNamingAnotherRelease() => Check(
        root =>
        {
            StandardsFixture.Write(root, "litespec.manifest.json", "{\"version\":\"2.0.0\"}");
            StandardsFixture.Write(root, "schemas/record.schema.json", "{\"$id\":\"https://example.com/schemas/record.schema.json\",\"type\":\"object\"}");
        },
        ["SCHEMA_ID"]);

    [Fact(DisplayName = "schema id naming the published home and release")]
    public void SchemaIdNamingThePublishedRelease()
    {
        using var temp = Cli.Temp("standards");
        StandardsFixture.Base(temp.Path);
        StandardsFixture.Write(temp.Path, "litespec.manifest.json", "{\"version\":\"2.0.0\"}");
        StandardsFixture.Write(temp.Path, "schemas/record.schema.json", "{\"$id\":\"https://litespec.dev/2.0.0/schemas/record.schema.json\",\"type\":\"object\"}");

        var result = StandardsValidator.Validate(temp.Path);

        Assert.DoesNotContain(result.Diagnostics, diagnostic => diagnostic.Code == "SCHEMA_ID");
    }

    [Fact(DisplayName = "invalid schema consumer")]
    public void InvalidSchemaConsumer() => Check(
        root =>
        {
            StandardsFixture.Write(root, "schemas/litespec-manifest.schema.json", "{\"type\":\"object\",\"required\":[\"version\"],\"properties\":{\"version\":{\"const\":\"1.0.0\"}},\"additionalProperties\":false}");
            StandardsFixture.Write(root, "litespec.manifest.json", "{\"version\":\"1.17.0\"}");
        },
        ["SCHEMA_INVALID"]);

    [Fact(DisplayName = "unsupported schema keyword")]
    public void UnsupportedSchemaKeyword() => Check(
        root =>
        {
            StandardsFixture.Write(root, "schemas/litespec-manifest.schema.json", "{\"type\":\"object\",\"unevaluatedProperties\":false}");
            StandardsFixture.Write(root, "litespec.manifest.json", "{}");
        },
        ["SCHEMA_UNSUPPORTED_KEYWORD"]);

    [Fact(DisplayName = "unsupported schema keyword inside a branch")]
    public void UnsupportedSchemaKeywordInBranch() => Check(
        root =>
        {
            StandardsFixture.Write(root, "schemas/litespec-manifest.schema.json", "{\"type\":\"object\",\"anyOf\":[{\"type\":\"object\",\"properties\":{\"version\":{\"contentEncoding\":\"base64\"}}}]}");
            StandardsFixture.Write(root, "litespec.manifest.json", "{}");
        },
        ["SCHEMA_UNSUPPORTED_KEYWORD"]);

    [Fact(DisplayName = "unsupported schema keyword inside propertyNames")]
    public void UnsupportedSchemaKeywordInPropertyNames() => Check(
        root =>
        {
            StandardsFixture.Write(root, "schemas/litespec-manifest.schema.json", "{\"type\":\"object\",\"propertyNames\":{\"type\":\"string\",\"contentMediaType\":\"text/plain\"}}");
            StandardsFixture.Write(root, "litespec.manifest.json", "{}");
        },
        ["SCHEMA_UNSUPPORTED_KEYWORD"]);

    [Fact(DisplayName = "schema upper bound")]
    public void SchemaUpperBound() => Check(
        root =>
        {
            StandardsFixture.Write(root, "schemas/litespec-manifest.schema.json", "{\"type\":\"object\",\"properties\":{\"version\":{\"type\":\"string\",\"maxLength\":3}}}");
            StandardsFixture.Write(root, "litespec.manifest.json", "{\"version\":\"1.16.0\"}");
        },
        ["SCHEMA_INVALID"]);

    [Fact(DisplayName = "schema anyOf branch")]
    public void SchemaAnyOfBranch() => Check(
        root =>
        {
            StandardsFixture.Write(root, "schemas/litespec-manifest.schema.json", "{\"type\":\"object\",\"properties\":{\"version\":{\"anyOf\":[{\"type\":\"integer\"},{\"type\":\"boolean\"}]}}}");
            StandardsFixture.Write(root, "litespec.manifest.json", "{\"version\":\"1.16.0\"}");
        },
        ["SCHEMA_INVALID"]);

    [Fact(DisplayName = "schema dependent property")]
    public void SchemaDependentProperty() => Check(
        root =>
        {
            StandardsFixture.Write(root, "schemas/litespec-manifest.schema.json", "{\"type\":\"object\",\"dependentRequired\":{\"version\":[\"name\"]}}");
            StandardsFixture.Write(root, "litespec.manifest.json", "{\"version\":\"1.16.0\"}");
        },
        ["SCHEMA_INVALID"]);

    [Fact(DisplayName = "schema property name shape")]
    public void SchemaPropertyNameShape() => Check(
        root =>
        {
            StandardsFixture.Write(root, "schemas/litespec-manifest.schema.json", "{\"type\":\"object\",\"propertyNames\":{\"pattern\":\"^[a-z]+$\"}}");
            StandardsFixture.Write(root, "litespec.manifest.json", "{\"Version\":\"1.16.0\"}");
        },
        ["SCHEMA_INVALID"]);

    [Fact(DisplayName = "schema pattern properties")]
    public void SchemaPatternProperties() => Check(
        root =>
        {
            StandardsFixture.Write(root, "schemas/litespec-manifest.schema.json", "{\"type\":\"object\",\"patternProperties\":{\"^v\":{\"type\":\"integer\"}},\"additionalProperties\":false}");
            StandardsFixture.Write(root, "litespec.manifest.json", "{\"version\":\"1.16.0\"}");
        },
        ["SCHEMA_INVALID"]);

    [Fact(DisplayName = "schema array bounds")]
    public void SchemaArrayBounds() => Check(
        root =>
        {
            StandardsFixture.Write(root, "schemas/litespec-manifest.schema.json", "{\"type\":\"object\",\"properties\":{\"areas\":{\"type\":\"array\",\"maxItems\":1}}}");
            StandardsFixture.Write(root, "litespec.manifest.json", "{\"areas\":[\"CORE\",\"EXT\"]}");
        },
        ["SCHEMA_INVALID"]);

    [Fact(DisplayName = "schema JSON")]
    public void SchemaJson() => Check(
        root =>
        {
            StandardsFixture.Write(root, "schemas/litespec-manifest.schema.json", "{");
            StandardsFixture.Write(root, "litespec.manifest.json", "{}");
        },
        ["SCHEMA_JSON"]);

    [Fact(DisplayName = "project template carrying a removed overrides entry")]
    public void ProjectTemplateWithRemovedOverrides() => Check(
        root =>
        {
            StandardsFixture.Write(root, "schemas/litespec-project.schema.json", StandardsFixture.ShippedProjectSchema());
            StandardsFixture.Write(root, "templates/consumer/litespec.project.json", "{\"overrides\":[{\"provisionId\":\"litespec/core/topic#keep-the-topic-bounded\"}]}");
        },
        ["SCHEMA_INVALID"]);

    [Fact(DisplayName = "value matches no oneOf branch")]
    public void ValueMatchesNoOneOfBranch() => Check(
        root =>
        {
            StandardsFixture.Write(root, "schemas/litespec-project.schema.json", OneOfSchema);
            StandardsFixture.Write(root, "templates/consumer/litespec.project.json", "{\"selectedExtensions\":[{\"id\":\"outbox\",\"criterion\":\"Durable delivery.\"}]}");
        },
        ["SCHEMA_INVALID"]);

    [Fact(DisplayName = "value matches exactly one oneOf branch")]
    public void ValueMatchesOneOneOfBranch() => Check(
        root =>
        {
            StandardsFixture.Write(root, "schemas/litespec-project.schema.json", OneOfSchema);
            StandardsFixture.Write(root, "templates/consumer/litespec.project.json", "{\"selectedExtensions\":[\"outbox\",{\"id\":\"jobs\",\"criterion\":\"Holds expire on a timer.\",\"reviewBy\":\"2099-01-01\"}]}");
        },
        [], ["SCHEMA_INVALID"]);

    [Fact(DisplayName = "template index names a missing file")]
    public void TemplateIndexNamesMissingFile() => Check(
        root =>
        {
            StandardsFixture.Write(root, "templates/consumer/sample.md", "# Sample\n");
            StandardsFixture.Write(root, "templates/consumer/README.md", "# Templates\n\n## Intent\n\nUse these starting points.\n\n| Template | Target | Purpose |\n|:---|:---|:---|\n| `sample.md` | `docs/sample.md` | Present. |\n| `absent.md` | `docs/absent.md` | Renamed away. |\n");
        },
        ["TEMPLATE_INDEX_PATH"]);

    [Fact(DisplayName = "template index omits a tracked template")]
    public void TemplateIndexOmitsTemplate() => Check(
        root =>
        {
            StandardsFixture.Write(root, "templates/consumer/sample.md", "# Sample\n");
            StandardsFixture.Write(root, "templates/consumer/unlisted.md", "# Unlisted\n");
            StandardsFixture.Write(root, "templates/consumer/README.md", "# Templates\n\n## Intent\n\nUse these starting points.\n\n| Template | Target | Purpose |\n|:---|:---|:---|\n| `sample.md` | `docs/sample.md` | Present. |\n");
        },
        ["TEMPLATE_INDEX_PATH"]);

    [Fact(DisplayName = "template index resolves every row")]
    public void TemplateIndexResolvesEveryRow() => Check(
        root =>
        {
            StandardsFixture.Write(root, "templates/consumer/sample.md", "# Sample\n");
            StandardsFixture.Write(root, "templates/consumer/README.md", "# Templates\n\n## Intent\n\nUse these starting points.\n\n| Template | Target | Purpose |\n|:---|:---|:---|\n| `sample.md` | `docs/sample.md` | Present. |\n");
        },
        [], ["TEMPLATE_INDEX_PATH"]);
}
