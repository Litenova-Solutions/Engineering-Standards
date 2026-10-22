using Microsoft.CodeAnalysis;

namespace LiteSpec.Analyzers.Rules;

/// <summary>
///     Every diagnostic the package reports. LS1xxx check Domain, LS2xxx the outer layers,
///     LS3xxx code style in the five production projects, LS4xxx test projects. Each one
///     names the provision it enforces, and its help link opens that provision.
/// </summary>
internal static class Descriptors
{
    private const string DomainCategory = "LiteSpec.Domain";
    private const string LayersCategory = "LiteSpec.Layers";
    private const string StyleCategory = "LiteSpec.Style";
    private const string TestsCategory = "LiteSpec.Tests";

    private static readonly Provision DomainOuterLayers = Provision.Of("backend/dotnet/domain", "keep-domain-free-of-outer-layer-concerns");
    private static readonly Provision ClosedSets = Provision.Of("backend/dotnet/domain", "model-every-closed-set-of-domain-values-without-enums");
    private static readonly Provision StateRecords = Provision.Of("backend/dotnet/domain", "model-every-aggregate-lifecycle-with-state-records");
    private static readonly Provision DomainExceptions = Provision.Of("backend/dotnet/domain", "reject-business-violations-with-domain-exceptions");
    private static readonly Provision DomainEvents = Provision.Of("backend/dotnet/domain", "raise-immutable-domain-facts");
    private static readonly Provision ExactQuantities = Provision.Of("backend/domain", "keep-binary-floating-point-out-of-exact-quantities");
    private static readonly Provision Nondeterminism = Provision.Of("backend/domain", "pass-nondeterministic-values-into-domain");
    private static readonly Provision Repositories = Provision.Of("backend/dotnet/domain", "keep-repository-interfaces-in-domain");
    private static readonly Provision DomainDocumentation = Provision.Of("backend/dotnet/domain", "document-every-public-domain-contract");
    private static readonly Provision TypedIdentifiers = Provision.Of("backend/dotnet/domain", "use-strongly-typed-version-7-identifiers");
    private static readonly Provision InternalImplementations = Provision.Of("backend/dotnet/architecture", "keep-implementation-types-internal");
    private static readonly Provision OneCommandPipeline = Provision.Of("backend/dotnet/application", "keep-one-state-changing-use-case-in-one-command-pipeline");
    private static readonly Provision NoControllers = Provision.Of("backend/dotnet/api", "exclude-mvc-controllers-from-the-stack");
    private static readonly Provision RepositoryWrites = Provision.Of("backend/dotnet/persistence", "stage-aggregate-writes-through-repositories");
    private static readonly Provision AsyncNames = Provision.Of("backend/dotnet/naming", "name-asynchronous-methods-completely");
    private static readonly Provision FileNames = Provision.Of("backend/dotnet/naming", "match-c-files-and-primary-types");
    private static readonly Provision ImplementationStyle = Provision.Of("backend/dotnet/naming", "keep-implementation-style-consistent");
    private static readonly Provision ModuleFolders = Provision.Of("backend/domain", "organize-a-module-by-aggregate-and-concept");
    private static readonly Provision RoleSuffixes = Provision.Of("workspace/naming", "use-architectural-suffixes");
    private static readonly Provision ScenarioProof = Provision.Of("backend/dotnet/testing", "prove-each-case-with-a-test-that-calls-its-use-case");

    public static readonly DiagnosticDescriptor LS1001 = Create("LS1001", DomainCategory, DomainOuterLayers,
        "Domain references an outer-layer concern",
        "Domain uses '{0}' from '{1}', an outer-layer concern",
        "Domain references only the .NET base class library and project-owned Domain types: no persistence, web, messaging, mediator, logging, configuration, dependency injection or serialization.");

    public static readonly DiagnosticDescriptor LS1002 = Create("LS1002", DomainCategory, ClosedSets,
        "Domain declares an enum",
        "Enum '{0}' models a closed set; use an abstract record with sealed cases and a stable Code",
        "A closed set of domain values is an abstract record base with one sealed record per case, exposing a stable Code and converting labels through FromCode.");

