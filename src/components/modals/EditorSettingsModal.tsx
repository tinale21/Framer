import { useState } from 'react';
import { Close, CheckSquare, Chevron } from '../../icons';

// Only the leaf items hold actual state; parent rows ("Error Checking",
// "Accessibility", "Recommendation Prompting") derive their checked /
// indeterminate state from their descendants, and clicking a parent
// toggles every descendant at once (Gmail-style tree checkbox).
export type LeafKey =
  | 'spelling' | 'grammar'
  | 'legibility' | 'readability' | 'operability'
  | 'designLayout' | 'communityResources' | 'plugins' | 'helpAndSupport';

export type EditorSettings = Record<LeafKey, boolean>;

const SPELLING_GRAMMAR_LEAVES: LeafKey[] = ['spelling', 'grammar'];
const ACCESSIBILITY_LEAVES: LeafKey[] = ['legibility', 'readability', 'operability'];
const ERROR_CHECKING_LEAVES: LeafKey[] = [...SPELLING_GRAMMAR_LEAVES, ...ACCESSIBILITY_LEAVES];
const RECOMMENDATION_LEAVES: LeafKey[] = ['designLayout', 'communityResources', 'plugins', 'helpAndSupport'];

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  spelling: true, grammar: true,
  legibility: true, readability: true, operability: true,
  designLayout: true, communityResources: true, plugins: true, helpAndSupport: true,
};

type ParentState = 'checked' | 'unchecked' | 'indeterminate';
function parentState(leaves: EditorSettings, ks: LeafKey[]): ParentState {
  let on = 0;
  for (const k of ks) if (leaves[k]) on++;
  if (on === 0) return 'unchecked';
  if (on === ks.length) return 'checked';
  return 'indeterminate';
}

