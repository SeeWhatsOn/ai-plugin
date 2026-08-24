# Breaking a requirement down

## The ladder

```
outcome ──→ epic ──→ story ──→ acceptance criteria
```

Each level answers a different question:

| Level | Question it answers | Test that it is at the right level |
|---|---|---|
| **Outcome** | What changes in the world? | Stated as a change for users or the business, not a feature. |
| **Epic** | What coherent slice delivers part of it? | Could be cut entirely and the others still make sense. |
| **Story** | What can one user do that they couldn't before? | Deliverable and demonstrable on its own. |
| **Acceptance criteria** | How do we know it's done? | Someone else could verify it without asking you. |

## Writing stories

Format:

> As a **&lt;actor&gt;**, I want **&lt;capability&gt;**, so that **&lt;benefit&gt;**

Example:

> As a mobile bank customer, I want to see the balance on my accounts, so that I can make better
> informed decisions about my spending.

Be extensive. Cover the whole feature, including the unglamorous parts — empty states, errors,
permissions, the first-run experience, what an admin sees. Teams under-write these and then discover
them mid-sprint.

**The actor must be a real kind of person.** "As a user" is a story that hasn't been thought about
yet. If every story has the same actor, the product probably has more than one kind of user and
nobody has separated them.

**The benefit must not restate the capability.** "So that I can see my balance" after "I want to see
my balance" is circular — it means the reason hasn't been worked out. Push until the benefit is
something the person actually cares about.

**Watch for tasks wearing a story costume.** "As a developer, I want to add a database index, so
that queries are faster" is a task. Real stories describe value to someone outside the team.
Technical work is legitimate, but it belongs in the spec, not the PRD — or it belongs reframed
around whoever feels the slowness.

## Acceptance criteria

One story, two to five criteria. Each one checkable.

Given/When/Then works well when behaviour is conditional:

> **Given** an account with a pending transaction, **when** the customer opens the account view,
> **then** the pending amount is shown separately from the available balance.

A plain checklist is fine when it isn't:

> - Balance refreshes when the view is opened
> - Shows a placeholder rather than 0.00 while loading
> - Shows the last-known value with a timestamp when offline

"Works well", "is fast", "looks good" are not criteria. If performance matters, name the number.

## Prioritising

MoSCoW, per story:

| | Meaning |
|---|---|
| **Must** | Ship is meaningless without it. |
| **Should** | Painful to omit, but shippable without. |
| **Could** | Do it if there's room. |
| **Won't** | Not this release — goes to "What we're not doing". |

Two things to watch. If nearly everything is a Must, no prioritisation has happened — push back and
make the trade-off real. And **Won't is not the bin**: it is a record of a deliberate decision, so
each one should say briefly why, and whether it might return later.
