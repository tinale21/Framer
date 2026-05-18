import { useState } from 'react';
import type { SceneSetter } from '../../types';
import { Close, CheckSquare, Sort } from '../../icons';

const ROWS = ['Frame', 'Stack', 'Grid', 'Masonry', 'Vectors', 'Components', 'Effects', 'Breakpoints'];

export default function TutorialOverlaysModal({ onSceneChange }: { onSceneChange: SceneSetter }) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    Frame: true, Stack: false, Grid: true, Masonry: true,
    Vectors: true, Components: true, Effects: true, Breakpoints: true,
  });

  const toggle = (name: string) => setEnabled(prev => ({ ...prev, [name]: !prev[name] }));
  const setAll = (val: boolean) => setEnabled(Object.fromEntries(ROWS.map(r => [r, val])));

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 520, paddingTop: 22 }}>
        <button className="modal__close" onClick={() => onSceneChange('base')}><Close /></button>
        <h2 className="modal__title">Tutorial Overlays</h2>

        <div className="overlay-toolbar">
          <Sort />
          <div>
            <button className="overlay-toolbar__btn" onClick={() => setAll(true)}>Enable All</button>
            <button className="overlay-toolbar__btn" onClick={() => setAll(false)}>Disable All</button>
          </div>
        </div>

        <div className="overlay-rows" style={{ maxHeight: 380, overflowY: 'auto' }}>
          {ROWS.map(row => (
            <div key={row} className="overlay-row">
              <button onClick={() => toggle(row)} style={{ background: 'none' }}>
                <CheckSquare checked={enabled[row]} thin={!enabled[row]} />
              </button>
              <span>{row}</span>
              <span className="overlay-row__demo">Start Demo</span>
            </div>
          ))}
        </div>

        <div className="modal__footer">
          <button className="btn btn--primary" onClick={() => onSceneChange('base')}>Save</button>
        </div>
      </div>
    </div>
  );
}
