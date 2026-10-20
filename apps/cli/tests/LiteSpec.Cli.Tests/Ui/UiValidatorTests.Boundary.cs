namespace LiteSpec.Tests.Ui;

/// <summary>
/// The application boundary, application stylesheet and shared stylesheet cases.
/// </summary>
public sealed partial class UiValidatorTests
{
    // Application boundary (litespec/frontend/components#compose-composites-in-page-code).

    [Fact]
    public void An_Application_Importing_The_Primitive_Library()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.AppCaseWith("import { Dialog } from \"@base-ui/react/dialog\";\nexport function Case() {\n  return <Dialog />;\n}\n"),
            "imports the primitive library directly");
    }

    [Fact]
    public void An_Application_Importing_A_Table_Library()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.AppCaseWith("import { flexRender } from \"@tanstack/react-table\";\nexport function Case() {\n  return <main>{flexRender}</main>;\n}\n"),
            "imports the table library directly");
    }

    [Fact]
    public void A_Library_Name_Inside_A_Doc_Comment_Is_Prose()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.AppCaseWith(
            "/** Reads a value from `@base-ui/react` in the composite that wraps it. */\nexport function Case() {\n  return <main>Orders</main>;\n}\n"));
    }

    // Application stylesheet (litespec/frontend/web/ui#keep-tokens-in-one-stylesheet).

    [Fact]
    public void An_Application_Stylesheet_Importing_The_Package_Tokens()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.AppStylesCase(UiFixture.CleanAppStyles));
    }

    [Fact]
    public void An_Application_Stylesheet_Writing_A_Value_From_A_Token()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.AppStylesCase(
            UiFixture.CleanAppStyles + "\n:where(button) {\n  --ring-width: 2px;\n}\n"));
    }

    [Fact]
    public void An_Application_Stylesheet_Declaring_A_Literal_Value()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.AppStylesCase(UiFixture.CleanAppStyles + "\nbody {\n  background: #ffffff;\n}\n"),
            "declares 'background'");
    }

    [Fact]
    public void An_Application_Stylesheet_Importing_Nothing()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.AppStylesCase(string.Empty),
            "imports no stylesheet");
    }

    [Fact]
    public void An_Application_Stylesheet_Importing_A_Third_Party_Sheet()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.AppStylesCase("@import \"bootstrap/dist/css/bootstrap.css\";\n"),
            "import 'bootstrap/dist/css/bootstrap.css' is outside the shared package");
    }

    // Shared stylesheets (litespec/frontend/web/ui#keep-tokens-in-one-stylesheet).

    [Fact]
    public void A_Shared_Stylesheet_Written_From_Tokens()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.PathCase(
            "packages/ui/src/styles/shadows.css",
            "@utility shade {\n  background: radial-gradient(farthest-side, var(--scroll-shade), transparent);\n}\n"));
    }

    [Fact]
    public void A_Shared_Stylesheet_Carrying_A_Literal_Colour()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.PathCase(
                "packages/ui/src/styles/shadows.css",
                "@utility shade {\n  background: radial-gradient(farthest-side, oklch(0 0 0 / 0.16), transparent);\n}\n"),
            "literal color 'oklch(' belongs in the token stylesheet");
    }

    [Fact]
    public void A_Shared_Stylesheet_Carrying_A_Hex_Colour()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.PathCase(
                "packages/ui/src/styles/shadows.css",
                "@utility shade {\n  color: #b9bbc6;\n}\n"),
            "literal color '#b9bbc6' belongs in the token stylesheet");
    }
}
