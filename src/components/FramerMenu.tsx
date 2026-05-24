import { useState, useRef, useLayoutEffect } from 'react';
import type { SceneSetter } from '../types';
import { Search, Chevron } from '../icons';

type Item = {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  divider?: boolean;
  sub?: boolean;
  // Named action so we can wire several "action" items in the same
  // submenu to different parent callbacks.
  action?: 'tutorialOverlays' | 'editorSettings';
};
type Entry = {
  label: string;
  disabled?: boolean;
  checkable?: boolean;
  shortcut?: string;
  items?: Item[];
};

const PREF_ITEMS: Item[] = [
  { label: 'Auto-Draft Content', checked: true },
  { label: 'Use Direct Selection', checked: true },
  { label: 'Auto Layout Pinning', disabled: true },
  { label: 'Reverse Zoom Direction' },
  { label: 'Fast Zoom' },
  { label: 'Animate on Zoom', checked: true },
  { label: 'Keyboard Zooms to Selection' },
  { label: 'Auto Switch to Layers Panel' },
  { label: 'Off-Screen Content Hint', checked: true },
  { label: 'Exit Canvas on Double Click' },
  { label: 'Show Templates on New Project', checked: true },
  { divider: true },
  { label: 'Reset Default Frame Fill', disabled: true },
  { label: 'Performance Mode' },
  { label: 'Tutorial Overlays', action: 'tutorialOverlays' },
  { label: 'Editor Settings', action: 'editorSettings' },
];

