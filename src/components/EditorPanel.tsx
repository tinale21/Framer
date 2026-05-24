import type { Issue } from '../types';

export default function EditorPanel({
  issues, currentIdx, previewedFixIdx,
  onSelectFix, onPrev, onNext, onClose,
  onIgnoreOnce, onIgnoreAll, onAddToExceptions, onOpenSettings,
}: {
  issues: Issue[];
  currentIdx: number;
  previewedFixIdx: number | null;
  onSelectFix: (i: number | null) => void;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onIgnoreOnce: () => void;
  onIgnoreAll: () => void;
  onAddToExceptions: () => void;
  onOpenSettings: () => void;
}) {
  const total = issues.length;
  const issue = issues[currentIdx] ?? null;
  return (
    <aside className="right-sidebar editor-panel">
      <div className="editor-panel__header">
        <span className="editor-panel__title">Editor</span>
        <button type="button" className="editor-panel__close" aria-label="Close editor"
          onClick={onClose}>×</button>
      </div>

      <div className="editor-panel__pager">
        <span className="editor-panel__pager-count">
          {total === 0 ? '0/0' : `${currentIdx + 1}/${total}`}
        </span>
        <span className="editor-panel__pager-arrows">
          <button type="button" disabled={total <= 1} onClick={onPrev} aria-label="Previous issue">‹</button>
          <button type="button" disabled={total <= 1} onClick={onNext} aria-label="Next issue">›</button>
        </span>
      </div>

      <div className="divider" />

      {issue ? (
        <>
          <div className="editor-panel__section-title">Accessibility</div>
          <div className="editor-panel__check-row">
            {issue.kind === 'spelling' ? 'Spelling Error'
              : issue.kind === 'grammar' ? (issue.label ?? 'Grammar Error')
              : 'Failed Contrast Check'}
            <span className="editor-panel__info" aria-label="What is this">ⓘ</span>
          </div>

          {issue.kind === 'spelling' || issue.kind === 'grammar' ? null : null}
          {issue.kind === 'fill-contrast' ? (
            <>
              <button
                type="button"
                className={
                  'editor-panel__card editor-panel__card--current'
                  + (previewedFixIdx === null ? ' editor-panel__card--active' : '')
                }
                onClick={() => onSelectFix(null)}
              >
                <span className="editor-panel__swatch" style={{ background: issue.currentColor }} />
                <span className="editor-panel__card-label">Current</span>
                <span className="editor-panel__ratio editor-panel__ratio--fail">
                  {issue.currentRatio!.toFixed(2)}:1
                </span>
              </button>

              <div className="editor-panel__section-title" style={{ marginTop: 14 }}>
                Suggested Fixes
              </div>
              {issue.fixes!.map((f, i) => (
                <button
                  type="button"
                  key={i}
                  className={
                    'editor-panel__card'
                    + (previewedFixIdx === i ? ' editor-panel__card--active' : '')
                  }
                  onClick={() => onSelectFix(i)}
                >
                  <span className="editor-panel__swatch" style={{ background: f.color }} />
                  <span className="editor-panel__card-label">
                    {f.color.replace('#', '').slice(0, 6).toUpperCase()}
                  </span>
                  <span
                    className={
                      'editor-panel__ratio'
                      + (f.ratio >= 4.5 ? ' editor-panel__ratio--pass' : ' editor-panel__ratio--fail')
                    }
                  >
                    {f.ratio.toFixed(2)}:1
                  </span>
                </button>
              ))}
            </>
          ) : (
            <>
              <button
                type="button"
                className={
                  'editor-panel__card editor-panel__card--current'
                  + (previewedFixIdx === null ? ' editor-panel__card--active' : '')
                }
                onClick={() => onSelectFix(null)}
              >
                <span className="editor-panel__spell-mark" aria-hidden="true">Aa</span>
                <span className="editor-panel__card-label editor-panel__card-label--strike">{issue.word}</span>
              </button>

              <div className="editor-panel__section-title" style={{ marginTop: 14 }}>
                {issue.kind === 'grammar' ? 'Suggested Fix' : 'Suggested Corrections'}
              </div>
              {issue.suggestions!.map((s, i) => (
                <button
                  type="button"
                  key={i}
                  className={
                    'editor-panel__card'
                    + (previewedFixIdx === i ? ' editor-panel__card--active' : '')
                  }
                  onClick={() => onSelectFix(i)}
                >
                  <span className="editor-panel__spell-mark" aria-hidden="true">Aa</span>
                  <span className="editor-panel__card-label">{s}</span>
                </button>
              ))}
            </>
          )}

          <div className="editor-panel__actions">
            <button type="button" className="editor-panel__action" onClick={onIgnoreOnce}>Ignore Once</button>
            <button type="button" className="editor-panel__action" onClick={onIgnoreAll}>Ignore All</button>
            <button type="button" className="editor-panel__action" onClick={onAddToExceptions}>Add to Exceptions</button>
          </div>
        </>
      ) : (
        <div className="editor-panel__empty">
          <div className="editor-panel__section-title">Accessibility</div>
          <p>No accessibility issues on the canvas.</p>
        </div>
      )}

      <button type="button" className="editor-panel__settings" onClick={onOpenSettings}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
          strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="2.2" />
          <path d="M8 1v2M8 13v2M3.3 3.3l1.4 1.4M11.3 11.3l1.4 1.4M1 8h2M13 8h2M3.3 12.7l1.4-1.4M11.3 4.7l1.4-1.4" />
        </svg>
        Editor Settings
      </button>
    </aside>
  );
}
