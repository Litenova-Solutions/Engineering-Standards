using System.Collections.Concurrent;
using System.Globalization;
using System.Runtime.CompilerServices;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace LiteSpec.Schemas;

/// <summary>
///     The local JSON Schema evaluator, and the keyword gate that makes it safe.
///     Three validators read this module, so a second copy of the evaluator would
///     drift from the first invisibly. The gate below is what makes a local
///     evaluator safe: a keyword with no implementation fails the schema instead
///     of passing unread.
/// </summary>
static class JsonSchema
{
    /// <summary>The schema keywords that assert nothing (SCHEMA_ANNOTATIONS).</summary>
    public static readonly IReadOnlySet<string> Annotations = new HashSet<string>(StringComparer.Ordinal)
    {
        "$schema", "$id", "$defs", "$comment", "title", "description", "default", "examples", "deprecated", "format",
    };

    /// <summary>
    ///     Every keyword the evaluator implements. A keyword listed here without an
    ///     implementation would read as an annotation and assert nothing, so every
    ///     assertive name in this set has a branch in <see cref="Validate"/>, and every
    ///     name outside it fails the schema rather than passing unread (SCHEMA_KEYWORDS).
    /// </summary>
    public static readonly IReadOnlySet<string> Keywords = new HashSet<string>(Annotations.Concat([
        "$ref", "type", "const", "enum", "pattern", "minLength", "maxLength",
        "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf",
        "minItems", "maxItems", "uniqueItems", "items", "prefixItems", "contains",
        "minProperties", "maxProperties", "required", "dependentRequired",
        "properties", "patternProperties", "propertyNames", "additionalProperties",
        "allOf", "anyOf", "oneOf", "if", "then", "else", "not",
    ]), StringComparer.Ordinal);

    // Every position a subschema can occupy, so the gate reaches each one. A keyword
    // the gate never descends into hides its whole subtree from the check.
    static readonly string[] ChildLists = ["allOf", "anyOf", "oneOf", "prefixItems"];
    static readonly string[] ChildMaps = ["properties", "patternProperties", "$defs"];
    static readonly string[] ChildValues = ["items", "contains", "propertyNames", "additionalProperties", "if", "then", "else", "not"];

    // Compact JSON with relaxed escaping, so structural comparison and diagnostic text stay stable.
    static readonly JsonSerializerOptions CompactJson = new() { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping };

    // A schema repeats its patterns and references on every value it meets: a
    // record schema with hundreds of nested records resolves the same reference
    // thousands of times per page. Each distinct expression compiles once, each
    // reference resolves once per schema root, and the keyword gate walks each
    // schema once. The tables hold no diagnostic text, only the parsed shapes,
    // so every finding reads exactly as before.
    static readonly ConcurrentDictionary<string, Regex> PatternCache = new(StringComparer.Ordinal);

    static readonly ConditionalWeakTable<JsonNode, ConcurrentDictionary<string, JsonNode?>> RefCache = new();

    static readonly ConditionalWeakTable<JsonNode, string[]> GateCache = new();

    static readonly JsonObject NoProperties = new();

    static Regex CachedPattern(string pattern) =>
        PatternCache.GetOrAdd(pattern, expression => new Regex(expression, RegexOptions.Compiled));

