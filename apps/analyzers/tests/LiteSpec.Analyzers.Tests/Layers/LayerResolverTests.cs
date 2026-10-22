using LiteSpec.Analyzers.Layers;

namespace LiteSpec.Analyzers.Tests.Layers;

/// <summary>Tests for reading a project's layer.</summary>
public sealed class LayerResolverTests
{
    [Theory(DisplayName = "the assembly name suffix names the layer")]
    [InlineData("Shop.Domain", "Domain")]
    [InlineData("Shop.Application.Abstractions", "ApplicationAbstractions")]
    [InlineData("Shop.Application", "Application")]
    [InlineData("Shop.Infrastructure", "Infrastructure")]
    [InlineData("Shop.WebApi", "WebApi")]
    [InlineData("Domain", "Domain")]
    [InlineData("Shop.DomainTests", "None")]
    [InlineData("Shop.Domain.Tests", "Test")]
    [InlineData("Shop.Integration.Tests", "Test")]
    [InlineData("Shop.Architecture.Test", "Test")]
    [InlineData("Shop.Worker", "None")]
    public void ReadsTheAssemblyName(string assemblyName, string expected) =>
        Assert.Equal(Enum.Parse<Layer>(expected), LayerResolver.FromAssemblyName(assemblyName));

    [Theory(DisplayName = "a declared layer name parses with or without its dot")]
    [InlineData("Domain", "Domain")]
    [InlineData("Application.Abstractions", "ApplicationAbstractions")]
    [InlineData("applicationabstractions", "ApplicationAbstractions")]
    [InlineData("WebApi", "WebApi")]
    [InlineData("Test", "Test")]
    [InlineData("Tests", "Test")]
    [InlineData("None", "None")]
    [InlineData("Worker", "None")]
    public void ParsesADeclaredLayer(string value, string expected) =>
        Assert.Equal(Enum.Parse<Layer>(expected), LayerResolver.Parse(value));
}
