# The eight sections

Adapted from Atlassian's agile PRD guidance
(https://www.atlassian.com/agile/product-management/requirements).

The governing idea: give "just enough" context to understand the project's requirements and its
impact on users. One page. Link out to the detail rather than inlining it. Expect to change it as
the team learns.

## 1. Project specifics

Small header block at the top so a reader knows where this stands before reading a word of prose.

- **Participants** — product owner, the team, stakeholders. Name real people where you know them.
- **Status** — on target / at risk / delayed / deferred / draft.
- **Target release** — when it is projected to ship, or explicitly "not scheduled".

## 2. Goals and business objectives

What the team is trying to achieve, and why the business cares. Get to the point; ambiguity here
gives everyone downstream room to assume something different.

This is also where **success metrics** belong. Atlassian tucks them into the user stories, but they
get lost there, and they are the section teams most often skip. Pull them out and make them
explicit:

- Each metric names what is measured, the current value if known, and the target
- If nobody knows the current value, say so — that is an open question, not a blank
- If a goal cannot be measured, say how you would recognise success qualitatively instead of
  inventing a number

## 3. Background and strategic fit

The motivation. What problem this solves, for whom, and how it connects to broader goals. This is
what lets someone six months from now understand why the work existed.

## 4. Assumptions

What is being taken on faith about technology, business needs, or user behaviour. Stating these is
how you find the risky ones early — an unstated assumption is just a bug in the plan that nobody
has noticed yet.

Revisit this section as the project runs. Assumptions that turn out to be wrong are the usual reason
a PRD needs rewriting.

## 5. User stories

The core of the document. See `breakdown.md` for how to write these and how to structure them into
epics.

Link out generously: customer interviews, prior discussions, screenshots, related tickets. A link
carries the detail without bloating the page.

## 6. User interaction and design

Wireframes, design explorations, flows. Link rather than embed. If there is no design yet, say
that — it is usually a meaningful gap rather than an empty section.

## 7. Open questions

A table of things that need deciding or researching, so they are tracked rather than forgotten.

| Question | Owner | Needed by |
|---|---|---|

Questions surfacing here is a sign of a healthy PRD, not an incomplete one. A PRD with no open
questions has usually papered over them.

## 8. What we're not doing

Explicit non-goals. Anything out of scope now that someone might reasonably assume is in — plus
anything deliberately deferred for later, so the decision is recorded rather than relitigated every
week.

This is the cheapest section to write and the one that saves the most time.

## Anti-patterns

The article names these as the signs a requirements process has gone wrong:

- The entire project is spec'd out in great detail before any engineering work begins
- Thorough review and iron-clad sign-off from all teams are required before work starts
- Designers and developers don't know when requirements have been updated
- Requirements are never updated at all, because everyone already signed off
- The product owner writes requirements without the team

The counter-practice: **never write a PRD alone.** Write it with a developer. Share it early, invite
comments, and treat other people's questions on it as the point rather than an interruption.
