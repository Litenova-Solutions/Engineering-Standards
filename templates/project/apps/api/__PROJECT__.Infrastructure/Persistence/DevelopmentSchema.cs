using Marten;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace __PROJECT__.Infrastructure.Persistence;

public static class DevelopmentSchema
{
    public static async Task ApplyDevelopmentSchemaAsync(
        this IServiceProvider services,
        IHostEnvironment environment)
    {
        if (!environment.IsDevelopment())
        {
            return;
        }

        using var scope = services.CreateScope();
        var store = scope.ServiceProvider.GetRequiredService<IDocumentStore>();
        await store.Storage.ApplyAllConfiguredChangesToDatabaseAsync();
    }
}
