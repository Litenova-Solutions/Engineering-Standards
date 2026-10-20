namespace LiteSpec.Tests.Authoring;

/// <summary>Manifest, stack, extension, identifier-scope, and vocabulary cases.</summary>
public sealed partial class StandardsValidatorTests
{
    static readonly string RegistryManifest = "{\"provisionRegistry\":{\"areas\":[\"CORE\",\"EXT\",\"PROFILE\"]}}";

    static readonly string SampleExtensionManifest =
        "{\"extensions\":{\"sample\":{\"path\":\"docs/ext/sample.md\"," +
        "\"activationScope\":\"local\",\"applicableKinds\":[\"use-case\"]}}}";

    [Fact(DisplayName = "manifest JSON")]
    public void ManifestJson() => Check(
        root => StandardsFixture.Write(root, "litespec.manifest.json", "{"),
        ["MANIFEST_JSON"]);

    [Fact(DisplayName = "manifest path")]
    public void ManifestPath() => Check(
        root => StandardsFixture.Write(root, "litespec.manifest.json", "{\"agentsEntry\":\"missing.md\"}"),
        ["MANIFEST_PATH"]);

    [Fact(DisplayName = "manifest anchor")]
    public void ManifestAnchor() => Check(
        root => StandardsFixture.Write(root, "litespec.manifest.json", "{\"agentsEntry\":\"docs/core/topic.md#missing\"}"),
        ["MANIFEST_ANCHOR"]);

    [Fact(DisplayName = "manifest duplicate path")]
    public void ManifestDuplicatePath() => Check(
        root => StandardsFixture.Write(root, "litespec.manifest.json", "{\"stacks\":{\"sample\":{\"entry\":\"docs/profile/sample.md\",\"pages\":[\"docs/core/topic.md\",\"docs/core/topic.md\"]}}}"),
        ["MANIFEST_DUPLICATE_PATH"]);

    [Fact(DisplayName = "stack composition missing")]
    public void StackCompositionMissing() => Check(
        root => StandardsFixture.Write(root, "litespec.manifest.json", "{\"stacks\":{\"sample\":{\"entry\":\"docs/profile/sample.md\",\"pages\":[\"docs/core/topic.md\",\"docs/core/other.md\"]}}}"),
        ["STACK_COMPOSITION_MISSING"]);

    [Fact(DisplayName = "stack composition extra")]
    public void StackCompositionExtra() => Check(
        root => StandardsFixture.Write(root, "litespec.manifest.json", "{\"stacks\":{\"sample\":{\"entry\":\"docs/profile/sample.md\",\"pages\":[]}}}"),
        ["STACK_COMPOSITION_EXTRA"]);

    [Fact(DisplayName = "stack composition matches")]
    public void StackCompositionMatches() => Check(
        root => StandardsFixture.Write(root, "litespec.manifest.json", "{\"provisionRegistry\":{\"areas\":[\"CORE\",\"EXT\",\"PROFILE\"]},\"stacks\":{\"sample\":{\"entry\":\"docs/profile/sample.md\",\"pages\":[\"docs/core/topic.md\"]}}}"),
        []);

    [Fact(DisplayName = "extension scope mismatch")]
    public void ExtensionScopeMismatch() => Check(
        root => StandardsFixture.Write(root, "litespec.manifest.json", "{\"extensions\":{\"sample\":{\"path\":\"docs/ext/sample.md\",\"activationScope\":\"project\"}}}"),
        ["EXTENSION_SCOPE"]);

    [Fact(DisplayName = "extension kind mismatch")]
    public void ExtensionKindMismatch() => Check(
        root => StandardsFixture.Write(root, "litespec.manifest.json", "{\"extensions\":{\"sample\":{\"path\":\"docs/ext/sample.md\",\"activationScope\":\"local\",\"applicableKinds\":[\"workflow\"]}}}"),
        ["EXTENSION_KIND"]);

    [Fact(DisplayName = "missing extension activation")]
    public void MissingExtensionActivation() => Check(
        root =>
        {
            StandardsFixture.Write(root, "docs/ext/sample.md", StandardsFixture.ReplaceFirst(StandardsFixture.ExtensionPage, "\nEnable this extension when the sample capability is required.\n", "\n"));
            StandardsFixture.Write(root, "litespec.manifest.json", SampleExtensionManifest);
        },
        ["EXTENSION_ACTIVATION"]);

    [Fact(DisplayName = "empty baseline relationship")]
    public void EmptyBaselineRelationship() => Check(
        root =>
        {
            StandardsFixture.Write(root, "docs/ext/sample.md", StandardsFixture.ReplaceFirst(StandardsFixture.ExtensionPage, "This extension replaces no baseline provision.\n", ""));
            StandardsFixture.Write(root, "litespec.manifest.json", SampleExtensionManifest);
        },
        ["EXTENSION_BASELINE"]);

    [Fact(DisplayName = "empty extension dependencies")]
    public void EmptyExtensionDependencies() => Check(
        root =>
        {
            StandardsFixture.Write(root, "docs/ext/sample.md", StandardsFixture.ReplaceFirst(StandardsFixture.ExtensionPage, "## Dependencies\n\nNone.", "## Dependencies\n"));
            StandardsFixture.Write(root, "litespec.manifest.json", SampleExtensionManifest);
        },
        ["EXTENSION_DEPENDENCIES"]);

