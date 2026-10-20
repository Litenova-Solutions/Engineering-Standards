namespace LiteSpec.Tests.Ui;

/// <summary>
/// <c>litespec ui</c> cases: one test per validator rule, asserting the expected diagnostics.
/// </summary>
public sealed partial class UiValidatorTests
{
    // Baseline.

    [Fact]
    public void Tracked_Templates_Validate_As_Shipped()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.Run());
    }

    // Allowed construction (litespec/frontend/web/ui#restrict-css-decisions).

    [Fact]
    public void Approved_Layout_Utilities()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.CompositeCase(
            "export const C = () => <div className=\"grid gap-6 lg:grid-cols-2\" />;"));
    }

    [Fact]
    public void Semantic_Token_Classes()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.CompositeCase(
            "export const C = () => <div className=\"bg-background text-foreground border-border\" />;"));
    }

    [Fact]
    public void State_And_Container_Variants()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.CompositeCase(
            "export const C = () => <div className=\"data-[state=open]:rotate-180 has-[input:checked]:bg-accent min-[420px]:flex\" />;"));
    }

    [Fact]
    public void Class_Merge_Helper()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.CompositeCase(
            "import { cn } from \"cn\";\nexport const C = ({ x }: { x?: string }) => <div className={cn(\"flex gap-2\", x && \"justify-between\")} />;"));
    }

    [Fact]
    public void Pinned_Icon_Family()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.CompositeCase(
            "import { Check } from \"lucide-react\";\nexport const C = () => <Check className=\"size-4\" />;"));
    }

    [Fact]
    public void The_Primitive_Library_Named_By_The_Package_That_Owns_It()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.CompositeCase(
            "import { Dialog } from \"@base-ui/react/dialog\";\nexport const C = () => <Dialog />;"));
    }

    [Fact]
    public void Javascript_Negation_Is_Not_An_Important_Modifier()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.CompositeCase(
            "export const C = ({ o }: { o: boolean }) => {\n  const v = !o;\n  return v ? null : <div className=\"p-4\" />;\n};"));
    }

    [Fact]
    public void A_Class_Name_Inside_A_Comment_Is_Prose()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.CompositeCase(
            "export const C = () => {\n  // never use bg-blue-500 or w-[37rem]\n  return <div className=\"p-4\" />;\n};"));
    }

    [Fact]
    public void Composed_Functional_Variants()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.CompositeCase(
            "export const C = () => <div className=\"group-data-[state=open]:rotate-180 not-has-[input]:opacity-50 peer-aria-[expanded=true]:block\" />;"));
    }

    [Fact]
    public void A_File_Under_Tests_Is_Outside_The_Controlled_Surface()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.PathCase(
            "packages/ui/tests/case.test.tsx",
            "export const C = () => <div className=\"bg-red-500\" />;\n"));
    }

    [Fact]
    public void A_File_Under_The_Copied_Primitive_Boundary_Is_Unedited_Source()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.PathCase(
            "packages/ui/src/components/extra.tsx",
            "export const C = () => <div className=\"bg-red-500\" />;\n"));
    }

    [Fact]
    public void A_Visual_File_Keeps_Its_Own_Layout()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.PathCase(
            "apps/web/src/modules/seat-map/seat-map.visual.tsx",
            "export const C = () => <div className=\"grid\" style={{ width: 120 }} />;\n"));
    }

    [Fact]
    public void A_Visual_File_Is_Still_Held_To_The_Token_Rule()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.PathCase(
                "apps/web/src/modules/seat-map/other.visual.tsx",
                "export const C = () => <div className=\"bg-red-500\" />;\n"),
            "raw Tailwind palette value requires a semantic token 'bg-red-500'");
    }

    [Fact]
    public void Generated_Web_Asset_Is_Ignored()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.PathCase(
            "apps/web/android/app/src/main/assets/public/generated.css",
            ".generated { color: red; }\n"));
    }

    [Fact]
    public void A_Route_Composing_One_Floorplan()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.AppCaseWith(
            "import { ListPage } from \"@fixture/ui/floorplans\";\nexport function Case() {\n  return <ListPage title=\"Orders\" />;\n}\n"));
    }

    // Restricted Tailwind use (litespec/frontend/web/ui#restrict-css-decisions).

    [Fact]
    public void Arbitrary_Length()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.CompositeCase("export const C = () => <div className=\"w-[37rem]\" />;"),
            "arbitrary Tailwind value requires a semantic token or declared variant 'w-[37rem]'");
    }

    [Fact]
    public void Arbitrary_Color()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.CompositeCase("export const C = () => <div className=\"bg-[#19324a]\" />;"),
            "'bg-[#19324a]'");
    }

    [Fact]
    public void Raw_Palette_Value()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.CompositeCase("export const C = () => <div className=\"text-red-500\" />;"),
            "raw Tailwind palette value requires a semantic token 'text-red-500'");
    }

    [Fact]
    public void Raw_Palette_Value_With_Opacity()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.CompositeCase("export const C = () => <div className=\"bg-slate-800/40\" />;"),
            "'bg-slate-800/40'");
    }

    [Fact]
    public void Important_Modifier_Prefix()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.CompositeCase("export const C = () => <div className=\"!mt-0\" />;"),
            "important modifier requires a declared variant '!mt-0'");
    }

    [Fact]
    public void An_Escaped_Quote_Keeps_The_Following_Literal_Readable()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.CompositeCase("import { cn } from \"cn\";\nexport const C = () => <div className={cn(\"a \\\" b\", \"text-red-500\")} />;"),
            "'text-red-500'");
    }

    [Fact]
    public void An_Arbitrary_Selector_Variant_In_A_Drawing()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.PathCase(
                "apps/web/src/modules/seat-map/grid.visual.tsx",
                "export const C = () => <div className=\"[&>svg]:size-4\" />;\n"),
            "arbitrary selector variant requires a declared variant '[&>svg]:size-4'");
    }

    [Fact]
    public void A_Runtime_Measurement_In_A_Composite()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.PathCase(
            "packages/ui/src/shell/width.tsx",
            "export const C = () => <div style={{ width: 12 }} />;\n"));
    }

    [Fact]
    public void Feature_Selector_In_The_Token_Entry()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.CssCase(UiFixture.CleanCss + ".promo-card{color:red}\n"),
            "selector '.promo-card' is a feature style");
    }

    [Fact]
    public void A_Comma_Inside_A_Quoted_Attribute_Value_Is_Not_A_Selector_List()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.CssCase(UiFixture.CleanCss + "[data-token=\",.promo\"]{color:red}\n"));
    }

    [Fact]
    public void A_Brace_Inside_A_Quoted_Attribute_Value_Is_Not_A_Block()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.CssCase(UiFixture.CleanCss + "[data-token=\"{\"]{color:red}\n"));
    }

    [Fact]
    public void An_Unterminated_String_Is_Reported_Once()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.CssCase(UiFixture.CleanCss + "[data-token=\"promo]{color:red}\n"),
            "global CSS has an unterminated string");
    }

    [Fact]
    public void Apply_Directive_Outside_The_Generated_Base_Layer()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.CssCase(UiFixture.CleanCss + "@layer components {\n  .btn { @apply px-4 py-2; }\n}\n"),
            "'@apply' outside the generated '@layer base' block");
    }

    [Fact]
    public void Unapproved_Global_Import()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.CssCase(UiFixture.CleanCss + "@import \"bootstrap/dist/css/bootstrap.css\";\n"),
            "import 'bootstrap/dist/css/bootstrap.css' is outside the approved global CSS surface");
    }
}