    /// <summary>
    ///     Reports each keyword the evaluator does not implement, descending into every
    ///     subschema position. <paramref name="add"/> takes the relative path, line, code
    ///     and message.
    /// </summary>
    public static void UnsupportedKeywords(JsonNode? schema, string relative, string pointer, Action<string, int, string, string> add)
    {
        if (schema is not JsonObject obj)
        {
            return;
        }

        foreach (var pair in obj)
        {
            if (!Keywords.Contains(pair.Key))
            {
                add(relative, 1, "SCHEMA_UNSUPPORTED_KEYWORD", $"unsupported JSON Schema keyword '{pair.Key}' at '{pointer}'");
            }
        }

        foreach (var key in ChildLists)
        {
            if (!obj.TryGetPropertyValue(key, out var children) || children is not JsonArray list)
            {
                continue;
            }

            for (var index = 0; index < list.Count; index++)
            {
                UnsupportedKeywords(list[index], relative, $"{pointer}/{key}/{index}", add);
            }
        }

        foreach (var key in ChildMaps)
        {
            if (!obj.TryGetPropertyValue(key, out var map))
            {
                continue;
            }

            if (map is JsonObject fields)
            {
                foreach (var (name, child) in fields)
                {
                    UnsupportedKeywords(child, relative, $"{pointer}/{key}/{name}", add);
                }
            }
            else if (map is JsonArray entries)
            {
                // A malformed schema can hold an array where a map belongs; the gate
                // then reads it by index, so every entry is still checked.
                for (var index = 0; index < entries.Count; index++)
                {
                    UnsupportedKeywords(entries[index], relative, $"{pointer}/{key}/{index}", add);
                }
            }
        }

        foreach (var key in ChildValues)
        {
            if (!obj.TryGetPropertyValue(key, out var child))
            {
                continue;
            }

            if (child is JsonObject or JsonArray)
            {
                UnsupportedKeywords(child, relative, $"{pointer}/{key}", add);
            }
        }
    }

    /// <summary>
    ///     Resolves a local <c>#/...</c> reference against the schema root, unescaping
    ///     <c>~1</c> to <c>/</c> and <c>~0</c> to <c>~</c> in each pointer segment.
    /// </summary>
    /// <exception cref="InvalidOperationException">The reference does not start with <c>#/</c>.</exception>
    public static JsonNode? ResolveRef(JsonNode root, string reference)
    {
        if (!reference.StartsWith("#/", StringComparison.Ordinal))
        {
            throw new InvalidOperationException($"unsupported schema reference '{reference}'");
        }

        JsonNode? current = root;

        foreach (var segment in reference.Substring(2).Split('/'))
        {
            var key = segment.Replace("~1", "/", StringComparison.Ordinal).Replace("~0", "~", StringComparison.Ordinal);

            if (current is JsonObject currentObject)
            {
                current = currentObject.TryGetPropertyValue(key, out var child) ? child : null;
            }
            else if (current is JsonArray currentArray && TryArrayIndex(key, currentArray, out var element))
            {
                current = element;
            }
            else
            {
                current = null;
            }
        }

        return current;
    }

    /// <summary>
    ///     Resolves a local reference once per schema root and reuses the target: the
    ///     same root resolves the same reference for every value it validates.
    /// </summary>
    static JsonNode? CachedRef(JsonNode root, string reference)
    {
        var resolved = RefCache.GetValue(root, _ => new ConcurrentDictionary<string, JsonNode?>(StringComparer.Ordinal));

        if (resolved.TryGetValue(reference, out var target))
        {
            return target;
        }

        target = ResolveRef(root, reference);

        if (target is not null)
        {
            resolved.TryAdd(reference, target);
        }

        return target;
    }

    /// <summary>
    ///     The keyword gate's messages for a schema, walked once per schema root.
    ///     The caller prefixes each one with its own location.
    /// </summary>
    static string[] GateMessages(JsonNode schema, string schemaFile) =>
        GateCache.GetValue(schema, _ =>
        {
            var found = new List<string>();
            UnsupportedKeywords(schema, schemaFile, "#", (_, _, _, message) => found.Add(message));
            return found.ToArray();
        });

