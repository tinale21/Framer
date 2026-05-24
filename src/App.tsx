import { useState, useEffect, useRef, useCallback, useMemo, type ChangeEvent } from 'react';
import TopBar from './components/TopBar';
import LeftSidebar from './components/LeftSidebar';
import Canvas from './components/Canvas';
import RightSidebar from './components/RightSidebar';
import BottomToolbar from './components/BottomToolbar';
import BasePopout from './components/BasePopout';
import StackTutorialModal from './components/modals/StackTutorialModal';
import StackDemoCompletedModal from './components/modals/StackDemoCompletedModal';
import DisabledStackTutorialModal from './components/modals/DisabledStackTutorialModal';
import TutorialOverlaysModal from './components/modals/TutorialOverlaysModal';
import EditorSettingsModal, { DEFAULT_EDITOR_SETTINGS, type EditorSettings } from './components/modals/EditorSettingsModal';
import {
  hexToHsva, hsvaToHex, hsvToHex, hexToRgb, vForContrast, contrastOverWhite,
} from './components/ColorPicker';
import type {
  Scene, DemoEl, TextEl, TextRun, LayoutOpts, VectorKind, VectorEl, Pt,
  VectorFill, VectorStroke, Issue,
} from './types';
import { setSelectionOffsets } from './textRuns';
import WORDLIST from './data/words.json';

const SHOW_POPOUT: Scene[] = [
  'base-hover',
];

export type CanvasSelection = 'none' | 'frame' | 'canvas';

// Rendered height of each element type at the free-element width (150px).
const EL_HEIGHTS: Record<string, number> = {
  gif: 113, video: 84, youtube: 84, vimeo: 84, spotify: 43, applemusic: 56, mp3: 31,
};
const EL_GAP = 12;

// Curated overrides — these win over Levenshtein so the most common
// typos always suggest the conventional fix.
const TYPO_OVERRIDES: Record<string, string[]> = {
  teh: ['the'],
  recieve: ['receive'],
  occured: ['occurred'],
  seperate: ['separate'],
  definately: ['definitely'],
  untill: ['until'],
  wierd: ['weird'],
  beleive: ['believe'],
  thier: ['their', "they're"],
  alot: ['a lot'],
  goverment: ['government'],
  enviroment: ['environment'],
  occassion: ['occasion'],
  neccessary: ['necessary'],
  embarass: ['embarrass'],
  accomodate: ['accommodate'],
  begining: ['beginning'],
  calender: ['calendar'],
  freind: ['friend'],
  recomend: ['recommend'],
};

// English wordlist (lowercase, 3-12 chars, alphabetic-only — filtered
// from /usr/share/dict/words ≈197K entries). Loaded once into a Set for
// O(1) lookup; suggestions for unknown words use a length-bucketed
// Levenshtein scan so we don't compare against all 197K each time.
const KNOWN_WORDS: Set<string> = new Set(WORDLIST as string[]);
const WORDS_BY_LEN: Map<number, string[]> = (() => {
  const m = new Map<number, string[]>();
  for (const w of WORDLIST as string[]) {
    const len = w.length;
    let arr = m.get(len);
    if (!arr) { arr = []; m.set(len, arr); }
    arr.push(w);
  }
  return m;
})();

// Optimal-string-alignment edit distance (insert / delete / substitute /
// adjacent-transpose). Needs the full DP matrix so the transposition
// check can read `d[i-2][j-2]`. Capped — returns cap+1 early when the
// minimum row exceeds the budget.
function editDistance(a: string, b: string, cap: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  const m = a.length, n = b.length;
  const d: number[][] = new Array(m + 1);
  for (let i = 0; i <= m; i++) {
    d[i] = new Array(n + 1);
    d[i][0] = i;
  }
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      let v = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1
        && a.charCodeAt(i - 1) === b.charCodeAt(j - 2)
        && a.charCodeAt(i - 2) === b.charCodeAt(j - 1)) {
        v = Math.min(v, d[i - 2][j - 2] + cost);
      }
      d[i][j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > cap) return cap + 1;
  }
  return d[m][n];
}

function suggestCorrections(word: string, max = 3): string[] {
  const overrides = TYPO_OVERRIDES[word];
  if (overrides) return overrides;
  // Scan candidates with length within ±2 of the word, score by edit distance.
  const scored: { word: string; d: number }[] = [];
  for (let dl = -2; dl <= 2; dl++) {
    const bucket = WORDS_BY_LEN.get(word.length + dl);
    if (!bucket) continue;
    for (const w of bucket) {
      const d = editDistance(word, w, 2);
      if (d <= 2) scored.push({ word: w, d });
    }
  }
  // Sort by edit distance, then prefer same-length candidates (less
  // jarring than 1-char drops), then alphabetical.
  scored.sort((a, b) => {
    if (a.d !== b.d) return a.d - b.d;
    const dlA = Math.abs(a.word.length - word.length);
    const dlB = Math.abs(b.word.length - word.length);
    if (dlA !== dlB) return dlA - dlB;
    return a.word.localeCompare(b.word);
  });
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of scored) {
    if (seen.has(s.word)) continue;
    seen.add(s.word);
    out.push(s.word);
    if (out.length >= max) break;
  }
  return out;
}

