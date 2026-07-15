using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;

namespace __PROJECT__.WebApi.Authentication;

internal sealed class ConfigureJwtBearerOptions(IOptions<AuthenticationOptions> authentication)
    : IConfigureNamedOptions<JwtBearerOptions>
{
    public void Configure(string? name, JwtBearerOptions options)
    {
        if (name is not null && name != JwtBearerDefaults.AuthenticationScheme)
        {
            return;
        }

        var settings = authentication.Value;
        options.Authority = settings.Authority;
        options.Audience = settings.Audience;
        options.RequireHttpsMetadata = settings.RequireHttpsMetadata;
        options.MapInboundClaims = false;
    }

    public void Configure(JwtBearerOptions options) => Configure(null, options);
}