    /// <summary>
    ///     Validates <paramref name="value"/> against <paramref name="schema"/>, appending
    ///     one <c>{location}: ...</c> message per violation to <paramref name="errors"/>.
    ///     A missing property is distinct from an explicit JSON null.
    /// </summary>
    public static void Validate(JsonNode? value, JsonNode? schema, JsonNode root, string location, List<string> errors)
    {
        if (schema is not JsonObject obj)
        {
            return;
        }

        if (obj.TryGetPropertyValue("$ref", out var refNode) && IsTruthy(refNode))
        {
            var reference = refNode is JsonValue refValue && refValue.TryGetValue<string>(out var refText) ? refText : null;

            if (reference is null)
            {
                throw new InvalidOperationException($"unsupported schema reference '{Stringify(refNode)}'");
            }

            var target = CachedRef(root, reference);

            if (!IsTruthy(target))
            {
                errors.Add($"{location}: unresolved schema reference '{reference}'");
            }
            else
            {
                Validate(value, target, root, location, errors);
            }
        }

        if (obj.TryGetPropertyValue("allOf", out var allOf) && allOf is JsonArray branches)
        {
            foreach (var branch in branches)
            {
                Validate(value, branch, root, location, errors);
            }
        }

        // Exactly one branch accepts the value. The count alone tells an author that
        // the value fits no shape without telling them why any shape refused it, so
        // the message carries the first reason from each branch that rejected.
        if (obj.TryGetPropertyValue("oneOf", out var oneOfNode) && oneOfNode is JsonArray oneOf)
        {
            var dispatch = DispatchIndex(value, oneOf, root);

            if (dispatch >= 0)
            {
                var fastErrors = new List<string>();
                Validate(value, oneOf[dispatch], root, location, fastErrors);

                if (fastErrors.Count == 0)
                {
                    // Every other branch pins a different type const, so each one
                    // rejects a value whose type matches this branch. The value
                    // matches exactly one shape and reports nothing.
                }
                else
                {
                    // The matching shape failed, so the value matches none. The
                    // loop below reproduces the exact message, reusing the
                    // dispatched branch's errors instead of validating it twice.
                    var rejections = new List<string>();
                    var matched = 0;

                    for (var index = 0; index < oneOf.Count; index++)
                    {
                        List<string> branchErrors;

                        if (index == dispatch)
                        {
                            branchErrors = fastErrors;
                        }
                        else
                        {
                            branchErrors = new List<string>();
                            Validate(value, oneOf[index], root, location, branchErrors);
                        }

                        if (branchErrors.Count == 0)
                        {
                            matched++;
                        }
                        else
                        {
                            rejections.Add($"shape {index + 1}: {StripLocationPrefix(branchErrors[0], location)}");
                        }
                    }

                    if (matched != 1)
                    {
                        var because = matched == 0 && rejections.Count > 0 ? $" ({string.Join("; ", rejections)})" : "";
                        errors.Add($"{location}: value matches {matched} of {oneOf.Count} allowed shapes, expected exactly 1{because}");
                    }
                }
            }
            else
            {
                var rejections = new List<string>();
                var matched = 0;

                for (var index = 0; index < oneOf.Count; index++)
                {
                    var branchErrors = new List<string>();
                    Validate(value, oneOf[index], root, location, branchErrors);

                    if (branchErrors.Count == 0)
                    {
                        matched++;
                    }
                    else
                    {
                        rejections.Add($"shape {index + 1}: {StripLocationPrefix(branchErrors[0], location)}");
                    }
                }

                if (matched != 1)
                {
                    var because = matched == 0 && rejections.Count > 0 ? $" ({string.Join("; ", rejections)})" : "";
                    errors.Add($"{location}: value matches {matched} of {oneOf.Count} allowed shapes, expected exactly 1{because}");
                }
            }
        }

        if (obj.TryGetPropertyValue("anyOf", out var anyOfNode) && anyOfNode is JsonArray anyOf)
        {
            var rejections = new List<string>();
            var accepted = false;

            for (var index = 0; index < anyOf.Count && !accepted; index++)
            {
                var branchErrors = new List<string>();
                Validate(value, anyOf[index], root, location, branchErrors);

                if (branchErrors.Count == 0)
                {
                    accepted = true;
                }
                else
                {
                    rejections.Add($"shape {index + 1}: {StripLocationPrefix(branchErrors[0], location)}");
                }
            }

            if (!accepted)
            {
                errors.Add($"{location}: value matches none of the {anyOf.Count} allowed shapes ({string.Join("; ", rejections)})");
            }
        }

        if (obj.TryGetPropertyValue("if", out var condition) && IsTruthy(condition))
        {
            var conditionErrors = new List<string>();
            Validate(value, condition, root, location, conditionErrors);
            obj.TryGetPropertyValue("then", out var thenBranch);
            obj.TryGetPropertyValue("else", out var elseBranch);
            Validate(value, conditionErrors.Count == 0 ? thenBranch : elseBranch, root, location, errors);
        }

        if (obj.TryGetPropertyValue("not", out var forbidden) && IsTruthy(forbidden))
        {
            var notErrors = new List<string>();
            Validate(value, forbidden, root, location, notErrors);

            if (notErrors.Count == 0)
            {
                errors.Add($"{location}: value matches prohibited schema");
            }
        }

        if (obj.TryGetPropertyValue("type", out var typeNode) && IsTruthy(typeNode)
            && typeNode is JsonValue typeValue && typeValue.TryGetValue<string>(out var typeName) && typeName is not null)
        {
            var matches = typeName switch
            {
                "object" => value is JsonObject,
                "array" => value is JsonArray,
                "integer" => value is JsonValue integer && integer.TryGetValue<double>(out var whole)
                    && double.IsFinite(whole) && whole == Math.Truncate(whole),
                "number" => value is JsonValue numberValue && numberValue.TryGetValue<double>(out var finite) && double.IsFinite(finite),
                "string" => value is JsonValue textual && textual.TryGetValue<string>(out _),
                "boolean" => value is JsonValue flag && flag.TryGetValue<bool>(out _),
                "null" => value is null,
                _ => true,
            };

            if (!matches)
            {
                errors.Add($"{location}: expected {typeName}");
                return;
            }
        }

        if (obj.ContainsKey("const") && !JsonEqual(value, obj["const"]))
        {
            errors.Add($"{location}: expected constant {Stringify(obj["const"])}");
        }

        if (obj.TryGetPropertyValue("enum", out var enumNode) && IsTruthy(enumNode) && enumNode is JsonArray allowed
            && !allowed.Any(item => JsonEqual(item, value)))
        {
            errors.Add($"{location}: value is outside the allowed enum");
        }

        if (value is JsonValue stringValue && stringValue.TryGetValue<string>(out var text) && text is not null)
        {
            if (obj.TryGetPropertyValue("minLength", out var minLength) && TryNumber(minLength, out var min) && text.Length < min)
            {
                errors.Add($"{location}: string is shorter than {JsNumber(min)}");
            }

            if (obj.TryGetPropertyValue("maxLength", out var maxLength) && TryNumber(maxLength, out var max) && text.Length > max)
            {
                errors.Add($"{location}: string is longer than {JsNumber(max)}");
            }

            if (obj.TryGetPropertyValue("pattern", out var patternNode) && patternNode is JsonValue patternValue
                && patternValue.TryGetValue<string>(out var pattern) && !string.IsNullOrEmpty(pattern)
                && !CachedPattern(pattern).IsMatch(text))
            {
                errors.Add($"{location}: string does not match {pattern}");
            }
        }

        if (value is JsonValue numeric && numeric.TryGetValue<double>(out var number))
        {
            if (obj.TryGetPropertyValue("minimum", out var minimum) && TryNumber(minimum, out var floor) && number < floor)
            {
                errors.Add($"{location}: number is below {JsNumber(floor)}");
            }

            if (obj.TryGetPropertyValue("maximum", out var maximum) && TryNumber(maximum, out var ceiling) && number > ceiling)
            {
                errors.Add($"{location}: number is above {JsNumber(ceiling)}");
            }

            if (obj.TryGetPropertyValue("exclusiveMinimum", out var exclusiveFloor) && TryNumber(exclusiveFloor, out var above) && number <= above)
            {
                errors.Add($"{location}: number is not above {JsNumber(above)}");
            }

            if (obj.TryGetPropertyValue("exclusiveMaximum", out var exclusiveCeiling) && TryNumber(exclusiveCeiling, out var below) && number >= below)
            {
                errors.Add($"{location}: number is not below {JsNumber(below)}");
            }

            // Floating-point remainders drift, so the test rounds to the nearest
            // multiple and compares against a tolerance derived from the divisor.
            if (obj.TryGetPropertyValue("multipleOf", out var divisorNode) && TryNumber(divisorNode, out var divisor))
            {
                var quotient = number / divisor;

                if (Math.Abs(quotient - Math.Round(quotient)) > 1e-9)
                {
                    errors.Add($"{location}: number is not a multiple of {JsNumber(divisor)}");
                }
            }
        }

        if (value is JsonArray array)
        {
            if (obj.TryGetPropertyValue("minItems", out var minItems) && TryNumber(minItems, out var fewest) && array.Count < fewest)
            {
                errors.Add($"{location}: array has fewer than {JsNumber(fewest)} items");
            }

            if (obj.TryGetPropertyValue("maxItems", out var maxItems) && TryNumber(maxItems, out var most) && array.Count > most)
            {
                errors.Add($"{location}: array has more than {JsNumber(most)} items");
            }

            if (obj.TryGetPropertyValue("uniqueItems", out var unique) && IsTruthy(unique)
                && array.Select(Stringify).ToHashSet(StringComparer.Ordinal).Count != array.Count)
            {
                errors.Add($"{location}: array items are not unique");
            }

            JsonArray prefix = [];
            obj.TryGetPropertyValue("items", out var items);

            if (obj.TryGetPropertyValue("prefixItems", out var prefixNode) && prefixNode is JsonArray prefixArray)
            {
                prefix = prefixArray;
            }

            for (var index = 0; index < prefix.Count && index < array.Count; index++)
            {
                Validate(array[index], prefix[index], root, $"{location}/{index}", errors);
            }

            for (var index = prefix.Count; index < array.Count; index++)
            {
                Validate(array[index], items, root, $"{location}/{index}", errors);
            }

            if (obj.TryGetPropertyValue("contains", out var contains) && IsTruthy(contains))
            {
                var holds = array.Any(item =>
                {
                    var itemErrors = new List<string>();
                    Validate(item, contains, root, location, itemErrors);
                    return itemErrors.Count == 0;
                });

                if (!holds)
                {
                    errors.Add($"{location}: array contains no item matching the required shape");
                }
            }
        }

        if (value is JsonObject fields)
        {
            if (obj.TryGetPropertyValue("minProperties", out var minProperties) && TryNumber(minProperties, out var fewest) && fields.Count < fewest)
            {
                errors.Add($"{location}: object has fewer than {JsNumber(fewest)} properties");
            }

            if (obj.TryGetPropertyValue("maxProperties", out var maxProperties) && TryNumber(maxProperties, out var most) && fields.Count > most)
            {
                errors.Add($"{location}: object has more than {JsNumber(most)} properties");
            }

            if (obj.TryGetPropertyValue("required", out var required) && required is JsonArray names)
            {
                foreach (var name in names)
                {
                    var property = RequiredName(name);

                    if (!fields.ContainsKey(property))
                    {
                        errors.Add($"{location}: missing required property '{property}'");
                    }
                }
            }

            if (obj.TryGetPropertyValue("dependentRequired", out var dependentRequired) && dependentRequired is JsonObject triggers)
            {
                foreach (var (trigger, dependents) in triggers)
                {
                    if (!fields.ContainsKey(trigger) || dependents is not JsonArray needs)
                    {
                        continue;
                    }

                    foreach (var dependent in needs)
                    {
                        var property = RequiredName(dependent);

                        if (!fields.ContainsKey(property))
                        {
                            errors.Add($"{location}: property '{trigger}' requires '{property}'");
                        }
                    }
                }
            }

            if (obj.TryGetPropertyValue("propertyNames", out var propertyNames) && IsTruthy(propertyNames))
            {
                foreach (var key in fields.Select(pair => pair.Key).ToList())
                {
                    Validate(JsonValue.Create(key), propertyNames, root, $"{location}/{key}", errors);
                }
            }

            var declared = obj.TryGetPropertyValue("properties", out var properties) && properties is JsonObject declaredFields
                ? declaredFields
                : NoProperties;
            var patternFields = obj.TryGetPropertyValue("patternProperties", out var patternProperties) && patternProperties is JsonObject patterns
                ? patterns
                : null;
            obj.TryGetPropertyValue("additionalProperties", out var additional);

            foreach (var (key, child) in fields)
            {
                var evaluated = false;

                if (declared.ContainsKey(key))
                {
                    Validate(child, declared[key], root, $"{location}/{key}", errors);
                    evaluated = true;
                }

                if (patternFields is not null)
                {
                    foreach (var (expression, subschema) in patternFields)
                    {
                        if (!CachedPattern(expression).IsMatch(key))
                        {
                            continue;
                        }

                        Validate(child, subschema, root, $"{location}/{key}", errors);
                        evaluated = true;
                    }
                }

                if (evaluated)
                {
                    continue;
                }

                if (additional is JsonValue flag && flag.TryGetValue<bool>(out var allow) && !allow)
                {
                    errors.Add($"{location}: unknown property '{key}'");
                }
                else if (additional is JsonObject extra)
                {
                    Validate(child, extra, root, $"{location}/{key}", errors);
                }
            }
        }
    }

