---
name: prd
description: Turns a product need into a single self-contained HTML Product Requirements Document — actors, goals and success measures, assumptions ranked by risk, prioritised user stories with acceptance criteria, epic build order, open questions and explicit non-goals — built as one visual page with charts, tables and a dependency diagram, plus a short Markdown stub for the GitHub issue that links to it. Use this whenever the user describes something they want built for users rather than a code change: "I need a product that...", "we want users to be able to...", "write a PRD", "write a product spec", "break this requirement down", "what are the user stories for...", "turn this idea into requirements", or any point where a product need exists but nobody has written down who it is for, why it matters, or how you would know it worked. Use it BEFORE any engineering spec skill — a spec answers "how do we build it", this answers "what are we building and why". Also use when an existing PRD needs updating, re-scoping, or its stories re-prioritised.
---

# PRD

## Purpose

A PRD is the layer above an engineering spec. The spec says how to build the thing; the PRD says
what the thing is, who it is for, why it is worth doing, and how you will know it worked.

Skipping it is why teams build the wrong thing correctly.

The structure follows Atlassian's agile PRD — deliberately lightweight, one page, links out to
detail, updated as you learn. `references/atlassian-prd.md` has the section-by-section guidance and
the reasoning behind each one.

## The output

**One self-contained HTML file.** Styles inline in the same file, no external assets, no build step.
It gets committed to the repo and rendered in a browser, so the whole PRD lives in one place and
reads as a designed page rather than a wall of text.

Alongside it, **a short Markdown stub** — six or seven lines — that goes in the GitHub issue and
links to the rendered page. The stub is the trailer; the HTML is the film.

`references/publishing.md` covers where the HTML actually goes, and why pasting it into a GitHub
issue does not work.

### One page means one page

The first version of this skill produced a 3,300-word PRD. Every claim in it was sound and nobody
would ever read it. Atlassian's whole argument is that a PRD earns its keep by being short enough
that the team actually revisits it.

The budget:

- **Prose under ~900 words across the whole page.** Not per section — total.
- Anything longer than a short paragraph is a candidate to become a table, a chart, or a link.
- A reader should get the whole thing in about five minutes.

Detail is not deleted, it is **moved**. Research, transcripts, header checks, spec extracts and
option comparisons go into linked material — a separate page, an existing artifact, a doc in the
repo. The PRD says the conclusion and links to the working.

When you find yourself writing a fourth paragraph in a row, stop: that content wants to be a table.

### Visuals carry the structure

This is the main reason the output is HTML. Use `references/visuals.md` to pick them — it maps each
part of a PRD to the visual that suits it, and it names the ones that are worse than no visual at
all.

The rule that matters most: **chart real data only.** Story counts, priority spread and epic
dependencies are real — they come from the PRD itself. A confidence gauge, a made-up burndown, or a
"business impact" score out of ten is decoration wearing the costume of evidence, and it damages the
credibility of every honest number on the page.

## Process

### 1. Take inventory before asking anything

The user has usually already told you a lot — in this conversation, in the repo, in an existing doc.
Interviewing them about things they just said is annoying and wastes the goodwill you need for the
questions that actually matter.

So first, quietly gather:

- What they said in this conversation — the need, the users, any constraints or deadlines
- The codebase, if there is one — what exists today, what the product currently does, domain
  vocabulary, any `CONTEXT.md`, ADRs, or existing PRDs
- Anything they linked to

### 2. Ask only about the gaps

Map what you have against the sections in `references/atlassian-prd.md`, then ask about what is
genuinely missing and genuinely matters. In practice the gaps are almost always some of these:

| Gap | Why it matters |
|---|---|
| **Who the actors are** | Every story starts "As a…". Without this the stories are generic. |
| **How success is measured** | The most commonly skipped section, and the one that decides whether this was worth building. |
| **What is explicitly out** | Without it, scope drifts and the team builds forever. |
| **Target release / deadline** | Changes what makes the cut. |
| **Who reviews it** | Atlassian's strongest advice: never write a PRD alone. Name a developer. |

Ask these efficiently. Where the answer is a choice between a few options, offer the options. Where
it is open-ended, ask one question at a time and wait — a wall of questions gets a wall of
half-answers.

Keep it short. Four or five questions is plenty. If the user says "just draft it" or seems
impatient, stop asking and write the PRD with the gaps marked as assumptions and open questions —
that is a legitimate output, and it makes the gaps visible rather than hiding them behind guesses.

### 3. Break the need down

This is the part that turns a requirement into something a team can pick up. Work down the ladder:

