using LiteSpec.Patterns;

namespace LiteSpec.Tests.Patterns;

/// <summary>The wireframe language: parsing, its rules, and the sketch it draws.</summary>
public sealed class WireframeTests
{
    const string Order = """
        page
          breadcrumb "Orders" "SO-1042"
          header
            heading "SO-1042"
            status "Paid" positive
            action primary "Mark as shipped"
            menu "More"
              action "Duplicate"
              action destructive "Cancel order"
          split 2:1
            region "Items"
              table 3 "Item" "Qty" "Total"
                item: text "Oak desk lamp" · text "2" · text "EUR 90.00"
            aside
              card "Customer"
                fact "Name" "Maria Garcia"
                field "Note" textarea = "Leave at the \"back\" door"
          dialog "Cancel SO-1042?"
            text "The customer is told by email."
            footer
              action "Keep the order"
              action primary destructive "Cancel order"
        """;

    [Fact(DisplayName = "a wireframe parses into parts with modifiers copy and children")]
    public void ParsesPartsModifiersCopyAndChildren()
    {
        var wireframe = WireframeParser.Parse(Order);

        Assert.Empty(wireframe.Errors);
        var page = wireframe.Page!;
        Assert.Equal(["breadcrumb", "header", "split", "dialog"], page.Children.Select(child => child.Part));
        var header = page.Children[1];
        Assert.Equal(["positive"], header.Children[1].Modifiers);
        Assert.Equal("Mark as shipped", header.Children[2].Text);
        Assert.Equal(2, header.Children[3].Children.Count);
        var split = page.Children[2];
        Assert.Equal([2, 1], split.Ratio!);
        var table = split.Children[0].Children[0];
        Assert.Equal(3, table.Count);
        Assert.Equal(["Item", "Qty", "Total"], table.Strings);
        Assert.True(table.Children[0].InlineChildren);
        Assert.Equal(["Oak desk lamp", "2", "EUR 90.00"], table.Children[0].Children.Select(cell => cell.Text));
        var field = split.Children[1].Children[0].Children[1];
        Assert.Equal("Leave at the \"back\" door", field.Value);
    }

    [Theory(DisplayName = "the language refuses what its rules forbid")]
    [InlineData("page\n  button \"Save\"", "unknown part 'button'")]
    [InlineData("page\n   heading \"Odd\"", "multiple of two spaces")]
    [InlineData("page\n  heading \"Open", "not closed")]
    [InlineData("page\n  split 2:1\n    text \"Only one\"", "holds 2 children, not 1")]
    [InlineData("page\n  row\n    text \"Alone\"", "at least two children")]
    [InlineData("page\n  list\n    item: text \"A\"", "needs a count")]
    [InlineData("page\n  list 3\n    text \"A\"\n    text \"B\"", "exactly one child")]
    [InlineData("page\n  header\n    action primary \"A\"\n    action primary \"B\"", "at most one primary action")]
    [InlineData("page\n  status \"Paid\" happy", "not 'happy'")]
    [InlineData("page\n  status \"Paid\" positive critical", "takes one of")]
    [InlineData("page\n  text \"A\" = \"B\"", "only a field takes a value")]
    [InlineData("page\n  region\n    dialog \"Nested\"", "a dialog is a child of 'page'")]
    [InlineData("page\n  dialog \"First\"\n  text \"After\"", "nothing follows it")]
    [InlineData("header\n  heading \"No page\"", "exactly one 'page'")]
    [InlineData("page\n  heading Order", "copy goes in double quotes")]
    [InlineData("page\n  nav\n    action \"Go\"", "holds only link")]
    [InlineData("page\n  item: text \"A\"\n    text \"B\"", "already has inline children")]
    public void RefusesWhatTheRulesForbid(string text, string expected)
    {
        var wireframe = WireframeParser.Parse(text);

        Assert.Null(wireframe.Page);
        Assert.Contains(wireframe.Errors, error => error.Message.Contains(expected, StringComparison.Ordinal));
    }

    [Fact(DisplayName = "an error names the line inside the block")]
    public void AnErrorNamesItsLine()
    {
        var wireframe = WireframeParser.Parse("page\n  header\n\n    widget \"X\"");

        Assert.Equal(4, Assert.Single(wireframe.Errors).Line);
    }

    [Fact(DisplayName = "the sketch is an svg at the desktop and phone widths with the copy as text")]
    public void DrawsAnSvgAtEachWidth()
    {
        var page = WireframeParser.Parse(Order).Page!;

        var desktop = WireframeRenderer.Render(page, phone: false);
        var phone = WireframeRenderer.Render(page, phone: true);

        Assert.StartsWith("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1200\"", desktop, StringComparison.Ordinal);
        Assert.StartsWith("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"390\"", phone, StringComparison.Ordinal);
        Assert.Contains(">Mark as shipped</text>", desktop, StringComparison.Ordinal);
        Assert.Contains(">Maria Garcia</text>", desktop, StringComparison.Ordinal);
        Assert.Contains("&quot;back&quot;", desktop, StringComparison.Ordinal);
        Assert.Contains(">Total</text>", desktop, StringComparison.Ordinal);
        Assert.DoesNotContain(">Total</text>", phone, StringComparison.Ordinal);
        Assert.Contains("fill-opacity=\"0.38\"", desktop, StringComparison.Ordinal);
        Assert.Equal(desktop, WireframeRenderer.Render(page, phone: false));
    }

    [Fact(DisplayName = "a phone sketch stacks a split and moves the aside after the main content")]
    public void PhoneStacksASplit()
    {
        var page = WireframeParser.Parse("""
            page
              split 1:2
                aside
                  text "Side"
                region "Main"
                  text "Body"
            """).Page!;

        var desktop = WireframeRenderer.Render(page, phone: false);
        var phone = WireframeRenderer.Render(page, phone: true);

        Assert.True(desktop.IndexOf(">Side<", StringComparison.Ordinal) < desktop.IndexOf(">Main<", StringComparison.Ordinal));
        Assert.True(phone.IndexOf(">Main<", StringComparison.Ordinal) < phone.IndexOf(">Side<", StringComparison.Ordinal));
    }
}
