# Render it before you publish

A PRD page can have valid HTML, balanced braces and a stylesheet that survives publishing
intact — and still lay out wrong. Nothing catches that except a browser.

Publishing first and fixing after is not the same thing. The user reads the broken version,
and every fix costs a republish and their attention.

## The routine

Serve the file and run one scan against it:

```bash
cd <dir-with-the-html> && nohup python3 -m http.server 8931 >/dev/null 2>&1 &
```

Navigate a browser tab to `http://127.0.0.1:8931/<file>.html`, run the scan below, then kill
the server. `file://` is blocked by the browser tools, which is why this needs a local server.

Do this on the **local file**, not the published artifact. The artifact viewer locks
`overflow:hidden` on the host page and scrolls inside a cross-origin iframe, so you cannot
scroll or script it from outside. A page that looks truncated there is the viewer, not the page.

## The scan

```js
// 1. SCATTERED CONTENT — flex/grid containers that also hold bare text nodes.
//    Every element child AND every loose text run becomes its own item.
const scattered = [...document.querySelectorAll('*')]
  .filter(el => /flex|grid/.test(getComputedStyle(el).display)
             && el.children.length > 0
             && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
  .map(el => el.tagName.toLowerCase() + '.' + el.className);

// 2. COLLISIONS — statically positioned siblings whose boxes overlap.
const overlaps = [];
document.querySelectorAll('body *').forEach(el => {
  const k = [...el.children].filter(c => getComputedStyle(c).position === 'static');
  for (let a = 0; a < k.length; a++) for (let b = a + 1; b < k.length; b++) {
    const p = k[a].getBoundingClientRect(), q = k[b].getBoundingClientRect();
    if (p.width && q.width && p.left < q.right - 1 && q.left < p.right - 1
        && p.top < q.bottom - 1 && q.top < p.bottom - 1)
      overlaps.push(`${k[a].tagName}/${k[b].tagName} in ${el.tagName}.${el.className}`);
  }
});

// 3. OVERFLOW — the body must never scroll sideways.
const wide = [...document.querySelectorAll('body *')]
  .filter(e => e.getBoundingClientRect().width > innerWidth + 1)
  .map(e => e.tagName + '.' + e.className);

JSON.stringify({ scattered, overlaps: [...new Set(overlaps)], wide,
  hOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth });
```

**Check 1 must return `[]`.** It has no false positives.

**Checks 2 and 3 need reading.** Two known false positives in check 2: nested SVG `<g>`/`<rect>`/
`<text>` legitimately overlap, and two inline elements straddling a line wrap report an overlap
because an inline rect is the union of its line boxes. Anything else is real.

Then look at the page. Rendering catches what geometry cannot — a caption that contradicts what
it labels, a legend in the wrong order, a diagram whose arrows say something the text does not.

## Named failure modes

**Inline content inside a grid container.** The one that keeps happening. This looks reasonable
and is wrong:

```css
ol.risk li{ display:grid; grid-template-columns:1.5rem 1fr; }  /* WRONG */
```

```html
<li><span class="flag">Riskiest</span><strong>[ASSUMPTION]</strong> The add-on can hold a
    <code>127.0.0.1</code> socket. Unverified.</li>
```

The `<span>`, the `<strong>`, the `<code>` and each bare text run become **six separate grid
items**, dealt across two columns. One sentence, shredded.

Use grid only where every child is a block you placed deliberately. To hang a marker off text,
take it out of flow instead:

```css
ol.risk li{ position:relative; padding-left:2.2rem; }
ol.risk li::before{ content:counter(r); position:absolute; left:0; top:.15rem; }
```

**A ramp that inverts between themes.** Sequential palettes flip direction for contrast — in
light mode Must is darkest, in dark mode it is lightest. So never write a caption that names a
direction ("darker is higher priority"). Direct-label the segments and the caption is free to
say something useful.

**A diagram label written by hand.** Absolute `x`/`y` in an inline SVG is a guess until measured.
Check every `<text>` against every `<rect>`; if a label collides, delete it — the box and the
figcaption usually already carry the relation.
