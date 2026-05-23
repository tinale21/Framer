import type { TextRun } from './types';

// Apply `color` to the character range [start, end) of `text`, given an
// (optional) existing run list. Returns a fresh, normalized run array
// covering the full text. Adjacent runs that end up sharing the same color
// get merged so the structure stays minimal.
export function applyColorToRange(
  text: string,
  runs: TextRun[] | undefined,
  start: number,
  end: number,
  color: string,
): TextRun[] {
  const lo = Math.max(0, Math.min(start, end, text.length));
  const hi = Math.max(0, Math.max(start, end), 0);
  const upper = Math.min(hi, text.length);
  const base: TextRun[] = runs && runs.length > 0 ? runs : [{ text }];
  // Make sure the runs cover the full text length — if a prior run list was
  // shorter (shouldn't normally happen), pad with a default-color tail.
  const baseTotal = base.reduce((n, r) => n + r.text.length, 0);
  if (baseTotal < text.length) base.push({ text: text.slice(baseTotal) });
  const out: TextRun[] = [];
  let pos = 0;
  for (const r of base) {
    const rs = pos, re = pos + r.text.length;
    pos = re;
    if (re <= lo || rs >= upper) { out.push(r); continue; }
    const beforeLen = Math.max(0, lo - rs);
    const colorLen = Math.min(re, upper) - Math.max(rs, lo);
    const afterLen = Math.max(0, re - upper);
    if (beforeLen > 0) out.push({ ...r, text: r.text.slice(0, beforeLen) });
    if (colorLen > 0) out.push({ ...r, text: r.text.substr(beforeLen, colorLen), color });
    if (afterLen > 0) out.push({ ...r, text: r.text.slice(beforeLen + colorLen) });
  }
  return mergeRuns(out);
}

// Collapse adjacent runs with the same color so we don't accumulate cruft.
export function mergeRuns(runs: TextRun[]): TextRun[] {
  const out: TextRun[] = [];
  for (const r of runs) {
    if (r.text.length === 0) continue;
    const last = out[out.length - 1];
    if (last && last.color === r.color) last.text += r.text;
    else out.push({ ...r });
  }
  return out;
}

// Walk a contentEditable subtree and rebuild text + runs from its DOM.
// Color is inherited from any ancestor span with an inline `color` style;
// `rgb(...)` values get normalized to hex so they're comparable everywhere.
export function parseEditableToRuns(el: HTMLElement): { text: string; runs: TextRun[] } {
  const raw: TextRun[] = [];
  const walk = (n: Node, color: string | undefined) => {
    if (n.nodeType === Node.TEXT_NODE) {
      const text = (n as Text).data;
      if (text.length > 0) raw.push(color ? { text, color } : { text });
      return;
    }
    if (n.nodeType !== Node.ELEMENT_NODE) return;
    const elNode = n as HTMLElement;
    if (elNode.tagName === 'BR') { raw.push({ text: '\n' }); return; }
    const own = elNode.style?.color || (elNode.getAttribute && elNode.getAttribute('color')) || '';
    const next = own ? normalizeColor(own) : color;
    for (const c of Array.from(n.childNodes)) walk(c, next);
  };
  for (const c of Array.from(el.childNodes)) walk(c, undefined);
  const runs = mergeRuns(raw);
  return { text: runs.map(r => r.text).join(''), runs };
}

// Convert "rgb(r, g, b)" → "#rrggbb"; pass hex through unchanged.
export function normalizeColor(c: string): string {
  if (!c) return c;
  if (c.startsWith('#')) return c.toLowerCase();
  const m = c.match(/rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/);
  if (!m) return c;
  const r = parseInt(m[1], 10), g = parseInt(m[2], 10), b = parseInt(m[3], 10);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Serialize runs into HTML suitable for setting a contentEditable's innerHTML
// (or for read-only render via dangerouslySetInnerHTML). `flag` lets the
// accessibility Editor outline just the segments whose effective color
// matches the failing color (either via `run.color` or — when a run has no
// override — via `textColor`, the box's default).
export function runsToHtml(
  text: string,
  runs: TextRun[] | undefined,
  flag?: { color: string; textColor?: string },
): string {
  const list = runs && runs.length > 0 ? runs : [{ text } as TextRun];
  const target = flag?.color.toLowerCase();
  const defaultColor = flag?.textColor?.toLowerCase();
  return list.map(r => {
    const escaped = escapeHtml(r.text);
    const effective = (r.color ?? flag?.textColor ?? '').toLowerCase();
    const flagged = !!target && effective === target && (!!r.color || effective === defaultColor);
    const cls = flagged ? ' class="text-run--issue"' : '';
    if (r.color) return `<span${cls} style="color:${r.color}">${escaped}</span>`;
    if (flagged) return `<span${cls}>${escaped}</span>`;
    return escaped;
  }).join('');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Translate a (startContainer, startOffset)+(endContainer, endOffset) DOM
// selection — anchored inside `container` — to plain-text offsets.
export function getSelectionOffsets(container: HTMLElement): { start: number; end: number } | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) return null;
  const start = offsetOf(container, range.startContainer, range.startOffset);
  const end = offsetOf(container, range.endContainer, range.endOffset);
  return { start: Math.min(start, end), end: Math.max(start, end) };
}

function offsetOf(container: Node, node: Node, offset: number): number {
  let acc = 0;
  let done = false;
  const walk = (n: Node) => {
    if (done) return;
    if (n === node) {
      if (n.nodeType === Node.TEXT_NODE) acc += offset;
      else {
        for (let i = 0; i < offset && i < n.childNodes.length; i++) acc += textLength(n.childNodes[i]);
      }
      done = true;
      return;
    }
    if (n.nodeType === Node.TEXT_NODE) { acc += (n as Text).data.length; return; }
    for (const c of Array.from(n.childNodes)) { walk(c); if (done) return; }
  };
  walk(container);
  return acc;
}

function textLength(n: Node): number {
  if (n.nodeType === Node.TEXT_NODE) return (n as Text).data.length;
  let s = 0;
  for (const c of Array.from(n.childNodes)) s += textLength(c);
  return s;
}

// Restore selection to plain-text offsets inside `container` after a
// re-render. Used to keep the caret/highlight where the user expects after
// applying a color split to runs.
export function setSelectionOffsets(container: HTMLElement, start: number, end: number) {
  const range = document.createRange();
  let startSet = false, endSet = false;
  let acc = 0;
  const walk = (n: Node) => {
    if (startSet && endSet) return;
    if (n.nodeType === Node.TEXT_NODE) {
      const len = (n as Text).data.length;
      if (!startSet && acc + len >= start) { range.setStart(n, Math.max(0, start - acc)); startSet = true; }
      if (!endSet && acc + len >= end) { range.setEnd(n, Math.max(0, end - acc)); endSet = true; }
      acc += len;
      return;
    }
    for (const c of Array.from(n.childNodes)) { walk(c); if (startSet && endSet) return; }
  };
  walk(container);
  if (!startSet || !endSet) return;
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
}
