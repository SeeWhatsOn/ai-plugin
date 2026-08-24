#!/usr/bin/env node
//
// Generates every editor-specific manifest from two source files:
//
//   marketplace.config.json      -> .claude-plugin/marketplace.json
//                                   .cursor-plugin/marketplace.json
//                                   install.sh
//                                   the "Recommended plugins" section of README.md
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
  // Cursor discovers rules/, skills/, agents/ and commands/ by convention, so these
  // declarations are belt-and-braces — cursor/plugin-template's own manifests omit
  // them. They are kept because Cursor's validate-template.mjs checks exactly these
  // fields (logo, rules, skills, agents, commands, hooks, mcpServers), so naming the
  // dirs makes a missing one a build error rather than a silently absent component.
  // hooks and mcpServers are NOT optional: Cursor only loads those when declared.
  const cursor = { ...pick(src, SHARED_FIELDS) };
  if (has("assets/logo.svg")) cursor.logo = "assets/logo.svg";
  for (const dir of ["skills", "agents", "commands", "rules"]) {
    if (has(dir)) cursor[dir] = `./${dir}/`;
  }
  if (has("hooks/cursor.hooks.json")) cursor.hooks = "./hooks/cursor.hooks.json";
  if (has("mcp.json")) cursor.mcpServers = "./mcp.json";
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

// Favourites are other people's plugins. They are never published in my marketplace
// and never installed by my installer — they only get written up in the README, with
// the two commands to add each one by hand.
const fav = config.favourites ?? {};
const favMarketplaces = (fav.marketplaces ?? []).filter((m) => !m.disabled);
const favPlugins = (fav.plugins ?? []).filter((p) => !p.disabled);

const sourceOf = (name) => favMarketplaces.find((m) => m.name === name)?.source;

for (const p of favPlugins) {
  if (!p.from) errors.push(`favourites.plugins["${p.name}"]: needs a "from" marketplace`);
  else if (!sourceOf(p.from)) {
    errors.push(`favourites.plugins["${p.name}"]: "from" names an unlisted marketplace "${p.from}"`);
  }
}

const marketplaceMeta = {
  name: config.name,
  owner: config.owner,
  ...(config.description ? { description: config.description } : {}),
  ...(config.version ? { version: config.version } : {}),
};

// Only my own plugins are published here. Other people's plugins stay in their own
// marketplaces — the README points at them instead.
emitJson(".claude-plugin/marketplace.json", {
  $schema: "https://json.schemastore.org/claude-code-marketplace.json",
  ...marketplaceMeta,
  plugins: local,
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

// ---------------------------------------------------------------------------
// install.sh — my own plugins only
// ---------------------------------------------------------------------------

// Register my own marketplace from the published repo when `repo` is set, so this
// script works on a fresh machine with no clone. Without it, fall back to the
// directory this script sits in.
const selfSource = config.repo ?? '"$repo_root"';

const sh = [
  "#!/usr/bin/env bash",
  `# GENERATED by ${GENERATED_BY} (source: marketplace.config.json)`,
  "#",
  "# Installs my own plugins in Claude Code. Other people's plugins are listed in",
  "# the README under \"Recommended plugins\" — add those by hand, when I want them.",
  "set -euo pipefail",
  "",
  ...(config.repo ? [] : ['repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"', ""]),
  `claude plugin marketplace add ${selfSource}`,
  ...local.map((p) => `claude plugin install ${p.name}@${config.name}`),
  "",
  'echo "Done. Run /plugin inside Claude Code to review what is enabled."',
  "",
];
emit("install.sh", sh.join("\n"), { executable: true });

// ---------------------------------------------------------------------------
// README "Recommended plugins" section
// ---------------------------------------------------------------------------

// The README is hand-written apart from this one section, so rewrite between the
// markers instead of emitting the whole file.
const BEGIN = "<!-- BEGIN:recommended -->";
const END = "<!-- END:recommended -->";

const row = (cells) => `| ${cells.join(" | ")} |`;
const pinned = new Set(favPlugins.map((p) => p.from));

const section = [
  BEGIN,
  `<!-- GENERATED by ${GENERATED_BY} (source: marketplace.config.json) -->`,
  "",
  "## Recommended plugins",
  "",
  "Other people's plugins I actually use. **This marketplace does not install them** — it",
  "only signposts them. Add the ones you want:",
  "",
  row(["Plugin", "By", "What it does"]),
  row(["---", "---", "---"]),
  ...favPlugins.map((p) => row([`\`${p.name}\``, p.author ?? "—", p.note ?? ""])),
  "",
  "```bash",
  ...favPlugins
    .map((p) =>
      [
        `# ${p.name} — ${p.author ?? "unknown"}`,
        `claude plugin marketplace add ${sourceOf(p.from)}`,
        `claude plugin install ${p.name}@${p.from}`,
      ].join("\n")
    )
    .join("\n\n")
    .split("\n"),
  "```",
  "",
];

const unpinned = favMarketplaces.filter((m) => !pinned.has(m.name));
if (unpinned.length) {
  section.push(
    "Marketplaces worth browsing, with nothing pinned from them yet:",
    "",
    row(["Marketplace", "Add with"]),
    row(["---", "---"]),
    ...unpinned.map((m) =>
      row([`\`${m.name}\``, `\`claude plugin marketplace add ${m.source}\``])
    ),
    ""
  );
}

section.push(
  "**Cursor** — a Cursor marketplace `source` must be a relative path inside the marketplace",
  "repo, so none of these can be listed in `.cursor-plugin/marketplace.json`. In Cursor, get",
  "them from the [Cursor Marketplace](https://cursor.com/marketplace) or symlink the plugin",
  "folder into `~/.cursor/plugins/local/`.",
  "",
  END
);

const readmePath = join(ROOT, "README.md");
const readme = readFileSync(readmePath, "utf8");
const start = readme.indexOf(BEGIN);
const stop = readme.indexOf(END);
if (start === -1 || stop === -1 || stop < start) {
  errors.push(`README.md: missing the ${BEGIN} / ${END} markers around the recommended section`);
} else {
  emit(
    "README.md",
    readme.slice(0, start) + section.join("\n") + readme.slice(stop + END.length)
  );
}

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
      (favPlugins.length ? `, signposted ${favPlugins.length} favourite(s) in the README.` : ".")
  );
}
