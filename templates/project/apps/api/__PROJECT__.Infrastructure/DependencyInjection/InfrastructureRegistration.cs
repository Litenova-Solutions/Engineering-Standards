using __PROJECT__.Domain.Posts;
using __PROJECT__.Infrastructure.Persistence;
using Marten;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace __PROJECT__.Infrastructure.DependencyInjection;

public static class InfrastructureRegistration
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("database")
            ?? throw new InvalidOperationException("ConnectionStrings:database is required.");

        services.AddMarten(options =>
            {
                options.Connection(connectionString);
                options.DatabaseSchemaName = "__PROJECT_SNAKE__";
                options.Schema.For<Post>().Identity(post => post.Id);
            })
            .UseLightweightSessions();

        services.AddSingleton(TimeProvider.System);
        services.AddScoped<DomainEventBuffer>();
        services.AddScoped<IPostRepository, PostRepository>();
        services.AddHealthChecks()
            .AddCheck("postgresql", new PostgreSqlHealthCheck(connectionString), tags: ["ready"]);

        return services;
    }
}

