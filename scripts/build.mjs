#!/usr/bin/env node
//
// Generates every editor-specific manifest from two source files:
//
//   marketplace.config.json      -> .claude-plugin/marketplace.json
//                                   .cursor-plugin/marketplace.json
//                                   FAVOURITES.md
//                                   install-favourites.sh
//
//   plugins/<name>/plugin.json   -> plugins/<name>/.claude-plugin/plugin.json
//                                   plugins/<name>/.cursor-plugin/plugin.json
//
// Run `node scripts/build.mjs` after editing a source file, and commit the output.
// Run `node scripts/build.mjs --check` in CI to fail when the output is stale.
//
// No dependencies. Node 18+.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, chmodSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");

const GENERATED_BY = "scripts/build.mjs — do not edit by hand, edit the source file instead";

const errors = [];
const stale = [];
const notes = [];

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

function emit(relPath, contents, { executable = false } = {}) {
  const abs = join(ROOT, relPath);
  const current = existsSync(abs) ? readFileSync(abs, "utf8") : null;
  if (current === contents) return;

  if (CHECK) {
    stale.push(relPath);
    return;
  }
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, contents);
  if (executable) chmodSync(abs, 0o755);
  notes.push(`wrote ${relPath}`);
}

const emitJson = (relPath, obj) => emit(relPath, JSON.stringify(obj, null, 2) + "\n");

// ---------------------------------------------------------------------------
// Plugin manifests
// ---------------------------------------------------------------------------

// Fields that mean the same thing in both editors and are copied straight across.
const SHARED_FIELDS = [
  "name",
  "displayName",
  "version",
  "description",
  "author",
  "homepage",
  "repository",
  "license",
  "keywords",
];

function pick(src, fields) {
  const out = {};
  for (const f of fields) if (src[f] !== undefined) out[f] = src[f];
  return out;
}

function buildPlugin(dir) {
  const pluginDir = join("plugins", dir);
  const src = readJson(join(ROOT, pluginDir, "plugin.json"));

  if (!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(src.name ?? "")) {
    errors.push(`${pluginDir}/plugin.json: "name" must be lowercase kebab-case`);
  }
  if (src.name !== dir) {
    errors.push(`${pluginDir}/plugin.json: "name" (${src.name}) must match the folder name (${dir})`);
  }

  const has = (p) => existsSync(join(ROOT, pluginDir, p));

  // --- Claude Code -----------------------------------------------------
  // Defaults it already finds on its own: skills/, agents/, commands/, .mcp.json
  // We point it at the Claude-format hook file and at Cursor's mcp.json filename
  // so there is only one copy of each on disk.
  const claude = {
    $schema: "https://json.schemastore.org/claude-code-plugin-manifest.json",
    ...pick(src, SHARED_FIELDS),
  };
  if (has("hooks/claude.hooks.json")) claude.hooks = "./hooks/claude.hooks.json";
  if (has("mcp.json")) claude.mcpServers = "./mcp.json";
  emitJson(join(pluginDir, ".claude-plugin/plugin.json"), claude);

  // --- Cursor ----------------------------------------------------------
  // Cursor discovers rules/, skills/, agents/, commands/ and mcp.json by convention,
  // but every plugin Cursor themselves ship declares the component dirs explicitly.
  // Cursor's plugin docs are thin, so we match their own output rather than rely on
  // the documented defaults. Paths take the "./dir/" form their manifests use.
  const cursor = { ...pick(src, SHARED_FIELDS) };
  if (has("assets/logo.svg")) cursor.logo = "assets/logo.svg";
  for (const dir of ["skills", "agents", "commands", "rules"]) {
    if (has(dir)) cursor[dir] = `./${dir}/`;
  }
  if (has("hooks/cursor.hooks.json")) cursor.hooks = "./hooks/cursor.hooks.json";
  emitJson(join(pluginDir, ".cursor-plugin/plugin.json"), cursor);

  if (has("rules")) {
    notes.push(`${dir}: rules/ is Cursor-only — Claude Code ignores it`);
  }

  return {
    name: src.name,
    source: `./${pluginDir}`,
    description: src.description,
    version: src.version,
    author: src.author,
    license: src.license,
    keywords: src.keywords,
  };
}

// ---------------------------------------------------------------------------
// Marketplaces
// ---------------------------------------------------------------------------

const config = readJson(join(ROOT, "marketplace.config.json"));

const pluginDirs = readdirSync(join(ROOT, "plugins"), { withFileTypes: true })
  .filter((e) => e.isDirectory() && existsSync(join(ROOT, "plugins", e.name, "plugin.json")))
  .map((e) => e.name)
  .sort();

if (pluginDirs.length === 0) errors.push("plugins/: no plugin found (each needs a plugin.json)");

const local = pluginDirs.map(buildPlugin);

const fav = config.favourites ?? {};
const favMarketplaces = (fav.marketplaces ?? []).filter((m) => !m.disabled);
const favPlugins = (fav.plugins ?? []).filter((p) => !p.disabled);

// Favourites that carry their own `source` get inlined into my Claude marketplace,
// so `/plugin install <name>@<marketplace>` works. Ones that only name another
// marketplace can't be inlined — they go into install-favourites.sh instead.
const inlined = favPlugins.filter((p) => p.source);
const viaMarketplace = favPlugins.filter((p) => !p.source);

for (const p of viaMarketplace) {
  if (!p.from) errors.push(`favourites.plugins["${p.name}"]: needs either "source" or "from"`);
  else if (!favMarketplaces.some((m) => m.name === p.from)) {
    errors.push(`favourites.plugins["${p.name}"]: "from" names an unlisted marketplace "${p.from}"`);
  }
}

