'use client';

import { useEffect, useState } from 'react';
import { useTestCasesStore } from '@/stores/useTestCasesStore';
import {
  fetchTestCasesByQuestionId,
  createTestCases,
  updateTestCases,
  deleteTestCases,
} from '@/lib/api/testCases';
import { useToast } from '@/hooks/use-toast';
import JsonInput from './JsonInput';
import TestCasesSkeleton from './TestCasesSkeleton';

interface TestCasesSectionProps {
  questionId: string;
}

const TestCasesSection = ({ questionId }: TestCasesSectionProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const {
    testCases,
    schema,
    setTestCases,
    setSchema,
    testCasesId,
    setTestCasesId,
  } = useTestCasesStore();
  const { toast } = useToast();

  useEffect(() => {
    const loadTestCases = async () => {
      try {
        const existingTestCases = await fetchTestCasesByQuestionId(questionId);
        if (existingTestCases) {
          setTestCases(existingTestCases.cases);
          setSchema(existingTestCases.schema);
          setTestCasesId(existingTestCases.id);
        } else {
          setTestCases([]);
          setSchema({ type: 'object', properties: {}, required: [] });
          setTestCasesId(null);
        }
      } catch (error) {
        console.error('Failed to fetch test cases:', error);
        toast({
          variant: 'error',
          title: 'Error',
          description: 'Failed to fetch test cases.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTestCases();
  }, [questionId, setTestCases, setSchema, setTestCasesId, toast]);

  const handleSave = async () => {
    setIsMutating(true);
    const payload = {
      question_id: questionId,
      cases: testCases,
      schema,
    };

    try {
      if (testCases.length === 0) {
        // If there are no test cases, delete the existing ones if an ID exists
        if (testCasesId) {
          await deleteTestCases(testCasesId);
          toast({
            variant: 'success',
            title: 'Success',
            description: 'Test cases deleted successfully.',
          });
          setTestCasesId(null);
          setTestCases([]);
        }
      } else if (testCasesId) {
        // Update existing test cases
        await updateTestCases({ ...payload, id: testCasesId });
        toast({
          variant: 'success',
          title: 'Success',
          description: 'Test cases updated successfully.',
        });
      } else {
        // Create new test cases
        const newTestCases = await createTestCases(payload);
        toast({
          variant: 'success',
          title: 'Success',
          description: 'Test cases created successfully.',
        });
        setTestCasesId(newTestCases.id);
      }
    } catch (error) {
      console.error('Error saving test cases:', error);
      toast({
        variant: 'error',
        title: 'Error',
        description: `Failed to save test cases.`,
      });
    } finally {
      setIsMutating(false);
    }
  };

  if (isLoading) {
    return <TestCasesSkeleton />;
  }

  const isSaveDisabled = testCases.length === 0 && !testCasesId;

  const exampleJson = JSON.stringify(
    {
      testCases: [
        {
          input: {
            /* Your input parameters here */
          },
          output: {
            /* Expected output here */
          },
        },
      ],
    },
    null,
    2,
  );

  return (
    <div className="p-6 my-6 bg-white rounded-lg shadow-md">
      <h3 className="mb-4 text-2xl font-bold text-gray-800">Test Cases</h3>
      <p className="text-gray-600">
        You can edit the test cases for this question. Ensure the structure is
        in a JSON format with a "testCases" key containing an array of test
        cases.
      </p>
      <p className="mb-6 text-gray-600">
        Each key in a test case is treated as an input parameter, other than a
        compulsory "output" key.
      </p>
      <pre className="w-1/4 p-4 mb-6 overflow-x-auto text-sm text-gray-600 bg-gray-100 rounded-md">
        {exampleJson}
      </pre>
      <JsonInput
        handleSave={handleSave}
        isMutating={isMutating}
        isDisabled={isSaveDisabled}
      />
    </div>
  );
};

export default TestCasesSection;
