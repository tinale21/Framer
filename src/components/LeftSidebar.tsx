import { Chevron, Plus, Search, Devices, Monitor, ViewportPill } from '../icons';

export default function LeftSidebar() {
  return (
    <aside className="left-sidebar">
      <div className="left-sidebar__project">
        <span className="left-sidebar__project-name">Project Name</span>
        <span className="free-badge">FREE</span>
      </div>

      <div className="tabs">
        <span className="tab tab--active">Pages</span>
        <span className="tab">Assets</span>
        <span className="tab">Code</span>
      </div>

      <div className="divider" />

      <div className="viewport-dropdown">
        <span className="viewport-dropdown__left">
          <ViewportPill />
          Desktop - 1200
        </span>
        <Chevron dir="down" />
      </div>

      <div className="section-header">
        <span className="section-header__label">Pages</span>
        <button className="icon-btn"><Plus /></button>
      </div>

      <div className="search">
        <Search />
        <span>Search This File...</span>
      </div>

      <div className="tree">
        <div className="tree__item tree__item--selected">
          <Devices />
          <span>Home</span>
        </div>
        <div className="tree__item tree__item--sub tree__item--selected">
          <Monitor />
          <span>Desktop</span>
        </div>
      </div>
    </aside>
  );
}
