---
name: prd
description: Turns a product need into an agile Product Requirements Document — goals, business objectives, assumptions, prioritised user stories with acceptance criteria and success metrics, open questions, and explicit non-goals — following Atlassian's one-page PRD structure. Use this whenever the user describes something they want built for users rather than a code change: "I need a product that...", "we want users to be able to...", "write a PRD", "write a product spec", "break this requirement down", "what are the user stories for...", "turn this idea into requirements", or any point where a product need exists but nobody has written down who it is for, why it matters, or how you would know it worked. Use it BEFORE any engineering spec skill — a spec answers "how do we build it", this answers "what are we building and why". Also use when an existing PRD needs updating, re-scoping, or its stories re-prioritised.
---

# PRD

## Purpose

A PRD is the layer above an engineering spec. The spec says how to build the thing; the PRD says
what the thing is, who it is for, why it is worth doing, and how you will know it worked.

Skipping it is why teams build the wrong thing correctly.

This skill follows Atlassian's agile PRD structure — deliberately lightweight, one page, links out
to detail, updated as you learn. It is not a waterfall requirements document. Read
`references/atlassian-prd.md` for the full section-by-section guidance and the reasoning behind
each section.

## What good looks like

Three properties separate a useful PRD from documentation theatre:

- **Every claim is attributable.** A number in the PRD either came from the user, from the codebase,
  or is flagged as an assumption. Inventing a plausible-sounding success metric is the single most
  damaging thing you can do here, because it looks like research and it is not.
- **The non-goals are as clear as the goals.** "What we're not doing" is what keeps scope from
  drifting. A PRD without it is a wish list.
- **Every story can be shown to be done.** If a story has no acceptance criteria, nobody can tell
  when to stop.

## Process

### 1. Take inventory before asking anything

The user has usually already told you a lot — in this conversation, in the repo, in an existing doc.
Interviewing them about things they just said is annoying and wastes the goodwill you need for the
questions that actually matter.

So first, quietly gather:

- What they said in this conversation — the need, the users, any constraints or deadlines
- The codebase, if there is one — what exists today, what the product currently does, domain
  vocabulary, any `CONTEXT.md`, ADRs, or existing PRDs under `docs/`
- Anything they linked to

### 2. Ask only about the gaps

Map what you have against the eight sections in `references/atlassian-prd.md`. Then ask about what is
genuinely missing and genuinely matters. In practice the gaps are almost always some of these:

| Gap | Why it matters |
|---|---|
| **Who the user is** | Every story starts "As a…". Without this the stories are generic. |
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

This is the part that turns a requirement into something a team can actually pick up. Work down the
ladder:

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

`references/breakdown.md` has the detail on writing stories that aren't disguised tasks, and on
acceptance criteria that are checkable rather than aspirational. Read it before writing section 5.

### 4. Ask where it should go, then write it

Two things to settle:

- **Destination** — a file in the repo (usually `docs/prd/<slug>.md`), an issue tracker, or something
  they want to read and share visually.
- **Format** — this follows from the destination:

| Destination | Format |
|---|---|
| Repo file, or pasted into an issue tracker | **Markdown** — `assets/prd-template.md` |
| Something to read, share, or present | **HTML**, published as an Artifact — `assets/prd-template.html` |

Markdown is the default. Issue trackers get Markdown always — they render it and mangle HTML.
Only reach for HTML when the user wants to look at it rather than work from it.

If the answer is HTML, load the `artifact-design` skill before writing the page and publish it as an
Artifact — the template in `assets/` is structure, not a finished design, and the design pass is
where a PRD stops looking like a form someone filled in. Add `artifact-diagramming` if a story map
or flow would carry the breakdown better than a table.

Fill the template. Do not leave placeholder headings in with nothing under them; if a section has no
content, either cut it or say what is missing and why.

Mark every assumption inline as **[ASSUMPTION]** so a reviewer can spot in one pass what has been
validated and what has not.

### 5. Check it against the anti-patterns

Before handing it over, read back over it looking for the failure modes Atlassian calls out:

- The whole thing is spec'd out in detail before any engineering conversation has happened
- It reads as though it needs iron-clad sign-off before work can start
- It was written alone, with no developer involved
- It contains numbers nobody can source

If any of these are true, fix them or say so plainly when you hand it over.

### 6. Hand off

A PRD is the input to an engineering spec, not a replacement for one. When it is approved, point the
user at the next step:

> PRD's done. Next step is an engineering spec — run `/mattpocock-skills:to-spec` and it'll pick up
> the stories from here, or `/agent-skills:spec` if you want the capability map and build order.

If the work is small enough that a full spec is overkill, say so — `/watson-core:minimal-viable-delivery`
can take a well-scoped PRD straight to implementation.

## Updating an existing PRD

PRDs going stale is the main documented weakness of this approach, so treat updates as normal work
rather than an exception. When revisiting one:

- Keep the structure and the file; edit in place so the history is diffable
- Move resolved items out of **Open questions** and into the section they belong in
- When a story ships and reality differs from what was written, update the story — a PRD that
  describes something you didn't build is worse than no PRD
- If scope was cut, move it into **What we're not doing** rather than deleting it, so the decision
  survives