const SECTIONS: Entry[] = [
  { label: 'File', items: [
    { label: 'New' }, { label: 'New Page' }, { label: 'New Page Folder' },
    { label: 'Sort Pages Alphabetically' }, { label: 'Sort Layers Alphabetically' },
    { divider: true },
    { label: 'Duplicate' }, { label: 'Archive' },
    { divider: true },
    { label: 'Copy Remix Link' }, { label: 'Transfer Project' },
    { divider: true },
    { label: 'Invite Collaborators…' }, { label: 'Version History' },
    { label: 'Import from Figma…' },
    { divider: true },
    { label: 'Upload Image…' }, { label: 'Upload Video…' },
    { divider: true },
    { label: 'Publish Site' }, { label: 'Open Site', disabled: true },
  ] },
  { label: 'Edit', items: [
    { label: 'Undo' }, { label: 'Redo' },
    { divider: true },
    { label: 'Back' }, { label: 'Forward', disabled: true },
    { divider: true },
    { label: 'Cut', disabled: true }, { label: 'Copy', disabled: true },
    { label: 'Paste', sub: true }, { label: 'Duplicate', disabled: true },
    { label: 'Delete', disabled: true },
    { divider: true },
    { label: 'Find Content' }, { label: 'Text Search…' },
    { divider: true },
    { label: 'Rename', disabled: true }, { label: 'Auto Rename', disabled: true },
    { label: 'Lock', disabled: true }, { label: 'Hide', disabled: true },
    { divider: true },
    { label: 'Back To Page', disabled: true }, { label: 'Select Top Parent', disabled: true },
    { label: 'Select Parent', disabled: true }, { label: 'Select All' },
    { label: 'Select All Siblings', disabled: true }, { label: 'Select All Children', disabled: true },
    { label: 'Select All Top Parents' }, { label: 'Select All Text Layers' },
  ] },
  { label: 'View', checkable: true, items: [
    { label: 'Open Preview' }, { label: 'Templates' },
    { divider: true },
    { label: 'Appearance', sub: true },
    { divider: true },
    { label: 'CMS' }, { label: 'Localization' }, { label: 'Analytics' },
    { divider: true },
    { label: 'Zoom In' }, { label: 'Zoom Out' }, { label: 'Zoom to 100%' }, { label: 'Zoom to Fit' },
    { label: 'Zoom to Selection', disabled: true }, { label: 'Collapse Layers', disabled: true },
    { divider: true },
    { label: 'Show Pages' }, { label: 'Show Layers' }, { label: 'Show Assets' },
    { divider: true },
    { label: 'Show Interface', checked: true }, { label: 'Show All Links' },
    { label: 'Show Handoff' }, { label: 'Show Rulers' }, { label: 'Show Guides' },
    { label: 'Show Pixel Grid' },
  ] },
  { label: 'Tool', items: [
    { label: 'Insert' }, { label: 'Wireframer' },
    { divider: true },
    { label: 'Layout', sub: true }, { label: 'Text' }, { label: 'Link', disabled: true },
    { label: 'Scale', disabled: true }, { label: 'Vector', sub: true },
    { divider: true },
    { label: 'Library' }, { label: 'Zoom' }, { label: 'Comment' }, { label: 'Cursor Chat' },
    { label: 'Sample Color', disabled: true },
  ] },
  { label: 'Layout', items: [
    { label: 'Add Frame' }, { label: 'Add Stack' }, { label: 'Remove Wrapper', disabled: true },
    { divider: true },
    { label: 'Fit Content' }, { label: 'Resize to Fit Content', disabled: true },
    { divider: true },
    { label: 'Bring to Front', disabled: true }, { label: 'Bring Forward', disabled: true },
    { label: 'Send Backward', disabled: true }, { label: 'Send to Back', disabled: true },
    { divider: true },
    { label: 'Align', sub: true },
  ] },
  { label: 'Text', disabled: true },
  { label: 'Vector', disabled: true },
  { label: 'Component', items: [
    { label: 'Create Component…' }, { label: 'Create From Code…' },
    { divider: true },
    { label: 'Show Primary', disabled: true }, { label: 'Detach From Primary', disabled: true },
    { label: 'Update Primary From Instance', disabled: true },
    { divider: true },
    { label: 'Reset Overrides', disabled: true },
  ] },
  { label: 'Plugins', items: [
    { label: 'Browse All' }, { label: 'Run Recent Plugin', disabled: true },
    { label: 'Clear Recent Plugins', disabled: true }, { label: 'Open Development Plugin' },
    { divider: true },
    { label: 'Show Developer Tools' }, { label: 'API Documentation' },
  ] },
  { label: 'Code', items: [
    { label: 'Create Code Component…' }, { label: 'Create Code Override…' },
    { divider: true },
    { label: 'API Documentation' },
  ] },
  { label: 'Preferences', checkable: true, items: PREF_ITEMS },
  { label: 'Site Settings', items: [
    { label: 'Settings' },
    { divider: true },
    { label: 'General' }, { label: 'Domains' }, { label: 'Redirects' }, { label: 'Forms' },
    { label: 'Versions' }, { label: 'Custom Code' }, { label: 'Usage' }, { label: 'Plans' },
  ] },
  { label: 'Help', items: [
    { label: 'Watch Tutorials' }, { label: 'Browse Marketplace' },
    { divider: true },
    { label: 'Request Feature' }, { label: 'Join Community' },
    { divider: true },
    { label: 'Keyboard Shortcuts' }, { label: 'Copy Version Number' },
  ] },
];

const ENTRIES: Entry[] = [
  { label: 'Go to Dashboard' },
  { label: 'Quick Actions', shortcut: 'Ctrl+K' },
  ...SECTIONS,
  { label: 'Your Account' },
];

// Matches Framer's command search: the query is a prefix of any word.
const wordMatch = (text: string, q: string) =>
  text.toLowerCase().split(/[\s-]+/).some(w => w.startsWith(q));
const entryMatch = (e: Entry, q: string) =>
  wordMatch(e.label, q) || !!e.items?.some(it => it.label && wordMatch(it.label, q));

const CheckMark = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5L20 7" />
  </svg>
);

