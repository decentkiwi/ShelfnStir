const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!match) return;
      const [, key, rawValue] = match;
      const value = rawValue.replace(/^"(.*)"$/, "$1");
      if (!(key in process.env)) process.env[key] = value;
    });
}

module.exports = { loadEnvLocal };
