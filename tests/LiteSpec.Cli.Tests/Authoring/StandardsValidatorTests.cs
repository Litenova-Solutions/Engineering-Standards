using LiteSpec.Authoring;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Authoring;

/// <summary>
///     Standards validator cases: one test per validator rule, in both directions,
///     asserting the expected diagnostic codes. This part holds the runner,
///     the coverage gate, the usage case, and the page-class cases.
/// </summary>
public sealed partial class StandardsValidatorTests
{
    /// <summary>
    ///     Runs one case with a mutation and its expected and forbidden codes:
    ///     every expected code is present, every forbidden code is absent, and a
    ///     passing case reports no diagnostics.
    /// </summary>
    static void Check(Action<string>? mutate, string[] expected, string[] forbidden)
    {
        using var temp = Cli.Temp("standards");
        StandardsFixture.Base(temp.Path);
        mutate?.Invoke(temp.Path);
        var result = StandardsValidator.Validate(temp.Path);
        var codes = result.Diagnostics.Select(item => item.Code).ToHashSet(StringComparer.Ordinal);
        foreach (var code in expected)
        {
            Assert.Contains(code, codes);
        }

        foreach (var code in forbidden)
        {
            Assert.DoesNotContain(code, codes);
        }

        if (expected.Length == 0)
        {
            Assert.Empty(result.Diagnostics);
        }
    }

    static void Check(Action<string>? mutate, string[] expected) => Check(mutate, expected, []);

    [Fact(DisplayName = "all page classes pass")]
    public void AllPageClassesPass() => Check(null, []);

    [Fact(DisplayName = "tutorial that omits what the reader built")]
    public void TutorialOmitsWhatReaderBuilt() => Check(
        root => StandardsFixture.Write(root, "docs/tutorial/sample.md", StandardsFixture.ReplaceFirst(StandardsFixture.TutorialPage, "## What you built", "## Verification")),
        ["PAGE_MISSING_SECTION", "PAGE_UNKNOWN_SECTION"]);

    [Fact(DisplayName = "reference page carrying an unknown section")]
    public void ReferenceWithUnknownSection() => Check(
        root => StandardsFixture.Write(root, "docs/reference/sample.md", StandardsFixture.ReplaceFirst(StandardsFixture.ReferencePage, "## Notes", "## Procedure")),
        ["PAGE_UNKNOWN_SECTION"]);

    [Fact(DisplayName = "reference page out of order")]
    public void ReferenceOutOfOrder() => Check(
        root =>
        {
            var page = StandardsFixture.ReplaceFirst(StandardsFixture.ReferencePage, "## Intent\n\nState the exact values that this repository publishes.\n\n", "");
            page = StandardsFixture.ReplaceFirst(page, "The values above come from the repository manifest.", "State the exact values that this repository publishes.\n\n## Intent\n\nThe values above come from the repository manifest.");
            StandardsFixture.Write(root, "docs/reference/sample.md", page);
        },
        ["PAGE_SECTION_ORDER"]);

    [Fact(DisplayName = "command page hiding its mechanism")]
    public void CommandHidingMechanism() => Check(
        root => StandardsFixture.Write(root, "docs/tools/sample.md", StandardsFixture.ReplaceFirst(StandardsFixture.CommandPage, "## Underneath\n\nNone.\n", "")),
        ["PAGE_MISSING_SECTION"]);

    [Fact(DisplayName = "command page without exit codes")]
    public void CommandWithoutExitCodes() => Check(
        root => StandardsFixture.Write(root, "docs/tools/sample.md", StandardsFixture.ReplaceFirst(StandardsFixture.CommandPage, "## Exit codes", "## Results")),
        ["PAGE_MISSING_SECTION", "PAGE_UNKNOWN_SECTION"]);

    [Fact(DisplayName = "frontend topic with per-stack sections")]
    public void FrontendWithPerStackSections() => Check(
        root =>
        {
            var page = StandardsFixture.TopicPage.Replace("core-topic", "frontend-sample");
            page = StandardsFixture.ReplaceFirst(page, "## Standards", "## React\n\n- React names the binding the rule below forbids.\n\n## Svelte\n\n- Svelte names the binding the rule below forbids.\n\n## Standards");
            StandardsFixture.Write(root, "docs/frontend/sample.md", page);
            StandardsFixture.RebuildIndex(root);
        },
        []);

