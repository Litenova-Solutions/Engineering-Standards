# Blueprint: Worker Program.cs

Copy into `apps/api/src/{ProjectName}.Worker/`. See `docs/conventions/backend/14-worker-projects.md`.

---

## `{ProjectName}.Worker.csproj`

```xml
<Project Sdk="Microsoft.NET.Sdk.Worker">
  <ItemGroup>
    <ProjectReference Include="..\{ProjectName}.Infrastructure\{ProjectName}.Infrastructure.csproj" />
    <ProjectReference Include="..\{ProjectName}.Application.Write\{ProjectName}.Application.Write.csproj" />
    <ProjectReference Include="..\{ProjectName}.Application.Reactions\{ProjectName}.Application.Reactions.csproj" />
    <ProjectReference Include="..\{ProjectName}.ServiceDefaults\{ProjectName}.ServiceDefaults.csproj" />
    <PackageReference Include="OpenTelemetry.Extensions.Hosting" />
    <PackageReference Include="OpenTelemetry.Instrumentation.Runtime" />
    <PackageReference Include="OpenTelemetry.Exporter.OpenTelemetryProtocol" />
  </ItemGroup>
</Project>
```

---

## `Program.cs`

```csharp
using {ProjectName}.Infrastructure.DependencyInjection;

var builder = Host.CreateApplicationBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHostedService<OutboxDispatcherHostedService>();

var host = builder.Build();
host.Run();
```

Worker projects MUST NOT reference `WebApi`.
