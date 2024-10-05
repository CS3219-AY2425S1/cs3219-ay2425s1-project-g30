import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import projects from "./supabase-config.json";

/**
 * This script is used to verify if the TypeScript types generated from Supabase schemas
 * are up-to-date with the current schemas defined in the Supabase projects.
 *
 * It does the following:
 * 1. Defines the root directory of the monorepo and fixed output directory for generated types.
 * 2. For each Supabase project defined in the `supabase-config.json` file, the script:
 *    - Generates types in a temporary directory using the Supabase CLI.
 *    - Lints both the existing and newly generated type files to ensure they meet coding standards.
 *    - Compares the newly generated types with the existing ones.
 * 3. If differences are found between the existing and newly generated types, the script:
 *    - Outputs a warning indicating which files differ.
 *    - Exits with a non-zero status, signaling the need to update the types.
 * 4. After the process completes, the script cleans up by removing the temporary directory.
 *
 * This script is intended to be used in CI/CD pipelines or local development environments to ensure
 * that types are kept in sync with Supabase schemas. If differences are found, developers are
 * instructed to run the `pnpm gen:all` command to regenerate the types.
 */

const GENERATED_DIR = __dirname;

// Existing directory for generated types
const EXISTING_DIR = path.join(GENERATED_DIR, "types");

// Temporary directory for generating new types
const TEMP_DIR = path.join(GENERATED_DIR, "check-types-tmp");

// Function to generate types for a specific Supabase project in a temp directory
const generateTypesInTemp = (
  projectId: string,
  schema: string,
  tempOutputPath: string,
) => {
  console.log(
    `Generating types for project: ${projectId} in temp directory...`,
  );

  // Ensure the temp output directory exists
  const tempOutputDirectory = path.dirname(tempOutputPath);
  if (!fs.existsSync(tempOutputDirectory)) {
    fs.mkdirSync(tempOutputDirectory, { recursive: true });
  }

  const supabaseCommand = `npx supabase gen types typescript --project-id ${projectId} --schema ${schema} > ${tempOutputPath}`;
  execSync(supabaseCommand, { stdio: "inherit" });

  console.log(
    `Supabase types generated in temp at ${path.relative(GENERATED_DIR, tempOutputPath)}`,
  );
};

// Function to compare files
const compareFiles = (
  existingFilePath: string,
  tempFilePath: string,
): boolean => {
  if (!fs.existsSync(existingFilePath)) {
    console.warn(
      `Warning: Existing file not found at ${path.relative(GENERATED_DIR, existingFilePath)}`,
    );
    return false;
  }

  const existingFile = fs.readFileSync(existingFilePath, "utf8");
  const tempFile = fs.readFileSync(tempFilePath, "utf8");

  return existingFile === tempFile;
};

// Function to run eslint on the files
const lintFiles = (filePath: string) => {
  try {
    console.log(`Linting files: ${path.relative(GENERATED_DIR, filePath)}`);
    execSync(`eslint --fix ${filePath}`, { stdio: "inherit" });
    console.log(`Linting completed: ${path.relative(GENERATED_DIR, filePath)}`);
  } catch (error) {
    console.error(
      `Error linting files: ${path.relative(GENERATED_DIR, filePath)}`,
      error,
    );
    throw error; // Ensure we fail if linting fails
  }
};

// Check if generated types differ from existing ones
const checkAllTypes = () => {
  let hasDifferences = false;

  projects.forEach(
    (project: { projectId: string; schema: string; fileName: string }) => {
      // Ensure the output path is absolute and within the fixed output directory
      const existingOutputPath = path.resolve(EXISTING_DIR, project.fileName);
      const tempOutputPath = path.resolve(TEMP_DIR, project.fileName);

      // Generate types in the temporary directory
      generateTypesInTemp(project.projectId, project.schema, tempOutputPath);

      // Run lint on both existing and temporary generated files
      lintFiles(existingOutputPath);
      lintFiles(tempOutputPath);

      // Compare the existing file with the temp file
      if (!compareFiles(existingOutputPath, tempOutputPath)) {
        console.warn(
          `Warning: File ${path.relative(GENERATED_DIR, existingOutputPath)} differs from the generated types.`,
        );
        hasDifferences = true;
      } else {
        console.log(
          `File ${path.relative(GENERATED_DIR, existingOutputPath)} is up-to-date.`,
        );
      }
    },
  );

  return hasDifferences;
};

const main = () => {
  try {
    // Clear the temp directory before generating
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }

    const hasDifferences = checkAllTypes();

    if (hasDifferences) {
      console.error(
        "There are differences between the existing and generated types. Please run `pnpm gen:all` to update.",
      );
      process.exit(1); // Fail the process if differences are found
    } else {
      console.log("All types are up-to-date.");
    }
  } catch (error) {
    console.error("Error during type check:", error);
    process.exit(1); // Fail the process if there's an error
  } finally {
    // Remove the temp directory after the process completes (success or failure)
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
      console.log("Temp directory removed.");
    }
  }
};

main();
