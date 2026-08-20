# ai-plugin

One repo that is a **plugin marketplace for both Claude Code and Cursor**.

Write each plugin once. `scripts/build.mjs` generates the editor-specific manifests.

```bash
node scripts/build.mjs         # regenerate manifests
node scripts/build.mjs --check # CI: fail if the output is stale
```

## Install

**Claude Code**

```bash
claude plugin marketplace add SeeWhatsOn/ai-plugin   # or a local path
claude plugin install watson-core@watson-ai
```

**Cursor** — Teams/Enterprise: Dashboard → Plugins → Add Marketplace → *Import from Repo*.
Solo: symlink the plugin folder into Cursor's local plugin directory.

```bash
ln -s "$PWD/plugins/watson-core" ~/.cursor/plugins/local/watson-core
# then Developer: Reload Window
```

**Favourites from other repos** — see [FAVOURITES.md](FAVOURITES.md), or just run:

```bash
./install-favourites.sh
```

The script registers my own marketplace from the `repo` value in `marketplace.config.json`
(`SeeWhatsOn/ai-plugin`), so it works on a machine with no clone. Drop `repo` and it falls
back to the folder the script sits in.

## Day to day

**Adding a skill, agent, command or rule needs no build.** Both editors find them by folder
convention — nothing in any manifest lists them. Drop the file in, commit, done.

**Rebuild only when you change a source file:**

| You changed | Rebuild? |
|---|---|
| a file inside an **existing** `skills/`, `agents/`, `commands/`, `rules/` | **no** |
| `plugin.json` or `marketplace.config.json` | **yes** — `npm run build` |
| **created or deleted** a whole component dir, `mcp.json`, `hooks/*.json`, `assets/logo.svg` | **yes** |

Claude Code finds every component dir by convention, so its manifest stays metadata-only.
Cursor's manifest lists them explicitly — that is what Cursor's own published plugins do,
and their docs are thin enough not to rely on the documented defaults. `build.mjs` emits
that list, which is why creating a *new* component dir needs a rebuild.

Nothing builds on commit. If you forget, CI fails with `--check` and names the stale files.
Claude Code reads the manifests straight from GitHub and never runs this script, so the
generated files have to be committed.

## Installing on a fresh machine vs a fresh repo

Two different scopes, two different mechanisms:

| | Fresh machine | Fresh repo |
|---|---|---|
| Use | `./install-favourites.sh` | `.claude/settings.json` in that repo |
| Why | the CLI **merges** into your existing `~/.claude/settings.json` | the file is new, so there is nothing to merge |
| Scope | user-wide, every project | that project only |

A marketplace is a **catalog, not an installer** — `claude plugin marketplace add` makes
plugins available, then you install by name. The settings route does both declaratively:

```jsonc
// .claude/settings.json — committed to a project repo
"extraKnownMarketplaces": { "watson-ai": { "source": { "source": "github", "repo": "SeeWhatsOn/ai-plugin" } } },
"enabledPlugins":        { "watson-core@watson-ai": true }
```

## Layout

```
marketplace.config.json              SOURCE  marketplace meta + favourites
plugins/watson-core/
  plugin.json                        SOURCE  the one manifest you edit
  skills/<name>/SKILL.md             shared  both editors
  agents/security-reviewer.md        shared  both editors
  commands/ship-it.md                shared  both editors
  rules/house-style.mdc              Cursor only
  assets/logo.svg                    Cursor marketplace display

  .claude-plugin/plugin.json         GENERATED
  .cursor-plugin/plugin.json         GENERATED
.claude-plugin/marketplace.json      GENERATED
.cursor-plugin/marketplace.json      GENERATED
FAVOURITES.md                        GENERATED
install-favourites.sh                GENERATED
```

Generated files are committed, because both editors read them straight from git.

## What each editor supports

| Component | Claude Code | Cursor | Shared file? |
|---|---|---|---|
| **Skills** (`skills/<n>/SKILL.md`) | yes | yes | **yes** |
| **Agents** (`agents/*.md`) | yes | yes | **yes** |
| **Commands** (`commands/*.md`) | yes | yes | **yes** |
| **MCP** | `.mcp.json` | `mcp.json` | **yes** — one `mcp.json`, Claude manifest points at it |
| **Hooks** | `hooks/*.json`, PascalCase events | `hooks/*.json`, camelCase events | **no** — two files, one shell script |
| **Rules** (`rules/*.mdc`) | — | yes | Cursor only |
| **LSP / monitors / bin / settings** | yes | — | Claude only |

Frontmatter tip: Cursor requires **both** `name:` and `description:` on skills, agents and
commands. Claude Code only needs `description:`. Write both and one file serves both.

## Adding a plugin

1. `mkdir -p plugins/my-plugin` and add `plugins/my-plugin/plugin.json` (copy `watson-core`'s).
2. Add whichever component folders you need.
3. `node scripts/build.mjs`
4. Commit the generated manifests.

`plugin.json` at the plugin root is the [Agent Plugins](https://agent-plugins.org)
standard manifest, so the folder is also portable to any other client that reads
that spec. Cursor prefers `.cursor-plugin/plugin.json` when both are present.

## Adding a favourite from another repo

Edit `marketplace.config.json`, then rebuild. Two forms:

```jsonc
"favourites": {
  // registers the other marketplace, then installs by name from it
  "marketplaces": [
    { "name": "claude-plugins-community", "source": "anthropics/claude-plugins-community" }
  ],
  "plugins": [
    { "name": "meticulous", "from": "claude-plugins-community" },

    // OR inline it into MY marketplace, so `/plugin install x@watson-ai` works
    { "name": "x", "source": { "source": "github", "repo": "owner/repo", "ref": "v1.0.0" } }
  ]
}
```

Claude Code plugin sources: `github`, `url` (any git URL), `git-subdir`, `npm`, `archive`,
`command`, or a relative path. Each accepts `ref` and `sha` for pinning.

**Cursor cannot do this.** Its marketplace `source` must be a relative path inside the
marketplace repo. Remote favourites are therefore Claude Code only — the build script
skips them in `.cursor-plugin/marketplace.json` and lists them in `FAVOURITES.md`.

## Validate

```bash
claude plugin validate .                    # marketplace manifest
claude plugin validate ./plugins/watson-core # plugin manifest
```

CI runs `--check` on every push (`.github/workflows/validate.yml`) — that catches a stale
or malformed manifest with no toolchain beyond Node. Run the two `validate` commands above
by hand when you change the shape of a manifest.

**Optional components.** `build.mjs` wires these up only when the file exists, so add one
and rebuild — nothing else to change:

| Add this file | Effect |
|---|---|
| `plugins/<n>/mcp.json` | MCP servers, both editors |
| `plugins/<n>/hooks/claude.hooks.json` | hooks, Claude Code (PascalCase events) |
| `plugins/<n>/hooks/cursor.hooks.json` | hooks, Cursor (camelCase events) |
| `plugins/<n>/assets/logo.svg` | Cursor marketplace display |

## References

- [Claude Code plugins](https://code.claude.com/docs/en/plugins) · [reference](https://code.claude.com/docs/en/plugins-reference) · [marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
- [Cursor plugins](https://cursor.com/docs/plugins) · [template](https://github.com/cursor/plugin-template)
- [Agent Plugins standard](https://agent-plugins.org)
