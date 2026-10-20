using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model;

/// <summary>Proves <c>litespec model check</c> against the fixtures, one test per broken overlay.</summary>
public sealed class ModelCheckTests
{
    /// <summary>Every finding code the builder emits, one entry per broken overlay.</summary>
    static readonly string[] FindingCodeList =
    [
        "record-shape",
        "identifier-form",
        "identifier-refused-form",
        "identifier-duplicate",
        "reference-unresolved",
        "draft-gate",
        "owner-unknown",
        "draft-without-decider",
        "known-gap-expired",
        "rule-name-negation",
        "use-case-without-success",
        "use-case-without-case",
        "requirement-unfulfilled",
        "case-result-unresolved",
        "refusal-not-thrown",
        "use-case-unimplemented",
        "proves-unconfirmed",
        "profile-type-missing",
        "journey-reach",
        "use-case-access",
        "result-status",
        "region-unknown",
        "business-record-name-clash",
        "decision-decides-nothing",
        "link-unresolved",
    ];

    /// <summary>The finding codes as theory rows, one row per broken overlay.</summary>
    public static TheoryData<string> FindingCodeData
    {
        get
        {
            TheoryData<string> data = new();
            foreach (var code in FindingCodeList)
            {
                data.Add(code);
            }

            return data;
        }
    }

    /// <summary>The one overlay without a finding code: bare refused prefixes exit 0.</summary>
    const string RefusedBarePrefix = "refused-bare-prefix";

    /// <summary>Clean small fixture exits 0.</summary>
    [Fact]
    public void Clean_Small_Fixture_Exits_0()
    {
        using var fixture = ModelFixture.Prepare("small");
        var result = Cli.Run("model", "check", "--root", fixture.Path, "--format", "json");
        Assert.Equal(0, result.Status);
    }

    /// <summary>Clean large fixture exits 0.</summary>
    [Fact]
    public void Clean_Large_Fixture_Exits_0()
    {
        using var fixture = ModelFixture.Prepare("large");
        var result = Cli.Run("model", "check", "--root", fixture.Path, "--format", "json");
        Assert.Equal(0, result.Status);
    }

    /// <summary>Broken overlay '&lt;code&gt;' exits 1 with its finding code in the output.</summary>
    [Theory]
    [MemberData(nameof(FindingCodeData))]
    public void Broken_Overlay_Exits_1(string code)
    {
        using var fixture = ModelFixture.Prepare("large", code);
        var result = Cli.Run("model", "check", "--root", fixture.Path, "--format", "json");
        Assert.Equal(1, result.Status);
        Assert.Contains(code, result.Output);
    }

    /// <summary>The theory's code list matches the overlay folders, so a new overlay without a case fails.</summary>
    [Fact]
    public void Finding_Codes_Match_Broken_Overlay_Folders()
    {
        var overlays = Directory.GetDirectories(Cli.Fixture("Model/broken"))
            .Select(Path.GetFileName)
            .OfType<string>()
            .Where(name => name != RefusedBarePrefix)
            .OrderBy(name => name, StringComparer.Ordinal)
            .ToList();
        var codes = FindingCodeList.OrderBy(code => code, StringComparer.Ordinal).ToList();
        Assert.Equal(codes, overlays);
    }

    /// <summary>Open known gap turns its finding into exit 0.</summary>
    [Fact]
    public void Open_Known_Gap_Turns_Its_Finding_Into_Exit_0()
    {
        using var fixture = ModelFixture.Prepare("large", "use-case-unimplemented");
        ModelFixture.WriteKnownGap(fixture.Path, "2035-06-01");
        var result = Cli.Run("model", "check", "--root", fixture.Path, "--format", "json");
        Assert.Equal(0, result.Status);
    }

    /// <summary>Expired known gap exits 1.</summary>
    [Fact]
    public void Expired_Known_Gap_Exits_1()
    {
        using var fixture = ModelFixture.Prepare("large", "use-case-unimplemented");
        ModelFixture.WriteKnownGap(fixture.Path, "2020-01-01");
        var result = Cli.Run("model", "check", "--root", fixture.Path, "--format", "json");
        Assert.Equal(1, result.Status);
    }

    /// <summary>Bare refused prefixes exit 0.</summary>
    [Fact]
    public void Bare_Refused_Prefixes_Exit_0()
    {
        using var fixture = ModelFixture.Prepare("large", RefusedBarePrefix);
        var result = Cli.Run("model", "check", "--root", fixture.Path, "--format", "json");
        Assert.Equal(0, result.Status);
    }
}