    /// <summary>
    ///     Reads one JSON value against one schema file and returns the problems it
    ///     found. The caller decides how to report them, because a standards diagnostic
    ///     carries a code and a consumer problem carries a provision identifier.
    /// </summary>
    public static List<string> Problems(string schemaFile, JsonNode? value, string location, Func<string, JsonNode?> readJson)
    {
        var schema = readJson(schemaFile);

        if (!IsTruthy(schema))
        {
            return [$"{location}: schema '{schemaFile}' is unreadable"];
        }

        var problems = new List<string>();

        foreach (var message in GateMessages(schema!, schemaFile))
        {
            problems.Add($"{location}: {message}");
        }

        try
        {
            Validate(value, schema, schema!, location, problems);
        }
        catch (Exception cause)
        {
            problems.Add($"{location}: {cause.Message}");
        }

        return problems;
    }

    static bool IsTruthy(JsonNode? node) => node switch
    {
        null => false,
        JsonObject => true,
        JsonArray => true,
        JsonValue value when value.TryGetValue<string>(out var text) => !string.IsNullOrEmpty(text),
        JsonValue value when value.TryGetValue<bool>(out var flag) => flag,
        JsonValue value when value.TryGetValue<double>(out var number) => number != 0 && !double.IsNaN(number),
        _ => true,
    };