```
  outcome        the change in the world you want
     │
     ├─ epic     a coherent slice of that outcome
     │    │
     │    ├─ story    "As a <actor>, I want <capability>, so that <benefit>"
     │    │     │
     │    │     └─ acceptance criteria   how you know the story is done
     │    └─ story …
     └─ epic …
```

Prioritise with MoSCoW — Must / Should / Could / Won't-this-release. The convenient part is that
**Won't feeds straight into "What we're not doing"**, so prioritisation and scope-fencing are the
same pass.

Then work out **which epics block which**, because lettering them A–E implies a sequence that is
usually wrong. The build order is a visual, not a sentence — see `references/visuals.md`.

`references/breakdown.md` has the detail on writing stories that aren't disguised tasks, on
acceptance criteria that are checkable rather than aspirational, and on which stories need criteria
at all.

### 4. Build the page

Before writing any HTML, load the **`artifact-design`** skill. The page is a designed document and
that skill is what stops it looking like a form someone filled in. Load **`dataviz`** before writing
any chart, and **`artifact-diagramming`** for the epic dependency graph.

`references/layout-check.md` has the layout faults that keep recurring — worth a look before you
write the CSS, not just after.

`assets/prd-page.html` is a working reference implementation — theme-aware tokens, the story card,
the priority chips, the metric table, the MoSCoW bar, the dependency diagram. Read it for the
component patterns and the structure, then design the actual page for this actual product. Copying
it verbatim produces a page that looks like every other PRD, which is the thing `artifact-design`
exists to prevent.

Two content rules while filling it:

- **No empty sections.** If a section has nothing in it, either cut it or say what is missing and
  why — "No design exists yet, and it is needed before Epic A starts" is content; a bare heading is
  not.
- **Mark every assumption** as `[ASSUMPTION]` so a reviewer can see in one pass what has been
  validated and what has not.

Then write the Markdown stub from `assets/prd-issue-stub.md`.

### 5. Render it, then fix what you see

**Do this before publishing, not after.** A page can have valid HTML, balanced braces and a
stylesheet that publishes byte-for-byte intact, and still lay out wrong. Only a browser knows.

Serve the file locally, open it, and run the scan in `references/layout-check.md`. It catches the
three faults that actually happen: inline content shredded across a grid, boxes colliding, and the
page scrolling sideways. Then look at the page — rendering catches what geometry cannot, like a
caption that contradicts the thing it labels.

Run the scan on the **local file**. The published artifact scrolls inside a cross-origin iframe you
cannot script from outside.

Fix what it finds. Do not publish a page you have not seen.

**Keep the file pure ASCII.** The page carries no `<meta charset>` — an Artifact injects one at
publish time, so the tag is not written into the file. That means a literal `—` or `·` renders as
mojibake the moment anyone opens the committed file directly. Write every such character as an HTML
entity (`&mdash;`, `&middot;`), and check before publishing:

```bash
python3 -c "print(sorted({c for c in open('<file>',encoding='utf-8').read() if ord(c)>127}))"
```

An empty list is the pass.

**If the PRD is going into a repo, print it and look at that too.** The PDF is a different rendering
of the page, not a screenshot: the print stylesheet changes widths and spacing, and Mermaid does not
survive the trip at all. `references/publishing.md` has the command and the reasoning.

### 6. Check the content, then say what you found

Read back over the draft against the failure modes in `references/atlassian-prd.md`:

- The whole thing is spec'd out in detail before any engineering conversation has happened
- It reads as though it needs iron-clad sign-off before work can start
- It was written alone, with no developer involved
- It contains numbers nobody can source
- It is over the word budget

**Report this in your message to the user, not as a section in the PRD.** It is a note from you
about the draft, and it goes stale the moment they act on it. The one exception is "written without
a developer" — that belongs in Open questions, because it is a live action for a named person.

### 7. Hand off

A PRD is the input to an engineering spec, not a replacement for one. When it is approved, point the
user at the next step:

> PRD's done. Next step is an engineering spec — run `/mattpocock-skills:to-spec` and it'll pick up
> the stories from here, or `/agent-skills:spec` if you want the capability map and build order.

If the work is small enough that a full spec is overkill, say so — `/watson-core:minimal-viable-delivery`
can take a well-scoped PRD straight to implementation.

## Updating an existing PRD

PRDs going stale is the main documented weakness of this approach, so treat updates as normal work
rather than an exception. When revisiting one:

- Edit the same HTML file in place so the history is diffable, and bump the "Last updated" date
- Move resolved items out of **Open questions** into the section they belong in
- When a story ships and reality differs from what was written, update the story — a PRD that
  describes something you didn't build is worse than no PRD
- If scope was cut, move it into **What we're not doing** rather than deleting it, so the decision
  survives
- Re-check the word budget. Updates are how one-page documents become eight-page documents.