function Gear({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 21 20" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.7605 7.50967C10.2219 7.45901 9.68008 7.56813 9.20913 7.8221C8.73818 8.07607 8.36117 8.46246 8.12971 8.92837C7.89825 9.39429 7.82366 9.91695 7.91615 10.4248C8.00864 10.9327 8.26369 11.4009 8.64637 11.7653C9.02906 12.1298 9.52069 12.3727 10.0539 12.4608C10.5872 12.5489 11.136 12.4778 11.6252 12.2574C12.1144 12.037 12.5201 11.6779 12.7868 11.2294C13.0534 10.7809 13.168 10.2648 13.1148 9.75186C13.0542 9.17685 12.7867 8.63949 12.3576 8.23085C11.9285 7.82221 11.3643 7.56742 10.7605 7.50967ZM17.081 9.99756C17.0794 10.2693 17.0584 10.5406 17.0183 10.8097L18.8726 12.1948C18.9533 12.2586 19.0077 12.3475 19.0261 12.4458C19.0445 12.5442 19.0257 12.6456 18.9731 12.7319L17.2188 15.6226C17.1656 15.7081 17.0823 15.773 16.9837 15.8058C16.8851 15.8386 16.7775 15.8372 16.6799 15.8019L14.8383 15.0956C14.7367 15.0571 14.6267 15.0432 14.5181 15.0551C14.4096 15.067 14.3058 15.1044 14.2161 15.164C13.935 15.3483 13.6397 15.512 13.3326 15.6538C13.2361 15.6985 13.1526 15.7651 13.0895 15.8478C13.0264 15.9305 12.9856 16.0268 12.9709 16.128L12.6948 17.9987C12.6767 18.0975 12.6231 18.1873 12.5432 18.2526C12.4633 18.3179 12.3621 18.3548 12.2568 18.3569H8.7483C8.64475 18.3552 8.5449 18.32 8.4652 18.257C8.3855 18.194 8.33071 18.1071 8.30984 18.0104L8.03422 16.1425C8.01874 16.0401 7.97694 15.943 7.91254 15.8597C7.84814 15.7764 7.76313 15.7096 7.66508 15.6651C7.35837 15.5241 7.06402 15.3599 6.78488 15.1741C6.6955 15.1149 6.59206 15.0778 6.48387 15.0661C6.37568 15.0545 6.26615 15.0686 6.16513 15.1073L4.32394 15.8132C4.22637 15.8486 4.11882 15.85 4.02022 15.8173C3.92163 15.7846 3.83833 15.7198 3.785 15.6343L2.03076 12.7437C1.97802 12.6573 1.95917 12.5559 1.97757 12.4575C1.99597 12.3592 2.05043 12.2702 2.13125 12.2065L3.69845 11.0347C3.78431 10.9698 3.85179 10.8855 3.89477 10.7894C3.93775 10.6934 3.95486 10.5886 3.94455 10.4847C3.92978 10.3218 3.92076 10.1593 3.92076 9.99639C3.92076 9.8335 3.92937 9.67334 3.94455 9.51396C3.95373 9.41066 3.93578 9.30679 3.89232 9.21174C3.84886 9.11668 3.78125 9.03341 3.69558 8.96943L2.1292 7.79756C2.04969 7.73353 1.99638 7.6449 1.97861 7.5472C1.96084 7.44949 1.97973 7.34895 2.03199 7.26318L3.78623 4.37256C3.8395 4.28701 3.92277 4.22211 4.02137 4.18931C4.11997 4.15651 4.22755 4.15791 4.32517 4.19326L6.16677 4.89951C6.26833 4.93802 6.37833 4.95194 6.48692 4.94C6.59551 4.92807 6.6993 4.89067 6.78898 4.83115C7.07004 4.64683 7.36538 4.48307 7.67246 4.34131C7.769 4.29662 7.8525 4.22998 7.91559 4.14728C7.97869 4.06457 8.01943 3.96834 8.03422 3.86709L8.31025 1.99639C8.32838 1.89759 8.38197 1.80786 8.46187 1.74252C8.54177 1.67719 8.64301 1.64031 8.7483 1.63818H12.2568C12.3603 1.63989 12.4602 1.67514 12.5399 1.73812C12.6196 1.8011 12.6744 1.88806 12.6952 1.98467L12.9709 3.85264C12.9863 3.95501 13.0281 4.05215 13.0925 4.13542C13.1569 4.2187 13.2419 4.28553 13.34 4.32998C13.6467 4.47098 13.941 4.63518 14.2202 4.821C14.3096 4.88022 14.413 4.91733 14.5212 4.929C14.6294 4.94066 14.7389 4.9265 14.8399 4.88779L16.6811 4.18193C16.7787 4.14655 16.8863 4.14509 16.9848 4.17782C17.0834 4.21054 17.1667 4.27536 17.2201 4.36084L18.9743 7.25146C19.0271 7.33783 19.0459 7.43921 19.0275 7.53757C19.0091 7.63593 18.9546 7.72488 18.8738 7.78857L17.3066 8.96045C17.2204 9.02515 17.1525 9.10936 17.1092 9.20542C17.0658 9.30148 17.0484 9.40634 17.0585 9.51045C17.072 9.67217 17.081 9.83467 17.081 9.99756Z" />
    </svg>
  );
}

type RowProps = {
  indent: 0 | 1 | 2;
  state: ParentState;
  onToggle: () => void;
  label: string;
  open?: boolean;
  onChev?: () => void;
  gear?: boolean;
  hideChev?: boolean;
};
function Row({ indent, state, onToggle, label, open, onChev, gear, hideChev }: RowProps) {
  return (
    <div className={`es-row es-row--indent-${indent}`}>
      <button type="button" className="es-row__check" onClick={onToggle} aria-label={label}>
        <CheckSquare checked={state === 'checked'} indeterminate={state === 'indeterminate'} size={16} />
      </button>
      <span className="es-row__label">{label}</span>
      {gear ? (
        <button type="button" className="es-row__icon" aria-label={`${label} settings`}>
          <Gear />
        </button>
      ) : hideChev ? null : (
        <button type="button" className="es-row__icon" onClick={onChev} aria-label={`Toggle ${label}`}>
          <Chevron dir={open ? 'up' : 'down'} size={12} />
        </button>
      )}
    </div>
  );
}

