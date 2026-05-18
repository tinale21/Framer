import { useState } from 'react';
import { Chevron, Plus, Search, ViewDay, PageIcon, MonitorPC } from '../icons';

const TABS = ['Pages', 'Assets', 'Code'] as const;
type TabName = typeof TABS[number];

type Props = {
  homeExpanded: boolean;
  onToggleHome: () => void;
};

export default function LeftSidebar({ homeExpanded, onToggleHome }: Props) {
  const [activeTab, setActiveTab] = useState<TabName>('Pages');

  return (
    <aside className="left-sidebar">
      <div className="left-sidebar__project">
        <span className="left-sidebar__project-name">Project Name</span>
        <span className="free-badge">FREE</span>
      </div>

      <div
        className="segmented"
        style={{ ['--active-index' as string]: TABS.indexOf(activeTab) }}
      >
        <div className="segmented__indicator" />
        {TABS.map((tab, i) => {
          const isActive = tab === activeTab;
          const next = TABS[i + 1];
          const showDivider = !isActive && next !== undefined && next !== activeTab;
          return (
            <button
              key={tab}
              className={
                'segmented__item' +
                (isActive ? ' segmented__item--active' : '') +
                (showDivider ? ' segmented__item--with-divider' : '')
              }
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
        <span>Search this file...</span>
      </div>

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
    </aside>
  );
}