// Rule-based grammar scanner. Each entry returns matches with the
// replacement to apply and a short rule label for the panel.
type GrammarHit = { match: string; offset: number; replacement: string; label: string };
function scanGrammar(text: string): GrammarHit[] {
  const out: GrammarHit[] = [];
  const push = (m: RegExpExecArray, replacement: string, label: string, matchOverride?: { text: string; offset: number }) => {
    out.push({
      match: matchOverride?.text ?? m[0],
      offset: matchOverride?.offset ?? m.index,
      replacement,
      label,
    });
  };
  const run = (re: RegExp, fn: (m: RegExpExecArray) => void) => {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) fn(m);
  };
  // Duplicate adjacent word ("the the").
  run(/\b(\w+)\s+\1\b/gi, m => push(m, m[1], 'Duplicate word'));
  // "could/should/would/might/must of" → "... have".
  run(/\b(could|should|would|might|must)\s+of\b/gi, m => push(m, `${m[1]} have`, "'of' → 'have'"));
  // "a" before a vowel-sounding word.
  run(/\b(a)\s+([aeiouAEIOU]\w*)/g, m => push(m, `an ${m[2]}`, "'a' → 'an'"));
  // "an" before an obvious consonant.
  run(/\ban\s+([bcdfgjklmnpqrtvwxz]\w*)/gi, m => push(m, `a ${m[1]}`, "'an' → 'a'"));
  // Double (or more) spaces collapsed to one.
  run(/ {2,}/g, m => push(m, ' ', 'Double space'));
  // Standalone lowercase "i" → "I".
  run(/(^|[\s.,!?;:"'(])(i)(?=[\s.,!?;:"')]|$)/g, m => {
    const before = m[1];
    const idx = m.index + before.length;
    out.push({ match: 'i', offset: idx, replacement: 'I', label: "'i' → 'I'" });
  });
  // First non-space character of the whole text should be uppercase.
  const firstAlpha = text.match(/^\s*([a-z])/);
  if (firstAlpha) {
    const idx = firstAlpha[0].length - 1;
    out.push({ match: firstAlpha[1], offset: idx, replacement: firstAlpha[1].toUpperCase(), label: 'Capitalize start' });
  }
  // Lowercase letter immediately after sentence-ending punctuation + space.
  run(/[.!?]\s+[a-z]/g, m => {
    const ch = m[0][m[0].length - 1];
    push(m, m[0].slice(0, -1) + ch.toUpperCase(), 'Capitalize sentence');
  });
  // Space before `, . ! ? ; :` ("hello ." → "hello.").
  run(/ +([,.!?;:])/g, m => push(m, m[1], 'Space before punctuation'));
  // Letter immediately after `, . ! ? : ;` with no space.
  run(/[.,!?:;][a-zA-Z]/g, m => push(m, `${m[0][0]} ${m[0][1]}`, 'Missing space'));
  // Repeated `! ! !` / `? ? ?` / `..` (not `...`).
  run(/!{2,}/g, m => push(m, '!', 'Repeated punctuation'));
  run(/\?{2,}/g, m => push(m, '?', 'Repeated punctuation'));
  run(/\.{2}(?!\.)/g, m => push(m, '.', 'Repeated punctuation'));
  // De-dupe / stable order by offset.
  out.sort((a, b) => a.offset - b.offset);
  // Keep only the first hit at any given offset (rules can overlap).
  const seen = new Set<number>();
  return out.filter(h => { if (seen.has(h.offset)) return false; seen.add(h.offset); return true; });
}

// True when a word should be ignored by spellcheck — known words,
// numbers / mixed-alphanumerics, very short words (< 3 chars), and
// pure-uppercase tokens (acronyms).
function isLikelyMisspelled(raw: string): boolean {
  if (raw.length < 3) return false;
  if (raw === raw.toUpperCase()) return false;       // acronyms / yelling
  const lower = raw.toLowerCase();
  if (KNOWN_WORDS.has(lower)) return false;
  if (TYPO_OVERRIDES[lower]) return true;
  // Numbers, mixed alphanumeric, or contains `'` after the apostrophe
  // stripped — skip if everything is alpha.
  if (!/^[a-zA-Z]+$/.test(raw)) return false;
  return true;
}

// Replace `length` chars at `offset` in `t.text` with `replacement`,
// keeping `t.runs` (if any) consistent. The replacement chars take on
// the color of whichever run contained the start of the replacement —
// for simple in-run typos this preserves the rich text exactly; for
// edits that span run boundaries the start run's color wins.
function spliceTextAndRuns(t: TextEl, offset: number, length: number, replacement: string): TextEl {
  const nextText = t.text.slice(0, offset) + replacement + t.text.slice(offset + length);
  if (!t.runs || t.runs.length === 0) return { ...t, text: nextText };
  const out: TextRun[] = [];
  let pos = 0;
  for (const r of t.runs) {
    const rEnd = pos + r.text.length;
    if (rEnd <= offset) { out.push(r); pos = rEnd; continue; }
    if (pos >= offset + length) { out.push(r); pos = rEnd; continue; }
    const before = r.text.slice(0, Math.max(0, offset - pos));
    const after = r.text.slice(Math.max(0, offset + length - pos));
    const isStart = pos <= offset && rEnd > offset;
    const newRunText = before + (isStart ? replacement : '') + after;
    if (newRunText.length > 0) out.push({ ...r, text: newRunText });
    pos = rEnd;
  }
  // Merge adjacent runs with the same color, drop empties.
  const merged: TextRun[] = [];
  for (const r of out) {
    if (r.text.length === 0) continue;
    const last = merged[merged.length - 1];
    if (last && last.color === r.color) last.text += r.text;
    else merged.push({ ...r });
  }
  return { ...t, text: nextText, runs: merged.length > 0 ? merged : undefined };
}

