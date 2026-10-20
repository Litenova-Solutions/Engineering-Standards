using LiteSpec;
using LiteSpec.Authoring;
using LiteSpec.Book;
using LiteSpec.Consumer;
using LiteSpec.Model;
using LiteSpec.Ui;

// Messages quote page text verbatim, so the console must write UTF-8 rather
// than the Windows code page, which turns a non-ASCII character into a control byte.
Console.OutputEncoding = new System.Text.UTF8Encoding(encoderShouldEmitUTF8Identifier: false);

const string usage = """
    Usage: litespec <command> [options]

    Commands in the LiteSpec repository:
      validate      Check the authoring contract of the LiteSpec repository.
      provisions    Write or check docs/reference/provisions.md.

    Commands in a consumer repository:
      consumer      Validate the consumer's project file, records and prose.
      ui            Validate the controlled web UI contract.
      model         Build, check, render or query the project model.
      book          Generate the project book from model.json.

    Run 'litespec <command> --help' for a command's options.
    'litespec --version' prints the LiteSpec release this tool ships in.
    """;

if (args.Length == 0)
{
    Console.Error.WriteLine(usage);
    return 2;
}

var rest = args[1..];

return args[0] switch
{
    "--help" or "-h" or "help" => Help(),
    "--version" => Version(),
    "validate" => StandardsValidator.Run(rest),
    "provisions" => ProvisionsCommand.Run(rest),
    "consumer" => ConsumerValidator.Run(rest),
    "ui" => UiValidator.Run(rest),
    "model" => ModelCommand.Run(rest),
    "book" => BookCommand.Run(rest),
    _ => Unknown(args[0]),
};

int Help()
{
    Console.WriteLine(usage);
    return 0;
}

int Version()
{
    Console.WriteLine(LiteSpecHome.Version ?? "unknown");
    return 0;
}

int Unknown(string command)
{
    Console.Error.WriteLine($"Unknown command '{command}'.");
    Console.Error.WriteLine(usage);
    return 2;
}
