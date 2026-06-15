#!/usr/bin/env node

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const entriesDir = path.join(root, "pets", "entries");
const manifestPath = path.join(root, "pets", "manifest.json");

const requiredFields = ["id", "name", "description", "contributor", "image"];
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const imagePattern =
  /^pets\/images\/[a-z0-9]+(?:-[a-z0-9]+)*\.(jpg|jpeg|png|webp)$/;

async function readEntry(fileName) {
  const filePath = path.join(entriesDir, fileName);
  const raw = await readFile(filePath, "utf8");

  let entry;
  try {
    entry = JSON.parse(raw);
  } catch {
    throw new Error(`${fileName}: invalid JSON`);
  }

  for (const field of requiredFields) {
    if (!entry[field] || typeof entry[field] !== "string") {
      throw new Error(`${fileName}: missing or invalid "${field}"`);
    }
  }

  if (!idPattern.test(entry.id)) {
    throw new Error(`${fileName}: id must be lowercase letters, numbers, and hyphens`);
  }

  if (!imagePattern.test(entry.image)) {
    throw new Error(
      `${fileName}: image must be pets/images/<id>.jpg, .jpeg, .png, or .webp`
    );
  }

  const expectedBase = `${entry.id}.json`;
  if (fileName !== expectedBase) {
    throw new Error(`${fileName}: file name must match id (${expectedBase})`);
  }

  const imagePath = path.join(root, entry.image);
  try {
    await readFile(imagePath);
  } catch {
    throw new Error(`${fileName}: image file not found at ${entry.image}`);
  }

  return {
    id: entry.id,
    name: entry.name.trim(),
    description: entry.description.trim(),
    contributor: entry.contributor.trim(),
    image: entry.image,
  };
}

async function buildManifest() {
  const files = await readdir(entriesDir);
  const jsonFiles = files.filter((file) => file.endsWith(".json")).sort();

  const pets = [];
  const seenIds = new Set();

  for (const fileName of jsonFiles) {
    const pet = await readEntry(fileName);

    if (seenIds.has(pet.id)) {
      throw new Error(`Duplicate pet id: ${pet.id}`);
    }

    seenIds.add(pet.id);
    pets.push(pet);
  }

  pets.sort((a, b) => a.name.localeCompare(b.name));

  await writeFile(manifestPath, `${JSON.stringify(pets, null, 2)}\n`, "utf8");
  console.log(`Wrote ${pets.length} pet(s) to pets/manifest.json`);
}

buildManifest().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