    public static readonly DiagnosticDescriptor LS1003 = Create("LS1003", DomainCategory, StateRecords,
        "Aggregate has no State record",
        "Aggregate '{0}' exposes no State property typed as an abstract record",
        "An aggregate exposes its lifecycle only through one State property backed by an abstract {Aggregate}State record.",
        compilationEnd: true);

    public static readonly DiagnosticDescriptor LS1004 = Create("LS1004", DomainCategory, StateRecords,
        "State case is not sealed",
        "State case '{0}' derives from '{1}' but is not sealed",
        "Each per-state record is sealed, so the set of states is closed and switch expressions are exhaustive.",
        compilationEnd: true);

    public static readonly DiagnosticDescriptor LS1005 = Create("LS1005", DomainCategory, DomainExceptions,
        "Domain throws a non-Domain exception",
        "Domain throws '{0}'; reject a business violation with a DomainException subclass",
        "A rejected business rule throws a DomainException subclass named {DomainType}{Reason}Exception with a stable code. Argument guards may throw ArgumentException and its subclasses.");

    public static readonly DiagnosticDescriptor LS1006 = Create("LS1006", DomainCategory, DomainExceptions,
        "Domain exception is misnamed or open",
        "Domain exception '{0}' must be sealed and end in 'Exception'",
        "A DomainException subclass is sealed and named {DomainType}{Reason}Exception.");

    public static readonly DiagnosticDescriptor LS1007 = Create("LS1007", DomainCategory, DomainEvents,
        "Domain event is not an immutable record",
        "Domain event '{0}' must be a record named '{{Aggregate}}{{PastFact}}Event' with no settable members",
        "A domain event is a public immutable record named {Aggregate}{PastFact}Event implementing IDomainEvent and carrying business data only.");

    public static readonly DiagnosticDescriptor LS1008 = Create("LS1008", DomainCategory, ExactQuantities,
        "Domain uses binary floating point",
        "'{0}' is typed '{1}'; use decimal or a value object for exact quantities",
        "A Domain type keeps double and float out of monetary amounts, rates applied to them, and quantities compared for exact equality.");

    public static readonly DiagnosticDescriptor LS1009 = Create("LS1009", DomainCategory, Nondeterminism,
        "Domain reads a nondeterministic value",
        "Domain reads '{0}'; pass time, randomness and new identifiers in as arguments",
        "Domain behavior receives time, randomness and new identifiers as arguments and reads no clock.");

    public static readonly DiagnosticDescriptor LS1010 = Create("LS1010", DomainCategory, Repositories,
        "Repository exposes a query surface",
        "Repository '{0}' exposes '{1}'; return aggregates and Domain types only",
        "A repository interface exposes only aggregate and Domain types for one aggregate root, without IQueryable, a session, or a generic CRUD surface.");

    public static readonly DiagnosticDescriptor LS1011 = Create("LS1011", DomainCategory, DomainDocumentation,
        "Public Domain contract is undocumented",
        "Public Domain member '{0}' has no XML documentation",
        "Every public Domain type and member carries XML documentation stating the business constraint, result, or failure it represents.");

    public static readonly DiagnosticDescriptor LS1012 = Create("LS1012", DomainCategory, TypedIdentifiers,
        "Identifier is not a strongly typed value",
        "Identifier '{0}' must be a readonly record struct wrapping one Guid with no implicit conversion",
        "An aggregate identity is a readonly record struct wrapping one version 7 Guid, with no implicit conversion, primitive alias, or public parameterless creation path.");

    public static readonly DiagnosticDescriptor LS1013 = Create("LS1013", DomainCategory, ModuleFolders,
        "Domain event sits outside the Events folder",
        "Domain event '{0}' lives in '{1}', outside the Events folder the model reads",
        "A domain event is declared in a file under its aggregate's Events folder, where the model builder discovers it.");

    public static readonly DiagnosticDescriptor LS2001 = Create("LS2001", LayersCategory, InternalImplementations,
        "Implementation type is not internal sealed",
        "'{0}' is an implementation type and must be declared internal sealed",
        "A handler, validator, definition, persistence implementation, or endpoint implementation is declared internal sealed.");

