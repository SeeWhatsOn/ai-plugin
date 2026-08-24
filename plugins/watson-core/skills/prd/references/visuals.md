# Visuals

The PRD is HTML so that structure can be seen rather than read. Every visual below is built from
data the PRD already contains — that is the test for whether it belongs.

## What to use where

| PRD content | Visual | Why this one |
|---|---|---|
| **Actors** | Table: actor · where they work · what they need | Four columns of scannable rows beats four paragraphs of persona prose. |
| **Success measures** | Table: measure · today · target | Three columns force the honest question — what is it *now*? |
| **Assumptions** | Ordered list, riskiest first, with the riskiest visually marked | The ranking is the information. A chart would add nothing. |
| **Story counts by priority** | One stacked horizontal bar: Must / Should / Could | Shows at a glance whether prioritisation actually happened. |
| **Stories within an epic** | Table for the list, cards for the ones with criteria | The table is the index; the cards are the detail. |
| **Epic dependencies** | Mermaid `flowchart LR` | The only reliable way to show that Epic C blocks A and B. |
| **Scope** | Two-column split: in this release / not doing | Putting them side by side is what makes the boundary feel real. |
| **Open questions** | Table: question · owner · needed by, blockers marked | A blocker with no owner is the most useful thing a PRD can surface. |
| **Sequencing, when real dates exist** | Mermaid `gantt`, or a simple milestone row | Only when the dates are real. "Q3-ish" is not a date. |

## Charting rules

`dataviz` has the full method — load it before writing any chart. The parts that bite hardest in a
PRD:

- **One page, few charts.** Two or three earn their place. More and they stop being signal.
- **Real counts only.** Story counts, priority spread, epic dependencies — these come out of the
  document itself and cannot be wrong.
- **Direct-label the values.** A PRD reader will not hover, and they may be reading a screenshot of
  it in a meeting.
- **Both themes.** The page will be opened in whatever the reader's browser is set to.

## What not to chart

These are the ones that look like insight and are not:

- **Confidence, impact or effort scores.** Nobody measured them. A number with a decimal point on it
  reads as evidence, and inventing one poisons the credibility of every real number on the page.
- **Burndowns, velocity, projected timelines.** The work has not started. There is no data.
- **Percentage complete on a PRD.** A PRD is not a project tracker; that number will be wrong within
  a day and nobody will fix it.
- **Anything with one data point.** That is a sentence. Write the sentence.

When there is no data, say what is unknown. "No adoption target has been set — see open questions"
is stronger than a chart of numbers someone made up, and a reader can tell the difference
immediately.
