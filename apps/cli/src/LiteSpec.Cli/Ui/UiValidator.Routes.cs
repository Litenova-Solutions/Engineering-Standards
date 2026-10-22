using System.Text.RegularExpressions;

namespace LiteSpec.Ui;

static partial class UiValidator
{
    static readonly Regex ReactRouteExtension = new(@"\.(?:tsx?|jsx?)$", RegexOptions.Compiled);

    // A React route is a file under src/routes with one address each, except the
    // files the router itself does not treat as addresses: the root layout, the
    // lazy half of a route, the generated route tree, and router-ignored
    // segments. The model reader states the same exclusions for the root, the
    // lazy half, and dash-prefixed segments; the generated tree stays untracked,
    // and a test colocated under routes is a test, not an address.
    static List<string> ReactRouteFiles(string routes) =>
        Walk(routes, file =>
        {
            if (TestDir.IsMatch(file) || TestFile.IsMatch(file))
            {
                return false;
            }

            var name = Path.GetFileName(file);
            if (name.StartsWith("__root", StringComparison.Ordinal)
                || name.Contains(".lazy.", StringComparison.Ordinal)
                || name.StartsWith("routeTree.gen.", StringComparison.Ordinal)
                || IgnoredRouteSegment(Path.GetRelativePath(routes, file)))
            {
                return false;
            }

            return ReactRouteExtension.IsMatch(name);
        });

    // A Svelte route is a folder holding +page.svelte. A server-only endpoint
    // renders no page, so the browser suite has nothing to visit there.
    static List<string> SvelteRouteFiles(string routes) =>
        Walk(routes, file =>
        {
            if (TestDir.IsMatch(file))
            {
                return false;
            }

            if (!Path.GetFileName(file).Equals("+page.svelte", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            return !IgnoredRouteSegment(Path.GetRelativePath(routes, file));
        });

    static bool IgnoredRouteSegment(string relative) =>
        relative.Split(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
            .Any(part => part.StartsWith("-", StringComparison.Ordinal));

    private sealed partial class Session
    {
        // The route suite is one specification per frontend that visits every
        // route the route tree discovers. Every browser verification row names
        // its file, so the file is the fixed contract. A route without
        // tests/routes/every-route.spec.ts under its frontend root is a route
        // the browser checks never visit, and each one is reported by name.
        // (litespec/frontend/web/ui#check-every-route-in-a-browser)
        public void ValidateRouteSuites(string label, string frontendRoot, string platform)
        {
            var routes = Path.Combine(frontendRoot, "src", "routes");
            var files = platform == "svelte" ? SvelteRouteFiles(routes) : ReactRouteFiles(routes);
            if (files.Count == 0)
            {
                return;
            }

            var suite = Path.Combine(frontendRoot, "tests", "routes", "every-route.spec.ts");
            if (File.Exists(suite))
            {
                return;
            }

            var expected = RelativeToRoot(suite);
            foreach (var file in files)
            {
                Errors.Add($"[litespec/frontend/web/ui#check-every-route-in-a-browser] {label}: route '{RelativeToRoot(file)}' has no route suite at '{expected}'");
            }
        }
    }
}
