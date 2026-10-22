using System.Text.Json;
using LiteSpec.Tests.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Builder;

/// <summary>Proves scenario-only coverage lists the code no scenario reaches.</summary>
public sealed class CoverageTests
{
    /// <summary>Cobertura and lcov files list each unreached line once, with its member.</summary>
    [Fact]
    public void Coverage_Files_List_Unreached_Lines_For_Triage()
    {
        using var temp = ModelFixture.Prepare("small");
        CopyResults(temp.Path);

        using var document = Build(temp.Path);
        var gaps = document.RootElement.GetProperty("unreachedCode");

        Assert.Equal(JsonValueKind.Array, gaps.ValueKind);
        Assert.Equal(3, gaps.GetArrayLength());
        Assert.Contains(gaps.EnumerateArray(), gap =>
            gap.GetProperty("path").GetString() == "apps/api/src/Library.Application/Lending/Loans/BorrowCopy/BorrowCopyCommandHandler.cs"
            && gap.GetProperty("line").GetInt32() == 12
            && gap.GetProperty("member").GetString() == "HandleAsync");
        Assert.Contains(gaps.EnumerateArray(), gap =>
            gap.GetProperty("path").GetString() == "apps/api/src/Library.Domain/Lending/Loans/Loan.cs"
            && gap.GetProperty("line").GetInt32() == 21
            && gap.GetProperty("member").GetString() == "MarkReturned");
        Assert.Contains(gaps.EnumerateArray(), gap =>
            gap.GetProperty("path").GetString() == "apps/api/src/Library.Domain/Lending/Loans/Loan.cs"
            && gap.GetProperty("line").GetInt32() == 22
            && gap.GetProperty("member").GetString() == "MarkReturned");
    }

    /// <summary>Without a coverage file the model holds null, not an empty report.</summary>
    [Fact]
    public void Missing_Coverage_Files_Write_Null_Unreached_Code()
    {
        using var temp = ModelFixture.Prepare("small");

        using var document = Build(temp.Path);

        Assert.Equal(JsonValueKind.Null, document.RootElement.GetProperty("unreachedCode").ValueKind);
    }

    static void CopyResults(string root)
    {
        var folder = Path.Combine(root, "TestResults");
        Directory.CreateDirectory(folder);
        File.Copy(Cli.Fixture("Builder/coverage/coverage.cobertura.xml"), Path.Combine(folder, "coverage.cobertura.xml"));
        File.Copy(Cli.Fixture("Builder/coverage/lcov.info"), Path.Combine(folder, "lcov.info"));
    }

    static JsonDocument Build(string root)
    {
        var output = Path.Combine(root, ".model", "model.json");
        var result = Cli.Run("model", "build", "--root", root, "--out", output);
        Assert.Equal(0, result.Status);

        return JsonDocument.Parse(File.ReadAllText(output));
    }
}
