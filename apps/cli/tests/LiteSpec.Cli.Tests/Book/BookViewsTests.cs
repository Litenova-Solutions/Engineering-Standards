using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Book;

/// <summary>Proves the book renders the reviewable specification: bodies, lifecycles, sentences, lenses and views.</summary>
public sealed class BookViewsTests
{
    /// <summary>A record page renders its prose body as text: headings, spans, lists, tables, code and quotes.</summary>
    [Fact]
    public void Record_Page_Renders_Its_Body_As_Text()
    {
        using var temp = Cli.Temp("book-views");
        var result = Cli.Run("book", "--model", Cli.Fixture("Book/review.json"), "--out", temp.Path);
        Assert.Equal(0, result.Status);
        var html = File.ReadAllText(Path.Combine(temp.Path, "aggregate", "lending", "loan.html"));
        Assert.Contains("<h2 id=\"about\">About</h2>", html, StringComparison.Ordinal);
        Assert.Contains("<h3 id=\"body-bounds\">Bounds</h3>", html, StringComparison.Ordinal);
        Assert.Contains("<strong>one copy</strong>", html, StringComparison.Ordinal);
        Assert.Contains("<em>one member</em>", html, StringComparison.Ordinal);
        Assert.Contains("<code>three weeks</code>", html, StringComparison.Ordinal);
        Assert.Contains("<a href=\"https://example.com/lending\">lending guide</a>", html, StringComparison.Ordinal);
        Assert.Contains("<a href=\"https://example.com/desks\">https://example.com/desks</a>", html, StringComparison.Ordinal);
        Assert.Contains("<th>Week</th>", html, StringComparison.Ordinal);
        Assert.Contains("<td class=\"num\">120</td>", html, StringComparison.Ordinal);
        Assert.Contains("<pre class=\"codeblock\"><code>scan member, scan copy, print slip</code></pre>", html, StringComparison.Ordinal);
        Assert.Contains("<blockquote>", html, StringComparison.Ordinal);
        Assert.Contains("<hr>", html, StringComparison.Ordinal);
        Assert.Contains("use-case/lending/borrow-copy.html", html, StringComparison.Ordinal);
        Assert.Contains(">Borrow Copy</span>", html, StringComparison.Ordinal);
        Assert.DoesNotContain("## Bounds", html, StringComparison.Ordinal);
    }

    /// <summary>A body can never inject markup: angle brackets escape inside code spans.</summary>
    [Fact]
    public void Record_Body_Escapes_Markup()
    {
        using var temp = Cli.Temp("book-views");
        var result = Cli.Run("book", "--model", Cli.Fixture("Book/review.json"), "--out", temp.Path);
        Assert.Equal(0, result.Status);
        var html = File.ReadAllText(Path.Combine(temp.Path, "runbook", "overdue-notice.html"));
        Assert.Contains("<code>&lt;code&gt;LOAN-1&lt;/code&gt;</code>", html, StringComparison.Ordinal);
        Assert.DoesNotContain("<code>LOAN-1</code>", html, StringComparison.Ordinal);
    }

    /// <summary>No page falls back to raw JSON: every field has a typed renderer.</summary>
    [Fact]
    public void Book_Has_No_Raw_Json_Fallback()
    {
        using var temp = Cli.Temp("book-views");
        var result = Cli.Run("book", "--model", Cli.Fixture("Book/review.json"), "--out", temp.Path);
        Assert.Equal(0, result.Status);
        foreach (var page in Directory.GetFiles(temp.Path, "*.html", SearchOption.AllDirectories))
        {
            var html = File.ReadAllText(page);
            Assert.DoesNotContain("<pre class=\"json\">", html, StringComparison.Ordinal);
            Assert.DoesNotContain("[object Object]", html, StringComparison.Ordinal);
        }
    }

