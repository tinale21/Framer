import { useState, useRef, useEffect } from 'react';
import type { SceneSetter } from '../../types';
import { Close, CheckSquare, Chevron } from '../../icons';

const ROWS = ['Frame', 'Stack', 'Grid', 'Masonry', 'Vectors', 'Components', 'Effects', 'Breakpoints'];

export default function TutorialOverlaysModal({ onSceneChange, stackTutorialDisabled, onSetStackTutorialDisabled }: {
  onSceneChange: SceneSetter;
  stackTutorialDisabled: boolean;
  onSetStackTutorialDisabled: (v: boolean) => void;
}) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    Frame: true, Stack: !stackTutorialDisabled, Grid: true, Masonry: true,
    Vectors: true, Components: true, Effects: true, Breakpoints: true,
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectMode, setSelectMode] = useState<'Select All' | 'Deselect All'>('Select All');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDown = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [pickerOpen]);

  const toggle = (name: string) => setEnabled(prev => ({ ...prev, [name]: !prev[name] }));
  const setAll = (val: boolean) => {
    setEnabled(Object.fromEntries(ROWS.map(r => [r, val])));
    setSelectMode(val ? 'Select All' : 'Deselect All');
    setPickerOpen(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal modal--completed modal--overlays">
        <button className="modal__close" onClick={() => onSceneChange('base')}><Close /></button>
        <h2 className="modal__title">Tutorial Overlays</h2>

        <div className="overlay-toolbar">
          <div className="overlay-picker" ref={pickerRef}>
            <button className="overlay-toolbar__btn" onClick={() => setPickerOpen(o => !o)}>
              {selectMode}
              <span className="overlay-picker__chev"><Chevron dir="down" size={13} /></span>
            </button>
            {pickerOpen && (
              <div className="overlay-picker__menu">
                <button className="layout-dropdown__item" onClick={() => setAll(true)}>Select All</button>
                <button className="layout-dropdown__item" onClick={() => setAll(false)}>Deselect All</button>
              </div>
            )}
          </div>
        </div>

        <div className="overlay-rows" style={{ maxHeight: 380, overflowY: 'auto' }}>
          {ROWS.map(row => (
            <div key={row} className="overlay-row">
              <button onClick={() => toggle(row)} style={{ background: 'none' }}>
                <CheckSquare checked={enabled[row]} size={16} />
              </button>
              <span>{row}</span>
              <span className="overlay-row__demo">Start Demo</span>
            </div>
          ))}
        </div>

        <div className="modal__footer">
          <button
            className="btn btn--primary"
            onClick={() => { onSetStackTutorialDisabled(!enabled.Stack); onSceneChange('base'); }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
