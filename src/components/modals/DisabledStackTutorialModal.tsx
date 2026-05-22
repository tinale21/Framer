import type { Scene, SceneSetter } from '../../types';
import { Close } from '../../icons';

export default function DisabledStackTutorialModal({ onSceneChange, endScene }: {
  onSceneChange: SceneSetter;
  endScene: Scene;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal modal--completed">
        <button className="modal__close" onClick={() => onSceneChange(endScene)}><Close /></button>
        <h2 className="modal__title">Disabled Stacks Tutorial</h2>
        <p className="modal__body">
          Want to remove or review other demo tutorials? Manage which tutorial overlay options are
          shown in settings.
        </p>

        <div className="modal__footer">
          <button className="btn" onClick={() => onSceneChange('tutorial-overlays-settings')}>Manage</button>
          <button className="btn btn--primary" onClick={() => onSceneChange(endScene)}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}