    [Fact(DisplayName = "extension replacing an unknown provision")]
    public void ExtensionReplacesUnknown() => Check(
        root => StandardsFixture.Write(root, "litespec.manifest.json", "{\"extensions\":{\"sample\":{\"path\":\"docs/ext/sample.md\",\"activationScope\":\"local\",\"applicableKinds\":[\"use-case\"],\"replaces\":[\"litespec/rule/core-topic.unknown-replacement\"]}}}"),
        ["EXTENSION_REPLACES_UNKNOWN"]);

    [Fact(DisplayName = "extension enforcing a replaced provision")]
    public void ExtensionReplacesEnforced() => Check(
        root => StandardsFixture.Write(root, "litespec.manifest.json", "{\"extensions\":{\"sample\":{\"path\":\"docs/ext/sample.md\",\"activationScope\":\"local\",\"applicableKinds\":[\"use-case\"],\"replaces\":[\"litespec/rule/ext-sample.record-extension-activation\"]}}}"),
        ["EXTENSION_REPLACES_ENFORCED"]);

    [Fact(DisplayName = "extension replacing a baseline provision")]
    public void ExtensionReplacesBaseline() => Check(
        root => StandardsFixture.Write(root, "litespec.manifest.json", "{\"provisionRegistry\":{\"areas\":[\"CORE\",\"EXT\",\"PROFILE\"]},\"extensions\":{\"sample\":{\"path\":\"docs/ext/sample.md\",\"activationScope\":\"local\",\"applicableKinds\":[\"use-case\"],\"replaces\":[\"litespec/rule/core-topic.keep-the-topic-bounded\"]}}}"),
        []);

    [Fact(DisplayName = "provision that does not name its page")]
    public void ProvisionNotNamingPage() => Check(
        root =>
        {
            StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.TopicPage.Replace("litespec/rule/core-topic.", "litespec/rule/core-other."));
            StandardsFixture.Write(root, "litespec.manifest.json", RegistryManifest);
        },
        ["ID_SCOPE_MISMATCH"]);

    [Fact(DisplayName = "provisions under an unregistered area directory")]
    public void ProvisionsUnderUnknownArea() => Check(
        root =>
        {
            StandardsFixture.Write(root, "docs/other/topic.md", StandardsFixture.TopicPage.Replace("litespec/rule/core-topic.", "litespec/rule/other-topic."));
            StandardsFixture.Write(root, "litespec.manifest.json", RegistryManifest);
        },
        ["ID_AREA_UNKNOWN"]);

    [Fact(DisplayName = "page file name that is not one lowercase word")]
    public void PageFileNameNotOneWord() => Check(
        root =>
        {
            StandardsFixture.Write(root, "docs/core/two-words.md", StandardsFixture.TopicPage.Replace("litespec/rule/core-topic.", "litespec/rule/core-two-words."));
            StandardsFixture.Write(root, "litespec.manifest.json", RegistryManifest);
        },
        ["ID_PAGE_FILENAME"]);

    [Fact(DisplayName = "provision slug that does not match its heading")]
    public void ProvisionSlugMismatch() => Check(
        root =>
        {
            StandardsFixture.Write(root, "docs/core/topic.md", StandardsFixture.ReplaceFirst(StandardsFixture.TopicPage, "### Keep the topic bounded", "### Keep the topic bounded tightly"));
            StandardsFixture.Write(root, "litespec.manifest.json", RegistryManifest);
        },
        ["ID_SLUG_MISMATCH"]);

    [Fact(DisplayName = "removed numbered identifier")]
    public void RemovedNumberedIdentifier() => Check(
        root => StandardsFixture.Write(root, "docs/README.md", "# Documentation\n\n## Intent\n\nThe page cites INV-ORDERS-01.\n"),
        ["REMOVED_IDENTIFIER"]);

    [Fact(DisplayName = "removed slashed identifier")]
    public void RemovedSlashedIdentifier() => Check(
        root => StandardsFixture.Write(root, "docs/README.md", "# Documentation\n\n## Intent\n\nThe page cites invariant/orders.only-placed-ships.\n"),
        ["REMOVED_IDENTIFIER"]);

    [Fact(DisplayName = "removed project rule prefix")]
    public void RemovedProjectRulePrefix() => Check(
        root => StandardsFixture.Write(root, "docs/README.md", "# Documentation\n\n## Intent\n\nThe page cites acme/rule/agents.what-acme-is.\n"),
        ["REMOVED_IDENTIFIER"]);

    [Fact(DisplayName = "bare refused prefixes are documentation")]
    public void BareRefusedPrefixesAreDocumentation() => Check(
        root => StandardsFixture.Write(root, "docs/README.md", "# Documentation\n\n## Intent\n\nRefused prefixes are AC-, INV-, path/, value/ and workflow/.\n\n" + StandardsFixture.IndexRouting),
        []);

    [Fact(DisplayName = "Workflow as a kind")]
    public void WorkflowAsKind() => Check(
        root => StandardsFixture.Write(root, "docs/README.md", "# Documentation\n\n## Intent\n\nA Workflow names its triggers and owner.\n"),
        ["WORKFLOW_KIND"]);

    [Fact(DisplayName = "lowercase workflow prose passes")]
    public void LowercaseWorkflowPasses() => Check(
        root => StandardsFixture.Write(root, "docs/README.md", "# Documentation\n\n## Intent\n\nThe release workflow runs weekly.\n\n" + StandardsFixture.IndexRouting),
        []);
}
