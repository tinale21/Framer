import type { SceneSetter } from '../../types';
import { CheckSquare } from '../../icons';

export default function StackDemoCompletedModal({ onSceneChange }: { onSceneChange: SceneSetter }) {
  return (
    <div className="modal-backdrop">
      <div className="modal modal--narrow">
        <h2 className="modal__title">Stack Demo Completed!</h2>
        <p className="modal__body">
          Unsaved changes will be lost. Would you like to save the changes you made to your project
          during the demo?
        </p>

        <div className="modal__checks">
          <label className="modal__check">
            <CheckSquare checked />
            Don't ask again
          </label>
          <label className="modal__check">
            <CheckSquare checked />
            Disable Stack Tutorial
          </label>
        </div>

        <div className="modal__footer">
          <button className="btn" onClick={() => onSceneChange('base')}>Discard</button>
          <button className="btn btn--primary" onClick={() => onSceneChange('demo-final')}>Save</button>
        </div>
      </div>
    </div>
  );
}
