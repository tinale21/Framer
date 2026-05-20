import { useState, useRef, useEffect } from 'react';
import type { Scene, SceneSetter } from '../types';
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
const ELEMENT_START = { x: 24, y: 360 };

type Props = {
  scene: Scene;
  onSceneChange: SceneSetter;
  selection?: Selection;
  onSelectFrame?: () => void;
  onSelectCanvas?: () => void;
  onDeselect?: () => void;
  pendingElement?: string | null;
  placedElements?: string[];
  onPlaceElement?: (id: string) => void;
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
  pendingElement = null,
  placedElements = [],
  onPlaceElement,
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

  // demo-6: drag the pending element from outside the canvas into the stack.
  const [elementPos, setElementPos] = useState<{ x: number; y: number } | null>(null);
  const [elementDragging, setElementDragging] = useState(false);
  const elementGrabRef = useRef<{ dx: number; dy: number } | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  // Reset transient demo state on scene / pending-element change (adjust-on-render).
  const [prevScene, setPrevScene] = useState(scene);
  if (prevScene !== scene) {
    setPrevScene(scene);
    if (scene !== 'demo-2-cursor' && demoPhase !== 'idle') setDemoPhase('idle');
  }
  // A freshly-picked element starts back at the default outside position.
  const [prevPending, setPrevPending] = useState(pendingElement);
  if (prevPending !== pendingElement) {
    setPrevPending(pendingElement);
    if (elementPos !== null) setElementPos(null);
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

  // demo-6: drag the element; on release over the stack, place it.
  useEffect(() => {
    if (!elementDragging) return;
    const onMove = (e: MouseEvent) => {
      const grab = elementGrabRef.current;
      const wrap = wrapRef.current;
      if (!grab || !wrap) return;
      const wr = wrap.getBoundingClientRect();
      setElementPos({ x: e.clientX - grab.dx - wr.left, y: e.clientY - grab.dy - wr.top });
    };
    const onUp = () => {
      setElementDragging(false);
      elementGrabRef.current = null;
      const el = elementRef.current;
      const stack = stackRef.current;
      if (el && stack && pendingElement && onPlaceElement) {
        const er = el.getBoundingClientRect();
        const sr = stack.getBoundingClientRect();
        const cx = er.left + er.width / 2;
        const cy = er.top + er.height / 2;
        if (cx >= sr.left && cx <= sr.right && cy >= sr.top && cy <= sr.bottom) {
          onPlaceElement(pendingElement);
        }
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [elementDragging, pendingElement, onPlaceElement]);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    // Demo interactions own the pointer during their scenes; no canvas panning.
    if (demoSpotlight || demo6) return;
    if ((e.target as HTMLElement).closest('button')) return;
    dragRef.current = {
      startMx: e.clientX,
      startMy: e.clientY,
      startOx: offset.x,
      startOy: offset.y,
      moved: false,
    };
  };

  const handleSurroundClick = () => {
    if (demoSpotlight || demo6 || isDragging) return;
    onDeselect?.();
  };

  const handleFrameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (demoSpotlight || demo6 || isDragging) return;
    onSelectFrame?.();
  };

  const handleCanvasContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (demoSpotlight || demo6 || isDragging) return;
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

  const handleElementMouseDown = (e: React.MouseEvent) => {
    const el = elementRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    elementGrabRef.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    setElementDragging(true);
  };

  const demoBoxStyle = {
    left: `${demoRect.x * 100}%`,
    top: `${demoRect.y * 100}%`,
    width: `${demoRect.w * 100}%`,
    height: `${demoRect.h * 100}%`,
  };
  const pendingSrc = pendingElement ? `${import.meta.env.BASE_URL}elem-${pendingElement}.svg` : '';
  const userStack = (
    <div className="demo-stack" style={demoBoxStyle} ref={stackRef}>
      <div className="demo-stack__col demo-stack__col--blue">
        {placedElements.map((id, i) => (
          <img
            key={i}
            src={`${import.meta.env.BASE_URL}elem-${id}.svg`}
            alt=""
            className="demo-stack__element"
          />
        ))}
      </div>
      <div className="demo-stack__col demo-stack__col--teal" />
    </div>
  );
  // After the draw, keep the stack exactly where the user placed it.
  const keepUserStack =
    (scene === 'demo-5-insert-highlighted' || demo6) && demoRect.w > 0;
  const elPos = elementPos ?? ELEMENT_START;

  return (
    <main
      ref={wrapRef}
      className={'canvas-wrap' + (isDragging ? ' canvas-wrap--dragging' : '')}
      onMouseDown={handleMouseDown}
      onClick={handleSurroundClick}
    >
      <div
        className={
          'frame-card' +
          (selection === 'frame' ? ' frame-card--selected' : '') +
          (selection === 'canvas' ? ' frame-card--canvas-selected' : '') +
          (demoSpotlight ? ' frame-card--demo' : '')
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
            (demoSpotlight && demoPhase === 'idle' ? ' canvas-content--demo-idle' : '')
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
      </div>

      {demo6 && pendingElement && pendingSrc && (
        <div
          ref={elementRef}
          className={'demo-element' + (elementDragging ? ' demo-element--dragging' : '')}
          style={{ left: `${elPos.x}px`, top: `${elPos.y}px` }}
          onMouseDown={handleElementMouseDown}
        >
          <div className="demo-element__callout">Drag this into the stack.</div>
          <img src={pendingSrc} alt="" className="demo-element__img" />
        </div>
      )}
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
