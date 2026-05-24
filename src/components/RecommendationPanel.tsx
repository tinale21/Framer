import { useState, useEffect } from 'react';

// Editor "recommendations" view — shown in place of the issue list once
// every accessibility / spelling / grammar issue has been resolved. The
// data is static for the prototype: two categories, two cards each,
// styled to mirror the user's reference SVG (preview block, avatar,
// hearts + comments + bookmark, three pills).

const CATEGORIES = ['Vectors', 'Text'] as const;
type Category = typeof CATEGORIES[number];

type RecCard = {
  title: string;
  preview: 'vectors-1' | 'vectors-2' | 'text-1' | 'text-2';
  hearts: string;
  comments: number;
  tags: string[];
  // Asset path (relative to BASE_URL) rendered onto the canvas when the
  // card is clicked — `null` for cards that don't have a demo yet.
  asset?: string;
  // PFP filename inside public/recs/pfps/ — one per author so the cards
  // don't all read as the same person.
  pfp?: string;
};

const RECS: Record<Category, RecCard[]> = {
  Vectors: [
    { title: 'Unique Shapes', preview: 'vectors-1', hearts: '1K+', comments: 21, tags: ['Component', 'Beginner'], asset: 'triangles-grid', pfp: 'pfp-1.svg' },
    { title: '3D Shapes', preview: 'vectors-2', hearts: '521', comments: 11, tags: ['Component', 'Pro'], asset: 'recs/3d-shapes.svg', pfp: 'pfp-2.svg' },
  ],
  Text: [
    { title: 'Text Editor', preview: 'text-1', hearts: '1K+', comments: 21, tags: ['Component', 'Free'], asset: 'text-list', pfp: 'pfp-3.svg' },
    { title: 'Advanced Text Effects', preview: 'text-2', hearts: '521', comments: 11, tags: ['Component', 'Advanced'], asset: 'text-effects-grid', pfp: 'pfp-4.svg' },
  ],
};

function Heart() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function Comment() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function Bookmark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function HelpCircle() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
    </svg>
  );
}

function CardPreview({ kind }: { kind: RecCard['preview'] }) {
  // 3D Shapes / Text Editor / Advanced Text Effects use real cover
  // images; Unique Shapes keeps the stylized CSS mockup since we
  // don't have an image asset for it yet.
  const imgMap: Partial<Record<RecCard['preview'], string>> = {
    'vectors-2': 'recs/cover-3d-shapes.png',
    'text-1':    'recs/cover-text-editor.png',
    'text-2':    'recs/cover-text-effects.png',
  };
  const img = imgMap[kind];
  if (img) {
    return (
      <div className="rec-card__preview rec-card__preview--img">
        <img src={`${import.meta.env.BASE_URL}${img}`} alt="" className="rec-card__preview-img" draggable={false} />
      </div>
    );
  }
  if (kind === 'vectors-1') return (
    <div className="rec-card__preview rec-card__preview--triangles">
      <div className="rec-card__preview-label">Triangle</div>
      <div className="rec-card__preview-sub">Total: 14</div>
    </div>
  );
  return null;
}

export default function RecommendationPanel({
  kinds, onClose, onOpenSettings, onApplyAsset, onUnhelpful, onSeeAll,
}: {
  kinds: Set<Category>;
  onClose: () => void;
  onOpenSettings: () => void;
  onApplyAsset: (asset: string | null) => void;
  onUnhelpful: () => void;
  onSeeAll: () => void;
}) {
  // Show only the categories the user has actually applied a fix for —
  // fall back to all categories if nothing's been applied yet (e.g.
  // they opened the panel with zero issues to begin with).
  const visibleCats = kinds.size > 0 ? CATEGORIES.filter(c => kinds.has(c)) : CATEGORIES;
  const [idx, setIdx] = useState(0);
  // null = waiting for response, 'yes' = swap question for a thank-you.
  // "No" opens a confirmation modal via onUnhelpful and doesn't change
  // local state (the modal owns the next step from here).
  const [feedback, setFeedback] = useState<'yes' | null>(null);
  const safeIdx = Math.min(idx, visibleCats.length - 1);
  const total = visibleCats.length;
  const cat = visibleCats[safeIdx];
  const cards = RECS[cat];
  const prev = () => setIdx(i => (i - 1 + total) % total);
  const next = () => setIdx(i => (i + 1) % total);
  // Reset pager when the visible set changes.
  useEffect(() => { setIdx(0); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kinds]);

  return (
    <aside className="right-sidebar editor-panel">
      <div className="editor-panel__header">
        <span className="editor-panel__title">Editor</span>
        <button type="button" className="editor-panel__close" aria-label="Close editor"
          onClick={onClose}>×</button>
      </div>

      <div className="editor-panel__pager">
        <span className="editor-panel__pager-count">{`${safeIdx + 1}/${total}`}</span>
        <span className="editor-panel__pager-arrows">
          <button type="button" disabled={total <= 1} onClick={prev} aria-label="Previous category">‹</button>
          <button type="button" disabled={total <= 1} onClick={next} aria-label="Next category">›</button>
        </span>
      </div>

      <div className="divider" />

      <div className="editor-panel__section-title">Recommendation</div>
      <div className="rec-subtitle">{cat === 'Vectors' ? 'Vector Components' : cat === 'Text' ? 'Text Components' : 'Header Components'} <HelpCircle /></div>
      <div className="rec-category">{cat}</div>

      <div className="rec-resources-row">
        <span className="editor-panel__section-title" style={{ margin: 0 }}>Recommended Resources</span>
        <a href="#" className="rec-see-all" onClick={e => { e.preventDefault(); onSeeAll(); }}>See All</a>
      </div>

      <div className="rec-cards">
        {cards.map(c => (
          <div
            className={'rec-card' + (c.asset ? ' rec-card--clickable' : '')}
            key={c.title}
            onClick={() => c.asset && onApplyAsset(c.asset)}
            role={c.asset ? 'button' : undefined}
          >
            <CardPreview kind={c.preview} />
            {c.pfp
              ? <img src={`${import.meta.env.BASE_URL}recs/pfps/${c.pfp}`} alt="" className="rec-card__avatar rec-card__avatar--img" />
              : <div className="rec-card__avatar" />}
            <div className="rec-card__body">
              <div className="rec-card__row">
                <span className="rec-card__title">{c.title}</span>
                <button type="button" className="rec-card__bookmark" aria-label="Bookmark"><Bookmark /></button>
              </div>
              <div className="rec-card__meta">
                <span><Heart /> {c.hearts}</span>
                <span><Comment /> {c.comments}</span>
              </div>
              <div className="rec-card__tags">
                {c.tags.map(t => <span key={t} className={`rec-card__tag rec-card__tag--${t.toLowerCase()}`}>{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="divider" style={{ marginTop: 14 }} />
      {feedback === 'yes' ? (
        <div className="rec-helpful rec-helpful--thanks">Thank you for your feedback!</div>
      ) : (
        <div className="rec-helpful">
          <span>Was this helpful?</span>
          <span className="rec-helpful__actions">
            <button type="button" onClick={() => setFeedback('yes')}>Yes</button>
            <button type="button" onClick={onUnhelpful}>No</button>
          </span>
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
