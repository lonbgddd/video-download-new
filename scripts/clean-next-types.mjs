import { rm } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const generatedTypeDirectories = [
  path.join(projectRoot, ".next", "types"),
  path.join(projectRoot, ".next", "dev", "types"),
];

// Route groups can leave obsolete generated validators after a git pull or
// branch switch. Only remove Next.js-generated type directories, never source.
await Promise.all(
  generatedTypeDirectories.map((directory) =>
    rm(directory, { recursive: true, force: true }),
  ),
);
