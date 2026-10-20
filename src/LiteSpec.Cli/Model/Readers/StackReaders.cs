using LiteSpec.Model.Readers.Dotnet;
using LiteSpec.Model.Readers.JUnit;
using LiteSpec.Model.Readers.TypeScript;

namespace LiteSpec.Model.Readers;

/// <summary>Reads the backend source for the configured backend roots.</summary>
interface IBackendReader
{
    /// <summary>Reads handlers, reactions and jobs, events, failure-code literals, comments and endpoint operations.</summary>
    CodeModel Read(ConsumerConfig config);
}

/// <summary>Reads the routes of one frontend.</summary>
interface IFrontendReader
{
    /// <summary>Reads the frontend's route screens and file comments.</summary>
    ScreenRead Read(ConsumerConfig config, CodeModel code);
}

/// <summary>Reads the acceptance scenarios and what they claim.</summary>
interface IScenarioReader
{
    /// <summary>Reads scenarios with their claimed cases, steps and asserted codes, and file comments.</summary>
    TestRead Read(ConsumerConfig config);
}

/// <summary>Reads test outcomes by test name and by scenario method name.</summary>
interface ITestRunReader
{
    /// <summary>Reads the run, or null when no result file exists.</summary>
    TestRun? Read(ConsumerConfig config);
}

/// <summary>The readers one consumer build reads through.</summary>
/// <param name="Backend">The backend reader.</param>
/// <param name="Frontends">One reader per readable frontend.</param>
/// <param name="Scenarios">The scenario reader.</param>
/// <param name="TestRuns">The test-run reader, across every supported result format.</param>
sealed record StackSet(
    IBackendReader Backend,
    IReadOnlyList<IFrontendReader> Frontends,
    IScenarioReader Scenarios,
    ITestRunReader TestRuns);

/// <summary>
///     Picks the readers for a consumer: the .NET backend and scenario readers when the
///     project names the dotnet or blazor stack, one frontend reader per declared
///     frontend from its platform, and a test-run reader across every supported result format.
/// </summary>
static class StackReaders
{
    /// <summary>Picks the readers for the consumer.</summary>
    public static StackSet For(ConsumerConfig config)
    {
        var dotnet = config.Stacks.Contains("dotnet", StringComparer.Ordinal)
            || config.Stacks.Contains("blazor", StringComparer.Ordinal);

        IBackendReader backend = dotnet ? new DotnetBackendReader() : new EmptyBackendReader();
        IScenarioReader scenarios = dotnet ? new DotnetScenarioReader() : new EmptyScenarioReader();

        var frontends = new List<IFrontendReader>();

        foreach (var frontend in config.Frontends)
        {
            if (frontend.Platform is "svelte" or "react")
            {
                frontends.Add(new TypeScriptFrontendReader(frontend));
            }
        }

        ITestRunReader runs = new CombinedTestRunReader(new TrxTestRunReader(), new JUnitRunReader());

        return new StackSet(backend, frontends, scenarios, runs);
    }

    /// <summary>Reads no backend: the project names no stack with .NET sources.</summary>
    sealed class EmptyBackendReader : IBackendReader
    {
        public CodeModel Read(ConsumerConfig config) => new();
    }

    /// <summary>Reads no scenarios: the project names no stack with .NET tests.</summary>
    sealed class EmptyScenarioReader : IScenarioReader
    {
        public TestRead Read(ConsumerConfig config) =>
            new([], [], new Dictionary<string, IReadOnlySet<string>>(StringComparer.Ordinal));
    }
}
