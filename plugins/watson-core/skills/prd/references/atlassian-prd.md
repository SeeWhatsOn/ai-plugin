# The sections

Adapted from Atlassian's agile PRD guidance
(https://www.atlassian.com/agile/product-management/requirements), with two sections added where
their structure left a gap.

The governing idea: give "just enough" context to understand the project's requirements and its
impact on users. One page. Link out to the detail rather than inlining it. Expect to change it as
the team learns.

## 1. Project specifics

A small header block so a reader knows where this stands before reading a word of prose.

- **Participants** — product owner, the team, stakeholders. Name real people where you know them.
- **Reviewer** — a named developer. Atlassian's strongest advice is never to write a PRD alone, and
  an unfilled reviewer field is a finding, not a blank.
- **Status** — draft / on target / at risk / delayed / deferred.
- **Target release** — when it is projected to ship, or explicitly "not scheduled".
- **Last updated** — a date, so staleness is visible.

## 2. Actors

*Not in Atlassian's structure. Added because it is needed.*

Who this is for, where they work, and what they need from it. Every user story opens with an actor,
so if they have not been named the stories come out generic — "as a user" is a story nobody has
thought about yet.

A table with three columns: actor, where they live, what they need from this. Four or five rows is
usually the whole cast. If every story ends up with the same actor, there is probably more than one
kind of user and nobody has separated them yet.

## 3. Goals and business objectives

What the team is trying to achieve, and why the business cares. Get to the point; ambiguity here
gives everyone downstream room to assume something different.

### Success measures

The section teams most often skip, and the one that decides whether the work was worth doing.
Atlassian folds it into the user stories, where it gets lost — pull it out and make it explicit.

Each measure names what is being judged, where it stands today, and what "good" looks like. If
nobody knows the current value, "unknown" is the honest entry and it becomes an open question.

**Not everything has a number, and forcing one is worse than admitting it.** Early work is often
judged qualitatively — a demo that lands, a first customer who understands it without help. When
that is the case, say so plainly and describe the bar instead:

> Success for this release is demo acceptance, judged qualitatively. No adoption targets exist yet;
> inventing them here would be worse than leaving them open. The bar: a full round trip completes
> unaided, on a clean machine, with no console errors.

A three-column table with acceptance criteria typed into it is not a set of measures. Either the
measures are real, or the qualitative bar is stated. Both are honest; the hybrid is not.

## 4. Background and strategic fit

The motivation. What problem this solves, for whom, and how it connects to broader goals. This is
what lets someone six months from now understand why the work existed.

Keep it to the conclusion and link the working. If investigation established something — a live
header check, a spec read, a repo grep — the finding belongs here in a line, and the evidence
belongs behind a link.

There is a standing pressure to let architecture creep into this section, because the constraints
that motivate the work are often technical. A settled constraint is background; a chosen design is
the spec's job. When a design decision genuinely has to be recorded because it unblocks the work,
keep it to a sentence and let the spec do the rest.

## 5. Assumptions

What is being taken on faith about technology, business needs, or user behaviour. Stating these is
how you find the risky ones early — an unstated assumption is just a bug in the plan nobody has
noticed yet.

**Order them by risk and mark the worst one.** A flat list treats "the user has a browser" the same
as "this transport works at all". Say what would happen if the riskiest turns out to be false, so
the cost of being wrong is visible.

Revisit this section as the project runs. Assumptions turning out wrong is the usual reason a PRD
needs rewriting.

## 6. User stories

The core of the document. See `breakdown.md` for how to write them, how to group them into epics,
which ones need acceptance criteria, and how to show the build order.

## 7. User interaction and design

Wireframes, design explorations, flows. Link rather than embed. If there is no design yet, say
that and say what it blocks — that is a real finding, not an empty section.

## 8. Open questions

A table of things that need deciding or researching, so they are tracked rather than forgotten:
question, owner, needed by.

**Mark anything that blocks work.** A blocker with no owner is the single most useful thing a PRD
can surface.

Questions appearing here is a sign of a healthy PRD, not an incomplete one. A PRD with no open
questions has usually papered over them.

## 9. What we're not doing

Explicit non-goals: anything out of scope that someone might reasonably assume is in, plus anything
deliberately deferred, so the decision is recorded rather than relitigated every week.

**Separate impossible from deferred.** "We investigated and this cannot work, here is why, it will
not come back" is a permanent answer that saves the question being asked every quarter. "Not this
release, returns when there is a customer" is a different statement entirely. Collapsing them into
one list throws away the stronger claim.

This is the cheapest section to write and the one that saves the most time.

## 10. Spun off

*Not in Atlassian's structure. Added because work like this always turns something up.*

Investigating a product need reliably surfaces problems that are real but belong to someone else — a
bug in an adjacent system, a doc that describes a feature that does not exist, a dependency nobody
owns.

These need somewhere to go. Without a home they get written up as user stories in this PRD, where
they inflate the scope and get counted twice — once here and once wherever they actually get fixed.

One line each: what it is, where it belongs, and whether it blocks this work. Then file it there.

## Anti-patterns

The failure modes Atlassian names:

- The entire project is spec'd out in great detail before any engineering work begins
- Thorough review and iron-clad sign-off from all teams are required before work starts
- Designers and developers don't know when requirements have been updated
- Requirements are never updated at all, because everyone already signed off
- The product owner writes requirements without the team

The counter-practice: **never write a PRD alone.** Write it with a developer. Share it early, invite
comments, and treat other people's questions on it as the point rather than an interruption.
