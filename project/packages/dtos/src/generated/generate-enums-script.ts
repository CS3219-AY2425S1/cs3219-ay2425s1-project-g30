import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";

/*
 * This script generates TypeScript enums from string literal unions in .types.ts files.
 * The enums are then written to .enums.ts files in a specified directory.
 *
 * This is necessary because Supabase generates string literal unions for enums in the database schema,
 * but string literal unions cannot be directly used with Zod validations or converted to TypeScript enums.
 * This script transforms those string literal unions into TypeScript enums
 * that are easier to use for validation and type safety.
 */

// Helper function to sanitize enum names (e.g., remove whitespaces, punctuation)
function sanitizeEnumName(enumName: string): string {
  return enumName.replace(/\s+/g, "").replace(/[^a-zA-Z0-9_]/g, "");
}

// Helper function to parse string literal unions and convert to enums
function parseUnionTypeToEnum(
  typeNode: ts.TypeNode,
  enumName: string,
): string | null {
  if (!ts.isUnionTypeNode(typeNode)) return null;

  const enumEntries: string[] = [];

  for (const member of typeNode.types) {
    if (ts.isLiteralTypeNode(member) && ts.isStringLiteral(member.literal)) {
      const enumKey = member.literal.text.replace(/[^a-zA-Z0-9]/g, "");
      const enumValue = member.literal.text;
      enumEntries.push(`  ${enumKey} = "${enumValue}"`);
    }
  }

  if (enumEntries.length > 0) {
    return `export enum ${sanitizeEnumName(enumName)} {\n${enumEntries.join(",\n")}\n}`;
  }

  return null;
}

// Main function to loop through Database["public"]["Enums"]
const generateEnumsFromDatabase = (dbFilePath: string): string | null => {
  // Parse the source file
  const program = ts.createProgram([dbFilePath], {});
  const sourceFile = program.getSourceFile(dbFilePath);

  if (!sourceFile) {
    console.error(`File not found: ${dbFilePath}`);
    return null;
  }

  const generatedEnums: string[] = [];

  // Traverse the AST to find types
  const visitNode = (node: ts.Node) => {
    if (
      ts.isTypeAliasDeclaration(node) &&
      node.type &&
      node.name.text === "Database"
    ) {
      const databaseType = node.type as ts.TypeLiteralNode;

      // Look for the `public` key inside the `Database` type
      const publicMember = databaseType.members.find(
        (member) =>
          ts.isPropertySignature(member) &&
          (member.name as ts.Identifier).text === "public",
      ) as ts.PropertySignature;

      if (
        publicMember &&
        publicMember.type &&
        ts.isTypeLiteralNode(publicMember.type)
      ) {
        const publicMembers = publicMember.type.members;

        // Find the Enums key
        const enumsMember = publicMembers.find(
          (member) =>
            ts.isPropertySignature(member) &&
            (member.name as ts.Identifier).text === "Enums",
        ) as ts.PropertySignature;

        if (
          enumsMember &&
          enumsMember.type &&
          ts.isTypeLiteralNode(enumsMember.type)
        ) {
          const enumsMembers = enumsMember.type.members;

          // Generate enums for each entry under Enums
          enumsMembers.forEach((enumMember) => {
            if (ts.isPropertySignature(enumMember) && enumMember.type) {
              const enumName = (enumMember.name as ts.Identifier).text;
              const enumDefinition = parseUnionTypeToEnum(
                enumMember.type,
                enumName,
              );
              if (enumDefinition) {
                generatedEnums.push(enumDefinition);
              }
            }
          });
        }
      }
    }
    ts.forEachChild(node, visitNode);
  };

  ts.forEachChild(sourceFile, visitNode);

  return generatedEnums.length > 0 ? generatedEnums.join("\n\n") : null;
};

// Helper function to find all .types.ts files in a directory
const findTypeFilesInDirectory = (directory: string): string[] => {
  const files = fs.readdirSync(directory);
  return files
    .filter((file) => file.endsWith(".types.ts"))
    .map((file) => path.join(directory, file));
};

// Helper function to clean the /enums directory by removing all .enums.ts files
const cleanEnumsDirectory = (enumsDirectory: string) => {
  if (fs.existsSync(enumsDirectory)) {
    const enumFiles = fs
      .readdirSync(enumsDirectory)
      .filter((file) => file.endsWith(".enums.ts"));
    enumFiles.forEach((file) => {
      const filePath = path.join(enumsDirectory, file);
      fs.unlinkSync(filePath); // Delete the .enums.ts file
      console.log(`Deleted old file: ${filePath}`);
    });
  }
};

// Main function to process all .types.ts files in the types directory and generate corresponding .enums.ts files in the enums directory
const processAllTypeFiles = (
  typesDirectory: string,
  enumsDirectory: string,
) => {
  const typeFiles = findTypeFilesInDirectory(typesDirectory);

  if (typeFiles.length === 0) {
    console.log(`No .types.ts files found in the directory: ${typesDirectory}`);
    return;
  }

  // Ensure the /enums directory exists and clean old .enums.ts files
  if (!fs.existsSync(enumsDirectory)) {
    fs.mkdirSync(enumsDirectory, { recursive: true });
  } else {
    cleanEnumsDirectory(enumsDirectory); // Clean old .enums.ts files
  }

  typeFiles.forEach((filePath) => {
    console.log(`Processing file: ${filePath}`);
    const enums = generateEnumsFromDatabase(filePath);

    if (enums) {
      const fileName = path
        .basename(filePath)
        .replace(".types.ts", ".enums.ts");
      const outputFilePath = path.join(enumsDirectory, fileName);
      fs.writeFileSync(outputFilePath, enums);
      console.log(`Generated enums have been written to: ${outputFilePath}`);
    } else {
      console.log(`No enums were generated from the file: ${filePath}`);
    }
  });
};

// Provide the directory paths for types and enums
const typesDirectoryPath = path.resolve(__dirname, "./types"); // Directory where .types.ts files reside
const enumsDirectoryPath = path.resolve(__dirname, "./enums"); // Directory where .enums.ts files should be generated
processAllTypeFiles(typesDirectoryPath, enumsDirectoryPath);
