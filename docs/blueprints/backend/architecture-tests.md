# Blueprint: Architecture Tests

Copy to `apps/api/tests/{ProjectName}.Architecture.Tests/ApplicationLayerTests.cs`. Replace `{ProjectName}` and example handler types.

```csharp
public sealed class ApplicationLayerTests
{
    [Fact]
    public void QueryHandlers_ShouldNotDependOn_InfrastructureProject()
    {
        var result = Types
            .InAssembly(typeof(GetPostByIdQueryHandler).Assembly)
            .ShouldNot()
            .HaveDependencyOn("{ProjectName}.Infrastructure")
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void CommandAndQueryHandlers_ShouldBeInternalSealed()
    {
        var result = Types
            .InAssemblies([
                typeof(CreatePostCommandHandler).Assembly,
                typeof(GetPostByIdQueryHandler).Assembly
            ])
            .That()
            .ImplementInterface(typeof(ICommandHandler<>))
            .Or()
            .ImplementInterface(typeof(ICommandHandler<,>))
            .Or()
            .ImplementInterface(typeof(IQueryHandler<,>))
            .Should()
            .BeSealed()
            .And()
            .NotBePublic()
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void ReactionsProject_ShouldNotDependOn_ExternalLibraries()
    {
        var result = Types
            .InAssembly(typeof(NotifySubscribersOnPostPublishedEventHandler).Assembly)
            .ShouldNot()
            .HaveDependencyOn("Microsoft.EntityFrameworkCore")
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void WebApi_ShouldNotContain_Controllers()
    {
        var result = Types
            .InAssembly(typeof(Program).Assembly)
            .ShouldNot()
            .Inherit(typeof(ControllerBase))
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void ContractsProjects_ShouldNotContain_Handlers()
    {
        var writeContracts = Types.InAssembly(typeof(CreatePostCommand).Assembly);
        var readContracts = Types.InAssembly(typeof(GetPostByIdQuery).Assembly);

        writeContracts.That().ImplementInterface(typeof(ICommandHandler<>)).GetTypes().Should().BeEmpty();
        readContracts.That().ImplementInterface(typeof(IQueryHandler<,>)).GetTypes().Should().BeEmpty();
    }
}
```

See `docs/decisions/architecture-tests-as-enforcement.md` for rationale.
