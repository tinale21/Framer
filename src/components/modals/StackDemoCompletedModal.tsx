import { useState } from 'react';
import { CheckSquare } from '../../icons';

export default function StackDemoCompletedModal({ onFinish, stackTutorialDisabled, onToggleStackTutorial }: {
  onFinish: (save: boolean) => void;
  stackTutorialDisabled: boolean;
  onToggleStackTutorial: () => void;
}) {
  const [dontAsk, setDontAsk] = useState(false);
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
          <button type="button" className="modal__check" onClick={onToggleStackTutorial}>
            <CheckSquare checked={stackTutorialDisabled} size={16} />
            Disable stack tutorial
          </button>
        </div>

        <div className="modal__footer">
          <button className="btn" onClick={() => onFinish(false)}>Discard</button>
          <button className="btn btn--primary" onClick={() => onFinish(true)}>Save</button>
        </div>
      </div>
    </div>
  );
}
