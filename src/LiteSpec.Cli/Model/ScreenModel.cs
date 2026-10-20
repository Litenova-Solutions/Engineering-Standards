namespace LiteSpec.Model;

/// <summary>One generated operation: its name, method and path.</summary>
sealed record GeneratedOperation(string Name, string Method, string Path);

/// <summary>One read route: its address, file, operations and use cases.</summary>
sealed record ScreenInfo(
    string Frontend,
    string Route,
    string File,
    IReadOnlyList<GeneratedOperation> Operations,
    IReadOnlyList<string> UseCases);

/// <summary>What the screen read found: route screens and file comments.</summary>
sealed record ScreenRead(
    IReadOnlyList<ScreenInfo> Screens,
    IReadOnlyList<CodeComment> Comments);
