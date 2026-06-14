import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

export const compile = (directory: string): void => {
  // Read the directory to get all `.cash` files
  const contractFiles = fs
    .readdirSync(directory)
    .filter((fn) => fn.endsWith(".cash"))
    .map((fn) => path.join(directory, fn));

  // Create artifacts directory if it doesn't exist
  const artifactsDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "artifacts"
  );
  fs.mkdirSync(artifactsDir, { recursive: true });

  // Compile each contract file using the CLI
  contractFiles.forEach((contractFile) => {
    const outputFileName = path.basename(contractFile).replace(".cash", ".ts");
    const outputPath = path.join(artifactsDir, outputFileName);

    // Build the CLI command
    const command = `cashc "${contractFile}" -o "${outputPath}" --format ts -S -L`;

    try {
      // Execute the CLI command
      execSync(command, { stdio: "inherit" });
      console.log(`\nCompiled ${path.basename(contractFile)}`);
    } catch (error) {
      console.error(`Failed to compile ${path.basename(contractFile)}:`, error);
    }
  });
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

compile(path.resolve(__dirname, "contracts"));
compile(path.resolve(__dirname, "contracts/loan"));
compile(path.resolve(__dirname, "contracts/loanKey"));
compile(path.resolve(__dirname, "contracts/loan/loanContractFunctions"));
compile(path.resolve(__dirname, "contracts/stabilitypool"));
compile(path.resolve(__dirname, "contracts/stabilitypool/poolContractFunctions"));
compile(path.resolve(__dirname, "contracts/redeemer"));
