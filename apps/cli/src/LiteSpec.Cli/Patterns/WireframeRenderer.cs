using System.Globalization;
using System.Net;
using System.Text;

namespace LiteSpec.Patterns;

/// <summary>
///     Draws one wireframe as an SVG sketch at a desktop or phone width. The sketch
///     shows structure and copy in one neutral style; tones are its only colors.
///     Text width is estimated from the character count, so nothing needs a font.
/// </summary>
sealed class WireframeRenderer
{
    /// <summary>The desktop sketch width in pixels.</summary>
    public const int DesktopWidth = 1200;

    /// <summary>The phone sketch width in pixels.</summary>
    public const int PhoneWidth = 390;

    const double Gap = 12;
    const double Body = 14;
    const string Ink = "#344054";
    const string Muted = "#667085";
    const string Faint = "#98a2b3";
    const string Line = "#d0d5dd";
    const string Hairline = "#eaecf0";
    const string Wash = "#f9fafb";
    const string Bar = "#e4e7ec";

    static readonly Dictionary<string, (string Fill, string Text)> ToneColours = new(StringComparer.Ordinal)
    {
        ["neutral"] = ("#f2f4f7", "#344054"),
        ["positive"] = ("#dcfae6", "#067647"),
        ["caution"] = ("#fef0c7", "#93370d"),
        ["critical"] = ("#fee4e2", "#b42318"),
        ["info"] = ("#d1e9ff", "#175cd3"),
    };

    readonly StringBuilder svg = new();
    readonly bool phone;
    (double X, double Y, double W, double H)? lastControl;
    double faded = 1;

    WireframeRenderer(bool phone) => this.phone = phone;

    /// <summary>Renders the page at the width; <paramref name="phone"/> applies the compact reflow rules.</summary>
    public static string Render(WireframeNode page, bool phone)
    {
        var renderer = new WireframeRenderer(phone);
        return renderer.Draw(page);
    }

    string Draw(WireframeNode page)
    {
        var width = phone ? PhoneWidth : DesktopWidth;
        var padding = phone ? 16.0 : 28.0;
        var content = page.Children.Where(child => !WireframeParts.Overlays.Contains(child.Part) && !IsStickyFooter(child)).ToList();
        var sticky = page.Children.Where(IsStickyFooter).ToList();
        var overlays = page.Children.Where(child => WireframeParts.Overlays.Contains(child.Part)).ToList();
        var height = Stack(Reflow(content), padding, padding, width - 2 * padding) + 2 * padding;
        if (sticky.Count > 0)
        {
            height -= padding / 2;

            foreach (var footer in sticky)
            {
                height += StickyFooter(footer, width, height, padding);
            }
        }

        height = Math.Max(height, overlays.Count > 0 ? (phone ? 640 : 560) : 0);

        foreach (var overlay in overlays)
        {
            height = Math.Max(height, Overlay(overlay, width, height));
        }

        var output = new StringBuilder();
        output.Append(CultureInfo.InvariantCulture, $"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{width}\" height=\"{N(height)}\" viewBox=\"0 0 {width} {N(height)}\" font-family=\"system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif\" role=\"img\">");
        output.Append(CultureInfo.InvariantCulture, $"<rect x=\"0.5\" y=\"0.5\" width=\"{width - 1}\" height=\"{N(height - 1)}\" rx=\"10\" fill=\"#ffffff\" stroke=\"{Line}\"/>");
        output.Append(svg);
        output.Append("</svg>");
        return output.ToString();
    }

    static bool IsStickyFooter(WireframeNode node) => node.Part == "footer" && node.Has("sticky");

    // A sticky footer is a bar across the bottom edge of the screen; on a phone its actions share the width.
    double StickyFooter(WireframeNode footer, double width, double top, double padding)
    {
        var mark = svg.Length;
        var inner = width - 2 * padding;
        double height;

        if (phone && footer.Children.All(IsControl))
        {
            var count = footer.Children.Count;
            var each = (inner - Gap * (count - 1)) / count;

            for (var index = 0; index < count; index++)
            {
                Button(footer.Children[index], padding + index * (each + Gap), top + 12, each);
            }

            height = 34 + 24;
        }
        else
        {
            height = Flow(footer.Children, padding, top + 12, inner, alignEnd: footer.Children.All(IsControl)) + 24;
        }

        svg.Insert(mark, $"<rect x=\"1\" y=\"{N(top)}\" width=\"{width - 2}\" height=\"{N(height)}\" fill=\"#ffffff\"/><rect x=\"1\" y=\"{N(top)}\" width=\"{width - 2}\" height=\"1\" fill=\"{Line}\"/>");
        return height;
    }

    // At the phone width an aside follows the main content wherever it was written.
    List<WireframeNode> Reflow(List<WireframeNode> children) =>
        phone ? [.. children.Where(child => child.Part != "aside"), .. children.Where(child => child.Part == "aside")] : children;

    double Stack(List<WireframeNode> children, double x, double y, double width, double gap = Gap * 1.5)
    {
        var top = y;

        for (var index = 0; index < children.Count; index++)
        {
            if (index > 0)
            {
                y += gap;
            }

            y += Block(children[index], x, y, width);
        }

        return y - top;
    }

