namespace LiteSpec.Tests.Authoring;

/// <summary>Verification cases, each asserting its diagnostic codes.</summary>
public sealed partial class StandardsValidatorTests
{
    [Fact(DisplayName = "duplicate verification row")]
    public void DuplicateVerificationRow() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "| litespec/core/topic#use-the-default-location | guidance | Does the topic live in its owning documentation area? |", "| litespec/core/topic#keep-the-topic-bounded | checkable | `litespec validate` confirms the topic stays inside its declared boundary. |\n| litespec/core/topic#use-the-default-location | guidance | Does the topic live in its owning documentation area? |")),
        ["VERIFY_DUPLICATE_ID"]);

    [Fact(DisplayName = "old verification method header")]
    public void OldVerificationMethodHeader() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "| ID | Mark | Evidence |", "| ID | Method | Evidence |")),
        ["VERIFY_HEADER"]);

    [Fact(DisplayName = "verification without a table")]
    public void VerificationWithoutTable() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "## Verification\n\n| ID | Mark | Evidence |\n|:---|:---|:---|\n| litespec/core/topic#keep-the-topic-bounded | checkable | `litespec validate` confirms the topic stays inside its declared boundary. |\n| litespec/core/topic#use-the-default-location | guidance | Does the topic live in its owning documentation area? |\n", "## Verification\n\n- Confirm that the validator exits with code zero.\n")),
        ["VERIFY_HEADER", "VERIFY_MISSING_ID"]);

    [Fact(DisplayName = "unknown verification mark")]
    public void UnknownVerificationMark() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "| litespec/core/topic#keep-the-topic-bounded | checkable |", "| litespec/core/topic#keep-the-topic-bounded | manual |")),
        ["VERIFY_MARK"]);

    [Fact(DisplayName = "checkable evidence naming a missing file")]
    public void CheckableEvidenceMissingFile() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "`litespec validate` confirms the topic stays inside its declared boundary.", "`tools/validate-missing.mjs` confirms the topic stays inside its declared boundary.")),
        ["VERIFY_COMMAND"]);

    [Fact(DisplayName = "checkable evidence naming no command")]
    public void CheckableEvidenceNoCommand() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "`litespec validate` confirms the topic stays inside its declared boundary.", "A reviewer confirms the topic stays inside its declared boundary.")),
        ["VERIFY_COMMAND"]);

    [Fact(DisplayName = "checkable evidence naming the consumer-side tool path")]
    public void CheckableEvidenceConsumerToolPath() => Check(
        root =>
        {
            StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "`litespec validate` confirms the topic stays inside its declared boundary.", "`litespec consumer` confirms the topic stays inside its declared boundary."));
            StandardsFixture.RebuildIndex(root);
        },
        []);

    [Fact(DisplayName = "checkable evidence naming a consumer-side suite path")]
    public void CheckableEvidenceConsumerSuitePath() => Check(
        root =>
        {
            StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "`litespec validate` confirms the topic stays inside its declared boundary.", "`tests/routes/every-route.spec.ts` proves the topic boundary in a browser."));
            StandardsFixture.Write(root, "tests/routes/every-route.spec.ts", "// Fixture stub so the consumer suite path resolves.\n");
            StandardsFixture.RebuildIndex(root);
        },
        []);

    [Fact(DisplayName = "guidance evidence names no command")]
    public void GuidanceEvidenceNoCommand() => Check(
        root =>
        {
            StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "| litespec/core/topic#keep-the-topic-bounded | checkable | `litespec validate` confirms the topic stays inside its declared boundary. |", "| litespec/core/topic#keep-the-topic-bounded | guidance | Does the topic stay inside its declared boundary? |"));
            StandardsFixture.RebuildIndex(root);
        },
        []);

    [Fact(DisplayName = "generic verification evidence")]
    public void GenericVerificationEvidence() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "confirms the topic stays inside its declared boundary.", "runs, then inspect evidence for the topic boundary.")),
        ["VERIFY_GENERIC_EVIDENCE"]);

    [Fact(DisplayName = "unknown verification row")]
    public void UnknownVerificationRow() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "| litespec/core/topic#use-the-default-location | guidance | Does the topic live in its owning documentation area? |", "| litespec/core/topic#use-the-default-location | guidance | Does the topic live in its owning documentation area? |\n| litespec/core/topic#unknown-verification | checkable | `litespec validate` asserts the unknown row. |")),
        ["VERIFY_UNKNOWN_ID"]);

    [Fact(DisplayName = "provision restates its heading")]
    public void ProvisionRestatesHeading() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "**Requirement:** Consumers MUST keep the topic inside its declared boundary.", "**Requirement:** Consumers MUST keep the topic bounded.")),
        ["PROVISION_RESTATES_HEADING"]);

    [Fact(DisplayName = "evidence repeats its provision heading")]
    public void EvidenceRepeatsHeading() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "| litespec/core/topic#keep-the-topic-bounded | checkable | `litespec validate` confirms the topic stays inside its declared boundary. |", "| litespec/core/topic#keep-the-topic-bounded | checkable | Pull request review asserts `keep the topic bounded` in the owning specification. |")),
        ["VERIFY_TEMPLATED_EVIDENCE"]);
}