    /// <summary>An aggregate page shows its lifecycle: a Mermaid diagram, transitions, states and data.</summary>
    [Fact]
    public void Aggregate_Page_Shows_Lifecycle_Diagram_And_Tables()
    {
        using var temp = Cli.Temp("book-views");
        var result = Cli.Run("book", "--model", Cli.Fixture("Book/review.json"), "--out", temp.Path);
        Assert.Equal(0, result.Status);
        var html = File.ReadAllText(Path.Combine(temp.Path, "aggregate", "lending", "loan.html"));
        Assert.Contains("stateDiagram-v2", html, StringComparison.Ordinal);
        Assert.Contains("[*] --&gt; s0", html, StringComparison.Ordinal);
        Assert.Contains("s0 --&gt; s1 : Borrow Copy", html, StringComparison.Ordinal);
        Assert.Contains("No transition reaches this state.", html, StringComparison.Ordinal);
        Assert.Contains("<th>From</th><th>To</th><th>Triggered By</th>", html, StringComparison.Ordinal);
        Assert.Contains(">Initial</span>", html, StringComparison.Ordinal);
        Assert.Contains("Exported or deleted on request", html, StringComparison.Ordinal);
        Assert.Contains("assets/mermaid.min.js", html, StringComparison.Ordinal);
    }

    /// <summary>A scenario page shows Given, When and Then sentences with examples and proof words.</summary>
    [Fact]
    public void Scenario_Page_Shows_Sentences_Examples_And_Proof()
    {
        using var temp = Cli.Temp("book-views");
        var result = Cli.Run("book", "--model", Cli.Fixture("Book/review.json"), "--out", temp.Path);
        Assert.Equal(0, result.Status);
        var html = File.ReadAllText(Path.Combine(temp.Path, "scenario", "borrow-copy", "borrowing-an-available-copy-succeeds.html"));
        Assert.Contains("<li><b>Given</b> A copy sits available on its shelf.</li>", html, StringComparison.Ordinal);
        Assert.Contains("<li><b>When</b> The member borrows the copy.</li>", html, StringComparison.Ordinal);
        Assert.Contains("<li><b>Then</b> The loan is active.", html, StringComparison.Ordinal);
        Assert.Contains("<th>Copy</th>", html, StringComparison.Ordinal);
        Assert.Contains("<td>copy-1</td>", html, StringComparison.Ordinal);
        Assert.Contains("<td>copy-2</td>", html, StringComparison.Ordinal);
        Assert.Contains("Proven by a passing test on 2026-10-20.", html, StringComparison.Ordinal);
        Assert.Contains("It proves", html, StringComparison.Ordinal);

        var refused = File.ReadAllText(Path.Combine(temp.Path, "scenario", "borrow-copy", "borrowing-a-loaned-copy-is-refused.html"));
        Assert.Contains("No passing proof yet.", refused, StringComparison.Ordinal);
    }

    /// <summary>A scenario page links its why-chain up to the goal.</summary>
    [Fact]
    public void Scenario_Page_Shows_Its_Why_Chain()
    {
        using var temp = Cli.Temp("book-views");
        var result = Cli.Run("book", "--model", Cli.Fixture("Book/review.json"), "--out", temp.Path);
        Assert.Equal(0, result.Status);
        var html = File.ReadAllText(Path.Combine(temp.Path, "scenario", "borrow-copy", "borrowing-an-available-copy-succeeds.html"));
        Assert.Contains("<h2 id=\"why\">Why</h2>", html, StringComparison.Ordinal);
        Assert.Contains(">Borrowed</a>", html, StringComparison.Ordinal);
        Assert.Contains(">Borrow Copy</a>", html, StringComparison.Ordinal);
        Assert.Contains(">One Loan Per Copy</a>", html, StringComparison.Ordinal);
        Assert.Contains(">Late Fee</a>", html, StringComparison.Ordinal);
        Assert.Contains(">Max Wait</a>", html, StringComparison.Ordinal);
        Assert.Contains(">Self Checkout</a>", html, StringComparison.Ordinal);
        Assert.Contains(">Faster Borrowing</a>", html, StringComparison.Ordinal);
    }