    /// <summary>Draws a part in a box of the width and returns the height it used.</summary>
    double Block(WireframeNode node, double x, double y, double width)
    {
        if (node.InlineChildren && node.Part is not ("table" or "menu"))
        {
            return Container(node, x, y, width, (cx, cy, cw) => Flex(node.Children, cx, cy, cw));
        }

        return node.Part switch
        {
            "header" => Header(node, x, y, width),
            "footer" => Flow(node.Children, x, y, width, alignEnd: node.Children.All(IsControl)),
            "toolbar" => Flow(node.Children, x, y, width, alignEnd: false),
            "region" => Region(node, x, y, width),
            "aside" => Aside(node, x, y, width),
            "card" => Card(node, x, y, width),
            "item" => Stack(node.Children, x, y, width, Gap / 2),
            "row" => phone ? Stack(node.Children, x, y, width) : Columns(node.Children, Enumerable.Repeat(1, node.Children.Count).ToList(), x, y, width),
            "split" => phone ? Stack(Reflow(node.Children), x, y, width) : Columns(node.Children, node.Ratio!, x, y, width),
            "tabs" => Tabs(node, x, y, width),
            "nav" => Nav(node, x, y, width),
            "breadcrumb" => Breadcrumb(node, x, y, width),
            "heading" => Heading(node, x, y, width),
            "text" => Paragraph(node.Text, x, y, width, node.Has("muted") ? Muted : Ink, Body),
            "fact" => Fact(node, x, y, width),
            "figure" => Figure(node, x, y, width),
            "status" => Pill(node, x, y),
            "message" => Message(node, x, y, width),
            "avatar" => Avatar(node, x, y),
            "image" => Image(node, x, y, width, Math.Min(180, Math.Max(64, width * 0.56))),
            "icon" => Icon(node, x, y),
            "link" => Link(node, x, y, width),
            "divider" => Divider(x, y, width),
            "action" => Button(node, x, y, Math.Min(width, Natural(node))),
            "menu" => Button(node, x, y, Math.Min(width, Natural(node))),
            "field" => Field(node, x, y, width),
            "list" => List(node, x, y, width),
            "table" => Table(node, x, y, width),
            "grid" => Grid(node, x, y, width),
            "timeline" => Timeline(node, x, y, width),
            _ => 0,
        };
    }

    static bool IsControl(WireframeNode node) => node.Part is "action" or "menu";

    static bool IsInline(WireframeNode node) =>
        node.Part is "heading" or "status" or "avatar" or "icon" or "link" or "action" or "menu";

    // The width a part asks for in a horizontal arrangement; flexible parts share the rest.
    static double Natural(WireframeNode node) => node.Part switch
    {
        "action" when node.Has("quiet") => TextWidth(node.Text, Body) + 8,
        "action" => TextWidth(node.Text, Body, bold: true) + 28,
        "menu" => TextWidth(node.Text, Body, bold: true) + 44,
        "status" => TextWidth(node.Text, 12, bold: true) + 18,
        "avatar" => 32,
        "icon" => 18,
        "image" => 96,
        "figure" => node.Strings.Max(text => TextWidth(text, 22, bold: true)) + 32,
        "heading" => TextWidth(node.Text, node.Has("small") ? 16 : 22, bold: true),
        "text" => TextWidth(node.Text, Body),
        "link" => TextWidth(node.Text, Body),
        "breadcrumb" => TextWidth(string.Join(" / ", node.Strings), 13),
        "field" when node.Has("checkbox") || node.Has("radio") || node.Has("toggle") => TextWidth(node.Text, Body) + 40,
        "field" => 220,
        "fact" => TextWidth(node.Strings[0], 13) + TextWidth(node.Strings.ElementAtOrDefault(1) ?? "", Body) + 16,
        _ => 0,
    };

    static bool Flexible(WireframeNode node) => node.Part is not ("action" or "menu" or "status" or "avatar" or "icon" or "image" or "figure")
        && !(node.Part == "field" && (node.Has("checkbox") || node.Has("radio") || node.Has("toggle")));

    // Side by side on one line: fixed parts take their width, flexible parts share what is left.
    double Flex(List<WireframeNode> children, double x, double y, double width)
    {
        if (children.Count == 0)
        {
            return 0;
        }

        if (phone && children.Count(Flexible) >= 3)
        {
            return Grouped(children, x, y, width);
        }

        var gap = Gap;
        var fixedWidth = children.Where(child => !Flexible(child)).Sum(Natural);
        var flexible = children.Count(Flexible);
        var spare = width - fixedWidth - gap * (children.Count - 1);
        var share = flexible > 0 ? Math.Max(48, spare / flexible) : 0;

        // Flexible parts that need less than their share give it back to the last one.
        var widths = children.Select(child => Flexible(child) ? share : Natural(child)).ToList();

        if (flexible > 1)
        {
            var flexIndexes = children.Select((child, index) => (child, index)).Where(item => Flexible(item.child)).Select(item => item.index).ToList();
            var saved = 0.0;

            foreach (var index in flexIndexes.Take(flexIndexes.Count - 1))
            {
                var want = Math.Max(48, Natural(children[index]));

                if (children[index].Part is "text" or "link" or "heading" or "fact" && want < share)
                {
                    saved += share - want;
                    widths[index] = want;
                }
            }

            widths[flexIndexes[^1]] += saved;
        }

        var heights = children.Select(child => Measure(child, widths[children.IndexOf(child)])).ToList();
        var lineHeight = heights.Max();
        var cursor = x;

        for (var index = 0; index < children.Count; index++)
        {
            var offset = (lineHeight - heights[index]) / 2;
            Block(children[index], cursor, y + offset, widths[index]);
            cursor += widths[index] + gap;
        }

        return lineHeight;
    }

    // On a phone a crowded line keeps its leading and trailing fixed parts and stacks the rest between them.
    double Grouped(List<WireframeNode> children, double x, double y, double width)
    {
        var lead = children.TakeWhile(child => !Flexible(child)).ToList();
        var trail = children.Skip(lead.Count).Reverse().TakeWhile(child => !Flexible(child)).Reverse().ToList();
        var middle = children.Skip(lead.Count).Take(children.Count - lead.Count - trail.Count).ToList();
        var leadWidth = lead.Sum(Natural) + Gap * lead.Count;
        var trailWidth = trail.Sum(Natural) + Gap * trail.Count;
        var cursor = x;

        foreach (var child in lead)
        {
            Block(child, cursor, y, Natural(child));
            cursor += Natural(child) + Gap;
        }

        var height = Stack(middle, x + leadWidth, y, width - leadWidth - trailWidth, 2);
        cursor = x + width - trailWidth + Gap;

        foreach (var child in trail)
        {
            Block(child, cursor, y, Natural(child));
            cursor += Natural(child) + Gap;
        }

        return Math.Max(height, children.Where(child => !Flexible(child)).Select(child => Measure(child, Natural(child))).DefaultIfEmpty(0).Max());
    }

