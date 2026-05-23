import { useState, useRef, useEffect, useCallback } from 'react';
import { shapeBox } from '../types';
import type { Scene, SceneSetter, DemoEl, TextEl, TextRun, LayoutOpts, VectorKind, VectorEl, Pt } from '../types';
import { runsToHtml, parseEditableToRuns, getSelectionOffsets, setSelectionOffsets } from '../textRuns';
import { Play, Plus, Cursor } from '../icons';

const INITIAL_Y = 84;
const INITIAL_SCALE = 0.765;
const MIN_SCALE = 0.15;
const MAX_SCALE = 3;
const DRAG_THRESHOLD = 5;

// Layout-panel values → CSS for the demo stack.
const JUSTIFY: Record<string, string> = {
  Start: 'flex-start', Center: 'center', End: 'flex-end',
  'Space Between': 'space-between', 'Space Around': 'space-around', 'Space Evenly': 'space-evenly',
};
const ALIGN: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end' };

type Selection = 'none' | 'frame' | 'canvas';
type DemoPhase = 'idle' | 'drawing' | 'placed';
type DemoRect = { x: number; y: number; w: number; h: number };

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

type Props = {
  scene: Scene;
  onSceneChange: SceneSetter;
  selection?: Selection;
  onSelectFrame?: () => void;
  onSelectCanvas?: () => void;
  onDeselect?: () => void;
  demoElements?: DemoEl[];
  selectedEl?: number | null;
  calloutEl?: number | null;
  onSelectEl?: (key: number | null) => void;
  onMoveElement?: (key: number, x: number, y: number, width?: number) => void;
  onDropElementInStack?: (key: number) => void;
  onPopElementFromStack?: (key: number) => void;
  textMode?: boolean;
  texts?: TextEl[];
  editingText?: number | null;
  selectedText?: number | null;
  onPlaceText?: (x: number, y: number) => void;
  onChangeText?: (key: number, text: string, runs?: TextRun[]) => void;
  // Reports the current text-character selection inside the editing text
  // (or `null` when nothing is selected / no text is being edited). Used so
  // the right-panel color picker can color just the highlighted portion.
  onTextSelectionChange?: (sel: { key: number; start: number; end: number } | null) => void;
  onMoveText?: (key: number, x: number, y: number) => void;
  onDropTextInStack?: (key: number) => void;
  onPopTextFromStack?: (key: number) => void;
  onSelectText?: (key: number) => void;
  onEditText?: (key: number) => void;
  onDeselectText?: () => void;
  onEndTextEdit?: (key: number, isEmpty: boolean) => void;
  layoutOpts?: LayoutOpts;
  layoutTouched?: boolean;
  stackSelected?: boolean;
  onSelectStack?: () => void;
  stackTutorialDisabled?: boolean;
  vectorTool?: VectorKind | null;
  shapes?: VectorEl[];
  selectedShape?: number | null;
  // Highlight a single shape or text on the canvas (Editor → "current issue").
  // For texts, `color` lets the renderer outline just the failing segment
  // instead of the entire text box.
  highlightedIssue?: { kind: 'shape' | 'text'; key: number; color?: string } | null;
  onCreateShape?: (
    kind: 'rectangle' | 'oval' | 'polygon' | 'star',
    x: number, y: number, w: number, h: number,
  ) => void;
  onCreatePath?: (points: Pt[], closed: boolean) => void;
  onSelectShape?: (key: number) => void;
  onMoveShape?: (key: number, x: number, y: number) => void;
  onResizeShape?: (key: number, x: number, y: number, w: number, h: number) => void;
  onResizeText?: (key: number, size: number) => void;
  onDropShapeInStack?: (key: number) => void;
  onPopShapeFromStack?: (key: number) => void;
  pathDraft?: Pt[];
  onAddPathPoint?: (p: Pt) => void;
};
type ContentProps = { scene: Scene; onSceneChange: SceneSetter; stackTutorialDisabled?: boolean };

const CHROME_DIMMED: Scene[] = [
  'demo-3-drawing-frame',
  'demo-4-stack-created',
];


