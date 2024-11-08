'use client';

import Editor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import Ajv from 'ajv';
import { useTestCasesStore } from '@/stores/useTestCasesStore';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';

const ajv = new Ajv({ allErrors: true, useDefaults: true, strict: false });

interface JsonInputProps {
  handleSave: () => Promise<void>;
  isMutating: boolean;
  isDisabled: boolean;
}

/**
 * Infers the type of a value to build a schema structure.
 * Handles simple types, arrays, and nested objects, and ensures uniform array types.
 */
const inferType = (value: any): any => {
  // Handle empty arrays
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { type: 'array', items: {} };
    }

    // Check if all items in the array have the same type
    const itemTypes = value.map((item) => JSON.stringify(inferType(item)));
    const uniqueItemTypes = Array.from(new Set(itemTypes));
    if (uniqueItemTypes.length > 1) {
      throw new Error(
        `Inconsistent types detected in array: ${uniqueItemTypes.join(
          ', ',
        )}. Ensure all elements in the array are of the same type.`,
      );
    }

    return {
      type: 'array',
      items: inferType(value[0]),
    };
  }

  if (value !== null && typeof value === 'object') {
    // Construct schema properties for nested objects
    return {
      type: 'object',
      properties: Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, inferType(val)]),
      ),
      required: Object.keys(value), // Mark all properties as required
    };
  }

  // Return primitive types
  if (typeof value === 'string') return { type: 'string' };
  if (typeof value === 'number') return { type: 'number' };
  if (typeof value === 'boolean') return { type: 'boolean' };

  return { type: 'null' };
};

/**
 * Validates the overall structure of the input JSON.
 * Ensures the presence of a "testCases" array and correct properties in each test case.
 */
const validateTestCasesStructure = (json: any) => {
  if (!Array.isArray(json.testCases)) {
    throw new Error('JSON must contain a "testCases" array.');
  }
  if (json.testCases.length === 0) {
    throw new Error('The "testCases" array must not be empty.');
  }

  // Use the first test case's keys as a baseline for validation
  const inputKeysSet = new Set(
    Object.keys(json.testCases[0]).filter((key) => key !== 'output'),
  );

  if (inputKeysSet.size === 0) {
    throw new Error('Each test case must have at least one input property.');
  }

  json.testCases.forEach((testCase: any, index: number) => {
    const inputKeys = new Set(
      Object.keys(testCase).filter((key) => key !== 'output'),
    );

    if (inputKeys.size === 0) {
      throw new Error(
        `Test case ${index + 1} must have at least one input property.`,
      );
    }

    // Check if unexpected properties exist in the test case
    const extraKeys = Object.keys(testCase).filter(
      (key) => !inputKeysSet.has(key) && key !== 'output',
    );

    if (extraKeys.length > 0) {
      throw new Error(
        `Test case ${index + 1} contains unexpected properties: ${extraKeys.join(', ')}.`,
      );
    }

    if (!testCase.hasOwnProperty('output')) {
      throw new Error(
        `Test case ${index + 1} must contain the output property.`,
      );
    }
  });
};

/**
 * Infers a schema from provided test cases and checks consistency across all test cases.
 */
const inferSchemaFromTestCases = (testCases: any[]) => {
  const firstTestCase = testCases[0];
  const inferredSchema: any = {
    type: 'object',
    properties: {},
    required: ['output'],
  };

  // Infer types for all properties in the first test case
  Object.entries(firstTestCase).forEach(([key, value]) => {
    inferredSchema.properties[key] = inferType(value);
    if (key !== 'output') {
      inferredSchema.required.push(key);
    }
  });

  // Validate consistency across all test cases
  for (let i = 1; i < testCases.length; i++) {
    const currentTestCase = testCases[i];

    // Ensure required keys are present in each test case
    Object.keys(inferredSchema.properties).forEach((key) => {
      if (!currentTestCase.hasOwnProperty(key) && key !== 'output') {
        throw new Error(`Missing property "${key}" in test case ${i + 1}.`);
      }
    });

    // Check for type consistency across properties
    Object.entries(currentTestCase).forEach(([key, value]) => {
      const expectedType = inferType(value);
      if (
        JSON.stringify(inferredSchema.properties[key]) !==
        JSON.stringify(expectedType)
      ) {
        throw new Error(
          `Inconsistent types for property "${key}" detected at test case ${i + 1}.`,
        );
      }
    });
  }

  return inferredSchema;
};

const JsonInput = ({ handleSave, isMutating, isDisabled }: JsonInputProps) => {
  const { testCases } = useTestCasesStore();
  const [content, setContent] = useState<string>('');
  const [isInitalized, setIsInitalized] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const setTestCases = useTestCasesStore.use.setTestCases();
  const setSchema = useTestCasesStore.use.setSchema();

  useEffect(() => {
    if (testCases.length > 0 && !isInitalized) {
      setContent(JSON.stringify({ testCases }, null, 2));
    }
    setIsInitalized(true);
  }, [testCases]);

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined || value.trim() === '') {
      setContent('');
      setTestCases([]);
      setSchema({ type: 'object', properties: {}, required: [] });
      setValidationError(null);
      return;
    }

    setContent(value);

    try {
      const parsedJson = JSON.parse(value);
      validateTestCasesStructure(parsedJson);

      const schema = inferSchemaFromTestCases(parsedJson.testCases);

      setTestCases(parsedJson.testCases);
      setSchema(schema);
      setValidationError(null);
    } catch (error: any) {
      setValidationError(`Error: ${error.message}`);
      setSchema({ type: 'object', properties: {}, required: [] });
    }
  };

  return (
    <div>
      <Editor
        height="300px"
        defaultLanguage="json"
        loading={
          <div className="flex items-start justify-start w-full h-full">
            <Skeleton className="w-full h-64 mb-4" />
          </div>
        }
        value={content}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />
      <div className="flex flex-row items-center justify-between mx-4">
        {validationError ? (
          <p className="flex text-red-600">{validationError}</p>
        ) : (
          <p />
        )}
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleSave}
            disabled={isDisabled || isMutating || validationError !== null}
          >
            {isMutating ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JsonInput;