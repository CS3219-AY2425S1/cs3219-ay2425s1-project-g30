import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import projects from "./supabase-config.json";

/**
 * This script is responsible for generating TypeScript types from Supabase schemas
 * for multiple Supabase projects defined in the `supabase-config.json` file. It automates
 * the process of generating types and saving them into a fixed output directory within a monorepo.
 *
 * Key functionalities of the script:
 *
 * 1. **Root Directory Setup**:
 *    - The script identifies the root directory of the monorepo and sets a fixed output directory
 *      (`src/generated`) where the generated TypeScript types will be stored.
 *
 * 2. **Type Generation**:
 *    - The `generateTypes` function is responsible for generating TypeScript types for a specific Supabase project.
 *    - It ensures the output directory exists, then runs the Supabase CLI command (`npx supabase gen types typescript`)
 *      to generate types for the given `projectId` and `schema`. The types are written to the specified output file.
 *
 * 3. **Handling Multiple Projects**:
 *    - The `generateAllTypes` function loops over all projects defined in the `supabase-config.json` file.
 *    - For each project, it calculates the absolute output path within the fixed directory (`src/generated`)
 *      and invokes `generateTypes` to generate the types.
 *
 * 4. **Error Handling**:
 *    - The `main` function calls `generateAllTypes` and includes basic error handling to catch and log any
 *      issues that occur during type generation.
 *
 * The script is designed to be run manually or as part of an automated process to ensure the latest TypeScript types
 * are generated for Supabase projects and saved in the correct directory structure within the monorepo.
 */

// Define a fixed output directory
const FIXED_OUTPUT_DIR = path.join(__dirname, "types");

// Function to generate types for a specific Supabase project
const generateTypes = (
  projectId: string,
  schema: string,
  outputPath: string,
) => {
  console.log(`Generating types for project: ${projectId}...`);

  // Ensure the output directory exists
  const outputDirectory = path.dirname(outputPath);
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  const supabaseCommand = `npx supabase gen types typescript --project-id ${projectId} --schema ${schema} > ${outputPath}`;
  execSync(supabaseCommand, { stdio: "inherit" }); // Run the Supabase CLI command

  console.log(`Supabase types generated at ${outputPath}`);
};

// Generate types for all projects
const generateAllTypes = () => {
  projects.forEach(
    (project: { projectId: string; schema: string; fileName: string }) => {
      // Ensure the output path is absolute and within the fixed output directory
      const absoluteOutputPath = path.resolve(
        FIXED_OUTPUT_DIR,
        project.fileName,
      );
      generateTypes(project.projectId, project.schema, absoluteOutputPath);
    },
  );
};

const main = () => {
  try {
    generateAllTypes();
  } catch (error) {
    console.error("Error during types or enums generation:", error);
  }
};

main();