const marketplaceMeta = {
  name: config.name,
  owner: config.owner,
  ...(config.description ? { description: config.description } : {}),
  ...(config.version ? { version: config.version } : {}),
};

emitJson(".claude-plugin/marketplace.json", {
  $schema: "https://json.schemastore.org/claude-code-marketplace.json",
  ...marketplaceMeta,
  plugins: [
    ...local,
    ...inlined.map((p) => ({
      name: p.name,
      source: p.source,
      ...(p.description ? { description: p.description } : {}),
    })),
  ],
});

// Cursor marketplace sources must be relative paths inside this repo — a remote
// favourite cannot be listed here, so local plugins only.
// Cursor puts description/version under `metadata`, not at the top level
// (cursor/plugin-template → .cursor-plugin/marketplace.json).
emitJson(".cursor-plugin/marketplace.json", {
  name: config.name,
  owner: config.owner,
  metadata: {
    ...(config.description ? { description: config.description } : {}),
    ...(config.version ? { version: config.version } : {}),
  },
  plugins: local.map((p) => ({
    name: p.name,
    source: p.source,
    ...(p.description ? { description: p.description } : {}),
  })),
});

if (inlined.length + viaMarketplace.length > 0) {
  notes.push(
    `favourites: ${inlined.length + viaMarketplace.length} third-party plugin(s) are Claude Code only — Cursor has no remote plugin source`
  );
}

// ---------------------------------------------------------------------------
// Favourites: installer + docs
// ---------------------------------------------------------------------------

// Register my own marketplace from the published repo when `repo` is set, so this
// script works on a fresh machine with no clone. Without it, fall back to the
// directory this script sits in.
const selfSource = config.repo ?? '"$repo_root"';

const sh = [
  "#!/usr/bin/env bash",
  `# GENERATED by ${GENERATED_BY} (source: marketplace.config.json)`,
  "#",
  "# Installs my own plugins plus my favourites from other repos, in Claude Code.",
  "# Cursor has no CLI installer — see FAVOURITES.md for the Cursor route.",
  "set -euo pipefail",
  "",
  ...(config.repo ? [] : ['repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"', ""]),
  "# --- my marketplace ---",
  `claude plugin marketplace add ${selfSource}`,
  ...local.map((p) => `claude plugin install ${p.name}@${config.name}`),
  ...inlined.map((p) => `claude plugin install ${p.name}@${config.name}`),
];

if (favMarketplaces.length) {
  sh.push("", "# --- favourite marketplaces ---");
  for (const m of favMarketplaces) sh.push(`claude plugin marketplace add ${m.source}`);
}
if (viaMarketplace.length) {
  sh.push("", "# --- favourite plugins from those marketplaces ---");
  for (const p of viaMarketplace) sh.push(`claude plugin install ${p.name}@${p.from}`);
}
sh.push("", 'echo "Done. Run /plugin inside Claude Code to review what is enabled."', "");
emit("install-favourites.sh", sh.join("\n"), { executable: true });

const row = (cells) => `| ${cells.join(" | ")} |`;
const md = [
  `<!-- GENERATED by ${GENERATED_BY} (source: marketplace.config.json) -->`,
  "",
  "# Favourites",
  "",
  "Plugins and marketplaces from **other repos** that I want alongside my own.",
  "",
  "```bash",
  "./install-favourites.sh",
  "```",
  "",
  "## Marketplaces",
  "",
  row(["Marketplace", "Source", "Note"]),
  row(["---", "---", "---"]),
  ...favMarketplaces.map((m) => row([`\`${m.name}\``, `\`${m.source}\``, m.note ?? ""])),
  "",
  "## Plugins",
  "",
  row(["Plugin", "By", "Where from", "Install as", "Note"]),
  row(["---", "---", "---", "---", "---"]),
  ...viaMarketplace.map((p) =>
    row([`\`${p.name}\``, p.author ?? "—", `\`${p.from}\``, `\`${p.name}@${p.from}\``, p.note ?? ""])
  ),
  ...inlined.map((p) =>
    row([
      `\`${p.name}\``,
      p.author ?? "—",
      `\`${p.source.repo ?? p.source.url ?? p.source.source}\``,
      `\`${p.name}@${config.name}\``,
      "inlined into my marketplace",
    ])
  ),
  "",
  "## Cursor",
  "",
  "Cursor plugin sources must be a relative path inside the marketplace repo, so these",
  "favourites cannot be listed in `.cursor-plugin/marketplace.json`. In Cursor, either:",
  "",
  "1. install them from the [Cursor Marketplace](https://cursor.com/marketplace) if they are listed there, or",
  "2. vendor the plugin folder into `plugins/` here (git submodule or a copy), or",
  "3. symlink it into `~/.cursor/plugins/local/`.",
  "",
];
emit("FAVOURITES.md", md.join("\n"));

// ---------------------------------------------------------------------------

if (errors.length) {
  console.error("Build failed:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

if (CHECK) {
  if (stale.length) {
    console.error("Generated files are out of date. Run `node scripts/build.mjs`:");
    for (const s of stale) console.error(`  - ${s}`);
    process.exit(1);
  }
  console.log("Generated files are up to date.");
} else {
  for (const n of notes) console.log(`  ${n}`);
  console.log(
    `Built ${local.length} plugin(s) for Claude Code and Cursor` +
      (inlined.length + viaMarketplace.length
        ? `, ${inlined.length + viaMarketplace.length} favourite(s).`
        : ".")
  );
}