    // Left to right at natural width, wrapping onto a new line when the width runs out.
    double Flow(List<WireframeNode> children, double x, double y, double width, bool alignEnd)
    {
        var lines = new List<List<(WireframeNode Node, double Width)>> { new() };
        var used = 0.0;

        foreach (var child in children)
        {
            var natural = Math.Min(width, child.Part == "field" && Flexible(child) ? Math.Min(260, width) : Math.Max(Natural(child), 24));

            if (lines[^1].Count > 0 && used + Gap + natural > width)
            {
                lines.Add([]);
                used = 0;
            }

            used += (lines[^1].Count > 0 ? Gap : 0) + natural;
            lines[^1].Add((child, natural));
        }

        var top = y;

        foreach (var line in lines.Where(line => line.Count > 0))
        {
            var heights = line.Select(item => Measure(item.Node, item.Width)).ToList();
            var lineHeight = heights.Max();
            var total = line.Sum(item => item.Width) + Gap * (line.Count - 1);
            var cursor = alignEnd ? x + width - total : x;

            for (var index = 0; index < line.Count; index++)
            {
                Block(line[index].Node, cursor, y + lineHeight - heights[index], line[index].Width);
                cursor += line[index].Width + Gap;
            }

            y += lineHeight + Gap / 2;
        }

        return y - top - Gap / 2;
    }

    // The height a part would use, found by drawing it into a scratch buffer.
    double Measure(WireframeNode node, double width)
    {
        var mark = svg.Length;
        var control = lastControl;
        var height = Block(node, 0, 0, width);
        svg.Length = mark;
        lastControl = control;
        return height;
    }

    double Header(WireframeNode node, double x, double y, double width)
    {
        var lead = node.Children.Where(child => !IsControl(child)).ToList();
        var controls = node.Children.Where(IsControl).ToList();

        if (phone || controls.Count == 0)
        {
            var leadHeight = Lead(lead, x, y, width);
            var actionsHeight = controls.Count > 0 ? Flow(controls, x, y + leadHeight + (lead.Count > 0 ? Gap : 0), width, alignEnd: false) + (lead.Count > 0 ? Gap : 0) : 0;
            return leadHeight + actionsHeight;
        }

        var controlsWidth = Math.Min(width * 0.5, controls.Sum(Natural) + Gap * (controls.Count - 1));
        var controlsHeight = Flow(controls, x + width - controlsWidth, y, controlsWidth, alignEnd: true);
        var height = Lead(lead, x, y, width - controlsWidth - Gap * 2);
        return Math.Max(height, controlsHeight);
    }

    // Inline parts share a line; block parts each take a line of their own.
    double Lead(List<WireframeNode> children, double x, double y, double width)
    {
        var top = y;
        var run = new List<WireframeNode>();

        void Emit()
        {
            if (run.Count == 0)
            {
                return;
            }

            y += Flow(run, x, y, width, alignEnd: false) + Gap / 2;
            run = [];
        }

        foreach (var child in children)
        {
            if (IsInline(child))
            {
                run.Add(child);
                continue;
            }

            Emit();
            y += Block(child, x, y, width) + Gap / 2;
        }

        Emit();
        return Math.Max(0, y - top - Gap / 2);
    }

    double Container(WireframeNode node, double x, double y, double width, Func<double, double, double, double> body)
    {
        if (node.Part is "card" or "item" or "row" or "region" or "aside" or "header" or "footer" or "toolbar")
        {
            return node.Part switch
            {
                "card" => Boxed(x, y, width, 16, (cx, cy, cw) => body(cx, cy, cw)),
                _ => body(x, y, width),
            };
        }

        return body(x, y, width);
    }

    double Region(WireframeNode node, double x, double y, double width)
    {
        var top = y;

        if (node.Text.Length > 0)
        {
            y += Text(node.Text, x, y, width, Ink, 16, bold: true) + Gap;
        }

        y += Stack(node.Children, x, y, width, Gap);
        return y - top;
    }

    double Aside(WireframeNode node, double x, double y, double width)
    {
        var mark = svg.Length;
        var top = y;
        var inner = width - 32;

        if (node.Text.Length > 0)
        {
            y += 16 + Text(node.Text, x + 16, y + 16, inner, Ink, 15, bold: true) + Gap - 16;
        }

        var height = Stack(node.Children, x + 16, y + 16, inner, Gap) + 32 + (y - top);
        svg.Insert(mark, $"<rect x=\"{N(x)}\" y=\"{N(top)}\" width=\"{N(width)}\" height=\"{N(height)}\" rx=\"8\" fill=\"{Wash}\" stroke=\"{Hairline}\"/>");
        return height;
    }

    double Card(WireframeNode node, double x, double y, double width) =>
        Boxed(x, y, width, 16, (cx, cy, cw) =>
        {
            var top = cy;

            if (node.Text.Length > 0)
            {
                cy += Text(node.Text, cx, cy, cw, Ink, 15, bold: true) + Gap;
            }

            return cy - top + Stack(node.Children, cx, cy, cw, Gap);
        });

    double Boxed(double x, double y, double width, double padding, Func<double, double, double, double> body, string fill = "#ffffff", string stroke = Line)
    {
        var mark = svg.Length;
        var height = body(x + padding, y + padding, width - 2 * padding) + 2 * padding;
        svg.Insert(mark, $"<rect x=\"{N(x + 0.5)}\" y=\"{N(y + 0.5)}\" width=\"{N(width - 1)}\" height=\"{N(height - 1)}\" rx=\"8\" fill=\"{fill}\" stroke=\"{stroke}\"{Opacity()}/>");
        return height;
    }

