export type Scene =
  | 'base'
  | 'base-hover'
  | 'stack-tutorial-modal'
  | 'demo-1-stack-highlighted'
  | 'demo-2-cursor'
  | 'demo-3-drawing-frame'
  | 'demo-4-stack-created'
  | 'demo-5-insert-highlighted'
  | 'demo-6-place-element'
  | 'demo-6-rect-with-text'
  | 'demo-7-layout-prompt'
  | 'demo-7-layout-panel'
  | 'demo-8-restacked'
  | 'demo-completed-modal'
  | 'demo-final'
  | 'disabled-tutorial-modal'
  | 'tutorial-overlays-settings';

export type SceneSetter = (scene: Scene) => void;

// The demo stack's layout, driven by the demo-7 Layout panel. `distribute`
// is one of the panel's options (Start / Center / End / Space Between /
// Space Around / Space Evenly).
export type LayoutOpts = {
  type: 'stack' | 'grid';
  direction: 'h' | 'v';
  distribute: string;
  align: 'start' | 'center' | 'end';
  gap: string;
  // Grid-only: a masonry toggle, column / row counts, and separate
  // horizontal / vertical gaps.
  masonry: 'yes' | 'no';
  cols: string;
  rows: string;
  gapX: string;
  gapY: string;
  // padMode is a panel-only toggle (one field vs four); the stack always
  // uses the four side values, kept in sync while padMode is 'uniform'.
  padMode: 'uniform' | 'individual';
  padT: string;
  padR: string;
  padB: string;
  padL: string;
};

// A single styled segment within a text. When `runs` is set on a TextEl
// it holds an ordered list of these — concatenating the `text` fields
// yields the plain-text content. `color` overrides the TextEl's default
// color for just this segment; undefined falls back to the default.
export type TextRun = { text: string; color?: string };

// A text element placed on the canvas: a unique key, a free position,
// its typed content, and whether it's been dropped into the demo stack.
// Typography fields are optional — defaults are applied at render time.
export type TextEl = {
  key: number;
  x: number;
  y: number;
  text: string;
  inStack: boolean;
  font?: string;
  weight?: number;
  size?: number;
  lineHeight?: number;       // undefined means "Auto"
  letterSpacing?: number;    // px; undefined means 0
  align?: 'left' | 'center' | 'right';
  color?: string;            // hex; undefined means the default text color
  width?: number;            // explicit width in px (set by resize); undefined means auto-fit
  runs?: TextRun[];          // per-segment color overrides; absent = uniform color
  bullet?: boolean;          // render with the list-style bullet icon prefix
  effect?: 'milk'; // text-effect preset (CSS class)
  // Demo-seeded placeholder ("Text") that should be cleared as soon as
  // the user enters edit mode. Otherwise the contentEditable inherits
  // the placeholder's width and wraps when typing past 4 chars.
  placeholder?: boolean;
};

// A demo element instance: a unique key, the element type, a free
// position, and whether it's been dropped into the stack. `src` holds a
// user-uploaded image's data URL (set when the element is a picked file).
export type DemoEl = {
  key: number;
  id: string;
  x: number;
  y: number;
  inStack: boolean;
  src?: string;
  // On-screen width to render at while free — set when pulled out of the
  // stack so the element keeps the size it had inside it.
  width?: number;
};

// A vector shape drawn on the canvas with the Vector tool. The geometric
// shapes carry a bbox; Path carries its anchor points (drawn click by click)
// and a closed flag. All coordinates live in the frame-card's own
// (un-zoomed) space so shapes pan and zoom with the frame. Both kinds share
// a fill (hex string or null = no fill) and an optional stroke.
export type VectorKind = 'rectangle' | 'oval' | 'polygon' | 'star' | 'path';
export type Pt = { x: number; y: number };
export type VectorFill = string | null;
export type VectorStroke = { color: string; width: number } | null;
type VectorStyle = { fill: VectorFill; stroke: VectorStroke };
type InStackFlag = { inStack: boolean };
export type VectorEl =
  | ({ key: number; kind: 'rectangle' | 'oval' | 'polygon' | 'star';
       x: number; y: number; w: number; h: number } & VectorStyle & InStackFlag)
  | ({ key: number; kind: 'path'; points: Pt[]; closed: boolean } & VectorStyle & InStackFlag);

// An accessibility issue surfaced by the Editor (right-panel) — currently
// only fill-contrast checks against the white canvas, with three suggested
// fixes (target contrast ratios 21:1, 7:1, 4.5:1) that preserve hue + alpha.
export type Fix = { color: string; ratio: number };
// Where the failing color lives. The Editor treats each vector kind and
// text as its own bucket, so an "Add to Exceptions" for an oval doesn't
// silence the same color on a star, a rectangle, or a text label.
export type IssueTarget = VectorKind | 'text';
// One contrast issue OR one spelling issue. Kept as a single shape with
// per-kind optional fields so the rest of the Editor pipeline can stay
// kind-agnostic; the panel + apply both switch on `kind`.
export type Issue = {
  id: string;
  targetKind: IssueTarget;
  targetKey: number;
  kind: 'fill-contrast' | 'spelling' | 'grammar';
  // fill-contrast only
  currentColor?: string;
  currentRatio?: number;
  fixes?: Fix[];
  // spelling / grammar — `word` is the matched substring in t.text,
  // `offset` its position, `suggestions` the replacement(s). For
  // grammar, `label` describes which rule fired (e.g. "Duplicate word").
  word?: string;
  offset?: number;
  suggestions?: string[];
  label?: string;
};

// The bbox of any shape in frame-card space — boxes carry one directly; for
// paths it's derived from the anchor points.
export function shapeBox(s: VectorEl): { x: number; y: number; w: number; h: number } {
  if (s.kind === 'path') {
    if (s.points.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
    const xs = s.points.map(p => p.x), ys = s.points.map(p => p.y);
    const minX = Math.min(...xs), minY = Math.min(...ys);
    return { x: minX, y: minY, w: Math.max(...xs) - minX, h: Math.max(...ys) - minY };
  }
  return { x: s.x, y: s.y, w: s.w, h: s.h };
}
