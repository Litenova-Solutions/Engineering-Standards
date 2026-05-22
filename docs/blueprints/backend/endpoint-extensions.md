# Blueprint: EndpointExtensions

Copy to `apps/api/src/{ProjectName}.WebApi/Extensions/EndpointExtensions.cs`.

```csharp
internal static class EndpointExtensions
{
    internal static IServiceCollection AddEndpoints(
        this IServiceCollection services,
        Assembly assembly)
    {
        var endpointTypes = assembly
            .GetTypes()
            .Where(t => t is { IsAbstract: false, IsInterface: false }
                && t.IsAssignableTo(typeof(IEndpoint)));

        foreach (var type in endpointTypes)
        {
            services.AddTransient(typeof(IEndpoint), type);
        }

        return services;
    }

    internal static IApplicationBuilder MapEndpoints(this WebApplication app)
    {
        var endpoints = app.Services.GetRequiredService<IEnumerable<IEndpoint>>();

        foreach (var endpoint in endpoints)
        {
            endpoint.MapEndpoint(app);
        }

        return app;
    }
}
```

```csharp
interface IEndpoint
{
    void MapEndpoint(IEndpointRouteBuilder app);
}
```

Place `IEndpoint` in the same file or in `WebApi/Endpoints/IEndpoint.cs`.