    static bool TryNumber(JsonNode? node, out double value)
    {
        if (node is JsonValue candidate && candidate.TryGetValue<double>(out var number))
        {
            value = number;
            return true;
        }

        value = 0;
        return false;
    }

    static bool TryArrayIndex(string key, JsonArray array, out JsonNode? element)
    {
        element = null;

        if (key.Length == 0 || (key.Length > 1 && key[0] == '0'))
        {
            return false;
        }

        foreach (var ch in key)
        {
            if (ch < '0' || ch > '9')
            {
                return false;
            }
        }

        if (!int.TryParse(key, NumberStyles.None, CultureInfo.InvariantCulture, out var index) || index >= array.Count)
        {
            return false;
        }

        element = array[index];
        return true;
    }

    static string Stringify(JsonNode? node) => node is null ? "null" : node.ToJsonString(CompactJson);

    static bool JsonEqual(JsonNode? left, JsonNode? right) => JsonNode.DeepEquals(left, right);

    static string RequiredName(JsonNode? node) =>
        node is JsonValue candidate && candidate.TryGetValue<string>(out var name) && name is not null ? name : Stringify(node);

    /// <summary>
    ///     The one branch of a <c>oneOf</c> whose pinned type const equals the value's
    ///     type, or -1 when the shape does not dispatch. A dispatch needs an object
    ///     value with a string type, every branch pinning a type const through its
    ///     properties, and exactly one branch pinning this value's type. Anything
    ///     else falls back to validating every branch, so every message reads as before.
    /// </summary>
    static int DispatchIndex(JsonNode? value, JsonArray oneOf, JsonNode root)
    {
        if (value is not JsonObject fields)
        {
            return -1;
        }

        if (!fields.TryGetPropertyValue("type", out var typeNode))
        {
            return -1;
        }

        if (typeNode is not JsonValue typeValue)
        {
            return -1;
        }

        if (!typeValue.TryGetValue<string>(out var typeName) || typeName is null)
        {
            return -1;
        }

        var match = -1;

        for (var index = 0; index < oneOf.Count; index++)
        {
            var pinned = BranchTypeConst(oneOf[index], root);

            if (pinned is null)
            {
                return -1;
            }

            if (pinned == typeName)
            {
                if (match >= 0)
                {
                    return -1;
                }

                match = index;
            }
        }

        return match;
    }

