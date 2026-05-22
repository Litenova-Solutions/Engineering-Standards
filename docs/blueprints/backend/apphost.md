# Blueprint: AppHost

Copy into `apps/api/src/{ProjectName}.AppHost/`. See `docs/conventions/backend/13-deployment-and-migrations.md` for package references.

---

## `{ProjectName}.AppHost.csproj`

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <NoWarn>$(NoWarn);ASPIREJAVASCRIPT001</NoWarn>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Aspire.Hosting.AppHost" />
    <PackageReference Include="Aspire.Hosting.PostgreSQL" />
    <PackageReference Include="Aspire.Hosting.JavaScript" />
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="..\{ProjectName}.WebApi\{ProjectName}.WebApi.csproj" />
    <ProjectReference Include="..\{ProjectName}.Worker\{ProjectName}.Worker.csproj" />
  </ItemGroup>
</Project>
```

---

## `Program.cs`

```csharp
var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres");
var database = postgres.AddDatabase("database");

var api = builder.AddProject<Projects.{ProjectName}_WebApi>("api")
    .WithReference(database)
    .WaitFor(database);

#pragma warning disable ASPIREJAVASCRIPT001

var web = builder.AddNextJsApp("web", "../../../apps/web")
    .WithPnpm()
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints()
    .DisableBuildValidation();

#pragma warning restore ASPIREJAVASCRIPT001

var worker = builder.AddProject<Projects.{ProjectName}_Worker>("worker")
    .WithReference(database)
    .WaitFor(database);

api.WithEnvironment("Cors__AllowedOrigins__0", web.GetEndpoint("http"));

web.WithReference(api)
   .WithEnvironment("API_URL", api.GetEndpoint("http"));

builder.Build().Run();
```

---

## Local startup

```bash
pnpm install --frozen-lockfile
dotnet ef database update \
  --project apps/api/src/{ProjectName}.Infrastructure \
  --startup-project apps/api/src/{ProjectName}.WebApi
dotnet run --project apps/api/src/{ProjectName}.AppHost
```
