# Blueprint: Acceptance Test Project

Copy to `apps/api/tests/{ProjectName}.AcceptanceTests/`.

## `{ProjectName}.AcceptanceTests.csproj`

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <IsPackable>false</IsPackable>
    <IsTestProject>true</IsTestProject>
    <ReqnrollUseIntermediateOutputPathForCodeBehind>true</ReqnrollUseIntermediateOutputPathForCodeBehind>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="AwesomeAssertions" />
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" />
    <PackageReference Include="Microsoft.NET.Test.Sdk" />
    <PackageReference Include="Reqnroll" />
    <PackageReference Include="Reqnroll.xUnit" />
    <PackageReference Include="Testcontainers.PostgreSql" />
    <PackageReference Include="xunit" />
    <PackageReference Include="xunit.runner.visualstudio" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\src\{ProjectName}.WebApi\{ProjectName}.WebApi.csproj" />
  </ItemGroup>
</Project>
```

Add `Reqnroll.Microsoft.Extensions.DependencyInjection` only when step definitions need DI-backed construction instead of explicit fixture composition.

## `reqnroll.json`

```json
{
  "$schema": "https://schemas.reqnroll.net/reqnroll-config-latest.json",
  "language": {
    "feature": "en-US"
  },
  "bindingAssemblies": []
}
```

## Layout

```text
Features/{Feature}/{UseCase}.feature
Steps/{Feature}Steps.cs
Steps/ResponseSteps.cs
Support/AcceptanceTestWebAppFactory.cs
Support/ScenarioState.cs
Support/TestUsers.cs
Support/TestApiClient.cs
TestData/PostBuilder.cs
Hooks/AcceptanceTestHooks.cs
GlobalUsings.cs
```

See sibling blueprint files for each support type.

## Related blueprints

- [acceptance-test-web-app-factory.md](acceptance-test-web-app-factory.md)
- [scenario-state.md](scenario-state.md)
- [test-api-client.md](test-api-client.md)
- [publish-post.feature.md](publish-post.feature.md)
- [post-steps.md](post-steps.md)
- [response-steps.md](response-steps.md)
