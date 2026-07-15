using __PROJECT__.Application;
using __PROJECT__.Domain.Posts;
using __PROJECT__.Infrastructure;
using NetArchTest.Rules;

namespace __PROJECT__.Architecture.Tests;

public sealed class ArchitectureTests
{
    [Fact]
    public void Domain_does_not_depend_on_outer_frameworks()
    {
        var result = Types.InAssembly(typeof(Post).Assembly)
            .ShouldNot()
            .HaveDependencyOnAny("Marten", "Microsoft.AspNetCore", "LiteBus")
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Application_handlers_are_internal_and_sealed()
    {
        var handlers = typeof(ApplicationAssemblyMarker).Assembly.GetTypes()
            .Where(type => type.Name.EndsWith("Handler", StringComparison.Ordinal));

        handlers.Should().NotBeEmpty();
        handlers.Should().OnlyContain(type => !type.IsPublic && type.IsSealed);
    }

    [Fact]
    public void Infrastructure_does_not_reference_WebApi()
    {
        var references = typeof(InfrastructureAssemblyMarker).Assembly
            .GetReferencedAssemblies()
            .Select(assembly => assembly.Name);

        references.Should().NotContain("__PROJECT__.WebApi");
    }
}

