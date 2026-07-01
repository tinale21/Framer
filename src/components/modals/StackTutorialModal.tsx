import type { SceneSetter } from '../../types';
import { Close } from '../../icons';

export default function StackTutorialModal({ onSceneChange }: { onSceneChange: SceneSetter }) {
  return (
    <div className="modal-backdrop">
      <div className="modal modal--wide" style={{ transform: 'scale(0.85)', maxWidth: '689px' }}>
        <button className="modal__close" onClick={() => onSceneChange('base')}><Close /></button>
        <h2 className="modal__title">Using Stacks</h2>
        <p className="modal__body">
          Utilize stacks to automatically manage spacing, alignment, and padding. Similar to Figma's
          auto-layout or CSS' Flexbox.
        </p>

        <div style={{ marginBottom: 20 }}>
          <video
            src={`${import.meta.env.BASE_URL}stack-demo.mp4`}
            autoPlay
            muted
            loop
            playsInline
            style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 14 }}
          />
        </div>

        <div className="modal__footer">
          <button className="btn" onClick={() => onSceneChange('disabled-tutorial-modal')}>Don't Show Again</button>
          <button className="btn btn--primary" onClick={() => onSceneChange('demo-1-stack-highlighted')}>Practice Demo</button>
        </div>
      </div>
    </div>
  );
}
