using System.Text;

namespace Litenova.Model;

/// <summary>
///     The casing conversions between code names and record identifiers.
/// </summary>
static class Naming
{
    /// <summary>
    ///     Turns a PascalCase name into the kebab-case form identifiers use.
    /// </summary>
    public static string Kebab(string name)
    {
        var built = new StringBuilder(name.Length + 8);

        for (var index = 0; index < name.Length; index++)
        {
            if (index > 0 && char.IsUpper(name[index]))
            {
                built.Append('-');
            }

            built.Append(char.ToLowerInvariant(name[index]));
        }

        return built.ToString();
    }

    /// <summary>
    ///     Turns a kebab-case name into the PascalCase form code uses.
    /// </summary>
    public static string Pascal(string kebab)
    {
        var built = new StringBuilder(kebab.Length);

        foreach (var part in kebab.Split('-', StringSplitOptions.RemoveEmptyEntries))
        {
            built.Append(char.ToUpperInvariant(part[0]));
            built.Append(part[1..]);
        }

        return built.ToString();
    }
}
