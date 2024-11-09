import { LANGUAGES } from '@/constants/languages';

export const formatInputsForLanguage = (
  inputs: any,
  schema: any,
  language: LANGUAGES,
): string => {
  const inputType = schema.properties.input;

  // Recursive function
  const formatArray = (arr: any[]) =>
    arr
      .map((item) =>
        formatInputsForLanguage(
          item,
          { properties: { input: inferType(item) } },
          language,
        ),
      )
      .join(', ');

  // Infer types for nested structures
  const inferType = (value: any): any => {
    if (Array.isArray(value)) {
      return { type: 'array', items: inferType(value[0] || {}) };
    }
    if (typeof value === 'string') return { type: 'string' };
    if (typeof value === 'number') return { type: 'number' };
    if (typeof value === 'boolean') return { type: 'boolean' };
    if (value && typeof value === 'object') {
      return {
        type: 'object',
        properties: Object.fromEntries(
          Object.entries(value).map(([k, v]) => [k, inferType(v)]),
        ),
      };
    }
    return { type: 'null' };
  };

  // Arrays
  if (inputType.type === 'array') {
    if (language === LANGUAGES.Java) {
      return `new int[]{${formatArray(inputs)}}`;
    } else if (language === LANGUAGES.Go) {
      return `[]int{${formatArray(inputs)}}`;
    } else if (language === LANGUAGES.Rust) {
      return `vec![${formatArray(inputs)}]`;
    }
  }

  // Primitives
  if (inputType.type === 'number' || inputType.type === 'integer') {
    return inputs.toString();
  } else if (inputType.type === 'string') {
    return `"${inputs}"`;
  } else if (inputType.type === 'boolean') {
    return inputs ? 'true' : 'false';
  }

  // Fallback for other types (e.g., complex objects)
  return JSON.stringify(inputs);
};