export default function App() {
  const [scene, setScene] = useState<Scene>('base');
  const [selection, setSelection] = useState<CanvasSelection>('none');
  const [darkMode, setDarkMode] = useState(false);
  // Every picked element is its own instance (keyed), so dropping more
  // never replaces an earlier one. selection / callout reference the key.
  const [demoElements, setDemoElements] = useState<DemoEl[]>([]);
  const [selectedEl, setSelectedEl] = useState<number | null>(null);
  const [calloutEl, setCalloutEl] = useState<number | null>(null);
  const elKeyRef = useRef(0);
  // The file input lives here (App never unmounts) so it survives the OS
  // file dialog — the Element popout would unmount mid-dialog and lose it.
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Text tool: textMode arms it, a canvas click drops a text box that the
  // user types into; editingText is the key of the box being edited.
  const [textMode, setTextMode] = useState(false);
  const [texts, setTexts] = useState<TextEl[]>([]);
  const [editingText, setEditingText] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<number | null>(null);
  const textKeyRef = useRef(0);
  // Vector tool: the Vector popout arms a shape kind (`vectorTool`); the next
  // drag on the canvas draws it. Shapes persist on the canvas like text.
  const [vectorTool, setVectorTool] = useState<VectorKind | null>(null);
  const [shapes, setShapes] = useState<VectorEl[]>([]);
  const [selectedShape, setSelectedShape] = useState<number | null>(null);
  // Which cell inside the active recommendation component is currently
  // selected (so handles render around just that cell, not the whole
  // component). Null = nothing selected. Cleared by the same click-out
  // helpers that clear other selections.
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const shapeKeyRef = useRef(0);
  // Path tool: in-progress anchor points while drafting (click to add). Lives
  // in App so the keydown handler can pop the last point on Delete.
  const [pathDraft, setPathDraft] = useState<Pt[]>([]);
  // Undo / redo history of the canvas content. Stored as JSON snapshots
  // (lives in refs so it doesn't trigger re-renders).
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(-1);
  const skipHistoryRef = useRef(false);
  const lastSnapshotRef = useRef('');
  // Switching away from the Path tool (e.g. Escape) drops the draft.
  if (vectorTool !== 'path' && pathDraft.length > 0) setPathDraft([]);
  // The demo stack's layout, set by the demo-7 Layout panel. Defaults match
  // the stack's resting look — a vertical, centered column.
  const [layoutOpts, setLayoutOpts] = useState<LayoutOpts>({
    type: 'stack', direction: 'v', distribute: 'Center', align: 'center',
    gap: '8', masonry: 'no', cols: '2', rows: '2', gapX: '10', gapY: '10',
    padMode: 'uniform', padT: '8', padR: '8', padB: '8', padL: '8',
  });
  // Once the user adjusts a layout control, the demo-7 spotlight/highlight
  // turns off — the panel is then used like the normal editor.
  const [layoutTouched, setLayoutTouched] = useState(false);
  if (scene !== 'demo-7-layout-panel' && layoutTouched) setLayoutTouched(false);
  const changeLayout = (next: LayoutOpts) => {
    setLayoutOpts(next);
    setLayoutTouched(true);
  };
  // The demo stack can be selected (in the layout-panel step) so the user
  // can delete it with the keyboard.
  const [stackSelected, setStackSelected] = useState(false);
  // Where the demo lands after the completion flow — `demo-final` keeps the
  // user's canvas, `base` is the blank editor.
  const [demoEndScene, setDemoEndScene] = useState<Scene>('base');
  // When the stack tutorial is turned off, the "Using Stacks" popup and the
  // guided steps are skipped — clicking Stack goes straight to the
  // drag-to-create step so the user still draws the stack themselves.
  const [stackTutorialDisabled, setStackTutorialDisabled] = useState(false);
  if (scene === 'stack-tutorial-modal' && stackTutorialDisabled) setScene('demo-2-cursor');
  // The "Disabled Stacks Tutorial" popup is a confirmation — whenever it's
  // shown the tutorial is actually off (this also covers the "Using Stacks"
  // popup's "Don't Show Again" button, which routes straight here).
  if (scene === 'disabled-tutorial-modal' && !stackTutorialDisabled) setStackTutorialDisabled(true);
  // The stack stays selectable in the layout-panel step, the finished canvas,
  // and — with the tutorial off — while placing elements into it.
  const stackSelectScene = scene === 'demo-7-layout-panel' || scene === 'demo-final'
    || (scene === 'demo-6-place-element' && stackTutorialDisabled);
  if (!stackSelectScene && stackSelected) setStackSelected(false);

  const pickElement = (id: string, src?: string) => {
    const key = elKeyRef.current++;
    // A new element drops in the workspace just left of the frame (negative x
    // in the frame's own space), so the user drags it onto the canvas. Stack
    // each one below the previous so picking several never piles them up.
    const y = demoElements
      .filter(el => !el.inStack)
      .reduce((bottom, el) => bottom + (EL_HEIGHTS[el.id] ?? 90) + EL_GAP, 300);
    setDemoElements(prev => [
      ...prev,
      { key, id, x: -165, y, inStack: false, src },
    ]);
    setSelectedEl(key);
    setSelectedText(null); // only one thing is selected at a time
    setEditingText(null);
    setSelectedShape(null);
    setVectorTool(null);
    // The callout is only for the guided demo step — picking an element
    // from the highlighted Insert section.
    setCalloutEl(scene === 'demo-5-insert-highlighted' ? key : null);
    setScene('demo-6-place-element');
  };
  const requestImageUpload = () => fileInputRef.current?.click();
  const handleImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file later
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') pickElement('image', reader.result);
    };
    reader.readAsDataURL(file);
  };
  const moveElement = useCallback((key: number, x: number, y: number, width?: number) => {
    setDemoElements(prev => prev.map(el => (el.key === key
      ? { ...el, x, y, ...(width !== undefined ? { width } : {}) }
      : el)));
  }, []);
  const dropElementInStack = useCallback((key: number) => {
    setDemoElements(prev => prev.map(el => (el.key === key ? { ...el, inStack: true } : el)));
  }, []);
  const popElementFromStack = useCallback((key: number) => {
    setDemoElements(prev => prev.map(el => (el.key === key ? { ...el, inStack: false } : el)));
  }, []);
  // Selecting an element clears any text selection — only one at a time.
  const selectEl = useCallback((key: number | null) => {
    setSelectedEl(key);
    setSelectedText(null);
    setEditingText(null);
    setStackSelected(false);
    setSelectedShape(null);
  }, []);
  // Selecting the whole stack clears any element / text selection — only
  // one thing is selected (and so deletable) at a time.
  const selectStack = useCallback(() => {
    setStackSelected(true);
    setSelectedEl(null);
    setSelectedText(null);
    setEditingText(null);
    setSelectedShape(null);
  }, []);
  // Clears all placed content — used by Discard and the keyboard delete.
  const clearCanvasState = useCallback(() => {
    setStackSelected(false);
    setSelectedEl(null);
    setSelectedText(null);
    setEditingText(null);
    setDemoElements([]);
    setTexts([]);
    setShapes([]);
    setSelectedShape(null);
  }, []);
  // Finishing the demo: Save keeps the canvas (ends at `demo-final`), Discard
  // clears it (ends at `base`). When "Disable stack tutorial" was ticked, both
  // detour through the disabled-tutorial popup, which then lands on that end.
  const finishDemo = useCallback((save: boolean) => {
    const end: Scene = save ? 'demo-final' : 'base';
    if (!save) clearCanvasState();
    setDemoEndScene(end);
    setScene(stackTutorialDisabled ? 'disabled-tutorial-modal' : end);
  }, [clearCanvasState, stackTutorialDisabled]);

  const armText = () => { setTextMode(m => !m); setVectorTool(null); };
  const placeText = useCallback((x: number, y: number) => {
    const key = textKeyRef.current++;
    setTexts(prev => [...prev, { key, x, y, text: '', inStack: false }]);
    setEditingText(key);
    setSelectedText(key);
    setSelectedEl(null); // only one thing is selected at a time
    setSelectedShape(null);
    setTextMode(false); // the text tool is one-shot, like Figma
  }, []);
  // Arming a vector tool from the Vector popout disarms the text tool; the
  // next drag on the canvas draws the shape.
  const armVector = useCallback((kind: VectorKind) => {
    setVectorTool(kind);
    setTextMode(false);
  }, []);
  // Drawing finishes here — the new shape is stored and selected, and the
  // tool disarms (one-shot, like the text tool).
  const createShape = useCallback(
    (kind: 'rectangle' | 'oval' | 'polygon' | 'star',
     x: number, y: number, w: number, h: number) => {
      const key = shapeKeyRef.current++;
      // Default look matches Framer: grey fill, no stroke.
      setShapes(prev => [
        ...prev,
        { key, kind, x, y, w, h, fill: '#cccccc', stroke: null, inStack: false },
      ]);
      setSelectedShape(key);
      setSelectedEl(null);
      setSelectedText(null);
      setEditingText(null);
      setStackSelected(false);
      setVectorTool(null);
    },
    [],
  );
  // Path is committed once the user closes it (clicking the first point) or
  // finishes it open (clicking the last point). Default look: thin grey
  // stroke, no fill — fill can be added from the Shape panel.
  const createPath = useCallback((points: Pt[], closed: boolean) => {
    const key = shapeKeyRef.current++;
    setShapes(prev => [
      ...prev,
      { key, kind: 'path', points, closed,
        fill: null, stroke: { color: '#aaaaaa', width: 1 }, inStack: false },
    ]);
    setSelectedShape(key);
    setSelectedEl(null);
    setSelectedText(null);
    setEditingText(null);
    setStackSelected(false);
    setVectorTool(null);
    setPathDraft([]);
  }, []);
  const addPathPoint = useCallback((p: Pt) => {
    setPathDraft(prev => [...prev, p]);
  }, []);
  const setShapeFill = useCallback((key: number, fill: VectorFill) => {
    setShapes(prev => prev.map(s => (s.key === key ? { ...s, fill } : s)));
  }, []);
  const setShapeStroke = useCallback((key: number, stroke: VectorStroke) => {
    setShapes(prev => prev.map(s => (s.key === key ? { ...s, stroke } : s)));
  }, []);
  // Resize a box shape (path is skipped — would need point-scaling).
  const resizeShape = useCallback((key: number, x: number, y: number, w: number, h: number) => {
    setShapes(prev => prev.map(s => {
      if (s.key !== key) return s;
      if (s.kind === 'path') return s;
      return { ...s, x, y, w, h };
    }));
  }, []);
  const dropShapeInStack = useCallback((key: number) => {
    setShapes(prev => prev.map(s => (s.key === key ? { ...s, inStack: true } : s)));
  }, []);
  const popShapeFromStack = useCallback((key: number) => {
    setShapes(prev => prev.map(s => (s.key === key ? { ...s, inStack: false } : s)));
  }, []);
  const selectShape = useCallback((key: number) => {
    setSelectedShape(key);
    setSelectedEl(null);
    setSelectedText(null);
    setEditingText(null);
    setStackSelected(false);
  }, []);
  // Move a shape — for boxes, set the new top-left; for paths, translate all
  // anchor points so the new bbox top-left matches (x, y).
  const moveShape = useCallback((key: number, x: number, y: number) => {
    setShapes(prev => prev.map(s => {
      if (s.key !== key) return s;
      if (s.kind === 'path') {
        const xs = s.points.map(p => p.x), ys = s.points.map(p => p.y);
        const dx = x - Math.min(...xs), dy = y - Math.min(...ys);
        return { ...s, points: s.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
      }
      return { ...s, x, y };
    }));
  }, []);
  const changeText = useCallback((key: number, text: string, runs?: TextRun[]) => {
    setTexts(prev => prev.map(t => (
      t.key === key
        ? { ...t, text, runs: runs && runs.some(r => r.color) ? runs : undefined }
        : t
    )));
  }, []);
  // Most recent non-empty range the user highlighted inside the editing
  // text. Cleared on mousedown (to start a fresh drag) and on edit-end.
  // Held in a ref so `setTextStyleScoped` reads the latest value even
  // when invoked from a stale picker-mousemove listener closure (the
  // picker's window handlers re-bind only when h/a change, so during an
  // SV-drag a state-derived closure would point at the old range from
  // when the drag started).
  const textSelectionRef = useRef<{ key: number; start: number; end: number } | null>(null);
  const setTextSelection = useCallback((v: { key: number; start: number; end: number } | null) => {
    textSelectionRef.current = v;
  }, []);
  const moveText = useCallback((key: number, x: number, y: number) => {
    setTexts(prev => prev.map(t => (t.key === key ? { ...t, x, y } : t)));
  }, []);
  const setTextStyle = useCallback((key: number, patch: Partial<TextEl>) => {
    setTexts(prev => prev.map(t => (t.key === key ? { ...t, ...patch } : t)));
  }, []);
  // Color changes are routed through the browser's `execCommand('foreColor')`
  // when the contentEditable is focused AND has a non-collapsed selection —
  // that's how Framer's per-segment coloring stays stable across multiple
  // in-place re-selections, since the browser tracks the live selection
  // natively. Otherwise (caret only, or text not in edit mode) it falls
  // back to changing the box's default color.
  const setTextStyleScoped = useCallback((key: number, patch: Partial<TextEl>) => {
    const colorOnly = patch.color !== undefined && Object.keys(patch).length === 1;
    // Always read from the ref — closure-captured state would be stale
    // when a long-lived picker listener invokes this mid-drag.
    const sel = textSelectionRef.current;
    if (colorOnly && sel && sel.key === key && sel.start < sel.end) {
      const editor = document.querySelector(
        `[data-text-editor="${key}"][contenteditable]`,
      ) as HTMLElement | null;
      if (editor) {
        editor.focus();
        setSelectionOffsets(editor, sel.start, sel.end);
        try { document.execCommand('styleWithCSS', false, 'true'); } catch { /* noop */ }
        document.execCommand('foreColor', false, patch.color!);
        return;
      }
    }
    setTextStyle(key, patch);
  }, [setTextStyle]);
  const dropTextInStack = useCallback((key: number) => {
    setTexts(prev => prev.map(t => (t.key === key ? { ...t, inStack: true } : t)));
  }, []);
  const popTextFromStack = useCallback((key: number) => {
    setTexts(prev => prev.map(t => (t.key === key ? { ...t, inStack: false } : t)));
  }, []);
  const selectText = useCallback((key: number) => {
    setSelectedText(key);
    setEditingText(null);
    setSelectedEl(null); // only one thing is selected at a time
    setStackSelected(false);
    setSelectedShape(null);
  }, []);
  const editText = useCallback((key: number) => {
    setSelectedText(key);
    setEditingText(key);
    setSelectedEl(null); // only one thing is selected at a time
    setStackSelected(false);
    setSelectedShape(null);
  }, []);
  const deselectText = useCallback(() => {
    setSelectedText(null);
    setEditingText(null);
    setTextSelection(null);
  }, []);
  const endTextEdit = useCallback((key: number, isEmpty: boolean) => {
    setEditingText(null);
    setTextSelection(null);
    if (isEmpty) {
      // Drop a text box the user placed but never typed into.
      setTexts(prev => prev.filter(t => t.key !== key));
      setSelectedText(s => (s === key ? null : s));
    } else {
      setSelectedText(key); // stays selected (blue) after committing
    }
  }, []);

  // Snapshot canvas content for undo whenever it settles (debounced 400ms).
  // Skipped right after applying an undo so we don't push the restored state.
  useEffect(() => {
    if (skipHistoryRef.current) { skipHistoryRef.current = false; return; }
    const t = window.setTimeout(() => {
      const snap = JSON.stringify({ demoElements, texts, shapes });
      if (snap === lastSnapshotRef.current) return;
      lastSnapshotRef.current = snap;
      const trimmed = historyRef.current.slice(0, historyIdxRef.current + 1);
      trimmed.push(snap);
      historyRef.current = trimmed.length > 100 ? trimmed.slice(-100) : trimmed;
      historyIdxRef.current = historyRef.current.length - 1;
    }, 400);
    return () => window.clearTimeout(t);
  }, [demoElements, texts, shapes]);

  const restoreHistoryAt = useCallback((idx: number) => {
    if (idx < 0 || idx >= historyRef.current.length) return;
    const snap = historyRef.current[idx];
    const prev = JSON.parse(snap);
    skipHistoryRef.current = true;
    lastSnapshotRef.current = snap;
    historyIdxRef.current = idx;
    setDemoElements(prev.demoElements);
    setTexts(prev.texts);
    setShapes(prev.shapes);
    // Clear selections; the old keys may not exist anymore.
    setSelectedEl(null);
    setSelectedText(null);
    setEditingText(null);
    setSelectedShape(null);
    setStackSelected(false);
  }, []);
  const undo = useCallback(() => restoreHistoryAt(historyIdxRef.current - 1), [restoreHistoryAt]);
  const redo = useCallback(() => restoreHistoryAt(historyIdxRef.current + 1), [restoreHistoryAt]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      // Cmd/Ctrl + Z (Shift = redo) — undo works even when an input is
      // focused so the user can undo right after typing.
      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
      }
      // Don't hijack typing — applies to plain inputs, textareas, and the
      // text-tool's contentEditable (which is a <div> with the attribute).
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
      // Escape disarms the text tool and deselects everything — deselecting
      // the stack brings the Insert panel back (it's hidden, replaced by the
      // Shape panel, while a stack is selected).
      if (e.key === 'Escape') {
        setTextMode(false);
        setVectorTool(null);
        setStackSelected(false);
        setSelectedEl(null);
        setSelectedText(null);
        setSelectedShape(null);
        setSelection('none');
        return;
      }
      // "T" arms the text tool, just like clicking the Text tile.
      if (e.key.toLowerCase() === 't' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setTextMode(true);
        return;
      }
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      // While drafting a path, Delete pops the most recent anchor point
      // (Figma / Illustrator behavior) instead of deleting a selected shape.
      if (pathDraft.length > 0) {
        setPathDraft(prev => prev.slice(0, -1));
        return;
      }
      if (stackSelected) {
        // Delete the stack itself and any items inside it; free items
        // elsewhere on the canvas (shapes, free elements, free texts) stay.
        setStackSelected(false);
        setSelectedEl(null);
        setSelectedText(null);
        setEditingText(null);
        setSelectedShape(null);
        setDemoElements(prev => prev.filter(el => !el.inStack));
        setTexts(prev => prev.filter(t => !t.inStack));
        setShapes(prev => prev.filter(s => !s.inStack));
        setScene('base');
        return;
      }
      if (selectedEl !== null) {
        setDemoElements(prev => prev.filter(el => el.key !== selectedEl));
        setSelectedEl(null);
      }
      if (selectedText !== null) {
        setTexts(prev => prev.filter(t => t.key !== selectedText));
        setSelectedText(null);
        setEditingText(null);
      }
      if (selectedShape !== null) {
        setShapes(prev => prev.filter(s => s.key !== selectedShape));
        setSelectedShape(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEl, selectedText, selectedShape, stackSelected, pathDraft.length, clearCanvasState, undo, redo]);

  // The completion screen appears ~2s after the first layout adjustment.
  useEffect(() => {
    if (!layoutTouched || scene !== 'demo-7-layout-panel') return;
    const t = window.setTimeout(() => setScene('demo-completed-modal'), 2000);
    return () => window.clearTimeout(t);
  }, [layoutTouched, scene]);
  const homeExpanded = selection !== 'none';
  const toggleHome = () => setSelection(s => (s === 'none' ? 'frame' : 'none'));
  const selectFrame = () => { setSelection('frame'); setStackSelected(false); setSelectedShape(null); setSelectedEl(null); setSelectedCellId(null); };
  const selectCanvas = () => { setSelection('canvas'); setStackSelected(false); setSelectedShape(null); setSelectedEl(null); setSelectedCellId(null); };
  const deselect = () => { setSelection('none'); setStackSelected(false); setSelectedShape(null); setSelectedEl(null); setSelectedCellId(null); };
  const toggleDarkMode = () => setDarkMode(d => !d);

  const selectedShapeEl: VectorEl | null = selectedShape !== null
    ? shapes.find(s => s.key === selectedShape) ?? null
    : null;
  const selectedTextEl: TextEl | null = selectedText !== null
    ? texts.find(t => t.key === selectedText) ?? null
    : null;

  // Which issue kinds the Editor should surface. Each toggle in the
  // Editor Settings modal gates a branch of the scanner below: legibility
  // controls fill-contrast, spelling / grammar control their checks.
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(DEFAULT_EDITOR_SETTINGS);

  // Accessibility issues — fill-contrast checks against white for both
  // shape fills and text colors. For each failing target, suggest three
  // fixes (21 / 7 / 4.5), preserving hue + saturation + alpha.
  const issues: Issue[] = useMemo(() => {
    const out: Issue[] = [];
    const buildFixes = (h: number, sa: number, a: number) =>
      [21, 7, 4.5].map(t => {
        const nv = vForContrast(h, sa, t, a);
        const color = hsvaToHex(h, sa, nv, a);
        const frgb = hexToRgb(hsvToHex(h, sa, nv));
        return { color, ratio: contrastOverWhite(frgb.r, frgb.g, frgb.b, a) };
      });
    // Fill-contrast is the "legibility" pillar of the accessibility group
    // in Editor Settings. Skip entirely when the user has turned it off.
    if (editorSettings.legibility) {
      for (const s of shapes) {
        if (s.fill === null) continue;
        const { h, s: sa, v, a } = hexToHsva(s.fill);
        const { r, g, b } = hexToRgb(hsvToHex(h, sa, v));
        const ratio = contrastOverWhite(r, g, b, a);
        if (ratio >= 4.5) continue;
        out.push({
          id: `${s.kind}-${s.key}`,
          targetKind: s.kind,
          targetKey: s.key,
          kind: 'fill-contrast',
          currentColor: s.fill,
          currentRatio: ratio,
          fixes: buildFixes(h, sa, a),
        });
      }
    }
    for (const t of texts) {
      if (editorSettings.legibility) {
        // Walk every distinct color in this text — default + any run override —
        // and emit one issue per failing color so a rich text with two bad
        // colors surfaces both. Issue id includes the color to keep them apart.
        const seen = new Set<string>();
        const colors: string[] = [];
        const push = (c?: string) => {
          if (!c) return;
          const k = c.toLowerCase();
          if (seen.has(k)) return;
          seen.add(k); colors.push(c);
        };
        push(t.color);
        if (t.runs) for (const r of t.runs) push(r.color);
        for (const c of colors) {
          const { h, s: sa, v, a } = hexToHsva(c);
          const { r, g, b } = hexToRgb(hsvToHex(h, sa, v));
          const ratio = contrastOverWhite(r, g, b, a);
          if (ratio >= 4.5) continue;
          out.push({
            id: `text-${t.key}-${c.toLowerCase()}`,
            targetKind: 'text',
            targetKey: t.key,
            kind: 'fill-contrast',
            currentColor: c,
            currentRatio: ratio,
            fixes: buildFixes(h, sa, a),
          });
        }
      }
      if (editorSettings.spelling) {
        // Spelling: walk each word; words not in our English dictionary
        // (and not acronyms / numbers) become issues with up to 3
        // Levenshtein-distance suggestions.
        const wordRe = /[a-zA-Z]+/g;
        let m: RegExpExecArray | null;
        while ((m = wordRe.exec(t.text)) !== null) {
          if (!isLikelyMisspelled(m[0])) continue;
          const suggestions = suggestCorrections(m[0].toLowerCase());
          if (suggestions.length === 0) continue;
          out.push({
            id: `text-spell-${t.key}-${m.index}-${m[0].toLowerCase()}`,
            targetKind: 'text',
            targetKey: t.key,
            kind: 'spelling',
            word: m[0],
            offset: m.index,
            suggestions,
          });
        }
      }
      if (editorSettings.grammar) {
        // Grammar: rule-based scan — duplicate words, a/an, "of" / "have",
        // double spaces, missing capitalization, missing space after
        // punctuation. Each hit becomes its own issue.
        for (const hit of scanGrammar(t.text)) {
          out.push({
            id: `text-grammar-${t.key}-${hit.offset}-${hit.label}`,
            targetKind: 'text',
            targetKey: t.key,
            kind: 'grammar',
            word: hit.match,
            offset: hit.offset,
            suggestions: [hit.replacement],
            label: hit.label,
          });
        }
      }
    }
    return out;
  }, [shapes, texts, editorSettings]);

  // Ignore state. Keyed per target-kind so a text exception doesn't silence
  // a shape with the same color (different design intent, separate review).
  //   ignoredOnce : `${kind}:${key}:${color}`  — single instance dismissal
  //   ignoredAll  : `${kind}:${color}`         — color silenced for new items of that kind
  //   exceptions  : `${kind}:${color}`         — approved exception, same effect
  const [ignoredOnce, setIgnoredOnce] = useState<Set<string>>(new Set());
  const [ignoredAll, setIgnoredAll] = useState<Set<string>>(new Set());
  const [exceptions, setExceptions] = useState<Set<string>>(new Set());
  const normColor = (c: string) => c.toLowerCase();
  const onceKey = (i: Issue) => {
    if (i.kind === 'spelling') return `text:spell:${i.targetKey}:${i.offset}:${i.word?.toLowerCase()}`;
    if (i.kind === 'grammar') return `text:grammar:${i.targetKey}:${i.offset}:${i.label}`;
    return `${i.targetKind}:${i.targetKey}:${normColor(i.currentColor!)}`;
  };
  const colorKey = (i: Issue) => {
    if (i.kind === 'spelling') return `text:spell:${i.word?.toLowerCase()}`;
    if (i.kind === 'grammar') return `text:grammar:${i.label}`;
    return `${i.targetKind}:${normColor(i.currentColor!)}`;
  };

  const visibleIssues = useMemo(() => issues.filter(i => (
    !ignoredOnce.has(onceKey(i))
    && !ignoredAll.has(colorKey(i))
    && !exceptions.has(colorKey(i))
  )), [issues, ignoredOnce, ignoredAll, exceptions]);

  // Editor (right-panel) state — which issue is being viewed and which fix is
  // currently previewed on the canvas.
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSettingsOpen, setEditorSettingsOpen] = useState(false);
  // Kinds the user has applied at least one fix for. Drives which
  // categories the Recommendation panel shows once issues hit zero.
  const [recommendationKinds, setRecommendationKinds] = useState<Set<'Vectors' | 'Text'>>(new Set());
  // Drop a recommendation asset onto the canvas as a draggable
  // / resizable element (Figma-style component placement). Reuses the
  // existing DemoEl machinery — width is fixed, height is intrinsic
  // from the image's aspect ratio.
  const applyRecommendation = useCallback((asset: string | null) => {
    if (!asset) return;
    const key = elKeyRef.current++;
    // The triangles pack is a CSS grid of 9 individual SVG files
    // rather than one composite SVG with parsed cells — Canvas renders
    // a TrianglesGrid when it sees id === 'recommendation-triangles'.
    if (asset === 'triangles-grid') {
      setDemoElements(prev => [...prev, {
        key,
        id: 'recommendation-triangles',
        x: 240,
        y: 220,
        width: 360,
        inStack: false,
      }]);
      return;
    }
    setDemoElements(prev => [...prev, {
      key,
      id: 'recommendation',
      x: 240,
      y: 220,
      width: 360,
      inStack: false,
      src: `${import.meta.env.BASE_URL}${asset}`,
    }]);
  }, []);
  // Mousedown on a shape inside a recommendation component → spawn a
  // free element at the cursor and hand its key back to Canvas, which
  // continues the drag seamlessly (Figma-style "tear off an instance").
  // The width comes from the rect's measured on-canvas size so the
  // torn-off copy is the same size as the cell the user grabbed. The
  // pattern id of the torn rect gets added to `extractedPatterns` so
  // ComponentSvg can hide the now-empty cell in the source component.
  const [extractedPatterns, setExtractedPatterns] = useState<Set<string>>(new Set());
  const extractComponentShape = useCallback((href: string, x: number, y: number, w: number, patternId: string) => {
    const key = elKeyRef.current++;
    setDemoElements(prev => [...prev, {
      key,
      id: 'recommendation-shape',
      x,
      y,
      width: w,
      inStack: false,
      src: href,
    }]);
    setExtractedPatterns(prev => {
      const n = new Set(prev);
      n.add(patternId);
      return n;
    });
    return key;
  }, []);
  const [currentIssueIdx, setCurrentIssueIdx] = useState(0);
  const [previewedFixIdx, setPreviewedFixIdx] = useState<number | null>(null);
  // Clamp the issue index when the list shrinks (e.g. after Apply / Ignore).
  if (currentIssueIdx > 0 && currentIssueIdx >= visibleIssues.length) setCurrentIssueIdx(Math.max(0, visibleIssues.length - 1));
  // When no issues remain, the editor stays open and switches to the
  // Recommendation view (RightSidebar handles the swap); only an
  // explicit close from the user dismisses the panel.
  const currentIssue = visibleIssues[currentIssueIdx] ?? null;

  // The shapes / texts Canvas renders — with the previewed fix overlaid.
  const renderShapes: VectorEl[] = useMemo(() => {
    if (!editorOpen || previewedFixIdx === null || !currentIssue) return shapes;
    if (currentIssue.targetKind === 'text' || currentIssue.kind !== 'fill-contrast') return shapes;
    const fix = currentIssue.fixes![previewedFixIdx];
    return shapes.map(s => (s.key === currentIssue.targetKey ? { ...s, fill: fix.color } : s));
  }, [shapes, editorOpen, previewedFixIdx, currentIssue]);
  const renderTexts: TextEl[] = useMemo(() => {
    if (!editorOpen || previewedFixIdx === null || !currentIssue) return texts;
    if (currentIssue.targetKind !== 'text') return texts;
    if (currentIssue.kind === 'fill-contrast') {
      const fix = currentIssue.fixes![previewedFixIdx];
      const target = currentIssue.currentColor!.toLowerCase();
      return texts.map(t => {
        if (t.key !== currentIssue.targetKey) return t;
        const nextColor = t.color && t.color.toLowerCase() === target ? fix.color : t.color;
        const nextRuns = t.runs?.map(r =>
          r.color && r.color.toLowerCase() === target ? { ...r, color: fix.color } : r
        );
        return { ...t, color: nextColor, runs: nextRuns };
      });
    }
    if (currentIssue.kind === 'spelling' || currentIssue.kind === 'grammar') {
      const suggestion = currentIssue.suggestions![previewedFixIdx];
      return texts.map(t => {
        if (t.key !== currentIssue.targetKey) return t;
        return spliceTextAndRuns(t, currentIssue.offset!, currentIssue.word!.length, suggestion);
      });
    }
    return texts;
  }, [texts, editorOpen, previewedFixIdx, currentIssue]);

  const toggleEditor = useCallback(() => {
    setEditorOpen(o => !o);
    setPreviewedFixIdx(null);
  }, []);
  const selectFix = useCallback((i: number | null) => setPreviewedFixIdx(i), []);
  const nextIssue = useCallback(() => {
    setPreviewedFixIdx(null);
    setCurrentIssueIdx(i => (visibleIssues.length === 0 ? 0 : (i + 1) % visibleIssues.length));
  }, [visibleIssues.length]);
  const prevIssue = useCallback(() => {
    setPreviewedFixIdx(null);
    setCurrentIssueIdx(i => (visibleIssues.length === 0 ? 0 : (i - 1 + visibleIssues.length) % visibleIssues.length));
  }, [visibleIssues.length]);
  const applyPreview = useCallback(() => {
    if (!currentIssue || previewedFixIdx === null) return;
    // Remember which kinds of target we've fixed so the Recommendation
    // panel only surfaces the relevant categories (Vectors / Text).
    const recKind: 'Vectors' | 'Text' = currentIssue.targetKind === 'text' ? 'Text' : 'Vectors';
    setRecommendationKinds(prev => prev.has(recKind) ? prev : new Set(prev).add(recKind));
    if (currentIssue.kind === 'spelling' || currentIssue.kind === 'grammar') {
      const suggestion = currentIssue.suggestions![previewedFixIdx];
      setTexts(prev => prev.map(t => (
        t.key === currentIssue.targetKey
          ? spliceTextAndRuns(t, currentIssue.offset!, currentIssue.word!.length, suggestion)
          : t
      )));
      setPreviewedFixIdx(null);
      return;
    }
    const fix = currentIssue.fixes![previewedFixIdx];
    if (currentIssue.targetKind === 'text') {
      const target = currentIssue.currentColor!.toLowerCase();
      setTexts(prev => prev.map(t => {
        if (t.key !== currentIssue.targetKey) return t;
        const nextColor = t.color && t.color.toLowerCase() === target ? fix.color : t.color;
        const nextRuns = t.runs?.map(r =>
          r.color && r.color.toLowerCase() === target ? { ...r, color: fix.color } : r
        );
        return { ...t, color: nextColor, runs: nextRuns };
      }));
    } else {
      setShapeFill(currentIssue.targetKey, fix.color);
    }
    setPreviewedFixIdx(null);
  }, [currentIssue, previewedFixIdx, setShapeFill, setTextStyle]);
  // Dismiss the current issue at one of three scopes.
  const ignoreCurrentOnce = useCallback(() => {
    if (!currentIssue) return;
    const k = onceKey(currentIssue);
    setIgnoredOnce(prev => { const n = new Set(prev); n.add(k); return n; });
    setPreviewedFixIdx(null);
  }, [currentIssue]);
  const ignoreCurrentAll = useCallback(() => {
    if (!currentIssue) return;
    const k = colorKey(currentIssue);
    setIgnoredAll(prev => { const n = new Set(prev); n.add(k); return n; });
    setPreviewedFixIdx(null);
  }, [currentIssue]);
  const addCurrentToExceptions = useCallback(() => {
    if (!currentIssue) return;
    const k = colorKey(currentIssue);
    setExceptions(prev => { const n = new Set(prev); n.add(k); return n; });
    setPreviewedFixIdx(null);
  }, [currentIssue]);

  const showPopout = SHOW_POPOUT.includes(scene);
  const showDemoTint =
    scene === 'demo-1-stack-highlighted' ||
    (scene === 'demo-2-cursor' && !stackTutorialDisabled) ||
    scene === 'demo-5-insert-highlighted' ||
    scene === 'demo-7-layout-prompt' ||
    (scene === 'demo-7-layout-panel' && !layoutTouched);
  const showStackTutorial = scene === 'stack-tutorial-modal';
  const showCompletedModal = scene === 'demo-completed-modal';
  const showDisabledModal = scene === 'disabled-tutorial-modal';
  const showOverlaysSettings = scene === 'tutorial-overlays-settings';

  return (
    <div className={'app' + (darkMode ? ' app--dark' : '')}>
      <TopBar onSceneChange={setScene} onOpenEditorSettings={() => setEditorSettingsOpen(true)} />
      <div className="main">
        <LeftSidebar homeExpanded={homeExpanded} onToggleHome={toggleHome} />
        <Canvas
          scene={scene}
          onSceneChange={setScene}
          selection={selection}
          onSelectFrame={selectFrame}
          onSelectCanvas={selectCanvas}
          onDeselect={deselect}
          demoElements={demoElements}
          selectedEl={selectedEl}
          calloutEl={calloutEl}
          onSelectEl={selectEl}
          onMoveElement={moveElement}
          onDropElementInStack={dropElementInStack}
          onPopElementFromStack={popElementFromStack}
          textMode={textMode}
          texts={renderTexts}
          editingText={editingText}
          selectedText={selectedText}
          onPlaceText={placeText}
          onChangeText={changeText}
          onTextSelectionChange={setTextSelection}
          onMoveText={moveText}
          onDropTextInStack={dropTextInStack}
          onPopTextFromStack={popTextFromStack}
          onSelectText={selectText}
          onEditText={editText}
          onDeselectText={deselectText}
          onEndTextEdit={endTextEdit}
          layoutOpts={layoutOpts}
          layoutTouched={layoutTouched}
          stackSelected={stackSelected}
          onSelectStack={selectStack}
          stackTutorialDisabled={stackTutorialDisabled}
          vectorTool={vectorTool}
          shapes={renderShapes}
          selectedShape={selectedShape}
          highlightedIssue={
            // Drop the red wash while previewing a fix so the user sees the
            // suggested color cleanly without the issue overlay on top.
            editorOpen && currentIssue && previewedFixIdx === null
              ? {
                  kind: currentIssue.targetKind === 'text' ? 'text' : 'shape',
                  key: currentIssue.targetKey,
                  // Tell the text renderer which slice to wash: by color
                  // (fill-contrast) or by character range (spelling /
                  // grammar). Shapes ignore this field.
                  runHighlight: currentIssue.targetKind !== 'text' ? undefined
                    : currentIssue.kind === 'fill-contrast'
                      ? { kind: 'color', color: currentIssue.currentColor!, textColor: undefined }
                      : { kind: 'range', start: currentIssue.offset!, end: currentIssue.offset! + currentIssue.word!.length },
                }
              : null
          }
          onCreateShape={createShape}
          onCreatePath={createPath}
          onSelectShape={selectShape}
          onMoveShape={moveShape}
          onResizeShape={resizeShape}
          onResizeText={(key, size) => setTextStyle(key, { size })}
          onDropShapeInStack={dropShapeInStack}
          onPopShapeFromStack={popShapeFromStack}
          pathDraft={pathDraft}
          onAddPathPoint={addPathPoint}
          onExtractComponentShape={extractComponentShape}
          extractedPatterns={extractedPatterns}
          selectedCellId={selectedCellId}
          onSelectCell={setSelectedCellId}
        />
        <RightSidebar
          scene={scene}
          onSceneChange={setScene}
          onPickElement={pickElement}
          onRequestImageUpload={requestImageUpload}
          onArmText={armText}
          textArmed={textMode}
          onArmVector={armVector}
          vectorArmed={vectorTool !== null}
          layoutOpts={layoutOpts}
          onLayoutChange={changeLayout}
          layoutTouched={layoutTouched}
          stackSelected={stackSelected}
          selectedShapeEl={selectedShapeEl}
          onSetShapeFill={setShapeFill}
          onSetShapeStroke={setShapeStroke}
          selectedTextEl={selectedTextEl}
          onSetTextStyle={setTextStyleScoped}
          editorOpen={editorOpen}
          issues={visibleIssues}
          currentIssueIdx={currentIssueIdx}
          previewedFixIdx={previewedFixIdx}
          onSelectFix={selectFix}
          onPrevIssue={prevIssue}
          onNextIssue={nextIssue}
          onCloseEditor={() => { setEditorOpen(false); setPreviewedFixIdx(null); }}
          onIgnoreOnce={ignoreCurrentOnce}
          onIgnoreAll={ignoreCurrentAll}
          onAddToExceptions={addCurrentToExceptions}
          onOpenEditorSettings={() => setEditorSettingsOpen(true)}
          recommendationKinds={recommendationKinds}
          onApplyRecommendation={applyRecommendation}
        />
      </div>
      <BottomToolbar
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        issueCount={visibleIssues.length}
        editorOpen={editorOpen}
        onToggleEditor={toggleEditor}
        previewing={previewedFixIdx !== null}
        onApplyPreview={applyPreview}
        onCancelPreview={() => setPreviewedFixIdx(null)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        style={{ display: 'none' }}
        onChange={handleImageFile}
      />
      {showDemoTint && <div className="demo-tint" />}
      {showPopout && <BasePopout scene={scene} onSceneChange={setScene} />}
      {showStackTutorial && <StackTutorialModal onSceneChange={setScene} />}
      {showCompletedModal && (
        <StackDemoCompletedModal
          onFinish={finishDemo}
          stackTutorialDisabled={stackTutorialDisabled}
          onToggleStackTutorial={() => setStackTutorialDisabled(v => !v)}
        />
      )}
      {showDisabledModal && (
        <DisabledStackTutorialModal onSceneChange={setScene} endScene={demoEndScene} />
      )}
      {showOverlaysSettings && (
        <TutorialOverlaysModal
          onSceneChange={setScene}
          stackTutorialDisabled={stackTutorialDisabled}
          onSetStackTutorialDisabled={setStackTutorialDisabled}
        />
      )}
      {editorSettingsOpen && (
        <EditorSettingsModal
          initial={editorSettings}
          onSave={s => { setEditorSettings(s); setEditorSettingsOpen(false); }}
          onClose={() => setEditorSettingsOpen(false)}
        />
      )}
    </div>
  );
}
