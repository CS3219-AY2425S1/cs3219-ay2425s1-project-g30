import { z } from "zod";

const testCasesItemSchema = z
  .object({
    input: z.any(),
    output: z.any(),
  })
  .catchall(z.any());

export const testCasesSchema = z.object({
  id: z.string().uuid(),
  question_id: z.string().uuid(),
  cases: z
    .array(testCasesItemSchema)
    .min(1, { message: "At least one test case is required" }),
  schema: z.object({
    type: z.literal("object", {
      errorMap: () => ({ message: 'Schema type must be "object"' }),
    }),
    properties: z.record(z.string(), z.any()), // Defines a flexible properties object with any values
    required: z
      .array(z.string())
      .min(1, { message: "Schema must have at least one required field" }),
  }),
  created_at: z.date(),
  updated_at: z.date(),
});

export const createTestCasesSchema = testCasesSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const updateTestCasesSchema = createTestCasesSchema.extend({
  id: z.string().uuid(),
});

export type TestCasesDto = z.infer<typeof testCasesSchema>;
export type CreateTestCasesDto = z.infer<typeof createTestCasesSchema>;
export type UpdateTestCasesDto = z.infer<typeof updateTestCasesSchema>;
