using LiteSpec.Authoring;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Authoring;

/// <summary>
///     The minimal LiteSpec tree every standards case mutates, so each case isolates one rule.
///     Each case starts from <see cref="Base"/> and changes one file.
/// </summary>
static class StandardsFixture
{
    /// <summary>The topic page every case mutates, with CLI evidence.</summary>
    public static readonly string TopicPage = Normalize("""
        # Topic Standard

        ## Intent

        This page defines one repository topic.

        ## Agent Summary {#agent-summary}

        - Keep the topic bounded. (litespec/core/topic#keep-the-topic-bounded)

        ## Standards

        ### Keep the topic bounded

        **Requirement:** Consumers MUST keep the topic inside its declared boundary.

        **Rationale:** The boundary gives reviewers one testable result.

        ## Conventions

        ### Use the default location

        **Default:** Store the topic in its owning documentation area.

        **Replacement:** A consumer can name another location through an explicit local convention.

        ## Verification

        | ID | Mark | Evidence |
        |:---|:---|:---|
        | litespec/core/topic#keep-the-topic-bounded | checkable | `litespec validate` confirms the topic stays inside its declared boundary. |
        | litespec/core/topic#use-the-default-location | guidance | Does the topic live in its owning documentation area? |
        """) + "\n";

    /// <summary>The pattern page: one pattern with two drawn options.</summary>
    public static readonly string PatternPage = Normalize("""
        # Sample Patterns

        ## Intent

        This page offers drawn options for one recurring question.

        ## Agent Summary {#agent-summary}

        - The record header offers two options. (litespec/frontend/patterns/sample#record-header)

        ## Patterns

        ### Record header

        **Question:** How does the top of a record read?

        **Default:** `one-primary`

        **Rationale:** One primary action answers what comes next.

        #### `one-primary`: One primary action

        ```wireframe
        page
          header
            heading "SO-1042"
            action primary "Mark as shipped"
        ```

        **Rationale:** The next step is plain.

        **Cost:** Other commands wait in a menu.

        #### `two-equal`: Two equal actions

        ```wireframe
        page
          header
            heading "SO-1042"
            action "Mark as shipped"
            action "Refund"
        ```

        **Rationale:** Both commands are one click away.

        **Cost:** The reader compares labels before acting.

        ## Verification

        | ID | Mark | Evidence |
        |:---|:---|:---|
        | litespec/frontend/patterns/sample#record-header | guidance | Does the top of each record page match the default option or the one its catalog records? |
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

        - Record extension activation. (litespec/ext/sample#record-extension-activation)

        ## Standards

        ### Record extension activation

        **Requirement:** Consumers MUST record activation on each applicable specification.

        ## Conventions

        None.

        ## Dependencies

        None.

        ## Verification

        | ID | Mark | Evidence |
        |:---|:---|:---|
        | litespec/ext/sample#record-extension-activation | checkable | `litespec validate` confirms each applicable specification records its activation. |
        """) + "\n";

    /// <summary>The stack page, with CLI evidence.</summary>
    public static readonly string StackPage = Normalize("""
        # Sample Stack

        ## Intent

        This stack selects one standards composition.

        ## Agent Summary {#agent-summary}

        - Apply the complete stack. (litespec/backend/sample/stack#apply-the-complete-stack)

        ## Standards

        ### Apply the complete stack

        **Requirement:** Consumers MUST apply every document in the selected stack composition.

        ## Conventions

        None.

        ## Verification

        | ID | Mark | Evidence |
        |:---|:---|:---|
        | litespec/backend/sample/stack#apply-the-complete-stack | checkable | `litespec validate` confirms every document in the selected stack composition. |
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
    ///     names <c>litespec validate</c>, which needs no stub file, so this tree
    ///     carries no <c>tools/</c> stub.
    /// </summary>
    public static void Base(string root)
    {
        Write(root, "docs/core/topic.md", TopicPage);
        Write(root, "docs/ext/sample.md", ExtensionPage);
        Write(root, "docs/backend/sample/stack.md", StackPage);
        Write(root, "docs/frontend/patterns/sample.md", PatternPage);
        Write(root, "docs/guide/sample.md", GuidePage);
        Write(root, "docs/README.md", "# Documentation\n\n## Intent\n\nUse this page to find repository documentation.\n\n" + IndexRouting);
        Write(root, "docs/tutorial/sample.md", TutorialPage);
        Write(root, "docs/reference/sample.md", ReferencePage);
        Write(root, "docs/tools/sample.md", CommandPage);
        Write(root, "docs/reference/glossary.md", "# Glossary\n\n## Topic\n\nA bounded standards subject.\n");
        RebuildIndex(root);
    }

    /// <summary>Replaces the first occurrence of one substring with another.</summary>
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
