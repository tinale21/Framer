import { useEffect, useState } from 'react';
import { Close } from '../../icons';

// Community assets popup. Cards use the exact same .rec-card markup
// as the Recommendation panel so the layout, preview, avatar, title,
// meta, and tags read identically. Filter tabs at the top hide cards
// whose tag set doesn't include the selected category.
type CommunityCard = {
  title: string;
  preview: string; // filename in public/community/
  hearts: string;
  comments: number;
  tags: string[];
  pfp: string; // file in public/recs/pfps/
};

const CARDS: CommunityCard[] = [
  { title: 'Card Build single Variant',         preview: '05-heroui.png',    hearts: '15',  comments: 4,  tags: ['Component', 'Free', 'Beginner'],   pfp: 'pfp-1.svg' },
  { title: 'Slot Text with 3D',                 preview: '01-3d-glass.png',  hearts: '20',  comments: 3,  tags: ['Component', 'Pro'],                pfp: 'pfp-2.svg' },
  { title: 'Say hello to Absolute UI',          preview: '02-3d-shapes.png', hearts: '4',   comments: 2,  tags: ['Template', 'Beginner'],            pfp: 'pfp-3.svg' },
  { title: 'Embedding Facebook posts',          preview: '06-headers.png',   hearts: '15',  comments: 4,  tags: ['Code snippet'],                    pfp: 'pfp-4.svg' },
  { title: 'Duplicated for multi lingual sites?', preview: '09-comforty.png', hearts: '15', comments: 4,  tags: ['Code snippet', 'Advanced'],        pfp: 'pfp-1.svg' },
  { title: 'Holographic Hover Card',            preview: '11-smarthome.png', hearts: '15',  comments: 4,  tags: ['Animation', 'Free', 'Intermediate'], pfp: 'pfp-2.svg' },
  { title: 'Unscramble Text Scroll',            preview: '04-lines.png',     hearts: '15',  comments: 4,  tags: ['Animation'],                       pfp: 'pfp-3.svg' },
  { title: 'Free Framer Template',              preview: '08-redo.png',      hearts: '32',  comments: 11, tags: ['Template', 'Free'],                pfp: 'pfp-4.svg' },
  { title: 'Gradient Backgrounds',              preview: '07-palette.png',   hearts: '88',  comments: 14, tags: ['Component', 'Free'],               pfp: 'pfp-1.svg' },
  { title: 'Smooth Page Transitions',           preview: '10-semi.png',      hearts: '102', comments: 7,  tags: ['Transition', 'Pro', 'Advanced'],   pfp: 'pfp-2.svg' },
  { title: 'Fade In Reveal',                    preview: '03-geometric.png', hearts: '56',  comments: 9,  tags: ['Animation', 'Free'],               pfp: 'pfp-3.svg' },
  { title: 'Snippet: Smooth Scroll',            preview: '12-3d-geometric.png', hearts: '24', comments: 3, tags: ['Code snippet', 'Intermediate'],   pfp: 'pfp-4.svg' },
];

const FILTERS = ['All', 'Favorites', 'Components', 'Animations', 'Code snippets', 'Transitions', 'Template', 'Free'] as const;
type Filter = typeof FILTERS[number];

// null = no tag filter (All / Favorites — Favorites narrows by
// bookmark set, not by tag).
const FILTER_TAG: Record<Filter, string | null> = {
  'All': null,
  'Favorites': null,
  'Components': 'Component',
  'Animations': 'Animation',
  'Code snippets': 'Code snippet',
  'Transitions': 'Transition',
  'Template': 'Template',
  'Free': 'Free',
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
function Bookmark({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CardPreview({ src }: { src: string }) {
  return (
    <div className="rec-card__preview rec-card__preview--comm">
      <img src={`${import.meta.env.BASE_URL}community/${src}`} alt="" className="rec-card__preview-img" draggable={false} />
    </div>
  );
}

export default function CommunityModal({
  onClose, bookmarked, onToggleBookmark,
}: {
  onClose: () => void;
  bookmarked: Set<string>;
  onToggleBookmark: (title: string) => void;
}) {
  const [filter, setFilter] = useState<Filter>('All');
  const [query, setQuery] = useState('');
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Combined filter: tab category AND case-insensitive title /
  // tag substring match. Empty query matches everything.
  const needle = FILTER_TAG[filter];
  const q = query.trim().toLowerCase();
  const visible = CARDS.filter(c => {
    if (filter === 'Favorites' && !bookmarked.has(c.title)) return false;
    if (needle !== null && !c.tags.includes(needle)) return false;
    if (q === '') return true;
    if (c.title.toLowerCase().includes(q)) return true;
    if (c.tags.some(t => t.toLowerCase().includes(q))) return true;
    return false;
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--community" onClick={e => e.stopPropagation()}>
        <button type="button" className="comm-close" onClick={onClose} aria-label="Close">
          <Close />
        </button>
        <div className="comm-popup">
          <div className="comm-header">
            <h2 className="comm-title">Community Assets</h2>
            <p className="comm-subtitle">Discover and remix shared content</p>
            <div className="comm-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search assets..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <div className="comm-filters">
              {FILTERS.map(f => (
                <button
                  key={f}
                  type="button"
                  className={'comm-filter' + (f === filter ? ' comm-filter--active' : '')}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="comm-grid">
            {visible.map((c, i) => (
              <div className="rec-card" key={c.title + i}>
                <CardPreview src={c.preview} />
                <img src={`${import.meta.env.BASE_URL}recs/pfps/${c.pfp}`} alt="" className="rec-card__avatar rec-card__avatar--img" />
                <div className="rec-card__body">
                  <div className="rec-card__row">
                    <span className="rec-card__title">{c.title}</span>
                    <button
                      type="button"
                      className={'rec-card__bookmark' + (bookmarked.has(c.title) ? ' rec-card__bookmark--on' : '')}
                      aria-label={bookmarked.has(c.title) ? 'Remove bookmark' : 'Bookmark'}
                      aria-pressed={bookmarked.has(c.title)}
                      onClick={() => onToggleBookmark(c.title)}
                    >
                      <Bookmark filled={bookmarked.has(c.title)} />
                    </button>
                  </div>
                  <div className="rec-card__meta">
                    <span><Heart /> {c.hearts}</span>
                    <span><Comment /> {c.comments}</span>
                  </div>
                  <div className="rec-card__tags">
                    {c.tags.map(t => (
                      <span key={t} className={`rec-card__tag rec-card__tag--${t.replace(/\s+/g, '-').toLowerCase()}`}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {visible.length === 0 && (
              <div className="comm-empty">No assets in this category</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
