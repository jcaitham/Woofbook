#!/usr/bin/env node

import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const siteDir = path.join(root, "_site");

function runBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn("node", ["scripts/build-manifest.js"], {
      cwd: root,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`build-manifest.js exited with code ${code}`));
    });
  });
}

async function copyIfExists(source, destination) {
  try {
    await stat(source);
  } catch {
    return;
  }

  await cp(source, destination, { recursive: true });
}

async function prepareSite() {
  await runBuild();

  const manifestPath = path.join(root, "pets", "manifest.json");
  const entriesDir = path.join(root, "pets", "entries");
  const entryFiles = (await readdir(entriesDir)).filter((file) =>
    file.endsWith(".json")
  );

  let manifest;
  try {
    const { readFile } = await import("node:fs/promises");
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch {
    throw new Error("pets/manifest.json was not created by the build step");
  }

  if (entryFiles.length > 0 && manifest.length === 0) {
    throw new Error(
      "Manifest is empty but pet entries exist. Build step failed silently."
    );
  }

  await rm(siteDir, { recursive: true, force: true });
  await mkdir(path.join(siteDir, "pets", "images"), { recursive: true });

  for (const fileName of ["index.html", "app.js", "styles.css"]) {
    await copyIfExists(path.join(root, fileName), path.join(siteDir, fileName));
  }

  await copyIfExists(manifestPath, path.join(siteDir, "pets", "manifest.json"));
  await copyIfExists(
    path.join(root, "pets", "images"),
    path.join(siteDir, "pets", "images")
  );

  console.log(
    `Prepared _site with ${manifest.length} pet(s) for GitHub Pages deploy`
  );
}

prepareSite().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