    /// <summary>
    ///     The type const a <c>oneOf</c> branch pins, following local references to
    ///     the shape that carries <c>properties.type.const</c>, or null when the
    ///     branch pins none. A branch that cannot be read this way disables the
    ///     dispatch for its whole <c>oneOf</c>.
    /// </summary>
    static string? BranchTypeConst(JsonNode? branch, JsonNode root)
    {
        var current = branch;

        for (var depth = 0; depth < 10; depth++)
        {
            if (current is not JsonObject currentObject)
            {
                return null;
            }

            if (currentObject.TryGetPropertyValue("$ref", out var refNode)
                && refNode is JsonValue refValue
                && refValue.TryGetValue<string>(out var reference)
                && !string.IsNullOrEmpty(reference))
            {
                JsonNode? target;

                try
                {
                    target = CachedRef(root, reference);
                }
                catch
                {
                    return null;
                }

                if (target is null)
                {
                    return null;
                }

                current = target;
                continue;
            }

            break;
        }

        if (current is not JsonObject effective)
        {
            return null;
        }

        if (!effective.TryGetPropertyValue("properties", out var propertiesNode))
        {
            return null;
        }

        if (propertiesNode is not JsonObject properties)
        {
            return null;
        }

        if (!properties.TryGetPropertyValue("type", out var typeSchema))
        {
            return null;
        }

        if (typeSchema is not JsonObject typeObject)
        {
            return null;
        }

        if (!typeObject.TryGetPropertyValue("const", out var constNode))
        {
            return null;
        }

        return constNode is JsonValue constValue && constValue.TryGetValue<string>(out var pinned) ? pinned : null;
    }

    static string StripLocationPrefix(string message, string location)
    {
        // Removes the first occurrence of the location prefix.
        var prefix = $"{location}: ";
        var index = message.IndexOf(prefix, StringComparison.Ordinal);
        return index >= 0 ? message.Remove(index, prefix.Length) : message;
    }

    static string JsNumber(double value)
    {
        if (double.IsPositiveInfinity(value))
        {
            return "Infinity";
        }

        if (double.IsNegativeInfinity(value))
        {
            return "-Infinity";
        }

        if (double.IsNaN(value))
        {
            return "NaN";
        }

        if (value == 0)
        {
            return "0";
        }

        if (double.IsFinite(value) && value == Math.Truncate(value) && Math.Abs(value) < 1e21)
        {
            return value.ToString("F0", CultureInfo.InvariantCulture);
        }

        var text = value.ToString("G", CultureInfo.InvariantCulture);
        var exponentAt = text.IndexOf('E');

        if (exponentAt < 0)
        {
            return text;
        }

        var exponent = int.Parse(text[(exponentAt + 1)..], CultureInfo.InvariantCulture);
        return text[..exponentAt] + "e" + (exponent < 0 ? "-" : "+") + Math.Abs(exponent).ToString(CultureInfo.InvariantCulture);
    }
}
