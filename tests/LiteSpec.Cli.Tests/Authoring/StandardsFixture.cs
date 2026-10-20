using LiteSpec.Authoring;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Authoring;

/// <summary>
///     The minimal LiteSpec tree the Node suite builds, ported from
///     <c>tools/validate-standards.cases.mjs</c>. Each case starts from
///     <see cref="Base"/> and mutates one file.
/// </summary>
static class StandardsFixture
{
    /// <summary>The topic page every case mutates, with CLI evidence.</summary>
    public static readonly string TopicPage = Normalize("""
        # Topic Standard

        ## Intent

        This page defines one repository topic.

        ## Agent Summary {#agent-summary}

        - Keep the topic bounded. (litespec/rule/core-topic.keep-the-topic-bounded)

        ## Standards

        ### Keep the topic bounded (litespec/rule/core-topic.keep-the-topic-bounded)

        **Requirement:** Consumers MUST keep the topic inside its declared boundary.

        **Rationale:** The boundary gives reviewers one testable result.

        ## Conventions

        ### Use the default location (litespec/convention/core-topic.use-the-default-location)

        **Default:** Store the topic in its owning documentation area.

        **Replacement:** A consumer can name another location through an explicit local convention.

        ## Verification

        | ID | Mark | Evidence |
        |:---|:---|:---|
        | litespec/rule/core-topic.keep-the-topic-bounded | checkable | `litespec validate` confirms the topic stays inside its declared boundary. |
        | litespec/convention/core-topic.use-the-default-location | guidance | Does the topic live in its owning documentation area? |
        """) + "\n";

    /// <summary>The extension page, with CLI evidence.</summary>
    public static readonly string ExtensionPage = Normalize("""
        # Sample Extension

        ## Intent

        This extension adds one optional capability.

        ## Activation

        Activation scope: `local`.

        Applicable specification kinds: `use-case`.

        Enable this extension when the sample capability is required.

        ## Baseline relationship

        This extension replaces no baseline provision.

        ## Agent Summary {#agent-summary}

        - Record extension activation. (litespec/rule/ext-sample.record-extension-activation)

        ## Standards

        ### Record extension activation (litespec/rule/ext-sample.record-extension-activation)

        **Requirement:** Consumers MUST record activation on each applicable specification.

        ## Conventions

        None.

        ## Dependencies

        None.

        ## Verification

        | ID | Mark | Evidence |
        |:---|:---|:---|
        | litespec/rule/ext-sample.record-extension-activation | checkable | `litespec validate` confirms each applicable specification records its activation. |
        """) + "\n";

    /// <summary>The profile page, with CLI evidence.</summary>
    public static readonly string ProfilePage = Normalize("""
        # Sample Profile

        ## Intent

        This profile selects one standards composition.

        ## Agent Summary {#agent-summary}

        - Apply the complete profile. (litespec/rule/profile-sample.apply-the-complete-profile)

        ## Standards

        ### Apply the complete profile (litespec/rule/profile-sample.apply-the-complete-profile)

        **Requirement:** Consumers MUST apply every document in the selected profile composition.

        ## Composition

        - [Topic standard](../core/topic.md)

        ## Conventions

        None.

        ## Verification

        | ID | Mark | Evidence |
        |:---|:---|:---|
        | litespec/rule/profile-sample.apply-the-complete-profile | checkable | `litespec validate` compares the stack composition with its manifest entry. |
        """) + "\n";

    /// <summary>The how-to page.</summary>
    public static readonly string GuidePage = Normalize("""
        # Sample Guide

        ## Purpose

        Create one verified standards artifact.

        ## Prerequisites

        - Read the applicable canonical provision.

        ## Procedure

        1. Create the artifact in its owning directory.
        2. Run the applicable repository validator.

        ## Verification

        - Confirm that the validator exits with code zero.
        """) + "\n";

    /// <summary>The tutorial page.</summary>
    public static readonly string TutorialPage = Normalize("""
        # Sample Tutorial

        ## Purpose

        Produce one working standards artifact.

        ## Prerequisites

        - Install the repository validator.

        ## Lesson

        1. Create the artifact in its owning directory.
        2. Run the repository validator.

        ## What you built

        - Confirm that one validated artifact sits in its owning directory.
        """) + "\n";

