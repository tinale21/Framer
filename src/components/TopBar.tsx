import { FramerLogo, Globe, Gear, Signal, Play } from '../icons';

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar__logo"><FramerLogo size={18} /></div>
      <div className="topbar__right">
        <div className="topbar__avatar">TL</div>
        <button className="topbar__icon" aria-label="Globe"><Globe /></button>
        <button className="topbar__icon" aria-label="Settings"><Gear /></button>
        <button className="topbar__icon" aria-label="Signal"><Signal /></button>
        <button className="topbar__icon" aria-label="Preview"><Play /></button>
        <button className="topbar__btn">Invite</button>
        <button className="topbar__btn">Publish</button>
      </div>
    </header>
  );
}
