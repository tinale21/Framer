import { Fragment, type ReactNode } from 'react';
import type { TextRun } from './types';

// Render runs as React nodes for the static (non-editing) text view, so
// the spans live inside React's tree and click / dblclick on the parent
// receive bubbled events normally. `flag` lets the accessibility Editor
// wash either the failing segments by color (fill-contrast) or the
// specific character range (spelling / grammar).
export type RunHighlight =
  | { kind: 'color'; color: string; textColor?: string }
  | { kind: 'range'; start: number; end: number };

export function renderRuns(
  text: string,
  runs: TextRun[] | undefined,
  flag?: RunHighlight,
): ReactNode {
  // Range highlight: walk through the text run-by-run, splitting at the
  // [start, end) boundary, wrapping the in-range chars with the issue class.
  if (flag?.kind === 'range') {
    const lo = Math.max(0, Math.min(flag.start, flag.end));
    const hi = Math.max(0, Math.max(flag.start, flag.end));
    const base = runs && runs.length > 0 ? runs : [{ text } as TextRun];
    const out: ReactNode[] = [];
    let pos = 0;
    let keyN = 0;
    const styleFor = (color?: string): React.CSSProperties | undefined => color ? { color } : undefined;
    for (const r of base) {
      const rStart = pos;
      const rEnd = pos + r.text.length;
      pos = rEnd;
      const before = Math.max(rStart, 0);
      const flagStart = Math.max(rStart, lo);
      const flagEnd = Math.min(rEnd, hi);
      const after = rEnd;
      // Slice indices within this run's text.
      const a = 0;
      const b = Math.max(0, flagStart - rStart);
      const c = Math.max(0, flagEnd - rStart);
      const d = r.text.length;
      const pushSeg = (seg: string, isFlagged: boolean) => {
        if (seg.length === 0) return;
        const cls = isFlagged ? 'text-run--issue' : undefined;
        const st = styleFor(r.color);
        if (st || cls) {
          out.push(<span key={keyN++} className={cls} style={st}>{seg}</span>);
        } else {
          out.push(<Fragment key={keyN++}>{seg}</Fragment>);
        }
      };
      if (rEnd <= lo || rStart >= hi) { pushSeg(r.text, false); continue; }
      pushSeg(r.text.slice(a, b), false);
      pushSeg(r.text.slice(b, c), true);
      pushSeg(r.text.slice(c, d), false);
      // silence unused-var warnings
      void before; void after;
    }
    return out;
  }
  // Color highlight (existing behavior).
  const target = flag?.kind === 'color' ? flag.color.toLowerCase() : undefined;
  const defaultColor = flag?.kind === 'color' ? flag.textColor?.toLowerCase() : undefined;
  const matches = (runColor?: string) => {
    if (!target) return false;
    const effective = (runColor ?? defaultColor ?? '').toLowerCase();
    return effective === target && (!!runColor || effective === defaultColor);
  };
  if (!runs || runs.length === 0) {
    if (matches(undefined)) return <span className="text-run--issue">{text}</span>;
    return text;
  }
  return runs.map((r, i) => {
    const flagged = matches(r.color);
    const cls = flagged ? 'text-run--issue' : undefined;
    if (r.color) return <span key={i} className={cls} style={{ color: r.color }}>{r.text}</span>;
    if (flagged) return <span key={i} className={cls}>{r.text}</span>;
    return <Fragment key={i}>{r.text}</Fragment>;
  });
}

// Serialize runs into HTML for setting a contentEditable's innerHTML.
export function runsToHtml(text: string, runs: TextRun[] | undefined): string {
  const list = runs && runs.length > 0 ? runs : [{ text } as TextRun];
  return list.map(r => {
    const escaped = escapeHtml(r.text);
    if (r.color) return `<span style="color:${r.color}">${escaped}</span>`;
    return escaped;
  }).join('');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Walk a contentEditable subtree and rebuild text + runs from its DOM.
// Color is inherited from any ancestor with an inline `color` style (or a
// legacy `<font color="...">` attribute, since `execCommand('foreColor')`
// may use either depending on `styleWithCSS`). `rgb(...)` values get
// normalized to hex so they're comparable everywhere.
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

// Translate the current document selection (when anchored inside
// `container`) to plain-text offsets. Returns null if there's no
// selection or it's outside the container.
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
  let acc = 0, done = false;
  const walk = (n: Node) => {
    if (done) return;
    if (n === node) {
      if (n.nodeType === Node.TEXT_NODE) acc += offset;
      else {
        for (let i = 0; i < offset && i < n.childNodes.length; i++) acc += textLength(n.childNodes[i]);
      }
      done = true; return;
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

// Apply a selection to plain-text offsets inside `container`. Walks the
// DOM and sets the document selection so subsequent `execCommand` calls
// operate on the right text.
export function setSelectionOffsets(container: HTMLElement, start: number, end: number) {
  const range = document.createRange();
  let startSet = false, endSet = false, acc = 0;
  const walk = (n: Node) => {
    if (startSet && endSet) return;
    if (n.nodeType === Node.TEXT_NODE) {
      const len = (n as Text).data.length;
      if (!startSet && acc + len >= start) { range.setStart(n, Math.max(0, start - acc)); startSet = true; }
      if (!endSet && acc + len >= end) { range.setEnd(n, Math.max(0, end - acc)); endSet = true; }
      acc += len; return;
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

export function normalizeColor(c: string): string {
  if (!c) return c;
  if (c.startsWith('#')) return c.toLowerCase();
  const m = c.match(/rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/);
  if (!m) return c;
  const r = parseInt(m[1], 10), g = parseInt(m[2], 10), b = parseInt(m[3], 10);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}
