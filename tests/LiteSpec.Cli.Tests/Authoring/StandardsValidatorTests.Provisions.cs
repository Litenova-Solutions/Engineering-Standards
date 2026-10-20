namespace LiteSpec.Tests.Authoring;

/// <summary>Identifier, Standard, and Convention cases, each asserting its diagnostic codes.</summary>
public sealed partial class StandardsValidatorTests
{
    [Fact(DisplayName = "duplicate slug on one page")]
    public void DuplicateId() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "## Conventions", "### Keep the topic bounded\n\n**Requirement:** Consumers MUST keep the topic inside its declared boundary.\n\n## Conventions")),
        ["ID_DUPLICATE"]);

    [Fact(DisplayName = "identifier text in a provision heading")]
    public void IdInHeading() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "### Keep the topic bounded", "### Keep the topic bounded (litespec/core/topic#keep-the-topic-bounded)")),
        ["ID_IN_HEADING"]);

    [Fact(DisplayName = "legacy litespec rule citation")]
    public void LegacyRuleCitation() => Check(
        root => StandardsFixture.Write(root, "docs/README.md", "# Documentation\n\n## Intent\n\nThe page cites litespec/rule/core-topic.keep-the-topic-bounded.\n"),
        ["REMOVED_IDENTIFIER"]);

    [Fact(DisplayName = "page file name that is not kebab case")]
    public void PageFileNameNotKebab() => Check(
        root => StandardsFixture.Write(root, "docs/core/TwoWords.md", StandardsFixture.TopicPage),
        ["ID_PAGE_FILENAME"]);

    [Fact(DisplayName = "missing requirement")]
    public void MissingRequirement() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "**Requirement:** Consumers MUST keep the topic inside its declared boundary.\n\n", "")),
        ["STANDARD_MISSING_REQUIREMENT"]);

    [Fact(DisplayName = "multiple modals")]
    public void MultipleModals() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "Consumers MUST keep the topic inside its declared boundary.", "Consumers MUST write the topic and MUST review the topic.")),
        ["STANDARD_MODAL_COUNT"]);

    [Fact(DisplayName = "missing deviation")]
    public void MissingDeviation() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "Consumers MUST keep", "Consumers SHOULD keep")),
        ["STANDARD_MISSING_DEVIATION"]);

    [Fact(DisplayName = "missing convention default")]
    public void MissingConventionDefault() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "**Default:** Store the topic in its owning documentation area.\n\n", "")),
        ["CONVENTION_MISSING_DEFAULT"]);

    [Fact(DisplayName = "normative convention")]
    public void NormativeConvention() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "Store the topic in its owning documentation area.", "Consumers MUST store the topic in its owning documentation area.")),
        ["CONVENTION_NORMATIVE"]);

    [Fact(DisplayName = "summary without ID")]
    public void SummaryWithoutId() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "- Keep the topic bounded. (litespec/core/topic#keep-the-topic-bounded)", "- Keep the topic bounded.")),
        ["SUMMARY_MISSING_ID"]);

    [Fact(DisplayName = "missing evidence row")]
    public void MissingEvidenceRow() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "| litespec/core/topic#keep-the-topic-bounded | checkable | `litespec validate` confirms the topic stays inside its declared boundary. |\n", "")),
        ["VERIFY_MISSING_ID"]);

    [Fact(DisplayName = "unknown active ID")]
    public void UnknownActiveId() => Check(
        root => StandardsFixture.Write(root, "docs/README.md", "# Documentation\n\n## Intent\n\nThe page cites litespec/core/topic#unknown-rule.\n"),
        ["ID_UNKNOWN_REFERENCE"]);

    [Fact(DisplayName = "stale citation")]
    public void StaleCitation() => Check(
        root => StandardsFixture.Write(root, "docs/README.md", "# Documentation\n\n## Intent\n\nThe page cites litespec/core/topic#keep-the-topic-bounded-elsewhere.\n"),
        ["ID_UNKNOWN_REFERENCE"]);

    [Fact(DisplayName = "grammar notation is not a citation")]
    public void GrammarNotationIsNotCitation() => Check(
        root => StandardsFixture.Write(root, "docs/README.md", "# Documentation\n\n## Intent\n\nAn identifier uses litespec/<page>#<slug> as its grammar.\n\n" + StandardsFixture.IndexRouting),
        []);

    [Fact(DisplayName = "unsupported modal vocabulary")]
    public void UnsupportedModalVocabulary() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "Consumers MUST keep the topic inside its declared boundary.", "Consumers MUST keep the topic bounded and SHALL record its owner.")),
        ["STANDARD_MODAL_VOCABULARY"]);

    [Fact(DisplayName = "multiple requirement sentences")]
    public void MultipleRequirementSentences() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "Consumers MUST keep the topic inside its declared boundary.", "Consumers MUST keep the topic inside its boundary. Reviewers inspect the result.")),
        ["STANDARD_SENTENCE_COUNT"]);

    [Fact(DisplayName = "duplicate Requirement")]
    public void DuplicateRequirement() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "**Rationale:** The boundary gives reviewers one testable result.", "**Requirement:** Consumers MUST name the topic owner.\n\n**Rationale:** The boundary gives reviewers one testable result.")),
        ["STANDARD_REQUIREMENT_COUNT"]);

    [Fact(DisplayName = "unexpected deviation")]
    public void UnexpectedDeviation() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "**Rationale:** The boundary gives reviewers one testable result.", "**Deviation:** No deviation applies.\n\n**Rationale:** The boundary gives reviewers one testable result.")),
        ["STANDARD_UNEXPECTED_DEVIATION"]);

    [Fact(DisplayName = "deviation sentence count")]
    public void DeviationSentenceCount() => Check(
        root =>
        {
            var page = StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "Consumers MUST keep", "Consumers SHOULD keep");
            page = StandardsFixture.ReplaceFirst(page, "**Rationale:** The boundary gives reviewers one testable result.", "**Deviation:** A local decision permits another boundary. The decision names its owner.\n\n**Rationale:** The boundary gives reviewers one testable result.");
            StandardsFixture.Write(root, "docs/core/topic.md", page);
        },
        ["STANDARD_DEVIATION_SENTENCE"]);

    [Fact(DisplayName = "unlabeled example")]
    public void UnlabeledExample() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "## Conventions", "```text\nexample\n```\n\n## Conventions")),
        ["STANDARD_EXAMPLE_LABEL"]);

    [Fact(DisplayName = "normative rationale")]
    public void NormativeRationale() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "The boundary gives reviewers one testable result.", "Reviewers MUST record the boundary result.")),
        ["STANDARD_INFORMATIVE_NORMATIVE"]);

    [Fact(DisplayName = "duplicate label")]
    public void DuplicateLabel() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "**Rationale:** The boundary gives reviewers one testable result.", "**Rationale:** The boundary gives reviewers one testable result.\n\n**Rationale:** Another explanation.")),
        ["STANDARD_LABEL_DUPLICATE"]);

    [Fact(DisplayName = "invalid label")]
    public void InvalidLabel() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "**Rationale:** The boundary gives reviewers one testable result.", "**Default:** Keep another default.\n\n**Rationale:** The boundary gives reviewers one testable result.")),
        ["STANDARD_LABEL_INVALID"]);

    [Fact(DisplayName = "label order")]
    public void LabelOrder() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "**Rationale:** The boundary gives reviewers one testable result.", "**Example:** One example.\n\n**Rationale:** The boundary gives reviewers one testable result.")),
        ["STANDARD_LABEL_ORDER"]);

    [Fact(DisplayName = "unlabeled provision content")]
    public void UnlabeledProvisionContent() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "**Rationale:** The boundary gives reviewers one testable result.", "Additional constraint.\n\n**Rationale:** The boundary gives reviewers one testable result.")),
        ["STANDARD_UNLABELED_CONTENT"]);

    [Fact(DisplayName = "missing convention replacement")]
    public void MissingConventionReplacement() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "**Replacement:** A consumer can name another location through an explicit local convention.\n", "")),
        ["CONVENTION_MISSING_REPLACEMENT"]);

    [Fact(DisplayName = "default sentence count")]
    public void DefaultSentenceCount() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "Store the topic in its owning documentation area.", "Store the topic in its owning documentation area. Record the path.")),
        ["CONVENTION_DEFAULT_SENTENCE"]);

    [Fact(DisplayName = "replacement sentence count")]
    public void ReplacementSentenceCount() => Check(
        root => StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "A consumer can name another location through an explicit local convention.", "A consumer can name another location. The local convention records it.")),
        ["CONVENTION_REPLACEMENT_SENTENCE"]);
}
