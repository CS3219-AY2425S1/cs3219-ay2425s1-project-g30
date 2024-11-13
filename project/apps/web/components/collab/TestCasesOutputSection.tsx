import { TestCasesDto } from '@repo/dtos/testCases';
import React, { useState } from 'react';

import { Button } from '../ui/button';

export interface TestResult {
  input: Record<string, any>;
  stdout: string;
  expectedOutput: any;
  functionOutput: any;
  passed: boolean;
}

interface TestCasesOutputSectionProps {
  testCases: TestCasesDto;
  testResults: TestResult[] | null;
}

const TestCasesOutputSection = ({
  testCases,
  testResults,
}: TestCasesOutputSectionProps) => {
  const [selectedTestIndex, setSelectedTestIndex] = useState(0);

  const testCasesToDisplay =
    testResults ||
    testCases.cases.map((testCase) => ({
      input: Object.fromEntries(
        testCases.schema.required
          .filter((key) => key !== 'output')
          .map((key) => [key, testCase[key]]),
      ),
      expectedOutput: testCase.output,
      stdout: '',
      functionOutput: '',
      passed: false,
    }));

  const selectedTestResult = testCasesToDisplay[selectedTestIndex];

  const handleSelectTest = (index: number) => {
    setSelectedTestIndex(index);
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-y-scroll">
      <div className="flex gap-2 px-4 mt-4 mb-2">
        {testCasesToDisplay.map((_, index) => (
          <Button
            key={index}
            variant={selectedTestIndex === index ? 'secondary' : 'ghost'}
            onClick={() => handleSelectTest(index)}
          >
            Test {index + 1}
          </Button>
        ))}
      </div>

      {selectedTestResult ? (
        <div className="flex flex-col gap-2 px-6">
          {selectedTestResult && testResults ? (
            <div
              className="mt-2 font-semibold"
              style={{
                color: selectedTestResult.passed ? '#4CAF50' : '#F44336',
              }}
            >
              {selectedTestResult.passed ? 'Passed' : 'Failed'}
            </div>
          ) : null}
          <div className="mt-2">
            <div className="text-sm font-semibold">Input</div>
            <pre className="p-2 mt-2 overflow-auto bg-gray-100 rounded">
              {Object.entries(selectedTestResult.input).map(([key, value]) => (
                <div key={key}>
                  <span className="font-thin text-gray-500">{key}:</span>{' '}
                  {JSON.stringify(value)}
                </div>
              ))}
            </pre>
          </div>
          {selectedTestResult.stdout ? (
            <div>
              <div className="text-sm font-semibold">Stdout</div>
              <pre className="p-2 mt-2 overflow-auto bg-gray-100 rounded">
                {selectedTestResult.stdout}
              </pre>
            </div>
          ) : null}
          {selectedTestResult.functionOutput ? (
            <div>
              <div className="text-sm font-semibold">Output</div>
              <pre
                style={{
                  color: selectedTestResult.passed ? '#4CAF50' : '#F44336',
                }}
                className={`p-2 mt-2 bg-gray-100 rounded overflow-auto`}
              >
                {typeof selectedTestResult.functionOutput === 'string'
                  ? selectedTestResult.functionOutput
                  : JSON.stringify(selectedTestResult.functionOutput)}
              </pre>
            </div>
          ) : null}
          <div className="mb-4">
            <div className="text-sm font-semibold">Expected</div>
            <pre className="p-2 mt-2 overflow-auto bg-gray-100 rounded">
              {typeof selectedTestResult.expectedOutput === 'string'
                ? selectedTestResult.expectedOutput
                : JSON.stringify(selectedTestResult.expectedOutput)}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TestCasesOutputSection;