    /// <summary>Reviewer pages hide identifiers, codes, file paths and check names behind the developer view.</summary>
    [Fact]
    public void Reviewer_View_Hides_Identifiers_Codes_Paths_And_Checks()
    {
        using var temp = Cli.Temp("book-views");
        var result = Cli.Run("book", "--model", Cli.Fixture("Book/review.json"), "--out", temp.Path);
        Assert.Equal(0, result.Status);
        var useCase = File.ReadAllText(Path.Combine(temp.Path, "use-case", "lending", "borrow-copy.html"));
        Assert.Contains("<div class=\"kind\">Use case</div>", useCase, StringComparison.Ordinal);
        Assert.Contains("<span class=\"dev-only\"><code>lending.copy-not-available</code></span>", useCase, StringComparison.Ordinal);
        Assert.Contains("<h2 id=\"implementation\">Implementation</h2>", useCase, StringComparison.Ordinal);
        Assert.Contains("<div class=\"dev-only\">", useCase, StringComparison.Ordinal);
        Assert.Contains("<h2 id=\"developer\">Developer</h2>", useCase, StringComparison.Ordinal);

        var requirement = File.ReadAllText(Path.Combine(temp.Path, "requirement", "borrowing", "max-wait.html"));
        Assert.Contains(">Check</dt><dd>k6 desk-wait p(95)&lt;120</dd>", requirement, StringComparison.Ordinal);

        var refusal = File.ReadAllText(Path.Combine(temp.Path, "result", "borrow-copy", "copy-unavailable.html"));
        Assert.Contains("<div class=\"dev-only\"><dt>Code</dt>", refusal, StringComparison.Ordinal);

        var deviation = File.ReadAllText(Path.Combine(temp.Path, "deviation", "kiosk-cache.html"));
        Assert.Contains("a missing record", deviation, StringComparison.Ordinal);
        Assert.Contains("litespec/ext/cache#define-cache-invalidation", deviation, StringComparison.Ordinal);
    }

    /// <summary>A goal lens walks from the goal through features and requirements to the verified state.</summary>
    [Fact]
    public void Goal_Lens_Shows_Goal_To_Verified()
    {
        using var temp = Cli.Temp("book-views");
        var result = Cli.Run("book", "--model", Cli.Fixture("Book/review.json"), "--out", temp.Path);
        Assert.Equal(0, result.Status);
        Assert.True(File.Exists(Path.Combine(temp.Path, "goals", "index.html")), "goals/index.html was not written.");
        var index = File.ReadAllText(Path.Combine(temp.Path, "goals", "index.html"));
        Assert.Contains("1 of 3 requirements verified", index, StringComparison.Ordinal);

        var lens = File.ReadAllText(Path.Combine(temp.Path, "goals", "faster-borrowing.html"));
        Assert.Contains("Self Checkout", lens, StringComparison.Ordinal);
        Assert.Contains("Max Wait", lens, StringComparison.Ordinal);
        Assert.Contains("Copy Shelf Home", lens, StringComparison.Ordinal);
        Assert.Contains("<span class=\"chip ok\">Verified</span>", lens, StringComparison.Ordinal);
        Assert.Contains("<span class=\"chip warn\">Awaiting proof</span>", lens, StringComparison.Ordinal);

        var empty = File.ReadAllText(Path.Combine(temp.Path, "goals", "quiet-study.html"));
        Assert.Contains("No feature serves this goal yet.", empty, StringComparison.Ordinal);
    }

    /// <summary>The review page lists gaps, drafts, open questions and findings.</summary>
    [Fact]
    public void Review_Page_Lists_Gaps_Drafts_Questions_And_Findings()
    {
        using var temp = Cli.Temp("book-views");
        var result = Cli.Run(
            "book",
            "--model", Cli.Fixture("Book/review.json"),
            "--findings", Cli.Fixture("Book/findings.json"),
            "--out", temp.Path);
        Assert.Equal(0, result.Status);
        var html = File.ReadAllText(Path.Combine(temp.Path, "review", "index.html"));
        Assert.Contains("Expired:", html, StringComparison.Ordinal);
        Assert.Contains("Self Checkout", html, StringComparison.Ordinal);
        Assert.Contains("Do kiosk users count toward the wait?", html, StringComparison.Ordinal);
        Assert.Contains("<span class=\"dev-only\"><code>use-case-unimplemented</code>", html, StringComparison.Ordinal);
    }

    /// <summary>A rule page states its kind in words, what breaks, and a worked example for calculations.</summary>
    [Fact]
    public void Rule_Page_Names_Break_Meaning_And_Worked_Example()
    {
        using var temp = Cli.Temp("book-views");
        var result = Cli.Run("book", "--model", Cli.Fixture("Book/review.json"), "--out", temp.Path);
        Assert.Equal(0, result.Status);
        var invariant = File.ReadAllText(Path.Combine(temp.Path, "rule", "loan", "one-loan-per-copy.html"));
        Assert.Contains("This rule is always true.", invariant, StringComparison.Ordinal);
        Assert.Contains("When it breaks: The copy stays unavailable and the member is told it is on loan.", invariant, StringComparison.Ordinal);

        var calculation = File.ReadAllText(Path.Combine(temp.Path, "rule", "loan", "late-fee.html"));
        Assert.Contains("This rule is computed as stated.", calculation, StringComparison.Ordinal);
        Assert.Contains("Worked Example", calculation, StringComparison.Ordinal);
        Assert.Contains("<td>copy-1</td>", calculation, StringComparison.Ordinal);
        Assert.DoesNotContain("copy-2", calculation, StringComparison.Ordinal);
    }

