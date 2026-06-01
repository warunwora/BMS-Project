import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
const composePath = join(__dir, "compose.yaml");
const reset = process.argv.includes("--reset");

function sh(cmd) {
  execSync(cmd, { cwd: root, stdio: "inherit" });
}

if (reset) {
  console.log("Resetting database (full schema + seed)...");
  sh(`docker compose -f "${composePath}" down -v`);
  sh(`docker compose -f "${composePath}" up -d`);
  console.log("Database container starting. Schema + seed run automatically on first init.");
} else {
  console.log("Starting database...");
  sh(`docker compose -f "${composePath}" up -d`);
}
