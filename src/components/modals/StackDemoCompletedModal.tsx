import { useState } from 'react';
import type { SceneSetter } from '../../types';
import { CheckSquare } from '../../icons';

export default function StackDemoCompletedModal({ onSceneChange, onDiscard }: {
  onSceneChange: SceneSetter;
  onDiscard: () => void;
}) {
  const [dontAsk, setDontAsk] = useState(true);
  const [disableTutorial, setDisableTutorial] = useState(true);
  return (
    <div className="modal-backdrop">
      <div className="modal modal--completed">
        <h2 className="modal__title">Stack Demo Completed!</h2>
        <p className="modal__body">
          Unsaved changes will be lost. Would you like to save the changes you made to your project
          during the demo?
        </p>

        <div className="modal__checks">
          <button type="button" className="modal__check" onClick={() => setDontAsk(v => !v)}>
            <CheckSquare checked={dontAsk} size={16} />
            Don't ask again
          </button>
          <button type="button" className="modal__check" onClick={() => setDisableTutorial(v => !v)}>
            <CheckSquare checked={disableTutorial} size={16} />
            Disable stack tutorial
          </button>
        </div>

        <div className="modal__footer">
          <button className="btn" onClick={onDiscard}>Discard</button>
          <button className="btn btn--primary" onClick={() => onSceneChange('demo-final')}>Save</button>
        </div>
      </div>
    </div>
  );
}
