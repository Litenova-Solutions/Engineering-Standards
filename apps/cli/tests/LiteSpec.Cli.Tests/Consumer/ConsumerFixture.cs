using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Consumer;

/// <summary>
/// Builds the throwaway small consumer every consumer case validates: a library-style shop with
/// one module, one aggregate, one use case with its results, one rule and
/// one event, actors, roles, permissions, entry points, one requirement, one
/// decision, and one page per page style. Every test owns its own folder.
/// </summary>
static class ConsumerFixture
{
    /// <summary>Two-space indent with relaxed escaping for fixture JSON.</summary>
    static readonly JsonSerializerOptions Json = new()
    {
        WriteIndented = true,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    static readonly Lazy<ManifestInfo> Manifest = new(ReadManifest);

    /// <summary>The pinned release the fixture project reviews, from the tracked manifest.</summary>
    public static string ManifestVersion => Manifest.Value.Version;

    /// <summary>The first extension id in the tracked manifest, or <c>outbox</c>.</summary>
    public static string KnownExtension => Manifest.Value.KnownExtension;

    /// <summary>One fixture page: repository-relative path, frontmatter JSON, body.</summary>
    sealed record PageSpec(string Relative, string Meta, string Body);

    // Every body sentence stays inside the prose measures, so the baseline case
    // proves the checks rather than the fixture prose.
    static readonly PageSpec[] Pages =
    [
        new("docs/product/brief.md",
            """
            {"type":"product","id":"product/fixture","title":"Fixture Shop","owner":"fixture","status":"approved","boundary":"The shop sells printed books to readers.","neverDoes":["The shop never sells ebooks."],"audience":["actor/customer"]}
            """,
            """
            # Fixture Shop

            ## Summary

            The shop sells printed books to readers in one city.

            """),
        new("docs/product/pricing.md",
            """
            {"type":"requirement-page","id":"pricing","title":"Pricing","owner":"fixture","status":"approved","records":[{"type":"requirement","id":"requirement/pricing.flat-fee","title":"Flat fee","kind":"business","statement":"Every order carries a flat fee of one euro.","rationale":"One fee keeps every receipt readable.","values":[{"value":"EUR 1.00","effectiveFrom":"2026-01-01"}]}]}
            """,
            """
            # Pricing

            ## Summary

            Every order carries a flat fee of one euro.

            ## The Situation

            Customers wait weeks to learn what delivery costs.

            ## What We Do

            The shop charges one flat fee on every order.

            ## Why It Is Better

            One fee keeps every receipt readable at a glance.

            ## Example

            Alex orders two books on Monday and pays one fee at checkout.

            ## Costs and Risks

            Large orders pay too little for their delivery cost.

            ## How Sure We Are

            The launch plan states the fee with high confidence.

            ## Position

            The shop holds the flat fee until delivery costs move.

            ## Refusals

            The shop refuses a percentage fee on every order.

            """),
        new("docs/product/decisions/0001-launch.md",
            """
            {"type":"decision","id":"decision/0001-launch","title":"Launch with a flat fee","owner":"fixture","status":"approved","decided":"2026-01-01","options":[{"name":"Flat fee","for":"Every receipt shows the same fee line.","against":"Large orders pay too little for delivery."},{"name":"Percentage","for":"Large orders carry their delivery cost.","against":"Every receipt needs its own math."}],"chosen":"Flat fee","changeWhen":"The fee changes when delivery costs move.","decides":["requirement/pricing.flat-fee"],"basedOn":[]}
            """,
            """
            # Launch with a Flat Fee

            ## Context

            The shop opens with one fee it can state on every page.

            ## Decision

            The shop charges a flat fee on every order.

            ## Consequences

            Every receipt shows the same fee line.

            ## Evidence with Confidence

            The launch plan states the fee on its first page.

            """),
        new("docs/domain/actors/customer.md",
            """
            {"type":"actor","id":"actor/customer","title":"Customer","owner":"fixture","status":"approved","kind":"person","holds":[{"role":"role/customer","scope":"self"}]}
            """,
            """
            # Customer

            ## Summary

            A customer buys books from the shop.

            """),
        new("docs/domain/roles/customer.md",
            """
            {"type":"role","id":"role/customer","title":"Customer","owner":"fixture","status":"approved","scope":"self","allows":["permission/cancel-order"]}
            """,
            """
            # Customer

            ## Summary

            A customer holds this role on their own orders.

            """),
        new("docs/domain/permissions.md",
            """
            {"type":"permission-list","id":"permissions","title":"Permissions","owner":"fixture","status":"approved","records":[{"type":"permission","id":"permission/cancel-order","title":"Cancel order","meaning":"The holder cancels an order they placed."}]}
            """,
            """
            # Permissions

            The list below names every action the shop grants.

            """),
        new("docs/domain/entry-points.md",
            """
            {"type":"entry-point-list","id":"entry-points","title":"Entry points","owner":"fixture","status":"approved","records":[{"type":"entry-point","id":"entry-point/web","title":"Web shop","kind":"app","path":"apps/web"}]}
            """,
            """
            # Entry Points

            Customers reach the shop through the web shop.

            """),
        new("docs/domain/modules/orders/README.md",
            """
            {"type":"module","id":"module/orders","title":"Orders","owner":"fixture","status":"approved","dependsOn":[]}
            """,
            """
            # Orders

            The orders module keeps every order claim.

            """),
        new("docs/domain/modules/orders/order-claims/README.md",
            """
            {"type":"aggregate","id":"aggregate/orders.order-claim","title":"Order claim","owner":"fixture","status":"approved","states":[{"name":"Draft","meaning":"The claim is open for changes."},{"name":"Canceled","meaning":"The customer canceled the claim."}],"records":[{"type":"rule","id":"rule/order-claim.cancel-before-shipment-only","title":"Cancel before shipment only","kind":"precondition","statement":"A customer cancels an order claim only before its shipment leaves.","governs":["use-case/orders.cancel-order"],"refusal":"result/cancel-order.cancel-refused","basedOn":[],"fulfills":["requirement/pricing.flat-fee"]},{"type":"event","id":"event/order-claim.order-canceled","title":"Order canceled","meaning":"An order claim was canceled.","carries":["orderId"]}]}
            """,
            """
            # Order Claim

            ## Transitions

            | From | To | Triggered By |
            |:---|:---|:---|
            | Draft | Canceled | Cancel order |

            ## Data

            | Name | Meaning | Classification |
            |:---|:---|:---|
            | orderId | The order this claim states. | internal |

            """),
        new("docs/domain/modules/orders/cancel-order.md",
            """
            {"type":"use-case","id":"use-case/orders.cancel-order","title":"Cancel order","owner":"fixture","status":"approved","kind":"command","needs":["permission/cancel-order"],"reachedThrough":["entry-point/web"],"raises":["event/order-claim.order-canceled"],"fulfills":["requirement/pricing.flat-fee"],"records":[{"type":"result","id":"result/cancel-order.order-canceled","title":"Order canceled","outcome":"success","meaning":"The order claim was canceled."},{"type":"result","id":"result/cancel-order.cancel-refused","title":"Cancel refused","outcome":"refusal","code":"orders.cancel-refused","meaning":"The shipment already left, so the cancel is refused."}]}
            """,
            """
            # Cancel Order

            ## Goal

            A customer cancels an order claim before shipment.

            ## What Happens

            The customer asks to cancel the claim. The shop refuses the cancel when the shipment already left.

            """),
        new("docs/guide/first-run.md",
            """
            {"type":"tutorial","id":"first-run","title":"Run It For The First Time","owner":"fixture","status":"approved"}
            """,
            """
            # Run It for the First Time

            ## Purpose

            This lesson starts the shop on a reader machine.

            ## Prerequisites

            - The reader installed the runtime the README names.

            ## Lesson

            Run the start command and open the shop page.

            ## What You Built

            The shop answers on the reader machine now.

            """),
        new("docs/guide/add-a-pack.md",
            """
            {"type":"how-to","id":"add-a-pack","title":"Add A Seed Pack","owner":"fixture","status":"approved"}
            """,
            """
            # Add a Seed Pack

            ## Purpose

            This page adds one seed pack to the shop.

            ## Procedure

            1. Copy the pack file into the packs folder.
            2. Run the seed command the README names.

            ## Check

            The shop lists the pack on its packs page.

            """),
        new("docs/tools/fixture-up.md",
            """
            {"type":"command","id":"fixture-up","title":"Fixture Up","owner":"fixture","status":"approved"}
            """,
            """
            # Fixture Up

            ## Name

            `fixture up` starts the shop.

            ## Synopsis

            ```bash
            fixture up [--detach]
            ```

            ## Description

            The command starts the shop and its database.

            ## Arguments

            | Argument | Required | Effect |
            |:---|:---|:---|
            | `target` | no | Selects the shop to start. |

            ## Options

            | Option | Default | Effect |
            |:---|:---|:---|
            | `--detach` | off | Starts the shop behind the terminal. |

            ## Exit Codes

            | Code | Meaning |
            |:---|:---|
            | `0` | The shop started. |
            | `1` | The shop failed to start. |

            ## Examples

            Start the shop from its root:

            ```bash
            fixture up
            ```

            ## Underneath

            The command runs the database and then the shop.

            """),
        new("docs/reference/ports.md",
            """
            {"type":"reference","id":"ports","title":"Allocated Ports","owner":"fixture","status":"approved"}
            """,
            """
            # Allocated Ports

            ## Intent

            This page lists the ports the shop uses.

            ## Reference

            | Name | Value |
            |:---|:---|
            | `shop` | `5080` |

            """),
        new("docs/tools/configuration.md",
            """
            {"type":"configuration","id":"configuration","title":"Fixture Settings","owner":"fixture","status":"approved"}
            """,
            """
            # Fixture Settings

            ## Intent

            This page lists the settings the shop reads.

            ## Settings

            | Setting | Meaning |
            |:---|:---|
            | `seedPack` | The pack the shop seeds. |

            ## Precedence

            The file sets the base and flags win.

            """),
    ];

    const string GlossaryJsonText = """
        {"schemaVersion":2,"terms":[{"id":"term/order-claim","term":"order claim","meaning":"A claim stating what a customer ordered from the shop.","labels":{"nl":"orderclaim","de":"Bestellanspruch"},"rejected":[{"word":"orderclaim","reason":"the words stay separate."}],"owner":"fixture","status":"approved"}],"mannered":[{"term":"load-bearing","instead":"required"}]}
        """;

    sealed record ManifestInfo(string Version, string KnownExtension);

    static ManifestInfo ReadManifest()
    {
        var manifest = (JsonObject)JsonNode.Parse(File.ReadAllText(Path.Combine(Cli.Repository, "litespec.manifest.json")))!;
        var version = (string?)manifest["version"] ?? "2.0.0";
        var known = manifest["extensions"] is JsonObject extensions && extensions.Count > 0
            ? extensions.Select(pair => pair.Key).First()
            : "outbox";
        return new ManifestInfo(version, known);
    }

    /// <summary>Serializes a JSON value with two-space indent and relaxed escaping.</summary>
    public static string Stringify(JsonNode? node) => node!.ToJsonString(Json);

    /// <summary>Parses inline JSON into a JSON value.</summary>
    public static JsonNode Meta(string json) => JsonNode.Parse(json)!;

    /// <summary>Combines frontmatter JSON and a body into one page.</summary>
    public static string Page(JsonNode meta, string body) => $"---\n{Stringify(meta)}\n---\n{body}";

    /// <summary>Builds a fresh fixture consumer in its own temporary folder.</summary>
    public static TempFolder Create()
    {
        var folder = Cli.Temp("consumer");
        // The project file drives path resolution. The fixture declares no frontend,
        // so the controlled UI validator stays out of these cases.
        var project = new JsonObject
        {
            ["project"] = new JsonObject { ["name"] = "fixture" },
            ["size"] = "small",
            ["stacks"] = new JsonArray("dotnet"),
            ["reviewedLiteSpecVersion"] = ManifestVersion,
            ["paths"] = new JsonObject
            {
                ["docs"] = "docs",
                ["domainDocs"] = "docs/domain",
                ["uiDocs"] = "docs/ui",
                ["frontends"] = new JsonArray(),
            },
            ["selectedExtensions"] = new JsonArray(),
            ["owners"] = new JsonArray("fixture"),
            ["constraints"] = new JsonObject { ["answered"] = true },
            ["optionalTypes"] = new JsonArray(),
        };
        WriteFile(folder.Path, "litespec.project.json", $"{Stringify(project)}\n");
        Directory.CreateDirectory(Path.Combine(folder.Path, "litespec"));
        File.Copy(
            Path.Combine(Cli.Repository, "litespec.manifest.json"),
            Path.Combine(folder.Path, "litespec", "litespec.manifest.json"));
        foreach (var page in Pages)
        {
            WriteFile(folder.Path, page.Relative, Page(Meta(page.Meta), page.Body));
        }

        WriteFile(folder.Path, "docs/glossary.json", $"{Stringify(Meta(GlossaryJsonText))}\n");
        return folder;
    }

    /// <summary>Writes a file under the fixture root, creating its directory.</summary>
    public static void WriteFile(string root, string relative, string contents)
    {
        var file = Resolve(root, relative);
        Directory.CreateDirectory(Path.GetDirectoryName(file)!);
        File.WriteAllText(file, contents);
    }

    /// <summary>Reads a file under the fixture root.</summary>
    public static string ReadFile(string root, string relative) => File.ReadAllText(Resolve(root, relative));

    /// <summary>Mutates one page's frontmatter, leaving its body alone.</summary>
    public static void MutateMeta(string root, string relative, Action<JsonObject> mutate)
    {
        var raw = ReadFile(root, relative);
        var end = raw.IndexOf("\n---", 3, StringComparison.Ordinal);
        var meta = (JsonObject)JsonNode.Parse(raw.Substring(3, end - 3).Trim())!;
        var body = raw.Substring(end + 4);
        mutate(meta);
        WriteFile(root, relative, $"---\n{Stringify(meta)}\n---{body}");
    }

    /// <summary>Mutates <c>litespec.project.json</c>.</summary>
    public static void MutateProject(string root, Action<JsonObject> mutate)
    {
        var project = (JsonObject)JsonNode.Parse(ReadFile(root, "litespec.project.json"))!;
        mutate(project);
        WriteFile(root, "litespec.project.json", $"{Stringify(project)}\n");
    }

    /// <summary>Mutates one JSON file under the fixture root.</summary>
    public static void MutateJson(string root, string relative, Action<JsonObject> mutate)
    {
        var value = (JsonObject)JsonNode.Parse(ReadFile(root, relative))!;
        mutate(value);
        WriteFile(root, relative, $"{Stringify(value)}\n");
    }

    /// <summary>Rewrites one file's text through a transform.</summary>
    public static void MutateBody(string root, string relative, Func<string, string> transform) =>
        WriteFile(root, relative, transform(ReadFile(root, relative)));

    static string Resolve(string root, string relative) =>
        Path.Combine(root, relative.Replace('/', Path.DirectorySeparatorChar));
}