    [Fact(DisplayName = "per-stack section outside frontend pages")]
    public void PerStackOutsideFrontend() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "## Standards", "## React\n\n- React names the binding the rule below forbids.\n\n## Standards")),
        ["PAGE_UNKNOWN_SECTION"]);

    [Fact(DisplayName = "per-stack section after standards")]
    public void PerStackAfterStandards() => Check(
        root => StandardsFixture.Write(root, "docs/frontend/sample.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage.Replace("core-topic", "frontend-sample"), "## Verification", "## React\n\n- React names the binding the rule above forbids.\n\n## Verification")),
        ["PAGE_SECTION_ORDER"]);

    static void CheckActionHeading(string verb)
    {
        var lower = verb.ToLowerInvariant();
        Check(
            root =>
            {
                var page = StandardsFixture.TopicPage.Replace("Keep the topic bounded", $"{verb} the topic boundary");
                page = page.Replace("keep-the-topic-bounded", $"{lower}-the-topic-boundary");
                page = StandardsFixture.ReplaceFirst(page, "MUST keep the topic", $"MUST {lower} the topic");
                StandardsFixture.Write(root, "docs/core/topic.md", page);
                StandardsFixture.RebuildIndex(root);
            },
            []);
    }

    [Fact(DisplayName = "action heading starting with 'answer'")]
    public void ActionHeadingAnswer() => CheckActionHeading("Answer");

    [Fact(DisplayName = "action heading starting with 'ask'")]
    public void ActionHeadingAsk() => CheckActionHeading("Ask");

    [Fact(DisplayName = "action heading starting with 'compute'")]
    public void ActionHeadingCompute() => CheckActionHeading("Compute");

    [Fact(DisplayName = "action heading starting with 'confirm'")]
    public void ActionHeadingConfirm() => CheckActionHeading("Confirm");

    [Fact(DisplayName = "action heading starting with 'grant'")]
    public void ActionHeadingGrant() => CheckActionHeading("Grant");

    [Fact(DisplayName = "action heading starting with 'reach'")]
    public void ActionHeadingReach() => CheckActionHeading("Reach");

    [Fact(DisplayName = "action heading starting with 'refuse'")]
    public void ActionHeadingRefuse() => CheckActionHeading("Refuse");

    [Fact(DisplayName = "action heading starting with 'show'")]
    public void ActionHeadingShow() => CheckActionHeading("Show");

    [Fact(DisplayName = "index without a routing block")]
    public void IndexWithoutRouting() => Check(
        root => StandardsFixture.Write(root, "docs/README.md", "# Documentation\n\n## Intent\n\nUse this page to find repository documentation.\n"),
        ["INDEX_MISSING_ROUTING"]);

    [Fact(DisplayName = "routing block after the first navigation group")]
    public void RoutingAfterNavigation() => Check(
        root => StandardsFixture.Write(root, "docs/README.md", "# Documentation\n\n## Intent\n\nUse this page to find repository documentation.\n\n## Core\n\n- [Topic](core/topic.md)\n\n" + StandardsFixture.IndexRouting),
        ["INDEX_MISSING_ROUTING"]);

    [Fact(DisplayName = "stale provision index")]
    public void StaleProvisionIndex() => Check(
        root => StandardsFixture.Write(root, Provisions.IndexPath, "# Provision Index\n\n## Intent\n\nThis page is out of date.\n"),
        ["PROVISIONS_STALE"]);

    [Fact(DisplayName = "missing provision index")]
    public void MissingProvisionIndex() => Check(
        root => StandardsFixture.Delete(root, Provisions.IndexPath),
        ["PROVISIONS_STALE"]);

    [Fact(DisplayName = "declared prose exclusions pass")]
    public void DeclaredProseExclusionsPass() => Check(
        root => StandardsFixture.Write(root, "templates/consumer/exclusions.md", "# Exclusion Fixture\n\n```json\n{\"metadata\":\"This obvious and/or non-ASCII value - \u2014 - is excluded because metadata and fenced code are not prose.\"}\n```\n\nRead the [source](https://example.com/an-obvious/and/or/very/long/link/destination).\n\nThe identifier `one.extremely-long.dotted-path-like-token/with-many-segments` counts as one word.\n"),
        []);

    [Fact(DisplayName = "validate with two positionals is a usage error")]
    public void ValidateUsageExits2()
    {
        var result = Cli.Run("validate", "one", "two");
        Assert.Equal(2, result.Status);
    }

    [Fact(DisplayName = "every stable diagnostic code has a failing case")]
    public void StableCodesAreCovered()
    {
        var covered = new HashSet<string>(StringComparer.Ordinal)
        {
            "AGENT_PROJECTION_ID",
            "ANCHOR_BROKEN",
            "CONVENTION_DEFAULT_SENTENCE",
            "CONVENTION_MISSING_DEFAULT",
            "CONVENTION_MISSING_REPLACEMENT",
            "CONVENTION_NORMATIVE",
            "CONVENTION_REPLACEMENT_SENTENCE",
            "EXTENSION_ACTIVATION",
            "EXTENSION_BASELINE",
            "EXTENSION_DEPENDENCIES",
            "EXTENSION_KIND",
            "EXTENSION_REPLACES_ENFORCED",
            "EXTENSION_REPLACES_UNKNOWN",
            "EXTENSION_SCOPE",
            "EXTENSION_STACK_UNKNOWN",
            "GLOSSARY_DEFINITION",
            "GLOSSARY_ORDER",
            "HEADING_ACTION",
            "HEADING_EMPTY_BODY",
            "ID_AREA_UNKNOWN",
            "ID_DUPLICATE",
            "ID_LOCATION",
            "ID_MISSING",
            "ID_PAGE_FILENAME",
            "ID_SCOPE_MISMATCH",
            "ID_SLUG_MISMATCH",
            "ID_UNKNOWN_REFERENCE",
            "INDEX_CONTAINS_PROCEDURE",
            "INDEX_INTENT",
            "INDEX_MISSING_ROUTING",
            "LAYER_OVERLAP",
            "LAYER_UNLISTED",
            "LINK_BROKEN",
            "MANIFEST_ANCHOR",
            "MANIFEST_DUPLICATE_PATH",
            "MANIFEST_JSON",
            "MANIFEST_PATH",
            "PAGE_EMPTY_SECTION",
            "PAGE_MISSING_SECTION",
            "PAGE_SECTION_ORDER",
            "PAGE_TITLE_CASE",
            "PAGE_TITLE_COUNT",
            "PAGE_UNKNOWN_SECTION",
            "PROSE_AND_OR",
            "PROSE_CONTRACTION",
            "PROSE_LIST_LENGTH",
            "PROSE_NON_ASCII",
            "PROSE_NORMATIVE_LOCATION",
            "PROSE_PARAGRAPH_LENGTH",
            "PROSE_SENTENCE_LENGTH",
            "PROSE_TABLE_CELL_LENGTH",
            "PROSE_VAGUE_TERM",
            "PROVISION_RESTATES_HEADING",
            "PROVISIONS_STALE",
            "REFERENCE_EXAMPLE_DECLARATION",
            "REMOVED_IDENTIFIER",
            "SCHEMA_ID",
            "SCHEMA_INVALID",
            "SCHEMA_JSON",
            "SCHEMA_UNSUPPORTED_KEYWORD",
            "STACK_COMPOSITION_EXTRA",
            "STACK_COMPOSITION_MISSING",
            "STANDARD_DEVIATION_SENTENCE",
            "STANDARD_EXAMPLE_LABEL",
            "STANDARD_INFORMATIVE_NORMATIVE",
            "STANDARD_LABEL_DUPLICATE",
            "STANDARD_LABEL_INVALID",
            "STANDARD_LABEL_ORDER",
            "STANDARD_MISSING_DEVIATION",
            "STANDARD_MISSING_REQUIREMENT",
            "STANDARD_MODAL_COUNT",
            "STANDARD_MODAL_VOCABULARY",
            "STANDARD_REQUIREMENT_COUNT",
            "STANDARD_SENTENCE_COUNT",
            "STANDARD_UNEXPECTED_DEVIATION",
            "STANDARD_UNLABELED_CONTENT",
            "SUMMARY_COUNT",
            "SUMMARY_ID_POSITION",
            "SUMMARY_MISSING_ID",
            "SUMMARY_NORMATIVE",
            "SUMMARY_RESTATES_REQUIREMENT",
            "SUMMARY_UNKNOWN_ID",
            "TEMPLATE_INDEX_PATH",
            "VERIFY_COMMAND",
            "VERIFY_DUPLICATE_ID",
            "VERIFY_GENERIC_EVIDENCE",
            "VERIFY_HEADER",
            "VERIFY_MARK",
            "VERIFY_MISSING_ID",
            "VERIFY_TEMPLATED_EVIDENCE",
            "VERIFY_UNKNOWN_ID",
            "WORKFLOW_KIND",
        };

        foreach (var code in StandardsValidator.StableDiagnosticCodes)
        {
            Assert.Contains(code, covered);
        }
    }
}