export default function Canvas({
  scene,
  onSceneChange,
  selection = 'none',
  onSelectFrame,
  onSelectCanvas,
  onDeselect,
  demoElements = [],
  selectedEl = null,
  calloutEl = null,
  onSelectEl,
  onMoveElement,
  onDropElementInStack,
  onPopElementFromStack,
  textMode = false,
  texts = [],
  editingText = null,
  selectedText = null,
  onPlaceText,
  onChangeText,
  onTextSelectionChange,
  onMoveText,
  onDropTextInStack,
  onPopTextFromStack,
  onSelectText,
  onEditText,
  onDeselectText,
  onEndTextEdit,
  layoutOpts = {
    type: 'stack', direction: 'v', distribute: 'Center', align: 'center',
    gap: '8', masonry: 'no', cols: '2', rows: '2', gapX: '10', gapY: '10',
    padMode: 'uniform', padT: '8', padR: '8', padB: '8', padL: '8',
  },
  layoutTouched = false,
  stackSelected = false,
  onSelectStack,
  stackTutorialDisabled = false,
  vectorTool = null,
  shapes = [],
  selectedShape = null,
  highlightedIssue = null,
  onCreateShape,
  onCreatePath,
  onSelectShape,
  onMoveShape,
  onResizeShape,
  onResizeText,
  onDropShapeInStack,
  onPopShapeFromStack,
  pathDraft = [],
  onAddPathPoint,
}: Props) {
  // The early demo steps dim the frame chrome.
  const chromeDimmed = CHROME_DIMMED.includes(scene) && !layoutTouched;
  const demoSpotlight = scene === 'demo-2-cursor';
  // The tutorial chrome — tint, callout, pulsing highlight — is shown only
  // during the guided demo. With the tutorial off, the user still drags to
  // create the stack, but without the spotlight.
  const demoChrome = demoSpotlight && !stackTutorialDisabled;
  const demo6 = scene === 'demo-6-place-element';

  const [offset, setOffset] = useState({ x: 0, y: INITIAL_Y });
  const [scale, setScale] = useState(INITIAL_SCALE);
  const [isDragging, setIsDragging] = useState(false);
  const wrapRef = useRef<HTMLElement>(null);
  const dragRef = useRef<
    { startMx: number; startMy: number; startOx: number; startOy: number; moved: boolean } | null
  >(null);

  // Practice-demo: click-drag on the white canvas to draw a stack.
  const [demoPhase, setDemoPhase] = useState<DemoPhase>('idle');
  const [demoRect, setDemoRect] = useState<DemoRect>({ x: 0, y: 0, w: 0, h: 0 });
  const demoStartRef = useRef<{ x: number; y: number } | null>(null);
  const canvasContentRef = useRef<HTMLDivElement>(null);
  const frameCardRef = useRef<HTMLDivElement>(null);

  // demo-6: drag a free element around the canvas / into the stack.
  const [draggingKey, setDraggingKey] = useState<number | null>(null);
  const elementGrabRef = useRef<
    { gx: number; gy: number; sx: number; sy: number; moved: boolean; fromStack: boolean } | null
  >(null);
  const draggingElRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  // Drag a text box around the canvas.
  const [draggingTextKey, setDraggingTextKey] = useState<number | null>(null);
  const textGrabRef = useRef<
    { tx: number; ty: number; sx: number; sy: number; moved: boolean; fromStack: boolean } | null
  >(null);
  const draggingTextElRef = useRef<HTMLDivElement>(null);

  // Vector tool: drag on the canvas to draw a shape. `vecDraw` is the live
  // rect (frame-card pixels) shown as a preview; `vecRectRef` mirrors it so
  // the mouseup handler can read the final size.
  const [vecDraw, setVecDraw] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [vecDrawing, setVecDrawing] = useState(false);
  const vecStartRef = useRef<{ x: number; y: number } | null>(null);
  const vecRectRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const vecDrewRef = useRef(false);
  // Dragging a placed shape to move it.
  const [draggingShape, setDraggingShape] = useState<number | null>(null);
  const shapeGrabRef = useRef<
    { sx: number; sy: number; ox: number; oy: number; moved: boolean; fromStack: boolean } | null
  >(null);
  const draggingShapeElRef = useRef<HTMLDivElement>(null);

  // Path tool: pathDraft (in-progress anchor points) lives in App so its
  // keydown handler can pop the last point on Delete. pathCursor is purely a
  // rubber-band visual and stays local.
  const [pathCursor, setPathCursor] = useState<Pt | null>(null);

  // Drag-to-resize state — works for shapes (2D), elements + texts (width
  // only). Tracks the dragged corner, initial bbox, and start mouse pos.
  type ResizeKind = 'shape' | 'element' | 'text';
  type ResizeCorner = 'tl' | 'tr' | 'bl' | 'br';
  const [resizing, setResizing] = useState<
    | { kind: ResizeKind; key: number; corner: ResizeCorner;
        sx: number; sy: number; ox: number; oy: number; ow: number; oh: number;
        osize?: number }
    | null
  >(null);
  const [resizeRect, setResizeRect] = useState<
    { x: number; y: number; w: number; h: number } | null
  >(null);
  const resizeJustEndedRef = useRef(false);
  const spaceDownRef = useRef(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  useEffect(() => {
    const isTyping = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || isTyping(e.target)) return;
      if (e.type === 'keydown') {
        if (!spaceDownRef.current) { spaceDownRef.current = true; setSpaceHeld(true); }
        e.preventDefault(); // stop page scroll
      } else {
        spaceDownRef.current = false;
        setSpaceHeld(false);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, []);
  const startResize = (
    e: React.MouseEvent, kind: ResizeKind, key: number, corner: ResizeCorner,
    bbox: { x: number; y: number; w: number; h: number },
    osize?: number,
  ) => {
    e.stopPropagation();
    setResizing({
      kind, key, corner,
      sx: e.clientX, sy: e.clientY,
      ox: bbox.x, oy: bbox.y, ow: bbox.w, oh: bbox.h,
      osize,
    });
    setResizeRect(bbox);
  };

  // Which drop-zone outline is shown during a drag. The outline sweeps one at
  // a time: frame → white canvas when dragging in, white canvas → frame out.
  const [dropOutline, setDropOutline] = useState<'frame' | 'content' | null>(null);
  const sweepTimerRef = useRef<number | null>(null);
  const startDropSweep = useCallback((fromStack: boolean) => {
    if (sweepTimerRef.current !== null) clearTimeout(sweepTimerRef.current);
    setDropOutline(fromStack ? 'content' : 'frame');
    sweepTimerRef.current = window.setTimeout(() => {
      setDropOutline(fromStack ? 'frame' : 'content');
      sweepTimerRef.current = null;
    }, 250);
  }, []);
  const endDropSweep = useCallback(() => {
    if (sweepTimerRef.current !== null) {
      clearTimeout(sweepTimerRef.current);
      sweepTimerRef.current = null;
    }
    setDropOutline(null);
  }, []);

  // Reset transient demo state on scene change (adjust-on-render).
  const [prevScene, setPrevScene] = useState(scene);
  if (prevScene !== scene) {
    setPrevScene(scene);
    if (scene !== 'demo-2-cursor' && demoPhase !== 'idle') setDemoPhase('idle');
  }

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const s = dragRef.current;
      if (!s) return;
      const dx = e.clientX - s.startMx;
      const dy = e.clientY - s.startMy;
      if (!s.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        s.moved = true;
        setIsDragging(true);
      }
      if (s.moved) setOffset({ x: s.startOx + dx, y: s.startOy + dy });
    };
    const handleUp = () => {
      if (dragRef.current?.moved) {
        // defer so click handlers see isDragging=true and bail out
        setTimeout(() => setIsDragging(false), 0);
      }
      dragRef.current = null;
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  // Drag-to-draw the stack during demo-2.
  useEffect(() => {
    if (demoPhase !== 'drawing') return;
    const onMove = (e: MouseEvent) => {
      const start = demoStartRef.current;
      const el = canvasContentRef.current;
      if (!start || !el) return;
      const r = el.getBoundingClientRect();
      const x = clamp01((e.clientX - r.left) / r.width);
      const y = clamp01((e.clientY - r.top) / r.height);
      setDemoRect({
        x: Math.min(start.x, x),
        y: Math.min(start.y, y),
        w: Math.abs(x - start.x),
        h: Math.abs(y - start.y),
      });
    };
    const onUp = () => {
      demoStartRef.current = null;
      setDemoRect(r => (r.w < 0.08 || r.h < 0.08 ? { x: 0.12, y: 0.12, w: 0.66, h: 0.52 } : r));
      setDemoPhase('placed');
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [demoPhase]);

  // Once the stack is placed, advance — to the Insert-highlight step in the
  // guided demo, or straight to the finished canvas when the tutorial is off.
  useEffect(() => {
    if (demoPhase !== 'placed') return;
    const next: Scene = stackTutorialDisabled ? 'demo-final' : 'demo-5-insert-highlighted';
    const t = window.setTimeout(() => onSceneChange(next), 650);
    return () => clearTimeout(t);
  }, [demoPhase, onSceneChange, stackTutorialDisabled]);

  // demo-6: a quick press selects an element; a drag moves it, and
  // dropping it over the stack drops it in.
  useEffect(() => {
    if (draggingKey === null) return;
    const key = draggingKey;
    const onMove = (e: MouseEvent) => {
      const grab = elementGrabRef.current;
      if (!grab) return;
      if (!grab.moved && Math.hypot(e.clientX - grab.sx, e.clientY - grab.sy) > DRAG_THRESHOLD) {
        grab.moved = true;
        startDropSweep(grab.fromStack); // sweep the drop-zone outline
        // A real drag began — take it out of the stack now (the stack
        // re-centers); a plain click never reaches here.
        if (grab.fromStack) onPopElementFromStack?.(key);
      }
      if (!grab.moved) return;
      // Coords are in the frame-card's space, so divide screen movement by zoom.
      onMoveElement?.(key, grab.gx + (e.clientX - grab.sx) / scale, grab.gy + (e.clientY - grab.sy) / scale);
    };
    const onUp = () => {
      const grab = elementGrabRef.current;
      setDraggingKey(null);
      endDropSweep();
      elementGrabRef.current = null;
      if (grab && !grab.moved) {
        onSelectEl?.(key);
        return;
      }
      const el = draggingElRef.current;
      const stack = stackRef.current;
      if (el && stack && onDropElementInStack) {
        const er = el.getBoundingClientRect();
        const sr = stack.getBoundingClientRect();
        const cx = er.left + er.width / 2;
        const cy = er.top + er.height / 2;
        if (cx >= sr.left && cx <= sr.right && cy >= sr.top && cy <= sr.bottom) {
          onDropElementInStack(key);
        }
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [draggingKey, onMoveElement, onSelectEl, onDropElementInStack, onPopElementFromStack,
      scale, startDropSweep, endDropSweep]);

  // Drag a selected text box. Screen movement is divided by the zoom
  // scale because text coords live in the frame-card's own space.
  useEffect(() => {
    if (draggingTextKey === null) return;
    const key = draggingTextKey;
    const onMove = (e: MouseEvent) => {
      const grab = textGrabRef.current;
      if (!grab) return;
      if (!grab.moved && Math.hypot(e.clientX - grab.sx, e.clientY - grab.sy) > DRAG_THRESHOLD) {
        grab.moved = true;
        startDropSweep(grab.fromStack); // sweep the drop-zone outline
        // A real drag began — take it out of the stack now (the stack
        // re-centers); a plain click never reaches here.
        if (grab.fromStack) onPopTextFromStack?.(key);
      }
      if (!grab.moved) return;
      onMoveText?.(key, grab.tx + (e.clientX - grab.sx) / scale, grab.ty + (e.clientY - grab.sy) / scale);
    };
    const onUp = () => {
      const grab = textGrabRef.current;
      setDraggingTextKey(null);
      endDropSweep();
      textGrabRef.current = null;
      // Dropping a dragged text over the demo stack drops it in.
      if (!grab || !grab.moved) return;
      const el = draggingTextElRef.current;
      const stack = stackRef.current;
      if (el && stack && onDropTextInStack) {
        const er = el.getBoundingClientRect();
        const sr = stack.getBoundingClientRect();
        const cx = er.left + er.width / 2;
        const cy = er.top + er.height / 2;
        if (cx >= sr.left && cx <= sr.right && cy >= sr.top && cy <= sr.bottom) {
          onDropTextInStack(key);
        }
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [draggingTextKey, onMoveText, onDropTextInStack, onPopTextFromStack, scale,
      startDropSweep, endDropSweep]);

  // Drag-to-draw a vector shape: track the pointer in frame-card space, then
  // hand the final rect to App, which stores and selects the shape.
  useEffect(() => {
    if (!vecDrawing) return;
    const onMove = (e: MouseEvent) => {
      const start = vecStartRef.current;
      const fc = frameCardRef.current;
      if (!start || !fc) return;
      const r = fc.getBoundingClientRect();
      const cx = (e.clientX - r.left) / scale;
      const cy = (e.clientY - r.top) / scale;
      const rect = {
        x: Math.min(start.x, cx), y: Math.min(start.y, cy),
        w: Math.abs(cx - start.x), h: Math.abs(cy - start.y),
      };
      vecRectRef.current = rect;
      setVecDraw(rect);
    };
    const onUp = () => {
      const rect = vecRectRef.current;
      setVecDrawing(false);
      setVecDraw(null);
      vecStartRef.current = null;
      vecRectRef.current = null;
      // Swallow the click that trails the draw, then clear the flag so the
      // next genuine click still works. The click fires before setTimeout(0).
      vecDrewRef.current = true;
      window.setTimeout(() => { vecDrewRef.current = false; }, 0);
      // The Path tool is click-based and never starts this drag-draw.
      if (!rect || !vectorTool || vectorTool === 'path') return;
      // A click or tiny drag drops a default-sized shape at the cursor.
      const w = rect.w < 8 ? 160 : rect.w;
      const h = rect.h < 8 ? 120 : rect.h;
      onCreateShape?.(vectorTool, rect.x, rect.y, w, h);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [vecDrawing, scale, vectorTool, onCreateShape]);

  // Drag a placed shape to move it. A press without a drag selects it. A
  // real drag from inside the stack pops the shape out first; releasing
  // over the stack drops a free shape in.
  useEffect(() => {
    if (draggingShape === null) return;
    const key = draggingShape;
    const onMove = (e: MouseEvent) => {
      const grab = shapeGrabRef.current;
      if (!grab) return;
      if (!grab.moved && Math.hypot(e.clientX - grab.sx, e.clientY - grab.sy) > DRAG_THRESHOLD) {
        grab.moved = true;
        if (grab.fromStack) onPopShapeFromStack?.(key);
      }
      if (!grab.moved) return;
      onMoveShape?.(key, grab.ox + (e.clientX - grab.sx) / scale, grab.oy + (e.clientY - grab.sy) / scale);
    };
    const onUp = () => {
      const grab = shapeGrabRef.current;
      setDraggingShape(null);
      shapeGrabRef.current = null;
      if (grab && !grab.moved) { onSelectShape?.(key); return; }
      // Released over the stack? Drop in.
      const el = draggingShapeElRef.current;
      const stack = stackRef.current;
      if (el && stack && onDropShapeInStack) {
        const er = el.getBoundingClientRect();
        const sr = stack.getBoundingClientRect();
        const cx = er.left + er.width / 2;
        const cy = er.top + er.height / 2;
        if (cx >= sr.left && cx <= sr.right && cy >= sr.top && cy <= sr.bottom) {
          onDropShapeInStack(key);
        }
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [draggingShape, scale, onMoveShape, onSelectShape, onDropShapeInStack, onPopShapeFromStack]);

  // Drag-to-resize: track the mouse globally while a handle is held, compute
  // a new bbox from the corner being dragged, and commit per-kind. Width-only
  // kinds (element / text) ignore the y delta.
  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: MouseEvent) => {
      const dx = (e.clientX - resizing.sx) / scale;
      const dy = (e.clientY - resizing.sy) / scale;
      const widthOnly = resizing.kind !== 'shape';
      let x = resizing.ox, y = resizing.oy, w = resizing.ow, h = resizing.oh;
      if (resizing.corner === 'tl' || resizing.corner === 'bl') { x += dx; w -= dx; }
      if (resizing.corner === 'tr' || resizing.corner === 'br') { w += dx; }
      if (!widthOnly) {
        if (resizing.corner === 'tl' || resizing.corner === 'tr') { y += dy; h -= dy; }
        if (resizing.corner === 'bl' || resizing.corner === 'br') { h += dy; }
      }
      // Clamp minimums; re-anchor x/y on the left/top corners when clipping.
      if (w < 8) { if (resizing.corner === 'tl' || resizing.corner === 'bl') x = resizing.ox + resizing.ow - 8; w = 8; }
      if (!widthOnly && h < 8) { if (resizing.corner === 'tl' || resizing.corner === 'tr') y = resizing.oy + resizing.oh - 8; h = 8; }
      setResizeRect({ x, y, w, h });
      if (resizing.kind === 'shape') onResizeShape?.(resizing.key, x, y, w, h);
      else if (resizing.kind === 'element') onMoveElement?.(resizing.key, x, resizing.oy, w);
      else if (resizing.kind === 'text') {
        // Scale font-size proportionally to the bbox area change so dragging
        // a corner makes the actual text bigger / smaller (Figma-style).
        const ratio = Math.sqrt((Math.max(8, w) * Math.max(8, h)) / (resizing.ow * resizing.oh));
        const next = Math.max(6, Math.min(120, Math.round((resizing.osize ?? 16) * ratio)));
        onResizeText?.(resizing.key, next);
      }
    };
    const onUp = () => {
      setResizing(null);
      setResizeRect(null);
      // Suppress the click that fires right after the mouseup so the canvas
      // doesn't deselect the just-resized element.
      resizeJustEndedRef.current = true;
      window.setTimeout(() => { resizeJustEndedRef.current = false; }, 0);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizing, scale, onResizeShape, onMoveElement, onResizeText]);

  // While drafting a path, track the cursor in frame-card space so the
  // rubber-band line from the last anchor to the cursor renders smoothly.
  useEffect(() => {
    if (pathDraft.length === 0) return;
    const onMove = (e: MouseEvent) => {
      const fc = frameCardRef.current;
      if (!fc) return;
      const r = fc.getBoundingClientRect();
      setPathCursor({
        x: (e.clientX - r.left) / scale,
        y: (e.clientY - r.top) / scale,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [pathDraft.length, scale]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const handleWheel = (e: WheelEvent) => {
      // Cmd/Ctrl + wheel (or trackpad pinch, which sets ctrlKey in browsers) = zoom
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const factor = Math.exp(-e.deltaY * 0.01);
        setScale(s => Math.max(MIN_SCALE, Math.min(MAX_SCALE, s * factor)));
        return;
      }
      // Two-finger trackpad scroll (or mouse-wheel) pans the workspace —
      // same direction as a drag-pan: the canvas follows your fingers.
      e.preventDefault();
      setOffset(o => ({ x: o.x - e.deltaX, y: o.y - e.deltaY }));
    };
    wrap.addEventListener('wheel', handleWheel, { passive: false });
    return () => wrap.removeEventListener('wheel', handleWheel);
  }, []);

  const placeTextAt = (e: React.MouseEvent) => {
    const fc = frameCardRef.current;
    if (!fc) return;
    // Store coords in the frame-card's own (un-transformed) space so the
    // text pans and zooms with it.
    const r = fc.getBoundingClientRect();
    onPlaceText?.((e.clientX - r.left) / scale, (e.clientY - r.top) / scale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // An armed vector tool draws on mousedown anywhere — on the white frame
    // or out in the workspace around it, so shapes can be made then dragged in.
    if (vectorTool) { handleVectorMouseDown(e); return; }
    // The stack-drawing step and the text tool own the pointer.
    if (demoSpotlight || textMode) return;
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    // Pan when dragging on the gray workspace surround, OR anywhere with
    // Space held / middle mouse — but never on a plain drag that started
    // on the frame card itself (so users can't accidentally move the frame).
    const onFrame = !!target.closest('.frame-card');
    const panGesture = spaceDownRef.current || e.button === 1 || !onFrame;
    if (!panGesture) return;
    dragRef.current = {
      startMx: e.clientX,
      startMy: e.clientY,
      startOx: offset.x,
      startOy: offset.y,
      moved: false,
    };
  };

  // Stay inert during the active draw demo and the guided-on demo-6 step,
  // but let the user dismiss selections everywhere else (including demo-6
  // with the tutorial disabled and demo-final).
  const demoBlocksDeselect = demoSpotlight || (demo6 && !stackTutorialDisabled);

  const handleSurroundClick = (e: React.MouseEvent) => {
    if (vecDrewRef.current) return; // a vector draw just finished
    if (resizeJustEndedRef.current) return;
    if (vectorTool === 'path') { handlePathClickAt(e); return; }
    if (textMode) { placeTextAt(e); return; }
    if (demoBlocksDeselect || isDragging) return;
    onDeselectText?.();
    onDeselect?.();
  };

  const handleFrameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (vecDrewRef.current) return;
    if (resizeJustEndedRef.current) return;
    if (vectorTool === 'path') { handlePathClickAt(e); return; }
    if (textMode) { placeTextAt(e); return; }
    if (demoBlocksDeselect || isDragging) return;
    onDeselectText?.();
    onSelectFrame?.();
  };

  const handleCanvasContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (vecDrewRef.current) return;
    if (resizeJustEndedRef.current) return;
    if (vectorTool === 'path') { handlePathClickAt(e); return; }
    if (textMode) { placeTextAt(e); return; }
    // Guided demo-6 only clears the element selection; the free variant
    // falls through to a normal deselect so the right panel can switch back.
    if (demo6 && !stackTutorialDisabled) { if (!isDragging) onSelectEl?.(null); return; }
    if (demoSpotlight || isDragging) return;
    onDeselectText?.();
    onSelectCanvas?.();
  };

  const handleDemoMouseDown = (e: React.MouseEvent) => {
    if (demoPhase === 'placed') return;
    const el = canvasContentRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = clamp01((e.clientX - r.left) / r.width);
    const y = clamp01((e.clientY - r.top) / r.height);
    demoStartRef.current = { x, y };
    setDemoRect({ x, y, w: 0, h: 0 });
    setDemoPhase('drawing');
  };

  // Press on the canvas with a box-shape tool armed — start drag-drawing.
  // The Path tool is click-based instead, so it's handled in the click
  // handlers (handlePathClickAt) and bails out here.
  const handleVectorMouseDown = (e: React.MouseEvent) => {
    const fc = frameCardRef.current;
    if (!fc || !vectorTool || vectorTool === 'path') return;
    e.stopPropagation();
    const r = fc.getBoundingClientRect();
    const x = (e.clientX - r.left) / scale;
    const y = (e.clientY - r.top) / scale;
    vecStartRef.current = { x, y };
    vecRectRef.current = { x, y, w: 0, h: 0 };
    setVecDraw({ x, y, w: 0, h: 0 });
    setVecDrawing(true);
  };

  // Click anywhere on the canvas/workspace with the Path tool armed — drop
  // an anchor point. Clicking near the first anchor (3+ points) closes the
  // path; clicking near the last anchor (2+ points) finishes it open.
  const handlePathClickAt = (e: React.MouseEvent) => {
    const fc = frameCardRef.current;
    if (!fc) return;
    const r = fc.getBoundingClientRect();
    const x = (e.clientX - r.left) / scale;
    const y = (e.clientY - r.top) / scale;
    const finish = (closed: boolean) => {
      onCreatePath?.([...pathDraft], closed);
      // App clears pathDraft inside onCreatePath; just drop the cursor.
      setPathCursor(null);
    };
    if (pathDraft.length >= 3) {
      const first = pathDraft[0];
      const d = Math.hypot(
        e.clientX - (r.left + first.x * scale),
        e.clientY - (r.top + first.y * scale),
      );
      if (d < 10) { finish(true); return; }
    }
    if (pathDraft.length >= 2) {
      const last = pathDraft[pathDraft.length - 1];
      const d = Math.hypot(
        e.clientX - (r.left + last.x * scale),
        e.clientY - (r.top + last.y * scale),
      );
      if (d < 10) { finish(false); return; }
    }
    onAddPathPoint?.({ x, y });
  };

  const handleTextMouseDown = (e: React.MouseEvent, t: TextEl) => {
    e.stopPropagation();
    textGrabRef.current = {
      tx: t.x, ty: t.y, sx: e.clientX, sy: e.clientY, moved: false, fromStack: false,
    };
    onSelectText?.(t.key);
    setDraggingTextKey(t.key);
  };
  // Press on an in-stack text: a plain click selects it; a real drag pulls it
  // out. A free dragging copy is placed right over the in-stack text (offset
  // by the free text's 5px/3px border+padding) so it never remounts mid-drag.
  const handleStackTextMouseDown = (e: React.MouseEvent, t: TextEl) => {
    e.stopPropagation();
    const fc = frameCardRef.current;
    if (!fc) return;
    const r = e.currentTarget.getBoundingClientRect();
    const fr = fc.getBoundingClientRect();
    const tx = (r.left - fr.left) / scale - 5;
    const ty = (r.top - fr.top) / scale - 3;
    onMoveText?.(t.key, tx, ty);
    textGrabRef.current = { tx, ty, sx: e.clientX, sy: e.clientY, moved: false, fromStack: true };
    onSelectText?.(t.key);
    setDraggingTextKey(t.key);
  };

  const handleElementMouseDown = (e: React.MouseEvent, el: DemoEl, fromStack = false) => {
    e.stopPropagation(); // don't also start a canvas pan
    // Coords live in the frame-card's own (un-transformed) space.
    let gx = el.x;
    let gy = el.y;
    if (fromStack) {
      // Render a free dragging copy right over the in-stack element so it
      // never remounts mid-drag — then it drags exactly like a free element.
      const fc = frameCardRef.current;
      if (!fc) return;
      const r = e.currentTarget.getBoundingClientRect();
      const fr = fc.getBoundingClientRect();
      gx = (r.left - fr.left) / scale;
      gy = (r.top - fr.top) / scale;
      onMoveElement?.(el.key, gx, gy, r.width / scale);
    }
    elementGrabRef.current = {
      gx,
      gy,
      sx: e.clientX,
      sy: e.clientY,
      moved: false,
      fromStack,
    };
    setDraggingKey(el.key);
  };

  // Press on a placed shape. With a box tool armed it starts a new draw; with
  // Path armed it lets the click bubble so a point gets dropped; otherwise it
  // begins a move (a press without a drag selects the shape).
  const handleShapeMouseDown = (e: React.MouseEvent, s: VectorEl, fromStack = false) => {
    if (vectorTool === 'path') return;
    e.stopPropagation();
    if (vectorTool) { handleVectorMouseDown(e); return; }
    let ox = shapeBox(s).x;
    let oy = shapeBox(s).y;
    if (fromStack) {
      // Take the in-stack shape's on-screen position and re-anchor the free
      // copy there, so it doesn't jump when the stack drops it.
      const fc = frameCardRef.current;
      if (!fc) return;
      const r = e.currentTarget.getBoundingClientRect();
      const fr = fc.getBoundingClientRect();
      ox = (r.left - fr.left) / scale;
      oy = (r.top - fr.top) / scale;
      onMoveShape?.(s.key, ox, oy);
    }
    shapeGrabRef.current = { sx: e.clientX, sy: e.clientY, ox, oy, moved: false, fromStack };
    setDraggingShape(s.key);
  };

  const demoBoxStyle = {
    left: `${demoRect.x * 100}%`,
    top: `${demoRect.y * 100}%`,
    width: `${demoRect.w * 100}%`,
    height: `${demoRect.h * 100}%`,
  };
  const elemSrc = (id: string) => `${import.meta.env.BASE_URL}elem-${id}.svg`;
  const stackEls = demoElements.filter(el => el.inStack);
  const stackTexts = texts.filter(t => t.inStack);
  const stackShapes = shapes.filter(s => s.inStack);
  // A stack item being dragged also renders as a free copy (over a hidden
  // placeholder that keeps its slot), so it never remounts mid-drag.
  const freeEls = demoElements.filter(el => !el.inStack || el.key === draggingKey);
  const freeTexts = texts.filter(t => !t.inStack || t.key === draggingTextKey);
  const freeShapes = shapes.filter(s => !s.inStack || s.key === draggingShape);
  // demo-6: once 2+ items are in the stack, prompt the user to click it.
  // With the tutorial off, that guided prompt (and its redirect) is skipped.
  const stackReady = demo6 && !stackTutorialDisabled && stackEls.length + stackTexts.length >= 2;
  // Once the stack is settled it can be clicked to select (then delete) it —
  // in the layout step, the finished canvas, and (tutorial off) while placing.
  const stackSelectable = scene === 'demo-7-layout-panel' || scene === 'demo-final'
    || (demo6 && stackTutorialDisabled);
  // The demo-7 Layout panel drives the stack's element column.
  const stackRow = layoutOpts.type === 'stack' && layoutOpts.direction === 'h';
  const stackPad = `${layoutOpts.padT}px ${layoutOpts.padR}px ${layoutOpts.padB}px ${layoutOpts.padL}px`;
  const gridCols = Math.max(1, parseInt(layoutOpts.cols, 10) || 1);
  const gridRows = Math.max(1, parseInt(layoutOpts.rows, 10) || 1);
  const stackColStyle: React.CSSProperties = layoutOpts.type === 'grid'
    ? {
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        // Masonry lets items keep their natural height; otherwise the rows
        // are an explicit, equal-height grid.
        ...(layoutOpts.masonry === 'yes'
          ? { gridAutoRows: 'auto', alignContent: 'start' }
          : { gridTemplateRows: `repeat(${gridRows}, 1fr)` }),
        placeItems: 'center',
        columnGap: `${layoutOpts.gapX}px`,
        rowGap: `${layoutOpts.gapY}px`,
        padding: stackPad,
      }
    : {
        flexDirection: layoutOpts.direction === 'h' ? 'row' : 'column',
        justifyContent: JUSTIFY[layoutOpts.distribute] ?? 'center',
        alignItems: ALIGN[layoutOpts.align] ?? 'center',
        gap: `${layoutOpts.gap}px`, padding: stackPad,
      };
  const textStyle = (t: TextEl): React.CSSProperties => ({
    fontFamily: t.font ? `'${t.font}', sans-serif` : undefined,
    fontWeight: t.weight,
    fontSize: t.size != null ? `${t.size}px` : undefined,
    lineHeight: t.lineHeight,
    letterSpacing: t.letterSpacing != null ? `${t.letterSpacing}px` : undefined,
    textAlign: t.align,
    color: t.color,
  });
  const renderShapeSvg = (s: VectorEl, w: number, h: number, fillOverride?: string) => {
    const fill = fillOverride ?? (s.fill ?? 'none');
    // When painting an overlay, drop the stroke so the highlight follows
    // just the filled silhouette and doesn't double the outline.
    const stroke = fillOverride ? 'none' : (s.stroke?.color ?? 'none');
    const sw = fillOverride ? 0 : (s.stroke?.width ?? 0);
    const strokeProps = {
      fill, stroke, strokeWidth: sw,
      vectorEffect: 'non-scaling-stroke' as const,
    };
    if (s.kind === 'path') {
      const bb = shapeBox(s);
      const pts = s.points.map(p => `${p.x - bb.x},${p.y - bb.y}`).join(' ');
      return s.closed
        ? <polygon points={pts} {...strokeProps} />
        : <polyline points={pts} {...strokeProps} />;
    }
    if (s.kind === 'rectangle') {
      return <rect x={0} y={0} width={w} height={h} rx={2} {...strokeProps} />;
    }
    if (s.kind === 'oval') {
      return <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} {...strokeProps} />;
    }
    if (s.kind === 'polygon') {
      const pts = `${w * 0.25},0 ${w * 0.75},0 ${w},${h * 0.5} ${w * 0.75},${h} ${w * 0.25},${h} 0,${h * 0.5}`;
      return <polygon points={pts} {...strokeProps} />;
    }
    // star (5-pointed) — same proportions as the popout/icon
    const sp = (px: number, py: number) => `${(px * w) / 100},${(py * h) / 100}`;
    const pts = [
      sp(50, 0), sp(61, 35), sp(98, 35), sp(68, 57), sp(79, 91),
      sp(50, 70), sp(21, 91), sp(32, 57), sp(2, 35), sp(39, 35),
    ].join(' ');
    return <polygon points={pts} {...strokeProps} />;
  };
  const userStack = (
    <div
      className={
        'demo-stack'
        + (stackReady ? ' demo-stack--clickable' : '')
        + (stackSelectable ? ' demo-stack--selectable' : '')
        + (stackSelected ? ' demo-stack--selected' : '')
      }
      style={demoBoxStyle}
      ref={stackRef}
      onClick={
        stackReady
          ? () => onSceneChange('demo-7-layout-prompt')
          : stackSelectable
            ? (e: React.MouseEvent) => { e.stopPropagation(); onSelectStack?.(); }
            : undefined
      }
    >
      {stackReady && (
        <div className="demo-stack__callout">Click the stack to change its layout.</div>
      )}
      <div
        className={'demo-stack__col demo-stack__col--blue' + (stackRow ? ' demo-stack__col--row' : '')}
        style={stackColStyle}
      >
        {stackEls.map(el => (
          <img
            key={el.key}
            src={el.src ?? elemSrc(el.id)}
            alt=""
            className={
              'demo-stack__element' +
              (selectedEl === el.key ? ' demo-stack__element--selected' : '')
            }
            style={el.key === draggingKey ? { opacity: 0 } : undefined}
            onMouseDown={e => handleElementMouseDown(e, el, true)}
            onClick={e => { e.stopPropagation(); onSelectEl?.(el.key); }}
          />
        ))}
        {stackTexts.map(t => (
          <div
            key={t.key}
            className={
              'demo-stack__text' +
              (selectedText === t.key ? ' demo-stack__text--selected' : '')
            }
            style={{
              ...textStyle(t),
              ...(t.key === draggingTextKey ? { opacity: 0 } : {}),
            }}
            onMouseDown={e => handleStackTextMouseDown(e, t)}
            onClick={e => { e.stopPropagation(); onSelectText?.(t.key); }}
            dangerouslySetInnerHTML={{
              __html: runsToHtml(t.text, t.runs,
                highlightedIssue?.kind === 'text' && highlightedIssue.key === t.key && highlightedIssue.color
                  ? { color: highlightedIssue.color, textColor: t.color }
                  : undefined),
            }}
          />
        ))}
        {stackShapes.map(s => {
          const bb = shapeBox(s);
          const w = Math.max(bb.w, 1), h = Math.max(bb.h, 1);
          const selected = selectedShape === s.key;
          const flagged = highlightedIssue?.kind === 'shape' && highlightedIssue.key === s.key;
          return (
            <div
              key={s.key}
              className={
                'demo-stack__shape vec-shape--' + s.kind +
                (selected ? ' demo-stack__shape--selected vec-shape--selected' : '') +
                (flagged ? ' vec-shape--issue' : '')
              }
              style={{
                width: `${w}px`, height: `${h}px`,
                opacity: s.key === draggingShape ? 0 : undefined,
              }}
              onMouseDown={e => handleShapeMouseDown(e, s, true)}
              onClick={e => { e.stopPropagation(); if (vectorTool !== 'path') onSelectShape?.(s.key); }}
            >
              <svg width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
                {renderShapeSvg(s, w, h)}
                {flagged && renderShapeSvg(s, w, h, 'rgba(255, 59, 48, 0.35)')}
              </svg>
              {selected && (
                <div className="vec-shape__select">
                  {s.kind !== 'path' && (['tl', 'tr', 'bl', 'br'] as const).map(c => (
                    <span key={c} className={`shape-handle shape-handle--${c}`}
                      onMouseDown={e => startResize(e, 'shape', s.key, c, { x: s.x, y: s.y, w, h })} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="demo-stack__col demo-stack__col--teal" />
    </div>
  );
  // After the draw, keep the stack exactly where the user placed it —
  // through the Insert step, placement, and the layout-panel steps.
  const keepUserStack =
    (scene === 'demo-5-insert-highlighted' || demo6 ||
      scene === 'demo-7-layout-prompt' || scene === 'demo-7-layout-panel' ||
      scene === 'demo-completed-modal' || scene === 'demo-final' ||
      // Behind the disabled-tutorial popup, show the stack only if the user
      // saved (kept content) — after Discard the canvas stays blank.
      (scene === 'disabled-tutorial-modal' &&
        (demoElements.length > 0 || texts.length > 0))) &&
    demoRect.w > 0;

  return (
    <main
      ref={wrapRef}
      className={
        'canvas-wrap' +
        (isDragging ? ' canvas-wrap--dragging' : '') +
        (textMode ? ' canvas-wrap--text' : '') +
        (vectorTool ? ' canvas-wrap--vector' : '') +
        (spaceHeld ? ' canvas-wrap--pan' : '') +
        (stackReady ? ' canvas-wrap--callout-room' : '')
      }
      onMouseDown={handleMouseDown}
      onClick={handleSurroundClick}
    >
      <div
        ref={frameCardRef}
        className={
          'frame-card' +
          (selection === 'frame' ? ' frame-card--selected' : '') +
          (selection === 'canvas' ? ' frame-card--canvas-selected' : '') +
          (demoChrome ? ' frame-card--demo' : '') +
          (dropOutline === 'frame' ? ' frame-card--drop' : '')
        }
        style={{
          ...(chromeDimmed ? { opacity: 0.55 } : {}),
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        }}
        onClick={handleFrameClick}
      >
        {demoChrome && demoPhase === 'idle' && (
          <div className="canvas-demo-callout">
            Click and drag to make a stack.
          </div>
        )}
        <div className="frame-card__title-row">
          <span>Home</span>
          <button className="plus-btn" onClick={e => e.stopPropagation()}><Plus size={12} /></button>
        </div>
        <div className="frame-card__bar">
          <span className="frame-card__bar-play"><Play size={12} /></span>
          <span className="frame-card__bar-desktop">Desktop</span>
          <span className="frame-card__bar-size">1200</span>
        </div>
        <div
          ref={canvasContentRef}
          className={
            'canvas-content' +
            (demoSpotlight ? ' canvas-content--demo' : '') +
            (demoChrome && demoPhase === 'idle' ? ' canvas-content--demo-idle' : '') +
            (dropOutline === 'content' ? ' canvas-content--drop' : '') +
            (stackReady ? ' canvas-content--callout-room' : '') +
            // While the stack is selected, drop the editor's hover outline.
            (stackSelected ? ' canvas-content--no-outline' : '')
          }
          onClick={handleCanvasContentClick}
          onMouseDown={
            demoSpotlight ? handleDemoMouseDown : vectorTool ? handleVectorMouseDown : undefined
          }
        >
          {demoSpotlight ? (
            <>
              {demoPhase === 'drawing' && <div className="demo-draw-rect" style={demoBoxStyle} />}
              {demoPhase === 'placed' && userStack}
            </>
          ) : keepUserStack ? (
            userStack
          ) : (
            <CanvasContent
              scene={scene}
              onSceneChange={onSceneChange}
              stackTutorialDisabled={stackTutorialDisabled}
            />
          )}
        </div>

        {/* Size badge floating beside the bottom-right corner during resize. */}
        {resizing && resizeRect && (
          <div
            className="resize-badge"
            style={{
              left: `${resizeRect.x + resizeRect.w}px`,
              top: `${resizeRect.y + resizeRect.h}px`,
            }}
          >
            {Math.round(resizeRect.w)} × {Math.round(resizeRect.h)}
          </div>
        )}

        {/* Vector shapes live in the frame-card so they pan and zoom with it. */}
        <div className="shapes-layer">
          {freeShapes.map(s => {
            const bb = shapeBox(s);
            const w = Math.max(bb.w, 1), h = Math.max(bb.h, 1);
            const selected = selectedShape === s.key;
            const flagged = highlightedIssue?.kind === 'shape' && highlightedIssue.key === s.key;
            return (
              <div
                key={s.key}
                ref={s.key === draggingShape ? draggingShapeElRef : undefined}
                className={
                  'vec-shape vec-shape--' + s.kind
                  + (selected ? ' vec-shape--selected' : '')
                  + (flagged ? ' vec-shape--issue' : '')
                }
                style={{ left: `${bb.x}px`, top: `${bb.y}px`, width: `${w}px`, height: `${h}px` }}
                onMouseDown={e => handleShapeMouseDown(e, s)}
                onClick={e => { if (vectorTool !== 'path') e.stopPropagation(); }}
              >
                <svg width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
                  {renderShapeSvg(s, w, h)}
                  {flagged && renderShapeSvg(s, w, h, 'rgba(255, 59, 48, 0.35)')}
                </svg>
                {selected && (
                  <div className="vec-shape__select">
                    {s.kind !== 'path' && (['tl', 'tr', 'bl', 'br'] as const).map(c => (
                      <span key={c} className={`shape-handle shape-handle--${c}`}
                        onMouseDown={e => startResize(e, 'shape', s.key, c, { x: bb.x, y: bb.y, w, h })} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {vecDraw && vectorTool && vectorTool !== 'path' && (
            <div
              className="vec-draw"
              style={{
                left: `${vecDraw.x}px`, top: `${vecDraw.y}px`,
                width: `${vecDraw.w}px`, height: `${vecDraw.h}px`,
              }}
            >
              <div className={'vec-fill vec-fill--' + vectorTool} />
              <span className="vec-size-badge">
                {Math.round(vecDraw.w)} × {Math.round(vecDraw.h)}
              </span>
            </div>
          )}
          {pathDraft.length > 0 && (
            <svg
              className="path-draft"
              width="100%" height="100%"
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                overflow: 'visible', pointerEvents: 'none',
              }}
            >
              {pathDraft.length >= 2 && (
                <polyline
                  points={pathDraft.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none" stroke="#0099ff" strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              )}
              {pathCursor && (
                <line
                  x1={pathDraft[pathDraft.length - 1].x}
                  y1={pathDraft[pathDraft.length - 1].y}
                  x2={pathCursor.x} y2={pathCursor.y}
                  stroke="#0099ff" strokeWidth={1} strokeDasharray="3 3"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              {pathDraft.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={3.5}
                  fill="#ffffff" stroke="#0099ff" strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke" />
              ))}
            </svg>
          )}
        </div>

        {/* Text lives inside the frame-card so it pans and zooms with it. */}
        <div className="text-layer">
          {freeTexts.map(t => {
            const editing = editingText === t.key;
            const selected = selectedText === t.key;
            return (
              <div
                key={t.key}
                ref={t.key === draggingTextKey ? draggingTextElRef : undefined}
                className={
                  'text-el' +
                  (editing ? ' text-el--editing' : selected ? ' text-el--selected' : '')
                }
                style={{
                  left: `${t.x}px`, top: `${t.y}px`,
                  width: t.width != null ? `${t.width}px` : undefined,
                }}
              >
                {editing ? (
                  <EditableText
                    text={t.text}
                    runs={t.runs}
                    style={textStyle(t)}
                    onChange={(text, runs) => onChangeText?.(t.key, text, runs)}
                    onSelectionChange={sel => onTextSelectionChange?.(
                      sel ? { key: t.key, start: sel.start, end: sel.end } : null
                    )}
                    onBlur={() => onEndTextEdit?.(t.key, t.text.trim() === '')}
                  />
                ) : (
                  <div
                    className="text-el__static"
                    style={textStyle(t)}
                    onMouseDown={e => handleTextMouseDown(e, t)}
                    onClick={e => { e.stopPropagation(); onSelectText?.(t.key); }}
                    onDoubleClick={e => { e.stopPropagation(); onEditText?.(t.key); }}
                    dangerouslySetInnerHTML={{
                      __html: runsToHtml(t.text, t.runs,
                        highlightedIssue?.kind === 'text' && highlightedIssue.key === t.key && highlightedIssue.color
                          ? { color: highlightedIssue.color, textColor: t.color }
                          : undefined),
                    }}
                  />
                )}
                {selected && !editing && (
                  <>
                    {(['tl', 'tr', 'bl', 'br'] as const).map(c => {
                      const r = (e: React.MouseEvent) => {
                        const el = (e.currentTarget as HTMLElement).parentElement;
                        if (!el) return;
                        const br = el.getBoundingClientRect();
                        startResize(e, 'text', t.key, c,
                          { x: t.x, y: t.y, w: br.width / scale, h: br.height / scale },
                          t.size ?? 16);
                      };
                      return (
                        <span key={c} className={`text-handle text-handle--${c}`} onMouseDown={r} />
                      );
                    })}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Free elements live in the frame-card so they pan and zoom with it.
            Rendered in any scene so items added outside the stack persist
            after the demo / after the stack is deleted. */}
        {freeEls.map(el => (
          <div
            key={el.key}
            ref={el.key === draggingKey ? draggingElRef : undefined}
            className={
              'demo-element' +
              (draggingKey === el.key ? ' demo-element--dragging' : '') +
              (selectedEl === el.key ? ' demo-element--selected' : '')
            }
            style={{
              left: `${el.x}px`,
              top: `${el.y}px`,
              width: el.width != null ? `${el.width}px` : undefined,
            }}
            onMouseDown={e => handleElementMouseDown(e, el)}
          >
            {calloutEl === el.key && (
              <div className="demo-element__callout">Drag this into the stack.</div>
            )}
            <img src={el.src ?? elemSrc(el.id)} alt="" className="demo-element__img" />
            {selectedEl === el.key && draggingKey !== el.key && (
              <>
                {(['tl', 'tr', 'bl', 'br'] as const).map(c => {
                  const r = (e: React.MouseEvent) => {
                    const wrap = (e.currentTarget as HTMLElement).parentElement;
                    if (!wrap) return;
                    const br = wrap.getBoundingClientRect();
                    startResize(e, 'element', el.key, c,
                      { x: el.x, y: el.y, w: br.width / scale, h: br.height / scale });
                  };
                  return (
                    <span key={c} className={`shape-handle shape-handle--${c} demo-element__handle`}
                      onMouseDown={r} />
                  );
                })}
              </>
            )}
          </div>
        ))}
      </div>

    </main>
  );
}

function CanvasContent({ scene, onSceneChange, stackTutorialDisabled }: ContentProps) {
  switch (scene) {
    case 'demo-3-drawing-frame':
      return (
        <>
          <div className="canvas-frame-drawing">
            <div className="canvas-frame-drawing__cursor"><Cursor size={20} />+</div>
          </div>
          <button
            className="demo-hint"
            style={{ top: '12%', left: '8%', width: '75%', height: '75%' }}
            onClick={() => onSceneChange('demo-4-stack-created')}
          />
        </>
      );

    case 'demo-4-stack-created':
      return (
        <>
          <div className="stack-frame">
            <div className="stack-frame__col stack-frame__col--blue" />
            <div className="stack-frame__col stack-frame__col--teal" />
          </div>
          {!stackTutorialDisabled && (
            <button
              className="demo-hint"
              style={{ top: '8%', left: '6%', width: '80%', height: '78%' }}
              onClick={() => onSceneChange('demo-5-insert-highlighted')}
            />
          )}
        </>
      );

    case 'demo-5-insert-highlighted':
      return (
        <div className="stack-frame stack-frame--dim">
          <div className="stack-frame__col stack-frame__col--blue" />
          <div className="stack-frame__col stack-frame__col--teal" />
        </div>
      );

    case 'demo-6-rect-with-text':
      return (
        <>
          <div className="stack-frame">
            <div className="stack-frame__col stack-frame__col--blue" />
            <div className="stack-frame__col stack-frame__col--teal" />
            <div className="stack-frame__rect" />
            <div className="stack-frame__text">sample text<br />sample text</div>
          </div>
          <button
            className="demo-hint"
            style={{ top: '8%', left: '6%', width: '80%', height: '78%' }}
            onClick={() => onSceneChange('demo-7-layout-panel')}
          />
        </>
      );

    case 'demo-7-layout-panel':
      return (
        <div className="stack-frame stack-frame--dim">
          <div className="stack-frame__col stack-frame__col--blue" />
          <div className="stack-frame__col stack-frame__col--teal" />
          <div className="stack-frame__rect" />
          <div className="stack-frame__text">sample text<br />sample text</div>
        </div>
      );

    case 'demo-8-restacked':
    case 'demo-completed-modal':
    case 'demo-final':
      return (
        <>
          <div className="stack-frame">
            <div className="stack-frame__col stack-frame__col--blue" />
            <div className="stack-frame__col stack-frame__col--teal" />
            <div className="stack-frame__rect" style={{ top: '8%', left: '4%', width: '22%', height: '20%' }} />
            <div className="stack-frame__text--top" style={{ left: '4%', top: '30%' }}>sample text</div>
            <div className="stack-frame__text--top" style={{ left: '4%', top: '38%' }}>sample text</div>
          </div>
          {scene === 'demo-8-restacked' && (
            <button
              className="demo-hint"
              style={{ top: '8%', left: '4%', width: '80%', height: '78%' }}
              onClick={() => onSceneChange('demo-completed-modal')}
            />
          )}
          {scene === 'demo-final' && (
            <button
              className="demo-hint"
              style={{ inset: 0 }}
              onClick={() => onSceneChange('base')}
            />
          )}
        </>
      );

    default:
      return null;
  }
}

// Free-form contentEditable that renders styled spans from `runs` (or plain
// text when there's no per-segment coloring) and reports text + runs +
// caret/selection back as the user types. The DOM is the source of truth
// while editing; React only resets the inner HTML when the incoming runs
// change from outside (e.g. the picker colored a selection).
function EditableText({
  text, runs, style, onChange, onSelectionChange, onBlur,
}: {
  text: string;
  runs?: TextRun[];
  style: React.CSSProperties;
  onChange: (text: string, runs: TextRun[]) => void;
  onSelectionChange?: (sel: { start: number; end: number } | null) => void;
  onBlur?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef<string>('');

  // Initial mount: stamp the runs HTML and focus / place caret at end.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const html = runsToHtml(text, runs);
    el.innerHTML = html;
    lastHtmlRef.current = html;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // External update (e.g. picker colored a selection) — restamp the DOM
  // only when the desired HTML actually differs from what the user typed,
  // and preserve the selection across the swap.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const desired = runsToHtml(text, runs);
    if (desired === lastHtmlRef.current) return;
    const before = getSelectionOffsets(el);
    el.innerHTML = desired;
    lastHtmlRef.current = desired;
    if (before) setSelectionOffsets(el, before.start, before.end);
  }, [text, runs]);

  const handleInput = () => {
    const el = ref.current;
    if (!el) return;
    lastHtmlRef.current = el.innerHTML;
    const { text: nextText, runs: nextRuns } = parseEditableToRuns(el);
    onChange(nextText, nextRuns);
  };

  const reportSelection = () => {
    const el = ref.current;
    if (!el) return;
    const offsets = getSelectionOffsets(el);
    // Don't report nulls — a blur to the right-sidebar (picker) drops the
    // browser selection, but we want App to remember the last real range
    // so a color pick can still be applied to it. App clears the cached
    // selection itself when edit mode ends.
    if (offsets) onSelectionChange?.(offsets);
  };

  // contentEditable doesn't emit React's onSelect reliably — listen on the
  // document instead so highlights made via keyboard / mouse drag are seen.
  useEffect(() => {
    const onChange = () => reportSelection();
    document.addEventListener('selectionchange', onChange);
    return () => document.removeEventListener('selectionchange', onChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className="text-el__input"
      contentEditable
      suppressContentEditableWarning
      style={style}
      onInput={handleInput}
      onSelect={reportSelection}
      onKeyUp={reportSelection}
      onMouseUp={reportSelection}
      onBlur={e => {
        // If focus is moving into the right sidebar (picker / panel),
        // stay in edit mode and keep the selection alive so a chosen
        // color can be applied to the highlighted characters.
        const next = e.relatedTarget as HTMLElement | null;
        if (next && next.closest('.right-sidebar')) return;
        onBlur?.();
      }}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      onKeyDown={e => { if (e.key === 'Escape') (e.currentTarget as HTMLElement).blur(); }}
    />
  );
}
