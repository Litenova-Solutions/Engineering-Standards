namespace LiteSpec.Tests.Authoring;

/// <summary>Controlled-prose cases, each asserting its diagnostic codes.</summary>
public sealed partial class StandardsValidatorTests
{
    [Fact(DisplayName = "non-ASCII prose")]
    public void NonAsciiProse() => Check(
        root =>
        {
            var emDash = char.ConvertFromUtf32(0x2014);
            var page = StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "one repository topic", "one repository topic - with an em dash -");
            page = StandardsFixture.ReplaceFirst(page, "- with an em dash -", emDash + " with an em dash");
            StandardsFixture.Write(root, "docs/core/topic.md", page);
        },
        ["PROSE_NON_ASCII"]);

    static void CheckNonAsciiCodepoint(string codepoint)
    {
        var character = char.ConvertFromUtf32(Convert.ToInt32(codepoint, 16));
        Check(
            root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "one repository topic", $"one repository{character}topic")),
            ["PROSE_NON_ASCII"]);
    }

    [Fact(DisplayName = "non-ASCII prose U+00A0 (a plain space)")]
    public void NonAscii00A0() => CheckNonAsciiCodepoint("00A0");

    [Fact(DisplayName = "non-ASCII prose U+2018 (a straight apostrophe)")]
    public void NonAscii2018() => CheckNonAsciiCodepoint("2018");

    [Fact(DisplayName = "non-ASCII prose U+2019 (a straight apostrophe)")]
    public void NonAscii2019() => CheckNonAsciiCodepoint("2019");

    [Fact(DisplayName = "non-ASCII prose U+201C (a straight quotation mark)")]
    public void NonAscii201C() => CheckNonAsciiCodepoint("201C");

    [Fact(DisplayName = "non-ASCII prose U+201D (a straight quotation mark)")]
    public void NonAscii201D() => CheckNonAsciiCodepoint("201D");

    [Fact(DisplayName = "non-ASCII prose U+2013 (a hyphen)")]
    public void NonAscii2013() => CheckNonAsciiCodepoint("2013");

    [Fact(DisplayName = "non-ASCII prose U+2026 (three full stops)")]
    public void NonAscii2026() => CheckNonAsciiCodepoint("2026");

    [Fact(DisplayName = "non-ASCII prose U+00B7 (a hyphen)")]
    public void NonAscii00B7() => CheckNonAsciiCodepoint("00B7");

    [Fact(DisplayName = "rejection table exempts its refused word and its reason")]
    public void RejectionTableExempt() => Check(
        root => StandardsFixture.Write(root, "docs/reference/sample.md", StandardsFixture.ReplaceFirst(StandardsFixture.ReferencePage, "## Notes", "## Notes\n\n| Rejected | Use instead | Reason |\n|:---|:---|:---|\n| client | customer | The glossary defines client as the program that calls the public API, which a person placing an order never is at all. |\n")),
        []);

    [Fact(DisplayName = "normative guide prose")]
    public void NormativeGuideProse() => Check(
        root => StandardsFixture.Write(root, "docs/guide/sample.md", StandardsFixture.ReplaceFirst(StandardsFixture.GuidePage, "Create one verified standards artifact.", "Consumers MUST create one verified standards artifact.")),
        ["PROSE_NORMATIVE_LOCATION"]);
}
