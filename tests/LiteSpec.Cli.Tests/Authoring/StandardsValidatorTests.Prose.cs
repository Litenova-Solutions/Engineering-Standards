namespace LiteSpec.Tests.Authoring;

/// <summary>Controlled-prose cases, each asserting its diagnostic codes.</summary>
public sealed partial class StandardsValidatorTests
{
    [Fact(DisplayName = "long sentence")]
    public void LongSentence() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "This page defines one repository topic.", "This sentence contains more than twenty five visible words because the fixture must prove that descriptive prose cannot exceed the fixed controlled technical prose sentence limit in active documentation.")),
        ["PROSE_SENTENCE_LENGTH"]);

    [Fact(DisplayName = "long list item")]
    public void LongListItem() => Check(
        root => StandardsFixture.Write(root, "docs/guide/sample.md", StandardsFixture.ReplaceFirst(StandardsFixture.GuidePage, "- Read the applicable canonical provision.", "- Read the applicable canonical provision and every related document before you create any artifact or run any verification command for this repository task.")),
        ["PROSE_LIST_LENGTH"]);

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

    [Fact(DisplayName = "vague term")]
    public void VagueTerm() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "one repository topic", "one obvious repository topic")),
        ["PROSE_VAGUE_TERM"]);

    [Fact(DisplayName = "contraction")]
    public void Contraction() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "This page defines one repository topic.", "This page isn't a second repository topic.")),
        ["PROSE_CONTRACTION"]);

    [Fact(DisplayName = "and-or")]
    public void AndOr() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "one repository topic", "one repository and/or consumer topic")),
        ["PROSE_AND_OR"]);

    [Fact(DisplayName = "long paragraph")]
    public void LongParagraph() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "This page defines one repository topic.", "One sentence. Two sentences. Three sentences. Four sentences. Five sentences. Six sentences. Seven sentences.")),
        ["PROSE_PARAGRAPH_LENGTH"]);

    [Fact(DisplayName = "rejection table exempts its refused word and its reason")]
    public void RejectionTableExempt() => Check(
        root => StandardsFixture.Write(root, "docs/reference/sample.md", StandardsFixture.ReplaceFirst(StandardsFixture.ReferencePage, "## Notes", "## Notes\n\n| Rejected | Use instead | Reason |\n|:---|:---|:---|\n| client | customer | The glossary defines client as the program that calls the public API, which a person placing an order never is at all. |\n")),
        []);

    [Fact(DisplayName = "an ordinary reason column is still measured")]
    public void OrdinaryReasonMeasured() => Check(
        root => StandardsFixture.Write(root, "docs/reference/sample.md", StandardsFixture.ReplaceFirst(StandardsFixture.ReferencePage, "## Notes", "## Notes\n\n| Step | Reason |\n|:---|:---|:---|\n| Publish | The repository report records the declared topic boundary with its owner, scope, source, review date, status, evidence, command, path, and result. |\n")),
        ["PROSE_TABLE_CELL_LENGTH"]);

    [Fact(DisplayName = "a long cell beside a rejection column is still measured")]
    public void LongCellBesideRejectionMeasured() => Check(
        root => StandardsFixture.Write(root, "docs/reference/sample.md", StandardsFixture.ReplaceFirst(StandardsFixture.ReferencePage, "## Notes", "## Notes\n\n| Rejected | Use instead | Reason |\n|:---|:---|:---|\n| client | The repository report records the declared topic boundary with its owner, scope, source, review date, status, evidence, command, path, and result. | Short. |\n")),
        ["PROSE_TABLE_CELL_LENGTH"]);

    [Fact(DisplayName = "long table cell")]
    public void LongTableCell() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "Does the topic live in its owning documentation area?", "The repository report records the declared topic boundary with its owner, scope, source, review date, status, evidence, command, path, and result.")),
        ["PROSE_TABLE_CELL_LENGTH"]);

    [Fact(DisplayName = "normative guide prose")]
    public void NormativeGuideProse() => Check(
        root => StandardsFixture.Write(root, "docs/guide/sample.md", StandardsFixture.ReplaceFirst(StandardsFixture.GuidePage, "Create one verified standards artifact.", "Consumers MUST create one verified standards artifact.")),
        ["PROSE_NORMATIVE_LOCATION"]);
}
