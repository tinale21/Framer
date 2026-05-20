import { useState, useRef, useEffect, useCallback } from 'react';
import type { Scene, SceneSetter, DemoEl, TextEl } from '../types';
import { Play, Plus, Cursor } from '../icons';

const INITIAL_Y = 84;
const INITIAL_SCALE = 0.765;
const MIN_SCALE = 0.15;
const MAX_SCALE = 3;
const DRAG_THRESHOLD = 5;

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
  onChangeText?: (key: number, text: string) => void;
  onMoveText?: (key: number, x: number, y: number) => void;
  onDropTextInStack?: (key: number) => void;
  onPopTextFromStack?: (key: number) => void;
  onSelectText?: (key: number) => void;
  onEditText?: (key: number) => void;
  onDeselectText?: () => void;
  onEndTextEdit?: (key: number, isEmpty: boolean) => void;
};
type ContentProps = { scene: Scene; onSceneChange: SceneSetter };

const CANVAS_DIMMED: Scene[] = [
  'demo-7-layout-panel',
];

const CHROME_DIMMED: Scene[] = [
  'demo-3-drawing-frame',
  'demo-4-stack-created',
  'demo-7-layout-panel',
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
  onMoveText,
  onDropTextInStack,
  onPopTextFromStack,
  onSelectText,
  onEditText,
  onDeselectText,
  onEndTextEdit,
}: Props) {
  const chromeDimmed = CHROME_DIMMED.includes(scene);
  const canvasDimmed = CANVAS_DIMMED.includes(scene);
  const demoSpotlight = scene === 'demo-2-cursor';
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
    { dx: number; dy: number; sx: number; sy: number; moved: boolean; fromStack: boolean } | null
  >(null);
  const draggingElRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  // Drag a text box around the canvas.
  const [draggingTextKey, setDraggingTextKey] = useState<number | null>(null);
  const textGrabRef = useRef<
    { tx: number; ty: number; sx: number; sy: number; moved: boolean; fromStack: boolean } | null
  >(null);
  const draggingTextElRef = useRef<HTMLDivElement>(null);

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

  // Once the stack is placed, advance to the Insert-highlight step.
  useEffect(() => {
    if (demoPhase !== 'placed') return;
    const t = window.setTimeout(() => onSceneChange('demo-5-insert-highlighted'), 650);
    return () => clearTimeout(t);
  }, [demoPhase, onSceneChange]);

  // demo-6: a quick press selects an element; a drag moves it, and
  // dropping it over the stack drops it in.
  useEffect(() => {
    if (draggingKey === null) return;
    const key = draggingKey;
    const onMove = (e: MouseEvent) => {
      const grab = elementGrabRef.current;
      const wrap = wrapRef.current;
      if (!grab || !wrap) return;
      if (!grab.moved && Math.hypot(e.clientX - grab.sx, e.clientY - grab.sy) > DRAG_THRESHOLD) {
        grab.moved = true;
        startDropSweep(grab.fromStack); // sweep the drop-zone outline
        // A real drag began — take it out of the stack now (the stack
        // re-centers); a plain click never reaches here.
        if (grab.fromStack) onPopElementFromStack?.(key);
      }
      if (!grab.moved) return;
      const wr = wrap.getBoundingClientRect();
      onMoveElement?.(key, e.clientX - grab.dx - wr.left, e.clientY - grab.dy - wr.top);
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
      startDropSweep, endDropSweep]);

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

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const handleWheel = (e: WheelEvent) => {
      // Cmd/Ctrl + wheel (or trackpad pinch, which sets ctrlKey in browsers) = zoom
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const factor = Math.exp(-e.deltaY * 0.01);
        setScale(s => Math.max(MIN_SCALE, Math.min(MAX_SCALE, s * factor)));
      }
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
    // The stack-drawing step and the text tool own the pointer; otherwise
    // (including the demo-6 placement step) the canvas can be panned.
    if (demoSpotlight || textMode) return;
    if ((e.target as HTMLElement).closest('button')) return;
    dragRef.current = {
      startMx: e.clientX,
      startMy: e.clientY,
      startOx: offset.x,
      startOy: offset.y,
      moved: false,
    };
  };

  const handleSurroundClick = (e: React.MouseEvent) => {
    if (textMode) { placeTextAt(e); return; }
    if (demoSpotlight || demo6 || isDragging) return;
    onDeselectText?.();
    onDeselect?.();
  };

  const handleFrameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (textMode) { placeTextAt(e); return; }
    if (demoSpotlight || demo6 || isDragging) return;
    onDeselectText?.();
    onSelectFrame?.();
  };

  const handleCanvasContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (textMode) { placeTextAt(e); return; }
    if (demo6) { if (!isDragging) onSelectEl?.(null); return; }
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

  const handleElementMouseDown = (e: React.MouseEvent, key: number, fromStack = false) => {
    e.stopPropagation(); // don't also start a canvas pan
    const r = e.currentTarget.getBoundingClientRect();
    if (fromStack) {
      // Render a free dragging copy right over the in-stack element so it
      // never remounts mid-drag — then it drags exactly like a free element.
      const wrap = wrapRef.current;
      if (wrap) {
        const wr = wrap.getBoundingClientRect();
        onMoveElement?.(key, r.left - wr.left, r.top - wr.top, r.width);
      }
    }
    elementGrabRef.current = {
      dx: e.clientX - r.left,
      dy: e.clientY - r.top,
      sx: e.clientX,
      sy: e.clientY,
      moved: false,
      fromStack,
    };
    setDraggingKey(key);
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
  // A stack item being dragged also renders as a free copy (over a hidden
  // placeholder that keeps its slot), so it never remounts mid-drag.
  const freeEls = demoElements.filter(el => !el.inStack || el.key === draggingKey);
  const freeTexts = texts.filter(t => !t.inStack || t.key === draggingTextKey);
  // demo-6: once 2+ items are in the stack, prompt the user to click it.
  const stackReady = demo6 && stackEls.length + stackTexts.length >= 2;
  const userStack = (
    <div
      className={'demo-stack' + (stackReady ? ' demo-stack--clickable' : '')}
      style={demoBoxStyle}
      ref={stackRef}
      onClick={stackReady ? () => onSceneChange('demo-7-layout-prompt') : undefined}
    >
      {stackReady && (
        <div className="demo-stack__callout">Click the stack to change its layout.</div>
      )}
      <div className="demo-stack__col demo-stack__col--blue">
        {stackEls.map(el => (
          <img
            key={el.key}
            src={el.src ?? elemSrc(el.id)}
            alt=""
            className={
              'demo-stack__element' +
              (selectedEl === el.key ? ' demo-stack__element--selected' : '')
            }
            style={el.key === draggingKey ? { visibility: 'hidden' } : undefined}
            onMouseDown={e => handleElementMouseDown(e, el.key, true)}
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
            style={t.key === draggingTextKey ? { visibility: 'hidden' } : undefined}
            onMouseDown={e => handleStackTextMouseDown(e, t)}
            onClick={e => { e.stopPropagation(); onSelectText?.(t.key); }}
          >
            {t.text}
          </div>
        ))}
      </div>
      <div className="demo-stack__col demo-stack__col--teal" />
    </div>
  );
  // After the draw, keep the stack exactly where the user placed it —
  // through the Insert step, placement, and the layout-panel steps.
  const keepUserStack =
    (scene === 'demo-5-insert-highlighted' || demo6 ||
      scene === 'demo-7-layout-prompt' || scene === 'demo-7-layout-panel') &&
    demoRect.w > 0;

  return (
    <main
      ref={wrapRef}
      className={
        'canvas-wrap' +
        (isDragging ? ' canvas-wrap--dragging' : '') +
        (textMode ? ' canvas-wrap--text' : '') +
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
          (demoSpotlight ? ' frame-card--demo' : '') +
          (dropOutline === 'frame' ? ' frame-card--drop' : '')
        }
        style={{
          ...(chromeDimmed ? { opacity: 0.55 } : {}),
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        }}
        onClick={handleFrameClick}
      >
        {demoSpotlight && demoPhase === 'idle' && (
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
            (demoSpotlight && demoPhase === 'idle' ? ' canvas-content--demo-idle' : '') +
            (dropOutline === 'content' ? ' canvas-content--drop' : '') +
            (stackReady ? ' canvas-content--callout-room' : '')
          }
          style={canvasDimmed ? { opacity: 0.55 } : undefined}
          onClick={handleCanvasContentClick}
          onMouseDown={demoSpotlight ? handleDemoMouseDown : undefined}
        >
          {demoSpotlight ? (
            <>
              {demoPhase === 'drawing' && <div className="demo-draw-rect" style={demoBoxStyle} />}
              {demoPhase === 'placed' && userStack}
            </>
          ) : keepUserStack ? (
            userStack
          ) : (
            <CanvasContent scene={scene} onSceneChange={onSceneChange} />
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
                style={{ left: `${t.x}px`, top: `${t.y}px` }}
              >
                {editing ? (
                  <textarea
                    className="text-el__input"
                    value={t.text}
                    autoFocus
                    rows={1}
                    onChange={e => onChangeText?.(t.key, e.target.value)}
                    onBlur={() => onEndTextEdit?.(t.key, t.text.trim() === '')}
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => e.stopPropagation()}
                    onKeyDown={e => { if (e.key === 'Escape') e.currentTarget.blur(); }}
                  />
                ) : (
                  <div
                    className="text-el__static"
                    onMouseDown={e => handleTextMouseDown(e, t)}
                    onClick={e => { e.stopPropagation(); onSelectText?.(t.key); }}
                    onDoubleClick={e => { e.stopPropagation(); onEditText?.(t.key); }}
                  >
                    {t.text}
                  </div>
                )}
                {selected && !editing && (
                  <>
                    <span className="text-handle text-handle--tl" />
                    <span className="text-handle text-handle--tr" />
                    <span className="text-handle text-handle--bl" />
                    <span className="text-handle text-handle--br" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {demo6 && freeEls.map(el => (
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
          onMouseDown={e => handleElementMouseDown(e, el.key)}
        >
          {calloutEl === el.key && (
            <div className="demo-element__callout">Drag this into the stack.</div>
          )}
          <img src={el.src ?? elemSrc(el.id)} alt="" className="demo-element__img" />
        </div>
      ))}

    </main>
  );
}

function CanvasContent({ scene, onSceneChange }: ContentProps) {
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
          <button
            className="demo-hint"
            style={{ top: '8%', left: '6%', width: '80%', height: '78%' }}
            onClick={() => onSceneChange('demo-5-insert-highlighted')}
          />
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
