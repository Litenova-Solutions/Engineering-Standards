namespace LiteSpec.Tests.Authoring;

/// <summary>Page titles, sections, links, and glossary cases, each asserting its diagnostic codes.</summary>
public sealed partial class StandardsValidatorTests
{
    [Fact(DisplayName = "section order")]
    public void SectionOrder() => Check(
        root =>
        {
            var page = StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "## Standards", "## TEMP");
            page = StandardsFixture.ReplaceFirst(page, "## Conventions", "## Standards");
            page = StandardsFixture.ReplaceFirst(page, "## TEMP", "## Conventions");
            StandardsFixture.Write(root, "docs/core/topic.md", page);
        },
        ["PAGE_SECTION_ORDER"]);

    [Fact(DisplayName = "broken link")]
    public void BrokenLink() => Check(
        root => StandardsFixture.Write(root, "docs/README.md", "# Documentation\n\n## Intent\n\nRead the [missing page](missing.md).\n"),
        ["LINK_BROKEN"]);

    [Fact(DisplayName = "broken anchor")]
    public void BrokenAnchor() => Check(
        root => StandardsFixture.Write(root, "docs/README.md", "# Documentation\n\n## Intent\n\nRead the [missing anchor](core/topic.md#missing).\n"),
        ["ANCHOR_BROKEN"]);

    [Fact(DisplayName = "missing H1")]
    public void MissingH1() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "# Topic Standard\n\n", "")),
        ["PAGE_TITLE_COUNT"]);

    [Fact(DisplayName = "H1 case")]
    public void H1Case() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "# Topic Standard", "# Topic standard")),
        ["PAGE_TITLE_CASE"]);

    [Fact(DisplayName = "missing section")]
    public void MissingSection() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "## Intent\n\n", "")),
        ["PAGE_MISSING_SECTION"]);

    [Fact(DisplayName = "empty section")]
    public void EmptySection() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "This page defines one repository topic.\n\n", "")),
        ["PAGE_EMPTY_SECTION"]);

    [Fact(DisplayName = "unknown section")]
    public void UnknownSection() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "## Standards", "## Notes\n\nOne informative note.\n\n## Standards")),
        ["PAGE_UNKNOWN_SECTION"]);

    [Fact(DisplayName = "reference example declaration")]
    public void ReferenceExampleDeclaration() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "## Verification", "## Reference example\n\nA topic example has no declared provision.\n\n## Verification")),
        ["REFERENCE_EXAMPLE_DECLARATION"]);

    [Fact(DisplayName = "index without Intent")]
    public void IndexWithoutIntent() => Check(
        root => StandardsFixture.Write(root, "docs/README.md", "# Documentation\n\n## Overview\n\nUse this page to find repository documentation.\n"),
        ["INDEX_INTENT"]);

    [Fact(DisplayName = "glossary order")]
    public void GlossaryOrder() => Check(
        root => StandardsFixture.Write(root, "docs/reference/glossary.md", "# Glossary\n\n## Zeta\n\nThe last sample term.\n\n## Alpha\n\nThe first sample term.\n"),
        ["GLOSSARY_ORDER"]);

    [Fact(DisplayName = "glossary definition")]
    public void GlossaryDefinition() => Check(
        root => StandardsFixture.Write(root, "docs/reference/glossary.md", "# Glossary\n\n## Topic\n\nA bounded standards subject. It has another definition sentence.\n"),
        ["GLOSSARY_DEFINITION"]);

    [Fact(DisplayName = "non-action heading")]
    public void NonActionHeading() => Check(
        root =>
        {
            var page = StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "### Keep the topic bounded", "### Topic boundary");
            page = page.Replace("litespec/core/topic#keep-the-topic-bounded", "litespec/core/topic#topic-boundary");
            StandardsFixture.Write(root, "docs/core/topic.md", page);
        },
        ["HEADING_ACTION"]);

    [Fact(DisplayName = "uncited agent projection")]
    public void UncitedAgentProjection() => Check(
        root => StandardsFixture.Write(root, "AGENTS.md", "# Agent Context\n\nRead the standards before changing code.\n"),
        ["AGENT_PROJECTION_ID"]);

    [Fact(DisplayName = "heading with no body")]
    public void HeadingWithNoBody() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "## Standards", string.Join("\n", ["## Concepts", "", "### Empty concept", "", "### Second concept", "", "This concept has a body.", "", "## Standards"]))),
        ["HEADING_EMPTY_BODY"]);

    [Fact(DisplayName = "numbered procedure inside an index")]
    public void NumberedProcedureInsideIndex() => Check(
        root => StandardsFixture.Write(root, "docs/README.md", string.Join("\n", ["# Documentation", "", "## Intent", "", "Use this page to find repository documentation.", "", "## Activation", "", "1. Select the applicable document.", ""])),
        ["INDEX_CONTAINS_PROCEDURE"]);
}
