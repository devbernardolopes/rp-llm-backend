import { readFileSync, writeFileSync } from "node:fs";

const packagePath = new URL("../package.json", import.meta.url);
const configPath = new URL("../config.js", import.meta.url);

const pkgContent = readFileSync(packagePath, "utf8");
const configContent = readFileSync(configPath, "utf8");

let pkgData;
try {
  pkgData = JSON.parse(pkgContent);
} catch (err) {
  console.error("Failed to parse package.json:", err);
  process.exitCode = 1;
  throw err;
}

const targetVersion = String(pkgData.version || "").trim();
if (!targetVersion) {
  throw new Error("package.json does not declare a version");
}

const updatedConfig = configContent.replace(
  /(version:\s*["'])([^"']+)(["'])/,
  (_match, prefix, _old, suffix) => `${prefix}${targetVersion}${suffix}`,
);

if (updatedConfig === configContent) {
  console.warn("CONFIG version marker not found; no changes written.");
} else {
  writeFileSync(configPath, updatedConfig, "utf8");
  console.log(`Bumped config.js version to ${targetVersion}`);
}