    double Columns(List<WireframeNode> children, List<int> ratio, double x, double y, double width)
    {
        var gap = Gap * 2;
        var total = ratio.Sum();
        var usable = width - gap * (children.Count - 1);
        var cursor = x;
        var height = 0.0;

        for (var index = 0; index < children.Count; index++)
        {
            var columnWidth = usable * ratio[index] / total;
            var child = children[index];
            height = Math.Max(height, child.Part is "item" or "header" ? Block(child, cursor, y, columnWidth) : Stack([child], cursor, y, columnWidth));
            cursor += columnWidth + gap;
        }

        return height;
    }

    double Tabs(WireframeNode node, double x, double y, double width)
    {
        var cursor = x;
        var visible = phone ? 3 : node.Strings.Count;

        for (var index = 0; index < node.Strings.Count && index < visible; index++)
        {
            var label = node.Strings[index];
            var labelWidth = TextWidth(label, Body, bold: index == 0);

            if (cursor + labelWidth > x + width)
            {
                break;
            }

            Text(label, cursor, y + 4, labelWidth + 2, index == 0 ? Ink : Muted, Body, bold: index == 0);

            if (index == 0)
            {
                svg.Append($"<rect x=\"{N(cursor)}\" y=\"{N(y + 28)}\" width=\"{N(labelWidth)}\" height=\"2\" fill=\"{Ink}\"{Opacity()}/>");
            }

            cursor += labelWidth + 24;
        }

        if (visible < node.Strings.Count)
        {
            Text("More ▾", cursor, y + 4, 60, Muted, Body);
        }

        Divider(x, y + 30, width, margin: 0);
        var below = node.Children.Count > 0 ? Gap * 1.5 + Stack(node.Children, x, y + 31 + Gap * 1.5, width, Gap) : 0;
        return 31 + below;
    }

    double Nav(WireframeNode node, double x, double y, double width)
    {
        if (node.Has("side"))
        {
            var top = y;

            foreach (var link in node.Children)
            {
                if (link.Has("current"))
                {
                    svg.Append($"<rect x=\"{N(x)}\" y=\"{N(y)}\" width=\"{N(width)}\" height=\"30\" rx=\"6\" fill=\"#f2f4f7\"{Opacity()}/>");
                }

                Text(link.Text, x + 10, y + 7, width - 20, link.Has("current") ? Ink : Muted, Body, bold: link.Has("current"));
                y += 32;
            }

            return y - top;
        }

        var cursor = x;

        foreach (var link in node.Children)
        {
            var labelWidth = TextWidth(link.Text, Body, bold: link.Has("current"));

            if (cursor + labelWidth > x + width)
            {
                break;
            }

            Text(link.Text, cursor, y + 4, labelWidth + 2, link.Has("current") ? Ink : Muted, Body, bold: link.Has("current"));

            if (link.Has("current"))
            {
                svg.Append($"<rect x=\"{N(cursor)}\" y=\"{N(y + 24)}\" width=\"{N(labelWidth)}\" height=\"2\" fill=\"{Ink}\"{Opacity()}/>");
            }

            cursor += labelWidth + 20;
        }

        return 26;
    }

    double Breadcrumb(WireframeNode node, double x, double y, double width)
    {
        var cursor = x;

        for (var index = 0; index < node.Strings.Count; index++)
        {
            var last = index == node.Strings.Count - 1;
            var label = node.Strings[index];
            var labelWidth = Math.Min(TextWidth(label, 13, bold: last), x + width - cursor);

            if (labelWidth <= 8)
            {
                break;
            }

            Text(label, cursor, y, labelWidth + 1, last ? Ink : Muted, 13, bold: last, underline: !last);
            cursor += labelWidth;

            if (!last)
            {
                Text("/", cursor + 8, y, 12, Faint, 13);
                cursor += 24;
            }
        }

        return 18;
    }

    double Heading(WireframeNode node, double x, double y, double width)
    {
        var size = node.Has("small") ? 16 : phone ? 20 : 22;
        return Text(node.Text, x, y, width, Ink, size, bold: true);
    }

    double Fact(WireframeNode node, double x, double y, double width)
    {
        var label = node.Strings[0];
        var value = node.Strings[1];

        if (width < 280)
        {
            var top = y;
            y += Text(label, x, y, width, Muted, 12) + 3;
            y += Paragraph(value, x, y, width, Ink, Body);
            return y - top;
        }

        var labelWidth = Math.Min(width * 0.38, 180);
        Text(label, x, y + 1, labelWidth - 8, Muted, 13);
        return Math.Max(20, Paragraph(value, x + labelWidth, y, width - labelWidth, Ink, Body));
    }

    double Figure(WireframeNode node, double x, double y, double width) =>
        Boxed(x, y, width, 14, (cx, cy, cw) =>
        {
            var top = cy;
            // One string is the value alone; two are a label and its value.
            if (node.Strings.Count > 1)
            {
                cy += Text(node.Strings[0], cx, cy, cw, Muted, 12) + 6;
            }

            cy += Text(node.Strings[node.Strings.Count > 1 ? 1 : 0], cx, cy, cw, Ink, 22, bold: true);

            if (node.Strings.Count > 2)
            {
                cy += 4 + Text(node.Strings[2], cx, cy + 4, cw, Muted, 12);
            }

            return cy - top;
        });

    double Pill(WireframeNode node, double x, double y)
    {
        var (fill, text) = ToneColours[Tone(node)];
        var width = Natural(node);
        svg.Append($"<rect x=\"{N(x)}\" y=\"{N(y)}\" width=\"{N(width)}\" height=\"22\" rx=\"11\" fill=\"{fill}\"{Opacity()}/>");
        Text(node.Text, x + 9, y + 4, width - 16, text, 12, bold: true);
        return 22;
    }

