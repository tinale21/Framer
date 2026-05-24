import { Close } from '../../icons';

// Confirmation modal shown when the user clicks "No" on the
// recommendation panel's "Was this helpful?" prompt. Same spacing /
// button rules as DisabledStackTutorialModal.
export default function DisabledRecommendationsModal({
  onClose, onManage, onDismiss,
}: {
  onClose: () => void;
  onManage: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal modal--completed">
        <button className="modal__close" onClick={onClose}><Close /></button>
        <h2 className="modal__title">Disabled Recommendations</h2>
        <p className="modal__body">
          Want to remove or review other suggestion types? Manage which recommendation
          categories appear in your editor through settings.
        </p>

        <div className="modal__footer">
          <button className="btn" onClick={onManage}>Manage</button>
          <button className="btn btn--primary" onClick={onDismiss}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}
