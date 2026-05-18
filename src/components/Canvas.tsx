import type { Scene, SceneSetter } from '../types';
import { Play, Plus, Cursor } from '../icons';

type Props = { scene: Scene; onSceneChange: SceneSetter; onHomeClick?: () => void };
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

export default function Canvas({ scene, onSceneChange, onHomeClick }: Props) {
  const chromeDimmed = CHROME_DIMMED.includes(scene);
  const canvasDimmed = CANVAS_DIMMED.includes(scene);

  return (
    <main className="canvas-wrap">
      <div
        className="frame-card"
        style={chromeDimmed ? { opacity: 0.55 } : undefined}
        onClick={onHomeClick}
      >
        <div className="frame-card__title-row">
          <span>Home</span>
          <button className="plus-btn" onClick={e => e.stopPropagation()}><Plus size={12} /></button>
        </div>
        <div className="frame-card__bar">
          <span className="frame-card__bar-play"><Play size={11} /></span>
          <span className="frame-card__bar-desktop">Desktop</span>
          <span className="frame-card__bar-size">1200</span>
        </div>
        <div className="canvas-content" style={canvasDimmed ? { opacity: 0.55 } : undefined}>
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