    /// <summary>The reference page.</summary>
    public static readonly string ReferencePage = Normalize("""
        # Sample Reference

        ## Intent

        State the exact values that this repository publishes.

        ## Reference

        | Name | Value |
        |:---|:---|
        | Sample | One published value. |

        ## Notes

        The values above come from the repository manifest.
        """) + "\n";

    /// <summary>The command page. The validator checks its sections, not its sample command.</summary>
    public static readonly string CommandPage = Normalize("""
        # Sample Command

        ## Name

        `node tools/sample.mjs` runs one sample check.

        ## Synopsis

        ```bash
        node tools/sample.mjs [root]
        ```

        ## Description

        Run this command after changing the sample material.

        ## Arguments

        | Argument | Required | Effect |
        |:---|:---|:---|
        | `root` | no | Selects the repository to read. |

        ## Options

        None.

        ## Exit codes

        | Code | Meaning |
        |:---|:---|
        | `0` | The check passed. |
        | `1` | The check reported a defect. |

        ## Examples

        ```bash
        node tools/sample.mjs
        ```

        ## Underneath

        None.
        """) + "\n";

    /// <summary>
    ///     The routing block a documentation root index names before it links to one.
    /// </summary>
    public static readonly string IndexRouting =
        "## Which page do you want\n\n" +
        "A tutorial takes you through a first working result, one step at a time.\n" +
        "A how-to solves one stated problem for a reader who already has it running.\n" +
        "A reference states exact values, options, and defaults.\n" +
        "A command page documents one command and what it runs underneath.\n";

    /// <summary>Writes a file inside the temporary repository, creating its folder.</summary>
    public static void Write(string root, string relative, string contents)
    {
        var file = Path.Combine(root, relative.Replace('/', Path.DirectorySeparatorChar));
        Directory.CreateDirectory(Path.GetDirectoryName(file)!);
        File.WriteAllText(file, contents.Replace("\r\n", "\n"));
    }

    /// <summary>Deletes a file inside the temporary repository when it exists.</summary>
    public static void Delete(string root, string relative)
    {
        var file = Path.Combine(root, relative.Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(file))
        {
            File.Delete(file);
        }
    }

    /// <summary>Regenerates the provision index from the current standards.</summary>
    public static void RebuildIndex(string root)
    {
        Write(root, Provisions.IndexPath, Provisions.BuildIndex(root) + "\n");
    }

    /// <summary>
    ///     Writes the minimal repository every case mutates. Checkable evidence
    ///     names <c>litespec validate</c>, which needs no stub file, so unlike the
    ///     Node fixture this tree carries no <c>tools/</c> stub.
    /// </summary>
    public static void Base(string root)
    {
        Write(root, "docs/core/topic.md", TopicPage);
        Write(root, "docs/ext/sample.md", ExtensionPage);
        Write(root, "docs/profile/sample.md", ProfilePage);
        Write(root, "docs/guide/sample.md", GuidePage);
        Write(root, "docs/README.md", "# Documentation\n\n## Intent\n\nUse this page to find repository documentation.\n\n" + IndexRouting);
        Write(root, "docs/tutorial/sample.md", TutorialPage);
        Write(root, "docs/reference/sample.md", ReferencePage);
        Write(root, "docs/tools/sample.md", CommandPage);
        Write(root, "docs/reference/glossary.md", "# Glossary\n\n## Topic\n\nA bounded standards subject.\n");
        RebuildIndex(root);
    }

    /// <summary>Replaces the first occurrence, like JavaScript <c>String.replace</c>.</summary>
    public static string ReplaceFirst(string text, string oldValue, string newValue)
    {
        var index = text.IndexOf(oldValue, StringComparison.Ordinal);
        return index < 0 ? text : text[..index] + newValue + text[(index + oldValue.Length)..];
    }

    /// <summary>The shipped project schema, read from the real repository.</summary>
    public static string ShippedProjectSchema(string? root = null) =>
        File.ReadAllText(Path.Combine(root ?? Cli.Repository, "schemas", "litespec-project.schema.json"));

    static string Normalize(string value) => value.Replace("\r\n", "\n");
}