export default function EditorSettingsModal({
  initial, onSave, onClose,
}: {
  initial: EditorSettings;
  onSave: (s: EditorSettings) => void;
  onClose: () => void;
}) {
  const [leaves, setLeaves] = useState<EditorSettings>(initial);
  const [open, setOpen] = useState({
    errorChecking: true,
    spellingGrammar: true,
    accessibility: true,
    recommendation: true,
    designLayout: false,
    communityResources: false,
    plugins: false,
    helpAndSupport: false,
  });

  const toggleLeaf = (k: LeafKey) => setLeaves(prev => ({ ...prev, [k]: !prev[k] }));
  // Click a parent → if every descendant is on, turn them all off;
  // otherwise turn them all on. Indeterminate counts as "off-ish" so
  // the click brings everything up.
  const toggleParent = (ks: LeafKey[]) => {
    const allOn = ks.every(k => leaves[k]);
    const next = !allOn;
    setLeaves(prev => {
      const out = { ...prev };
      for (const k of ks) out[k] = next;
      return out;
    });
  };
  const toggleOpen = (k: keyof typeof open) => setOpen(prev => ({ ...prev, [k]: !prev[k] }));

  const errorCheckingState = parentState(leaves, ERROR_CHECKING_LEAVES);
  const accessibilityState = parentState(leaves, ACCESSIBILITY_LEAVES);
  const recommendationState = parentState(leaves, RECOMMENDATION_LEAVES);

  return (
    <div className="modal-backdrop">
      <div className="modal modal--editor-settings">
        <button className="modal__close" onClick={onClose}><Close /></button>
        <h2 className="modal__title">Editor Settings</h2>

        <div className="es-tree">
          <Row
            indent={0}
            state={errorCheckingState}
            onToggle={() => toggleParent(ERROR_CHECKING_LEAVES)}
            label="Error Checking"
            open={open.errorChecking}
            onChev={() => toggleOpen('errorChecking')}
          />
          {open.errorChecking && (
            <>
              <Row
                indent={1}
                state={parentState(leaves, SPELLING_GRAMMAR_LEAVES)}
                onToggle={() => toggleParent(SPELLING_GRAMMAR_LEAVES)}
                label="Spelling & Grammar"
                open={open.spellingGrammar}
                onChev={() => toggleOpen('spellingGrammar')}
              />
              {open.spellingGrammar && (
                <>
                  <Row indent={2} state={leaves.spelling ? 'checked' : 'unchecked'} onToggle={() => toggleLeaf('spelling')} label="Spelling" hideChev />
                  <Row indent={2} state={leaves.grammar ? 'checked' : 'unchecked'} onToggle={() => toggleLeaf('grammar')} label="Grammar" hideChev />
                </>
              )}
              <Row
                indent={1}
                state={accessibilityState}
                onToggle={() => toggleParent(ACCESSIBILITY_LEAVES)}
                label="Accessibility"
                open={open.accessibility}
                onChev={() => toggleOpen('accessibility')}
              />
              {open.accessibility && (
                <>
                  <Row indent={2} state={leaves.legibility ? 'checked' : 'unchecked'} onToggle={() => toggleLeaf('legibility')} label="Legibility" gear />
                  <Row indent={2} state={leaves.readability ? 'checked' : 'unchecked'} onToggle={() => toggleLeaf('readability')} label="Readability" gear />
                  <Row indent={2} state={leaves.operability ? 'checked' : 'unchecked'} onToggle={() => toggleLeaf('operability')} label="Operability" gear />
                </>
              )}
            </>
          )}

          <div className="es-section-spacer" />

          <Row
            indent={0}
            state={recommendationState}
            onToggle={() => toggleParent(RECOMMENDATION_LEAVES)}
            label="Recommendation Prompting"
            open={open.recommendation}
            onChev={() => toggleOpen('recommendation')}
          />
          {open.recommendation && (
            <>
              <Row indent={1} state={leaves.designLayout ? 'checked' : 'unchecked'} onToggle={() => toggleLeaf('designLayout')} label="Design Layout" hideChev />
              <Row indent={1} state={leaves.communityResources ? 'checked' : 'unchecked'} onToggle={() => toggleLeaf('communityResources')} label="Community Resources" hideChev />
              <Row indent={1} state={leaves.plugins ? 'checked' : 'unchecked'} onToggle={() => toggleLeaf('plugins')} label="Plugins" hideChev />
              <Row indent={1} state={leaves.helpAndSupport ? 'checked' : 'unchecked'} onToggle={() => toggleLeaf('helpAndSupport')} label="Help & Support Pages" hideChev />
            </>
          )}
        </div>

        <div className="modal__footer">
          <button className="btn btn--primary" onClick={() => onSave(leaves)}>Save</button>
        </div>
      </div>
    </div>
  );
}