    /// <summary>A requirement page states its fit criterion and its proof in words.</summary>
    [Fact]
    public void Requirement_Page_Shows_Fit_Criterion_And_Proof()
    {
        using var temp = Cli.Temp("book-views");
        var result = Cli.Run("book", "--model", Cli.Fixture("Book/review.json"), "--out", temp.Path);
        Assert.Equal(0, result.Status);
        var measured = File.ReadAllText(Path.Combine(temp.Path, "requirement", "borrowing", "max-wait.html"));
        Assert.Contains("Measured as p95 desk wait; the target is under 2 minutes.", measured, StringComparison.Ordinal);
        Assert.Contains("Awaiting proof", measured, StringComparison.Ordinal);
        Assert.Contains("The last proof run was on 2026-10-20.", measured, StringComparison.Ordinal);

        var fulfilled = File.ReadAllText(Path.Combine(temp.Path, "requirement", "borrowing", "copy-shelf-home.html"));
        Assert.Contains("Everything fulfilling this requirement is verified.", fulfilled, StringComparison.Ordinal);
    }

    /// <summary>A reaction page renders its trigger events and its schedule words.</summary>
    [Fact]
    public void Reaction_Page_Renders_Trigger_Words_And_Events()
    {
        using var temp = Cli.Temp("book-views");
        var result = Cli.Run("book", "--model", Cli.Fixture("Book/review.json"), "--out", temp.Path);
        Assert.Equal(0, result.Status);
        var html = File.ReadAllText(Path.Combine(temp.Path, "use-case", "lending", "send-due-reminder.html"));
        Assert.Contains("every morning at eight", html, StringComparison.Ordinal);
        Assert.Contains(">Loan Due</a>", html, StringComparison.Ordinal);
    }

    /// <summary>The search index covers statements, meanings and scenario text.</summary>
    [Fact]
    public void Search_Covers_Statements_Meanings_And_Scenario_Text()
    {
        using var temp = Cli.Temp("book-views");
        var result = Cli.Run("book", "--model", Cli.Fixture("Book/review.json"), "--out", temp.Path);
        Assert.Equal(0, result.Status);
        var payload = File.ReadAllText(Path.Combine(temp.Path, "search.json"));
        Assert.Contains("\"text\": \"", payload, StringComparison.Ordinal);
        Assert.Contains("waits less than two minutes", payload, StringComparison.Ordinal);
        Assert.Contains("sits available on its shelf", payload, StringComparison.Ordinal);
        Assert.Contains("A copy lent to a member.", payload, StringComparison.Ordinal);
    }

    /// <summary>The book vendors the pinned Mermaid script and loads it only where diagrams live.</summary>
    [Fact]
    public void Book_Vendors_Mermaid_For_Diagrams_Only()
    {
        using var temp = Cli.Temp("book-views");
        var result = Cli.Run("book", "--model", Cli.Fixture("Book/review.json"), "--out", temp.Path);
        Assert.Equal(0, result.Status);
        var script = new FileInfo(Path.Combine(temp.Path, "assets", "mermaid.min.js"));
        Assert.True(script.Exists, "assets/mermaid.min.js was not written.");
        Assert.True(script.Length > 1000000, "assets/mermaid.min.js looks truncated.");
        var pin = File.ReadAllText(Path.Combine(temp.Path, "assets", "mermaid.version"));
        Assert.Contains("12.2.0", pin, StringComparison.Ordinal);

        var aggregate = File.ReadAllText(Path.Combine(temp.Path, "aggregate", "lending", "loan.html"));
        Assert.Contains("assets/mermaid.min.js", aggregate, StringComparison.Ordinal);
        var useCase = File.ReadAllText(Path.Combine(temp.Path, "use-case", "lending", "borrow-copy.html"));
        Assert.DoesNotContain("mermaid.min.js", useCase, StringComparison.Ordinal);
    }
}
