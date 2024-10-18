import { z } from 'zod';

/**
 * Specify your client-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars. To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const client = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default('Peer Prep'),
  NEXT_PUBLIC_API_BASE_URL: z.string().default('http://localhost:4000'),
  NEXT_PUBLIC_MATCH_SOCKET_URL: z.string().default('http://localhost:8080'),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
 * middlewares) or client-side so we need to destruct manually.
 * Intellisense should work due to inference.
 *
 * @type {Record<keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
  // Client-side env vars
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_MATCH_SOCKET_URL: process.env.NEXT_PUBLIC_MATCH_SOCKET_URL,
};

// Don't touch the part below
// --------------------------
/** @typedef {z.input<typeof client>} MergedInput */
/** @typedef {z.infer<typeof client>} MergedOutput */
/** @typedef {z.SafeParseReturnType<MergedInput, MergedOutput>} MergedSafeParseReturn */

// @ts-expect-error Types are wonky from refinement

const parsed = /** @type {MergedSafeParseReturn} */ (
  client.safeParse(processEnv) // on client we can only validate the ones that are exposed
);

if (parsed.success === false) {
  console.error(
    '❌ Invalid environment variables:',
    parsed.error.flatten().fieldErrors,
  );
  throw new Error('Invalid environment variables');
}
const env = /** @type {MergedOutput} */ (parsed.data);

export { env };
