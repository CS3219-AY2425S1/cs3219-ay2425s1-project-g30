import z from "zod";

export const collectionMetadataSchema = z.object({
  count: z.number().int().nonnegative(),
  totalCount: z.number().int().nonnegative(),
});

export type collectionMetadataDto = z.infer<typeof collectionMetadataSchema>;
