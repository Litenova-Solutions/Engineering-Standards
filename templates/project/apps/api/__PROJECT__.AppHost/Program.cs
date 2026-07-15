var builder = DistributedApplication.CreateBuilder(args);

var postgresPassword = builder.AddParameter("postgres-password", secret: true);
var postgres = builder.AddPostgres("postgres", password: postgresPassword)
    .WithDataVolume("__PROJECT_LOWER__-postgres-data")
    .AddDatabase("database", "__PROJECT_SNAKE__");

builder.AddProject<Projects.__PROJECT___WebApi>("api")
    .WithReference(postgres)
    .WaitFor(postgres)
    .WithExternalHttpEndpoints();

builder.Build().Run();

