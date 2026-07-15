using __PROJECT__.Application;
using __PROJECT__.Infrastructure;
using __PROJECT__.Infrastructure.DependencyInjection;
using __PROJECT__.Infrastructure.Persistence;
using __PROJECT__.ServiceDefaults;
using __PROJECT__.WebApi.Authentication;
using __PROJECT__.WebApi.Endpoints;
using __PROJECT__.WebApi.Errors;
using LiteBus.Commands;
using LiteBus.Events;
using LiteBus.Extensions.Microsoft.DependencyInjection;
using LiteBus.Queries;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddOptions<AuthenticationOptions>()
    .BindConfiguration(AuthenticationOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();
builder.Services.AddSingleton<IConfigureOptions<JwtBearerOptions>, ConfigureJwtBearerOptions>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();
builder.Services.AddAuthorization();

builder.Services.AddLiteBus(liteBus =>
{
    liteBus.AddCommandModule(module =>
    {
        module.RegisterFromAssembly(typeof(ApplicationAssemblyMarker).Assembly);
        module.RegisterFromAssembly(typeof(InfrastructureAssemblyMarker).Assembly);
    });
    liteBus.AddQueryModule(module =>
    {
        module.RegisterFromAssembly(typeof(ApplicationAssemblyMarker).Assembly);
    });
    liteBus.AddEventModule(module =>
    {
        module.RegisterFromAssembly(typeof(ApplicationAssemblyMarker).Assembly);
    });
});

builder.Services.AddEndpoints(typeof(Program).Assembly);
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

var app = builder.Build();

await app.Services.ApplyDevelopmentSchemaAsync(app.Environment);

app.UseExceptionHandler();
app.UseAuthentication();
app.UseAuthorization();

app.MapDefaultEndpoints();
app.MapOpenApi();
if (app.Environment.IsDevelopment())
{
    app.MapScalarApiReference();
}

app.MapEndpoints();
app.Run();

public partial class Program;

