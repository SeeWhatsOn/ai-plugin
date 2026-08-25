# Where the PRD goes

## The constraint that shapes everything

**GitHub issues cannot render an HTML document.** Three separate mechanisms block it:

- GitHub's markdown pipeline **sanitises HTML**. `<style>` and `<script>` are stripped, and so are
  `class` and `id` attributes — so even inline-styled markup arrives unstyled and unstructured.
- `raw.githubusercontent.com` serves files as `text/plain` with `nosniff`, so linking the raw file
  gives the reader source code, not a page.
- `.html` is **not an accepted issue attachment type**. Images, PDFs, zips, `.md`, `.csv` and video
  are; HTML is not.

So the HTML file needs somewhere real to live, and the issue gets a Markdown stub that links to it.

## Choosing the destination

Work down this ladder and take the first one that applies. Confirm with the user before publishing
anywhere outward-facing.

**1. GitHub Pages, if the repo has it.** The cleanest answer — the file is in the repo, versioned
alongside the code, and renders at a stable URL. Check for an existing `docs/` folder served by
Pages, or a `gh-pages` branch:

```bash
gh api "repos/{owner}/{repo}/pages" --jq '.html_url // "not enabled"' 2>/dev/null
```

If Pages is on, put the file where Pages serves from — usually `docs/prd/<slug>.html` — and link the
published URL.

**2. Commit a PDF beside the HTML.** The only format GitHub renders natively in its own file
viewer — on any plan, private repositories included. One click, no download, no Pages. This is
usually the right answer for a private repo, and the only one when the org is on GitHub Free, where
Pages is available for public repositories only.

```bash
google-chrome --headless=new --disable-gpu --virtual-time-budget=15000 \
  --no-pdf-header-footer --print-to-pdf=<slug>.pdf "http://127.0.0.1:<port>/<slug>.html"
```

Serve the file over `http://` for this — the same local server `layout-check.md` already has you
running. Then **read the PDF back and look at it** before committing. The print stylesheet changes
the layout, so the PDF is a different rendering of the page, not a screenshot of it.

The HTML stays the source of truth and the PDF is generated from it. Say so in the repo's README and
regenerate the PDF whenever the HTML changes — two committed files that disagree is worse than one
file nobody can read. If the machine has no Chrome binary, skip the PDF and tell the user why rather
than failing.

Third-party viewers do not rescue a private repo: htmlpreview.github.io, raw.githack.com and jsDelivr
all fetch `raw.githubusercontent.com` unauthenticated, so every one of them 404s.

**3. Publish it as an Artifact.** No repo setup, renders immediately, and the URL is stable across
updates. Commit the HTML to the repo as the source of truth as well, so it is versioned. Use this
when Pages is off and the user does not want to turn it on.

**4. Commit it and link the blob URL.** The last resort. `github.com/{owner}/{repo}/blob/main/...`
shows the source with a "Raw" button; the reader downloads and opens it locally. Honest, but a worse
experience — say so rather than presenting it as equivalent.

Whichever you pick, the HTML file belongs in the repo. A PRD that only exists at a URL is a PRD that
disappears when someone tidies up.

## The issue stub

Short. Its job is to make someone click, and to survive on its own if they don't.

`assets/prd-issue-stub.md` has the shape. Keep it to the problem in a sentence or two, the shape of
the work, the one thing that is blocking, and the link. Everything else is on the page.

## No repo at all

If there is no repository, ask where it should live. Publishing as an Artifact and handing over the
link is usually right — but save the HTML file locally too, so the user owns a copy that does not
depend on anything.
