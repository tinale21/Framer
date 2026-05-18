import type { SceneSetter } from '../../types';
import { Close } from '../../icons';

export default function DisabledStackTutorialModal({ onSceneChange }: { onSceneChange: SceneSetter }) {
  return (
    <div className="modal-backdrop">
      <div className="modal modal--narrow">
        <button className="modal__close" onClick={() => onSceneChange('base-hover')}><Close /></button>
        <h2 className="modal__title">Disabled Stacks Tutorial</h2>
        <p className="modal__body">
          Want to remove or review other demo tutorials? Manage which tutorial overlay options are
          shown in settings.
        </p>

        <div className="modal__footer">
          <button className="btn" onClick={() => onSceneChange('tutorial-overlays-settings')}>Manage</button>
          <button className="btn" onClick={() => onSceneChange('base-hover')}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}
