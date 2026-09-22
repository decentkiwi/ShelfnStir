// Copies ONLY the files that are meant to be public into .deploy/.
// Used as the Cloudflare Worker's static assets and as the source for the
// gh-pages branch. It's an allowlist on purpose: anything not named here
// (source, db/, src/, env files, tooling config) can never be published by
// accident.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, ".deploy");

const FILES = [
  "index.html",
  "recipes.html",
  "bar-guide.html",
  "privacy.html",
  "responsible-drinking.html",
  "styles.css",
  "script.js",
  "_headers",
  "robots.txt",
  "sitemap.xml",
];
const DIRS = ["assets", "data", "recipes"];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);
FILES.forEach((file) => fs.copyFileSync(path.join(ROOT, file), path.join(OUT, file)));
DIRS.forEach((dir) => fs.cpSync(path.join(ROOT, dir), path.join(OUT, dir), { recursive: true }));

console.log(`Staged ${FILES.length} files and ${DIRS.length} folders into .deploy/`);
