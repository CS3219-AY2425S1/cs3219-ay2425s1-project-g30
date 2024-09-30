import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import projects from "./supabase-config.json";

// Get the root directory of the monorepo (assuming this script is inside the repo)
const PACKAGE_ROOT_DIR = path.resolve(__dirname, "../../"); // Adjust the depth as necessary

// Define a fixed output directory within the monorepo (for example, "generated" folder in the repo root)
const FIXED_OUTPUT_DIR = path.join(PACKAGE_ROOT_DIR, "src/generated");

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
    (project: { projectId: string; schema: string; outputPath: string }) => {
      // Ensure the output path is absolute and within the fixed output directory
      const absoluteOutputPath = path.resolve(
        FIXED_OUTPUT_DIR,
        project.outputPath,
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
