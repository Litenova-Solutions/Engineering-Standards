using System.ComponentModel.DataAnnotations;

namespace __PROJECT__.WebApi.Authentication;

internal sealed class AuthenticationOptions
{
    public const string SectionName = "Authentication";

    [Required]
    [Url]
    public string Authority { get; init; } = string.Empty;

    [Required]
    public string Audience { get; init; } = string.Empty;

    public bool RequireHttpsMetadata { get; init; } = true;
}