    public static readonly DiagnosticDescriptor LS2002 = Create("LS2002", LayersCategory, OneCommandPipeline,
        "Command handler dispatches another command",
        "Command handler '{0}' dispatches through ICommandMediator; one state-changing use case runs in one command pipeline",
        "A command handler never dispatches another command through ICommandMediator.");

    public static readonly DiagnosticDescriptor LS2003 = Create("LS2003", LayersCategory, NoControllers,
        "WebApi uses an MVC controller",
        "'{0}' derives from '{1}'; map one IEndpoint per operation instead",
        "A WebApi project never routes requests through MVC controllers or ControllerBase.");

    public static readonly DiagnosticDescriptor LS2004 = Create("LS2004", LayersCategory, RepositoryWrites,
        "Command handler writes through a document session",
        "Command handler '{0}' uses '{1}'; stage aggregate writes through a Domain repository",
        "A command handler reaches persistence only through a Domain repository, never through IDocumentSession.");

    public static readonly DiagnosticDescriptor LS2005 = Create("LS2005", LayersCategory, RoleSuffixes,
        "Handler name lacks its command or query suffix",
        "'{0}' implements '{1}' and must end in '{2}'",
        "A command handler is named {UseCase}CommandHandler and a query handler {UseCase}QueryHandler, so the model builder discovers each handler from its file name.");

    public static readonly DiagnosticDescriptor LS2006 = Create("LS2006", LayersCategory, RoleSuffixes,
        "Endpoint name lacks its suffix",
        "'{0}' implements 'IEndpoint' and must end in 'Endpoint'",
        "An endpoint is named {UseCase}Endpoint, so the model builder discovers each endpoint from its file name.");

    public static readonly DiagnosticDescriptor LS2007 = Create("LS2007", LayersCategory, RoleSuffixes,
        "Reaction or job name hides its kind",
        "'{0}' is a {1} and must be named '{2}'",
        "A reaction is named {Action}On{PastFact}Handler or *Reaction, and a job *Job, *Worker, or *Recurring*, so the model builder discovers each reaction and job by name.");

    public static readonly DiagnosticDescriptor LS3001 = Create("LS3001", StyleCategory, AsyncNames,
        "Asynchronous method name lacks Async",
        "Method '{0}' returns '{1}' and must end in 'Async'",
        "A method returning Task or ValueTask ends in Async.");

    public static readonly DiagnosticDescriptor LS3002 = Create("LS3002", StyleCategory, AsyncNames,
        "CancellationToken is not the last parameter",
        "Method '{0}' must take 'CancellationToken cancellationToken' as its last parameter",
        "A cancelable asynchronous method takes CancellationToken cancellationToken last.");

    public static readonly DiagnosticDescriptor LS3003 = Create("LS3003", StyleCategory, FileNames,
        "File does not match its primary type",
        "File '{0}' must hold one primary top-level type named '{0}'",
        "A C# file contains one primary top-level type and takes that type's exact name.");

    public static readonly DiagnosticDescriptor LS3004 = Create("LS3004", StyleCategory, ImplementationStyle,
        "Concrete class is not sealed",
        "Class '{0}' has no derived type and must be sealed",
        "Production C# seals every concrete class that nothing derives from.",
        compilationEnd: true);

    public static readonly DiagnosticDescriptor LS4001 = Create("LS4001", TestsCategory, ScenarioProof,
        "Test contains no assertion",
        "Test '{0}' contains no assertion",
        "A test calls the behavior it proves and asserts the result, so a passing test proves something.");

    private static DiagnosticDescriptor Create(
        string id, string category, Provision provision, string title, string message, string description, bool compilationEnd = false) =>
        new(
            id,
            title,
            message,
            category,
            DiagnosticSeverity.Error,
            isEnabledByDefault: true,
            description: $"{description} Provision: {provision.Id}",
            helpLinkUri: provision.HelpLink,
            customTags: compilationEnd ? [provision.Id, WellKnownDiagnosticTags.CompilationEnd] : [provision.Id]);
}
