// The local JSON Schema evaluator, and the keyword gate that makes it safe.
//
// Three validators read this module. `validate-standards.mjs` applies it to the
// repository's own schemas and manifest, `validate-ui.mjs` applies it to a
// consumer's design contracts, page sidecars, and composition recipes, and the
// case suites apply it to their fixtures. A second copy of the evaluator would
// drift from the first, and the drift would be invisible: each validator would
// keep reporting a pass against its own idea of JSON Schema.
//
// The repository ships no schema library on purpose. The gate below is what
// makes a local evaluator safe: a keyword with no implementation fails the
// schema instead of passing unread, and a library that accepts every keyword
// removes that protection.

// The keyword set and the evaluator below are one unit. A keyword listed here
// without an implementation would be read as an annotation and assert nothing,
// so every assertive name in this set has a branch in `validateSchemaValue`, and
// every name outside it fails the schema rather than passing unread. That is why
// the repository ships no schema library: the gate is what makes a local
// evaluator safe, and a library that accepts every keyword removes it.
export const SCHEMA_ANNOTATIONS = new Set(['$schema', '$id', '$defs', '$comment', 'title', 'description', 'default', 'examples', 'deprecated']);
export const SCHEMA_KEYWORDS = new Set([
  ...SCHEMA_ANNOTATIONS,
  '$ref', 'type', 'const', 'enum', 'pattern', 'minLength', 'maxLength',
  'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf',
  'minItems', 'maxItems', 'uniqueItems', 'items', 'prefixItems', 'contains',
  'minProperties', 'maxProperties', 'required', 'dependentRequired',
  'properties', 'patternProperties', 'propertyNames', 'additionalProperties',
  'allOf', 'anyOf', 'oneOf', 'if', 'then', 'else', 'not',
]);

// Every position a subschema can occupy, so the gate reaches each one. A keyword
// the gate never descends into hides its whole subtree from the check.
export const SCHEMA_CHILD_LISTS = ['allOf', 'anyOf', 'oneOf', 'prefixItems'];
export const SCHEMA_CHILD_MAPS = ['properties', 'patternProperties', '$defs'];
export const SCHEMA_CHILD_VALUES = ['items', 'contains', 'propertyNames', 'additionalProperties', 'if', 'then', 'else', 'not'];

export function unsupportedSchemaKeywords(schema, relative, pointer, add) {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) return;
  for (const key of Object.keys(schema)) {
    if (!SCHEMA_KEYWORDS.has(key)) add(relative, 1, 'SCHEMA_UNSUPPORTED_KEYWORD', `unsupported JSON Schema keyword '${key}' at '${pointer}'`);
  }
  for (const key of SCHEMA_CHILD_LISTS) {
    const children = schema[key];
    if (!Array.isArray(children)) continue;
    for (let index = 0; index < children.length; index += 1) unsupportedSchemaKeywords(children[index], relative, `${pointer}/${key}/${index}`, add);
  }
  for (const key of SCHEMA_CHILD_MAPS) {
    for (const [name, child] of Object.entries(schema[key] ?? {})) unsupportedSchemaKeywords(child, relative, `${pointer}/${key}/${name}`, add);
  }
  for (const key of SCHEMA_CHILD_VALUES) {
    if (schema[key] && typeof schema[key] === 'object') unsupportedSchemaKeywords(schema[key], relative, `${pointer}/${key}`, add);
  }
}

export function resolveSchemaRef(root, reference) {
  if (!reference.startsWith('#/')) throw new Error(`unsupported schema reference '${reference}'`);
  return reference.slice(2).split('/').reduce((value, segment) => value?.[segment.replace(/~1/g, '/').replace(/~0/g, '~')], root);
}

function jsonEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function validateSchemaValue(value, schema, root, location, errors) {
  if (!schema || typeof schema !== 'object') return;
  if (schema.$ref) {
    const target = resolveSchemaRef(root, schema.$ref);
    if (!target) errors.push(`${location}: unresolved schema reference '${schema.$ref}'`);
    else validateSchemaValue(value, target, root, location, errors);
  }
  for (const branch of schema.allOf ?? []) validateSchemaValue(value, branch, root, location, errors);
  // Exactly one branch accepts the value. The count alone tells an author that
  // the value fits no shape without telling them why any shape refused it, so
  // the message carries the first reason from each branch that rejected.
  if (schema.oneOf) {
    const rejections = [];
    let matched = 0;
    for (let index = 0; index < schema.oneOf.length; index += 1) {
      const branchErrors = [];
      validateSchemaValue(value, schema.oneOf[index], root, location, branchErrors);
      if (branchErrors.length === 0) matched += 1;
      else rejections.push(`shape ${index + 1}: ${branchErrors[0].replace(`${location}: `, '')}`);
    }
    if (matched !== 1) {
      const because = matched === 0 && rejections.length ? ` (${rejections.join('; ')})` : '';
      errors.push(`${location}: value matches ${matched} of ${schema.oneOf.length} allowed shapes, expected exactly 1${because}`);
    }
  }
  if (schema.anyOf) {
    const rejections = [];
    const accepted = schema.anyOf.some((branch, index) => {
      const branchErrors = [];
      validateSchemaValue(value, branch, root, location, branchErrors);
      if (branchErrors.length === 0) return true;
      rejections.push(`shape ${index + 1}: ${branchErrors[0].replace(`${location}: `, '')}`);
      return false;
    });
    if (!accepted) errors.push(`${location}: value matches none of the ${schema.anyOf.length} allowed shapes (${rejections.join('; ')})`);
  }
  if (schema.if) {
    const conditionErrors = [];
    validateSchemaValue(value, schema.if, root, location, conditionErrors);
    validateSchemaValue(value, conditionErrors.length === 0 ? schema.then : schema.else, root, location, errors);
  }
  if (schema.not) {
    const notErrors = [];
    validateSchemaValue(value, schema.not, root, location, notErrors);
    if (notErrors.length === 0) errors.push(`${location}: value matches prohibited schema`);
  }
  if (schema.type) {
    const matches = schema.type === 'object' ? value !== null && typeof value === 'object' && !Array.isArray(value)
      : schema.type === 'array' ? Array.isArray(value)
        : schema.type === 'integer' ? Number.isInteger(value)
          : schema.type === 'number' ? typeof value === 'number' && Number.isFinite(value)
            : schema.type === 'string' ? typeof value === 'string'
              : schema.type === 'boolean' ? typeof value === 'boolean'
                : schema.type === 'null' ? value === null
                  : true;
    if (!matches) {
      errors.push(`${location}: expected ${schema.type}`);
      return;
    }
  }
  if (schema.const !== undefined && !jsonEqual(value, schema.const)) errors.push(`${location}: expected constant ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.some((item) => jsonEqual(item, value))) errors.push(`${location}: value is outside the allowed enum`);
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${location}: string is shorter than ${schema.minLength}`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(`${location}: string is longer than ${schema.maxLength}`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${location}: string does not match ${schema.pattern}`);
  }
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${location}: number is below ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${location}: number is above ${schema.maximum}`);
    if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) errors.push(`${location}: number is not above ${schema.exclusiveMinimum}`);
    if (schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) errors.push(`${location}: number is not below ${schema.exclusiveMaximum}`);
    // Floating-point remainders drift, so the test rounds to the nearest
    // multiple and compares against a tolerance derived from the divisor.
    if (schema.multipleOf !== undefined) {
      const quotient = value / schema.multipleOf;
      if (Math.abs(quotient - Math.round(quotient)) > 1e-9) errors.push(`${location}: number is not a multiple of ${schema.multipleOf}`);
    }
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${location}: array has fewer than ${schema.minItems} items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${location}: array has more than ${schema.maxItems} items`);
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) errors.push(`${location}: array items are not unique`);
    const prefix = Array.isArray(schema.prefixItems) ? schema.prefixItems : [];
    for (let index = 0; index < prefix.length && index < value.length; index += 1) validateSchemaValue(value[index], prefix[index], root, `${location}/${index}`, errors);
    for (let index = prefix.length; index < value.length; index += 1) validateSchemaValue(value[index], schema.items, root, `${location}/${index}`, errors);
    if (schema.contains) {
      const holds = value.some((item) => {
        const itemErrors = [];
        validateSchemaValue(item, schema.contains, root, location, itemErrors);
        return itemErrors.length === 0;
      });
      if (!holds) errors.push(`${location}: array contains no item matching the required shape`);
    }
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const keys = Object.keys(value);
    if (schema.minProperties !== undefined && keys.length < schema.minProperties) errors.push(`${location}: object has fewer than ${schema.minProperties} properties`);
    if (schema.maxProperties !== undefined && keys.length > schema.maxProperties) errors.push(`${location}: object has more than ${schema.maxProperties} properties`);
    for (const required of schema.required ?? []) if (!(required in value)) errors.push(`${location}: missing required property '${required}'`);
    for (const [trigger, dependents] of Object.entries(schema.dependentRequired ?? {})) {
      if (!(trigger in value)) continue;
      for (const dependent of dependents) if (!(dependent in value)) errors.push(`${location}: property '${trigger}' requires '${dependent}'`);
    }
    if (schema.propertyNames) for (const key of keys) validateSchemaValue(key, schema.propertyNames, root, `${location}/${key}`, errors);
    const declared = schema.properties ?? {};
    const patterns = Object.entries(schema.patternProperties ?? {});
    for (const [key, child] of Object.entries(value)) {
      let evaluated = false;
      if (key in declared) {
        validateSchemaValue(child, declared[key], root, `${location}/${key}`, errors);
        evaluated = true;
      }
      for (const [expression, subschema] of patterns) {
        if (!new RegExp(expression).test(key)) continue;
        validateSchemaValue(child, subschema, root, `${location}/${key}`, errors);
        evaluated = true;
      }
      if (evaluated) continue;
      if (schema.additionalProperties === false) errors.push(`${location}: unknown property '${key}'`);
      else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') validateSchemaValue(child, schema.additionalProperties, root, `${location}/${key}`, errors);
    }
  }
}

// Reads one JSON value against one schema file and returns the problems it
// found. The caller decides how to report them, because a standards diagnostic
// carries a code and a consumer problem carries a provision identifier.
export function schemaProblems(schemaFile, value, location, readJson) {
  const schema = readJson(schemaFile);
  if (!schema) return [`${location}: schema '${schemaFile}' is unreadable`];
  const problems = [];
  unsupportedSchemaKeywords(schema, schemaFile, '#', (_relative, _line, _code, message) => problems.push(`${location}: ${message}`));
  try {
    validateSchemaValue(value, schema, schema, location, problems);
  } catch (cause) {
    problems.push(`${location}: ${cause.message}`);
  }
  return problems;
}
