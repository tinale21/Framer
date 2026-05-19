import { useState, useRef, useLayoutEffect } from 'react';
import { Chevron, Plus, Search, ViewDay, PageIcon, MonitorPC, Close } from '../icons';

const TABS = ['Pages', 'Assets', 'Code'] as const;
type TabName = typeof TABS[number];

type Props = {
  homeExpanded: boolean;
  onToggleHome: () => void;
};

export default function LeftSidebar({ homeExpanded, onToggleHome }: Props) {
  const [activeTab, setActiveTab] = useState<TabName>('Pages');
  const [searchQuery, setSearchQuery] = useState('');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  useLayoutEffect(() => {
    const el = tabRefs.current[TABS.indexOf(activeTab)];
    if (el) {
      const rect = el.getBoundingClientRect();
      const parentRect = el.parentElement!.getBoundingClientRect();
      setIndicator({
        left: rect.left - parentRect.left,
        width: rect.width,
        ready: true,
      });
    }
  }, [activeTab]);

  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;
  const homeMatches = isSearching && 'home'.includes(query);
  const desktopMatches = isSearching && 'desktop'.includes(query);

  return (
    <aside className="left-sidebar">
      <div className="left-sidebar__project">
        <span
          className="left-sidebar__project-name"
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
        >
          Project Name
        </span>
        <span className="free-badge">FREE</span>
      </div>

      <div className="pill-tabs">
        <div
          className="pill-tabs__indicator"
          style={{ left: indicator.left, width: indicator.width, opacity: indicator.ready ? 1 : 0 }}
        />
        {TABS.map((tab, i) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              ref={el => { tabRefs.current[i] = el; }}
              className={'pill-tab' + (isActive ? ' pill-tab--active' : '')}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="divider" />

      <div className="viewport-dropdown">
        <span className="viewport-dropdown__left">
          <ViewDay />
          Desktop - 1200
        </span>
        <span className="viewport-dropdown__chevron"><Chevron dir="down" /></span>
      </div>

      <div className="section-header">
        <span className="section-header__label">Pages</span>
        <button className="icon-btn"><Plus /></button>
      </div>

      <div className="search">
        <Search size={18} />
        <input
          type="text"
          className="search__input"
          placeholder="Search this file..."
          spellCheck={false}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {isSearching && (
          <button
            type="button"
            className="search__clear"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <Close size={14} />
          </button>
        )}
      </div>

      {isSearching ? (
        <div className="search-results">
          {homeMatches && (
            <div className="search-result-row">
              <PageIcon size={14} />
              <span>Home</span>
            </div>
          )}
          {desktopMatches && (
            <div className="search-result-row">
              <MonitorPC size={14} />
              <span>Desktop</span>
            </div>
          )}
        </div>
      ) : (
      <div className={'home-dropdown' + (homeExpanded ? ' home-dropdown--expanded' : '')}>
        <button
          className="home-dropdown__row home-dropdown__row--home"
          onClick={onToggleHome}
        >
          <PageIcon size={14} />
          <span>Home</span>
          <span className="home-dropdown__chevron home-dropdown__chevron--home">
            <Chevron dir="down" />
          </span>
        </button>
        <div className="home-dropdown__sub-wrap">
          <div className="home-dropdown__row home-dropdown__row--sub">
            <MonitorPC size={14} />
            <span>Desktop</span>
            <span className="home-dropdown__chevron home-dropdown__chevron--sub">
              <Chevron dir="up" />
            </span>
          </div>
        </div>
      </div>
      )}
    </aside>
  );
}