    double Message(WireframeNode node, double x, double y, double width)
    {
        var (fill, text) = ToneColours[Tone(node)];
        var mark = svg.Length;
        var height = Paragraph(node.Text, x + 34, y + 12, width - 48, text, Body) + 24;
        svg.Insert(mark, $"<rect x=\"{N(x)}\" y=\"{N(y)}\" width=\"{N(width)}\" height=\"{N(height)}\" rx=\"8\" fill=\"{fill}\"{Opacity()}/><circle cx=\"{N(x + 18)}\" cy=\"{N(y + 22)}\" r=\"6\" fill=\"none\" stroke=\"{text}\" stroke-width=\"1.5\"{Opacity()}/>");
        return height;
    }

    double Avatar(WireframeNode node, double x, double y)
    {
        svg.Append($"<circle cx=\"{N(x + 16)}\" cy=\"{N(y + 16)}\" r=\"16\" fill=\"#e4e7ec\"{Opacity()}/>");
        var initials = node.Text.Length > 2 ? node.Text[..2] : node.Text;
        var textWidth = TextWidth(initials, 12, bold: true);
        Text(initials, x + 16 - textWidth / 2, y + 9, textWidth + 2, Ink, 12, bold: true);
        return 32;
    }

    double Image(WireframeNode node, double x, double y, double width, double height)
    {
        svg.Append($"<g{Opacity()}><rect x=\"{N(x + 0.5)}\" y=\"{N(y + 0.5)}\" width=\"{N(width - 1)}\" height=\"{N(height - 1)}\" rx=\"6\" fill=\"{Wash}\" stroke=\"{Line}\"/>");
        svg.Append($"<path d=\"M{N(x)} {N(y)}L{N(x + width)} {N(y + height)}M{N(x + width)} {N(y)}L{N(x)} {N(y + height)}\" stroke=\"{Hairline}\"/></g>");
        var label = Math.Min(TextWidth(node.Text, 12), width - 12);
        svg.Append($"<rect x=\"{N(x + width / 2 - label / 2 - 6)}\" y=\"{N(y + height / 2 - 10)}\" width=\"{N(label + 12)}\" height=\"20\" rx=\"4\" fill=\"#ffffff\"{Opacity()}/>");
        Text(node.Text, x + width / 2 - label / 2, y + height / 2 - 7, label + 1, Muted, 12);
        return height;
    }

    double Icon(WireframeNode node, double x, double y)
    {
        svg.Append($"<rect x=\"{N(x + 1)}\" y=\"{N(y + 1)}\" width=\"16\" height=\"16\" rx=\"4\" fill=\"none\" stroke=\"{Muted}\" stroke-width=\"1.5\"{Opacity()}><title>{WebUtility.HtmlEncode(node.Text)}</title></rect>");
        return 18;
    }

    double Link(WireframeNode node, double x, double y, double width) =>
        Text(node.Text, x, y, width, "#175cd3", Body, bold: node.Has("current"), underline: true);

    double Divider(double x, double y, double width, double margin = 4)
    {
        svg.Append($"<rect x=\"{N(x)}\" y=\"{N(y + margin)}\" width=\"{N(width)}\" height=\"1\" fill=\"{Hairline}\"{Opacity()}/>");
        return 1 + 2 * margin;
    }

    double Button(WireframeNode node, double x, double y, double width)
    {
        lastControl = (x, y, width, 34);
        var label = node.Part == "menu" ? node.Text + "  ▾" : node.Text;

        if (node.Has("quiet"))
        {
            Text(node.Text, x + 4, y + 9, width - 4, Ink, Body, underline: true);
            return 34;
        }

        if (node.Has("disabled"))
        {
            svg.Append($"<rect x=\"{N(x + 0.5)}\" y=\"{N(y + 0.5)}\" width=\"{N(width - 1)}\" height=\"33\" rx=\"7\" fill=\"#f2f4f7\" stroke=\"{Hairline}\" stroke-dasharray=\"4 3\"{Opacity()}/>");
            Text(label, x + 14, y + 9, width - 20, Faint, Body, bold: true);
            return 34;
        }

        var primary = node.Has("primary");
        var destructive = node.Has("destructive");
        var critical = ToneColours["critical"].Text;
        var fill = primary ? (destructive ? critical : Ink) : "#ffffff";
        var stroke = primary ? fill : destructive ? critical : Line;
        var ink = primary ? "#ffffff" : destructive ? critical : Ink;
        svg.Append($"<rect x=\"{N(x + 0.5)}\" y=\"{N(y + 0.5)}\" width=\"{N(width - 1)}\" height=\"33\" rx=\"7\" fill=\"{fill}\" stroke=\"{stroke}\"{Opacity()}/>");
        Text(label, x + 14, y + 9, width - 20, ink, Body, bold: true);
        return 34;
    }

