import { randomBytes, createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const remote = process.argv.includes("--remote");
const key = randomBytes(32).toString("base64url");
const hash = createHash("sha256").update(key).digest("hex");
if (remote) {
  const result = spawnSync(process.execPath, ["node_modules/wrangler/bin/wrangler.js", "secret", "put", "ADMIN_KEY_HASH", "--config", "wrangler.jsonc"], { input: hash, stdio: ["pipe", "inherit", "inherit"] });
  if (result.status !== 0) process.exit(result.status || 1);
} else {
  let existing = "";
  try { existing = await readFile(".dev.vars", "utf8"); } catch (error) { if (error.code !== "ENOENT") throw error; }
  const lines = existing.split(/\r?\n/).filter(line => line && !line.startsWith("ADMIN_KEY_HASH="));
  await writeFile(".dev.vars", [...lines, `ADMIN_KEY_HASH=${hash}`].join("\n") + "\n", { mode: 0o600 });
}
console.log("\nSave this admin sign-in key in your password manager. It is shown only now:");
console.log(key);
console.log("\nDo not send it in chat or commit it to Git. Generating a new key signs out existing sessions.");
