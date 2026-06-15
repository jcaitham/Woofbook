#!/usr/bin/env node

import { execSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const manifestPath = "pets/manifest.json";
const allowedImageExt = [".jpg", ".jpeg", ".png", ".webp"];

function getStagedFiles() {
  const output = execSync("git diff --cached --name-only --diff-filter=ACMR", {
    cwd: root,
    encoding: "utf8",
  }).trim();

  return output ? output.split("\n") : [];
}

function getPrChangedFiles(baseRef) {
  execSync(`git fetch origin ${baseRef} --depth=1`, {
    cwd: root,
    stdio: "inherit",
  });

  const output = execSync(`git diff --name-only origin/${baseRef}...HEAD`, {
    cwd: root,
    encoding: "utf8",
  }).trim();

  return output ? output.split("\n") : [];
}

async function findImageForId(id) {
  const imagesDir = path.join(root, "pets", "images");
  const files = await readdir(imagesDir);

  return files.find((file) => {
    const extension = path.extname(file).toLowerCase();
    return file.startsWith(`${id}.`) && allowedImageExt.includes(extension);
  });
}

export function assertManifestNotChanged(files) {
  if (files.includes(manifestPath)) {
    throw new Error(
      `${manifestPath} is generated automatically. Remove it from your commit or PR — only add files under pets/entries/ and pets/images/.`
    );
  }
}

export async function stagePet(id) {
  if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error("Usage: npm run stage-pet -- <pet-id>");
  }

  const entryPath = `pets/entries/${id}.json`;
  const imageName = await findImageForId(id);

  if (!imageName) {
    throw new Error(
      `No image found for "${id}" in pets/images/ (${allowedImageExt.join(", ")})`
    );
  }

  const imagePath = `pets/images/${imageName}`;
  execSync(`git add -- ${entryPath} ${imagePath}`, { cwd: root, stdio: "inherit" });
  console.log(`Staged ${entryPath} and ${imagePath}`);
}

async function main() {
  const mode = process.argv[2];

  if (mode === "--staged") {
    assertManifestNotChanged(getStagedFiles());
    console.log("OK: manifest.json is not staged");
    return;
  }

  if (mode === "--pr") {
    const baseRef = process.env.GITHUB_BASE_REF;
    if (!baseRef) {
      throw new Error("GITHUB_BASE_REF is required for --pr mode");
    }

    assertManifestNotChanged(getPrChangedFiles(baseRef));
    console.log("OK: manifest.json is not part of this pull request");
    return;
  }

  const id = mode;
  await stagePet(id);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