    double Field(WireframeNode node, double x, double y, double width)
    {
        lastControl = (x, y, width, 34);
        var kind = node.Modifiers.FirstOrDefault(WireframeParts.FieldKinds.Contains) ?? "text";

        if (kind is "checkbox" or "radio" or "toggle")
        {
            var on = node.Value is "on" or "true" or "yes" or "checked";

            if (kind == "radio")
            {
                svg.Append($"<circle cx=\"{N(x + 9)}\" cy=\"{N(y + 11)}\" r=\"8\" fill=\"#ffffff\" stroke=\"{(on ? Ink : Line)}\"{Opacity()}/>{(on ? $"<circle cx=\"{N(x + 9)}\" cy=\"{N(y + 11)}\" r=\"4\" fill=\"{Ink}\"{Opacity()}/>" : "")}");
            }
            else if (kind == "checkbox")
            {
                svg.Append($"<rect x=\"{N(x + 0.5)}\" y=\"{N(y + 2.5)}\" width=\"17\" height=\"17\" rx=\"4\" fill=\"{(on ? Ink : "#ffffff")}\" stroke=\"{(on ? Ink : Line)}\"{Opacity()}/>");
            }
            else
            {
                svg.Append($"<rect x=\"{N(x + 0.5)}\" y=\"{N(y + 2.5)}\" width=\"31\" height=\"17\" rx=\"8.5\" fill=\"{(on ? Ink : Bar)}\"{Opacity()}/><circle cx=\"{N(x + (on ? 23 : 9))}\" cy=\"{N(y + 11)}\" r=\"6\" fill=\"#ffffff\"{Opacity()}/>");
            }

            Text(node.Text, x + (kind == "toggle" ? 40 : 26), y + 3, width - 40, Ink, Body);
            return 22;
        }

        var top = y;
        var boxHeight = kind switch
        {
            "textarea" => 84.0,
            "file" => 72.0,
            _ => 36.0,
        };

        if (kind is not ("search" or "file"))
        {
            y += Text(node.Text, x, y, width, Ink, 13, bold: true) + 6;
        }

        var dash = kind == "file" ? " stroke-dasharray=\"5 4\"" : "";
        svg.Append($"<rect x=\"{N(x + 0.5)}\" y=\"{N(y + 0.5)}\" width=\"{N(width - 1)}\" height=\"{N(boxHeight - 1)}\" rx=\"7\" fill=\"{(kind == "file" ? Wash : "#ffffff")}\" stroke=\"{Line}\"{dash}{Opacity()}/>");

        switch (kind)
        {
            case "search":
                svg.Append($"<circle cx=\"{N(x + 17)}\" cy=\"{N(y + 16)}\" r=\"5\" fill=\"none\" stroke=\"{Faint}\" stroke-width=\"1.5\"{Opacity()}/><path d=\"M{N(x + 21)} {N(y + 20)}l4 4\" stroke=\"{Faint}\" stroke-width=\"1.5\"{Opacity()}/>");
                Text(node.Value ?? node.Text, x + 32, y + 10, width - 40, node.Value is null ? Faint : Ink, Body);
                break;
            case "file":
                var labelWidth = Math.Min(TextWidth(node.Text, 13), width - 24);
                Text(node.Text, x + width / 2 - labelWidth / 2, y + boxHeight / 2 - 8, labelWidth + 2, Muted, 13);
                break;
            default:
                if (node.Value is not null)
                {
                    if (kind == "textarea")
                    {
                        Paragraph(node.Value, x + 12, y + 10, width - 24, Ink, Body);
                    }
                    else
                    {
                        Text(node.Value, x + 12, y + 10, width - 36, Ink, Body);
                    }
                }

                if (kind is "select" or "date")
                {
                    Text(kind == "select" ? "▾" : "▦", x + width - 22, y + 9, 14, Faint, Body);
                }

                break;
        }

        return y - top + boxHeight;
    }

    double List(WireframeNode node, double x, double y, double width)
    {
        var template = node.Children[0];
        var top = y;
        var count = node.Count ?? 1;

        for (var index = 0; index < count; index++)
        {
            if (index > 0)
            {
                Divider(x, y + Gap / 2 - 0.5, width, margin: 0);
            }

            var height = Faded(index, () => Block(template, x, y + Gap, width));
            y += height + Gap * 2;
        }

        return y - top - Gap;
    }

    double Table(WireframeNode node, double x, double y, double width)
    {
        var columns = node.Strings.ToList();
        var overflow = false;

        if (phone && columns.Count > 2)
        {
            columns = columns[..2];
            overflow = true;
        }

        var cells = node.Children.Count > 0 ? node.Children[0].Children : [];
        var reserve = overflow ? 28 : 0;
        var columnWidth = (width - 24 - reserve) / columns.Count;
        var top = y;
        svg.Append($"<rect x=\"{N(x)}\" y=\"{N(y)}\" width=\"{N(width)}\" height=\"34\" rx=\"6\" fill=\"{Wash}\"{Opacity()}/>");

        for (var index = 0; index < columns.Count; index++)
        {
            Text(columns[index], x + 12 + index * columnWidth, y + 10, columnWidth - 12, Muted, 12, bold: true);
        }

        if (overflow)
        {
            Text("…", x + width - 22, y + 9, 16, Muted, Body, bold: true);
        }

        y += 34;
        var count = node.Count ?? 1;

        for (var row = 0; row < count; row++)
        {
            var rowHeight = 40.0;

            if (row == 0 && cells.Count > 0)
            {
                for (var index = 0; index < columns.Count && index < cells.Count; index++)
                {
                    var cellWidth = columnWidth - 12;
                    var cell = cells[index];
                    var height = Measure(cell, Math.Min(cellWidth, Flexible(cell) ? cellWidth : Natural(cell)));
                    rowHeight = Math.Max(rowHeight, height + 18);
                }

                for (var index = 0; index < columns.Count && index < cells.Count; index++)
                {
                    var cellWidth = columnWidth - 12;
                    var cell = cells[index];
                    var drawWidth = Math.Min(cellWidth, Flexible(cell) ? cellWidth : Natural(cell));
                    var height = Measure(cell, drawWidth);
                    Block(cell, x + 12 + index * columnWidth, y + (rowHeight - height) / 2, drawWidth);
                }
            }
            else
            {
                for (var index = 0; index < columns.Count; index++)
                {
                    var barWidth = (columnWidth - 24) * (0.45 + 0.4 * ((row * 7 + index * 3) % 5) / 4.0);
                    svg.Append($"<rect x=\"{N(x + 12 + index * columnWidth)}\" y=\"{N(y + 16)}\" width=\"{N(barWidth)}\" height=\"8\" rx=\"4\" fill=\"{Bar}\"/>");
                }
            }

            Divider(x, y + rowHeight - 1, width, margin: 0);
            y += rowHeight;
        }

        return y - top;
    }

    double Grid(WireframeNode node, double x, double y, double width)
    {
        var template = node.Children[0];
        var count = node.Count ?? 1;
        var columns = phone ? 1 : Math.Max(1, Math.Min(count, (int)((width + Gap) / (220 + Gap))));
        var cellWidth = (width - Gap * (columns - 1)) / columns;
        var top = y;

        for (var start = 0; start < count; start += columns)
        {
            var rowHeight = 0.0;

            for (var column = 0; column < columns && start + column < count; column++)
            {
                var index = start + column;
                var height = Faded(index, () => template.Part is "card" or "figure" or "image"
                    ? Block(template, x + column * (cellWidth + Gap), y, cellWidth)
                    : Boxed(x + column * (cellWidth + Gap), y, cellWidth, 14, (cx, cy, cw) => Block(template, cx, cy, cw)));
                rowHeight = Math.Max(rowHeight, height);
            }

            y += rowHeight + Gap;
        }

        return y - top - Gap;
    }

    double Timeline(WireframeNode node, double x, double y, double width)
    {
        var template = node.Children[0];
        var count = node.Count ?? 1;
        var top = y;
        var mark = svg.Length;
        var lastDot = y;

        for (var index = 0; index < count; index++)
        {
            lastDot = y + 8;
            var height = Faded(index, () =>
            {
                svg.Append($"<circle cx=\"{N(x + 7)}\" cy=\"{N(y + 8)}\" r=\"5\" fill=\"#ffffff\" stroke=\"{Ink}\" stroke-width=\"1.5\"{Opacity()}/>");
                return Block(template, x + 26, y, width - 26);
            });
            y += Math.Max(height, 20) + Gap * 1.5;
        }

        svg.Insert(mark, $"<rect x=\"{N(x + 6.25)}\" y=\"{N(top + 8)}\" width=\"1.5\" height=\"{N(lastDot - top - 8)}\" fill=\"{Hairline}\"/>");
        return y - top - Gap * 1.5;
    }

    // A repeated entry after the first is drawn lighter: the first shows the template, the rest its count.
    double Faded(int index, Func<double> draw)
    {
        var before = faded;
        faded = index == 0 ? before : Math.Max(0.35, before * (index == 1 ? 0.6 : 0.45));
        var height = draw();
        faded = before;
        return height;
    }

    double Overlay(WireframeNode node, double width, double pageHeight)
    {
        if (node.Part == "toast")
        {
            var (fill, ink) = ToneColours[Tone(node)];
            var actionsWidth = node.Children.Sum(child => TextWidth(child.Text, Body, bold: true) + 16);
            var toastWidth = phone ? width - 32 : Math.Min(520, TextWidth(node.Text, Body) + 64 + actionsWidth);
            var tx = phone ? 16 : width - toastWidth - 24;
            var ty = pageHeight - 24 - 48;
            svg.Append($"<rect x=\"{N(tx)}\" y=\"{N(ty)}\" width=\"{N(toastWidth)}\" height=\"48\" rx=\"10\" fill=\"#1d2939\"/><circle cx=\"{N(tx + 20)}\" cy=\"{N(ty + 24)}\" r=\"5\" fill=\"{fill}\" stroke=\"{ink}\"/>");
            Text(node.Text, tx + 36, ty + 15, toastWidth - 48 - actionsWidth, "#ffffff", Body);

            // A toast's actions read as light text links at its right end.
            var cursor = tx + toastWidth - 16;
            foreach (var action in Enumerable.Reverse(node.Children))
            {
                var labelWidth = TextWidth(action.Text, Body, bold: true);
                cursor -= labelWidth;
                Text(action.Text, cursor, ty + 15, labelWidth + 2, "#ffffff", Body, bold: true, underline: true);
                cursor -= 16;
            }

            return pageHeight;
        }

        if (node.Part == "popover")
        {
            var anchor = lastControl ?? (width - 220, 80, 120, 34);
            var popoverWidth = Math.Min(phone ? width - 32 : 300, width - 32);
            var px = Math.Clamp(anchor.X + anchor.W - popoverWidth, 16, width - popoverWidth - 16);
            var py = anchor.Y + anchor.H + 8;
            var height = Boxed(px, py, popoverWidth, 14, (cx, cy, cw) => OverlayBody(node, cx, cy, cw), stroke: Muted);
            return Math.Max(pageHeight, py + height + 16);
        }

        svg.Append($"<rect x=\"0\" y=\"0\" width=\"{width}\" height=\"{N(pageHeight)}\" rx=\"10\" fill=\"#101828\" fill-opacity=\"0.38\"/>");

        if (node.Part == "drawer")
        {
            var side = phone ? "bottom" : node.Modifiers.FirstOrDefault() ?? "right";

            if (side == "bottom")
            {
                var mark = svg.Length;
                var bodyHeight = OverlayBody(node, 20, 0, width - 40);
                svg.Length = mark;
                var panelTop = Math.Max(48, pageHeight - bodyHeight - 48);
                svg.Append($"<rect x=\"0\" y=\"{N(panelTop)}\" width=\"{width}\" height=\"{N(pageHeight - panelTop)}\" rx=\"14\" fill=\"#ffffff\"/>");
                svg.Append($"<rect x=\"{N(width / 2.0 - 20)}\" y=\"{N(panelTop + 8)}\" width=\"40\" height=\"4\" rx=\"2\" fill=\"{Bar}\"/>");
                var used = OverlayBody(node, 20, panelTop + 24, width - 40);
                return Math.Max(pageHeight, panelTop + used + 48);
            }

            var panelWidth = Math.Min(420, width * 0.4);
            var left = side == "left" ? 0 : width - panelWidth;
            svg.Append($"<rect x=\"{N(left)}\" y=\"0\" width=\"{N(panelWidth)}\" height=\"{N(pageHeight)}\" fill=\"#ffffff\"/>");
            var drawn = OverlayBody(node, left + 24, 24, panelWidth - 48);
            return Math.Max(pageHeight, drawn + 48);
        }

        var dialogWidth = phone ? width - 32 : Math.Min(520, width - 64);
        var measure = svg.Length;
        var dialogHeight = OverlayBody(node, 0, 0, dialogWidth - 48) + 48;
        svg.Length = measure;
        var dx = (width - dialogWidth) / 2;
        var dy = Math.Max(32, (pageHeight - dialogHeight) / 2.5);
        svg.Append($"<rect x=\"{N(dx)}\" y=\"{N(dy)}\" width=\"{N(dialogWidth)}\" height=\"{N(dialogHeight)}\" rx=\"12\" fill=\"#ffffff\"/>");
        OverlayBody(node, dx + 24, dy + 24, dialogWidth - 48);
        return Math.Max(pageHeight, dy + dialogHeight + 32);
    }

    double OverlayBody(WireframeNode node, double x, double y, double width)
    {
        var top = y;

        if (node.Text.Length > 0)
        {
            y += Text(node.Text, x, y, width - 24, Ink, 17, bold: true) + Gap;

            if (node.Part is "dialog" or "drawer")
            {
                Text("×", x + width - 12, y - Gap - 20, 14, Muted, 18);
            }
        }

        // Actions that close the overlay's content read as its button row, as a footer would.
        var body = node.Children.Where(child => child.Part != "footer").ToList();
        var trailing = body.AsEnumerable().Reverse().TakeWhile(IsControl).Reverse().ToList();
        body = body.Take(body.Count - trailing.Count).ToList();
        var footer = node.Children.Where(child => child.Part == "footer").ToList();
        y += Stack(body, x, y, width, Gap);

        if (trailing.Count > 0)
        {
            y += (body.Count > 0 ? Gap * 1.5 : 0) + Flow(trailing, x, y + (body.Count > 0 ? Gap * 1.5 : 0), width, alignEnd: true);
        }

        if (footer.Count > 0)
        {
            y += Gap * 1.5;
            y += Stack(footer, x, y, width, Gap);
        }

        return y - top;
    }

    static string Tone(WireframeNode node) => node.Modifiers.FirstOrDefault(WireframeParts.Tones.Contains) ?? "neutral";

    // One line of text in the box, truncated with an ellipsis when it would overflow.
    double Text(string value, double x, double y, double width, string color, double size, bool bold = false, bool underline = false)
    {
        var shown = Fit(value, width, size, bold);

        if (shown.Length == 0)
        {
            return size * 1.4;
        }

        var weight = bold ? " font-weight=\"600\"" : "";
        var decoration = underline ? " text-decoration=\"underline\"" : "";
        svg.Append(CultureInfo.InvariantCulture, $"<text x=\"{N(x)}\" y=\"{N(y + size)}\" font-size=\"{N(size)}\" fill=\"{color}\"{weight}{decoration}{Opacity()}>{WebUtility.HtmlEncode(shown)}</text>");
        return size * 1.4;
    }

    // Word-wrapped text, at most four lines, the last truncated.
    double Paragraph(string value, double x, double y, double width, string color, double size)
    {
        var lines = Wrap(value, width, size);
        var lineHeight = size * 1.45;

        for (var index = 0; index < lines.Count; index++)
        {
            Text(lines[index], x, y + index * lineHeight, width, color, size);
        }

        return Math.Max(1, lines.Count) * lineHeight - (lineHeight - size * 1.4);
    }

    static List<string> Wrap(string value, double width, double size)
    {
        var lines = new List<string>();
        var current = "";

        foreach (var word in value.Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            var candidate = current.Length == 0 ? word : current + " " + word;

            if (current.Length > 0 && TextWidth(candidate, size) > width)
            {
                lines.Add(current);
                current = word;
            }
            else
            {
                current = candidate;
            }
        }

        if (current.Length > 0)
        {
            lines.Add(current);
        }

        if (lines.Count > 4)
        {
            lines = [.. lines[..3], string.Join(' ', lines[3..])];
        }

        return lines;
    }

    static string Fit(string value, double width, double size, bool bold)
    {
        if (TextWidth(value, size, bold) <= width)
        {
            return value;
        }

        var ellipsis = TextWidth("…", size, bold);
        var used = 0.0;
        var length = 0;

        while (length < value.Length && used + Advance(value[length], size, bold) + ellipsis <= width)
        {
            used += Advance(value[length], size, bold);
            length++;
        }

        return length == 0 ? "" : value[..length].TrimEnd() + "…";
    }

    /// <summary>The estimated width of the text at the size, in pixels, from per-character advances.</summary>
    public static double TextWidth(string value, double size, bool bold = false) => value.Sum(character => Advance(character, size, bold));

    // Advances of a common sans-serif, as fractions of the font size.
    static double Advance(char character, double size, bool bold)
    {
        var em = character switch
        {
            ' ' or 'i' or 'l' or 'j' or '.' or ',' or ':' or ';' or '\'' or '|' or '!' => 0.27,
            'f' or 't' or 'r' or 'I' or '(' or ')' or '/' or '-' => 0.36,
            'm' or 'w' or 'M' or 'W' => 0.84,
            >= 'A' and <= 'Z' => 0.66,
            >= '0' and <= '9' => 0.56,
            _ => 0.53,
        };

        return size * em * (bold ? 1.06 : 1);
    }

    string Opacity() => faded < 1 ? $" opacity=\"{N(faded)}\"" : "";

    static string N(double value) => Math.Round(value, 1).ToString(CultureInfo.InvariantCulture);
}
