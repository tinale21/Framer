import { useState, useRef, useEffect } from 'react';
import type { Scene, SceneSetter } from '../types';
import { Play, Plus, Cursor } from '../icons';

const INITIAL_Y = 84;
const INITIAL_SCALE = 0.765;
const MIN_SCALE = 0.15;
const MAX_SCALE = 3;
const DRAG_THRESHOLD = 5;

type Selection = 'none' | 'frame' | 'canvas';

type Props = {
  scene: Scene;
  onSceneChange: SceneSetter;
  selection?: Selection;
  onSelectFrame?: () => void;
  onSelectCanvas?: () => void;
  onDeselect?: () => void;
};
type ContentProps = { scene: Scene; onSceneChange: SceneSetter };

const CANVAS_DIMMED: Scene[] = [
  'demo-5-insert-highlighted',
  'demo-7-layout-panel',
];

const CHROME_DIMMED: Scene[] = [
  'demo-2-cursor',
  'demo-3-drawing-frame',
  'demo-4-stack-created',
  'demo-5-insert-highlighted',
  'demo-7-layout-panel',
];

export default function Canvas({
  scene,
  onSceneChange,
  selection = 'none',
  onSelectFrame,
  onSelectCanvas,
  onDeselect,
}: Props) {
  const chromeDimmed = CHROME_DIMMED.includes(scene);
  const canvasDimmed = CANVAS_DIMMED.includes(scene);

  const [offset, setOffset] = useState({ x: 0, y: INITIAL_Y });
  const [scale, setScale] = useState(INITIAL_SCALE);
  const [isDragging, setIsDragging] = useState(false);
  const wrapRef = useRef<HTMLElement>(null);
  const dragRef = useRef<
    { startMx: number; startMy: number; startOx: number; startOy: number; moved: boolean } | null
  >(null);

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
    // Don't start drag from buttons (demo hints, plus btn, etc.)
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
    if (isDragging) return;
    onDeselect?.();
  };

  const handleFrameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDragging) return;
    onSelectFrame?.();
  };

  const handleCanvasContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDragging) return;
    onSelectCanvas?.();
  };

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
          (selection === 'canvas' ? ' frame-card--canvas-selected' : '')
        }
        style={{
          ...(chromeDimmed ? { opacity: 0.55 } : {}),
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        }}
        onClick={handleFrameClick}
      >
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
          className="canvas-content"
          style={canvasDimmed ? { opacity: 0.55 } : undefined}
          onClick={handleCanvasContentClick}
        >
          <CanvasContent scene={scene} onSceneChange={onSceneChange} />
        </div>
      </div>
    </main>
  );
}

function CanvasContent({ scene, onSceneChange }: ContentProps) {
  switch (scene) {
    case 'demo-2-cursor':
      return (
        <>
          <div className="canvas-cursor">
            <Cursor size={20} />
            <span style={{ fontSize: 22, lineHeight: 1 }}>+</span>
          </div>
          <button
            className="demo-hint"
            style={{ top: '35%', left: '20%', width: '60%', height: '40%' }}
            onClick={() => onSceneChange('demo-3-drawing-frame')}
          />
        </>
      );

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
