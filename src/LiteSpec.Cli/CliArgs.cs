namespace LiteSpec;

/// <summary>
///     The parsed arguments of one command. An option takes its value as
///     <c>--name value</c> or <c>--name=value</c>; a flag stands alone. Anything
///     the command does not declare is a usage error.
/// </summary>
sealed class CliArgs
{
    readonly Dictionary<string, string> values = new(StringComparer.Ordinal);
    readonly HashSet<string> flags = new(StringComparer.Ordinal);

    /// <summary>The arguments that are not options, in order.</summary>
    public List<string> Positionals { get; } = [];

    /// <summary>The usage error, or null when the arguments parsed.</summary>
    public string? Error { get; private set; }

    /// <summary>True when <c>--help</c> or <c>-h</c> was passed.</summary>
    public bool Help { get; private set; }

    /// <summary>
    ///     Parses <paramref name="args"/> against the declared flags and value options.
    ///     Names include their dashes, such as <c>--check</c> or <c>--root</c>.
    /// </summary>
    public static CliArgs Parse(string[] args, IEnumerable<string> flagNames, IEnumerable<string> optionNames, int maxPositionals = 0)
    {
        var result = new CliArgs();
        var knownFlags = flagNames.ToHashSet(StringComparer.Ordinal);
        var knownOptions = optionNames.ToHashSet(StringComparer.Ordinal);

        for (var index = 0; index < args.Length; index++)
        {
            var arg = args[index];

            if (arg is "--help" or "-h")
            {
                result.Help = true;
                continue;
            }

            if (!arg.StartsWith('-') || arg == "-")
            {
                if (result.Positionals.Count >= maxPositionals)
                {
                    result.Error ??= $"Unexpected argument '{arg}'.";
                }

                result.Positionals.Add(arg);
                continue;
            }

            var equals = arg.IndexOf('=');
            var name = equals > 0 ? arg[..equals] : arg;

            if (knownFlags.Contains(name) && equals < 0)
            {
                result.flags.Add(name);
            }
            else if (knownOptions.Contains(name))
            {
                if (equals > 0)
                {
                    result.values[name] = arg[(equals + 1)..];
                }
                else if (index + 1 < args.Length && !args[index + 1].StartsWith("--", StringComparison.Ordinal))
                {
                    result.values[name] = args[++index];
                }
                else
                {
                    result.Error ??= $"Option {name} needs a value.";
                }
            }
            else
            {
                result.Error ??= $"Unknown option '{arg}'.";
            }
        }

        return result;
    }

    /// <summary>True when the flag was passed.</summary>
    public bool Has(string flag) => flags.Contains(flag);

    /// <summary>The option's value, or null when it was not passed.</summary>
    public string? Value(string option) => values.GetValueOrDefault(option);

    /// <summary>True when <c>--format json</c> or <c>--format=json</c> was passed.</summary>
    public bool Json => Value("--format") == "json";

    /// <summary>A usage error for a <c>--format</c> value other than <c>json</c> or <c>text</c>.</summary>
    public string? FormatError => Value("--format") is null or "json" or "text" ? null : $"Unknown format '{Value("--format")}'; use json or text.";

    /// <summary>The <c>--root</c> value as a full path, or the working directory.</summary>
    public string Root(string? fallback = null) =>
        Path.GetFullPath(Value("--root") ?? fallback ?? Directory.GetCurrentDirectory());
}