export default function FramerMenu({ onClose, onSceneChange, onOpenEditorSettings }: {
  onClose: () => void;
  onSceneChange: SceneSetter;
  onOpenEditorSettings: () => void;
}) {
  // `active` tracks which section is hovered, the y-offset of its row,
  // and the row's height, so the submenu can open next to it instead of
  // always at the top — and so a "bottom-aligned" submenu (Preferences)
  // can land flush with the row's bottom.
  const [active, setActive] = useState<{ label: string; top: number; height: number } | null>(null);
  const [query, setQuery] = useState('');
  // Measured height of the currently rendered submenu — used to bottom-align
  // the Preferences submenu against the Preferences row.
  const submenuRef = useRef<HTMLDivElement>(null);
  const [submenuTop, setSubmenuTop] = useState<number | null>(null);

  const q = query.trim().toLowerCase();
  const results = q ? ENTRIES.filter(e => entryMatch(e, q)) : null;
  // While searching, the first result is highlighted until something is hovered.
  const highlighted = active?.label ?? (results && results.length ? results[0].label : null);
  const activeSection = SECTIONS.find(s => s.label === active?.label && s.items);

  const openTutorialOverlays = () => {
    onClose();
    onSceneChange('tutorial-overlays-settings');
  };
  const openEditorSettings = () => {
    onClose();
    onOpenEditorSettings();
  };
  const runAction = (name?: Item['action']) => {
    if (name === 'tutorialOverlays') openTutorialOverlays();
    else if (name === 'editorSettings') openEditorSettings();
  };

  // After the Preferences submenu mounts, measure it and bottom-align it
  // with the Preferences row so there's no leftover gap below.
  useLayoutEffect(() => {
    if (!submenuRef.current || !active || activeSection?.label !== 'Preferences') {
      setSubmenuTop(null);
      return;
    }
    const h = submenuRef.current.offsetHeight;
    setSubmenuTop(active.top + active.height - h);
  }, [active, activeSection?.label]);

  const renderEntry = (e: Entry) => (
    <button
      key={e.label}
      type="button"
      className={
        'framer-menu__item'
        + (e.disabled ? ' framer-menu__item--disabled' : '')
        + (highlighted === e.label ? ' framer-menu__item--active' : '')
      }
      onMouseEnter={ev => setActive(
        e.items
          ? { label: e.label, top: ev.currentTarget.offsetTop, height: ev.currentTarget.offsetHeight }
          : null
      )}
    >
      {e.label}
      {e.shortcut && <span className="framer-menu__shortcut">{e.shortcut}</span>}
      {e.items && <span className="framer-menu__chev"><Chevron dir="right" size={13} /></span>}
    </button>
  );

  return (
    <div className="framer-menu">
      <div className="framer-menu__panel">
        <div className="framer-menu__search">
          <Search size={15} />
          <input
            className="framer-menu__search-input"
            placeholder="Type to search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            spellCheck={false}
            autoFocus
          />
        </div>
        <div className="framer-menu__sep" />
        {q ? (
          results && results.length
            ? results.map(renderEntry)
            : <div className="framer-menu__empty">No results</div>
        ) : (
          ENTRIES.map((e, i) => (
            <div key={e.label} style={{ display: 'contents' }}>
              {(i === 2 || e.label === 'Site Settings' || e.label === 'Your Account') && (
                <div className="framer-menu__sep" />
              )}
              {renderEntry(e)}
            </div>
          ))
        )}
      </div>

      {activeSection && activeSection.items && active && (
        <div
          ref={submenuRef}
          className="framer-menu__panel framer-menu__submenu"
          style={
            // Preferences sits near the bottom of the parent menu, so its
            // submenu opens *upward* and we bottom-align it with the
            // Preferences row (Framer-style — no gap below).
            activeSection.label === 'Preferences'
              ? { top: submenuTop ?? 0, maxHeight: `calc(100vh - 67px)` }
              : { top: active.top - 8, maxHeight: `calc(100vh - 67px - ${active.top}px)` }
          }
        >
          {activeSection.items.map((it, i) => it.divider ? (
            <div key={i} className="framer-menu__sep" />
          ) : (
            <button
              key={i}
              type="button"
              className={'framer-menu__item' + (it.disabled ? ' framer-menu__item--disabled' : '')}
              onClick={it.action ? () => runAction(it.action) : undefined}
            >
              {activeSection.checkable && (
                <span className="framer-menu__check">{it.checked && <CheckMark />}</span>
              )}
              {it.label}
              {it.sub && (
                <span className="framer-menu__chev"><Chevron dir="right" size={13} /></span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
