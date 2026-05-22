import { useState, useRef, useEffect } from 'react';
import type { SceneSetter } from '../types';
import { Chevron } from '../icons';
import FramerMenu from './FramerMenu';

const ICONS = ['globe', 'hexagon', 'signal', 'play'] as const;

export default function TopBar({ onSceneChange }: { onSceneChange: SceneSetter }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  return (
    <header className="topbar">
      <div className="topbar__logo-wrap" ref={wrapRef}>
        <button
          type="button"
          className={'topbar__logo-btn' + (menuOpen ? ' topbar__logo-btn--active' : '')}
          onClick={() => setMenuOpen(o => !o)}
        >
          <img
            src={`${import.meta.env.BASE_URL}framer-logo.svg`}
            alt="Framer"
            className="topbar__logo"
            width={26}
            height={26}
          />
          <span className="topbar__logo-chev"><Chevron dir="down" size={13} /></span>
        </button>
        {menuOpen && (
          <FramerMenu onClose={() => setMenuOpen(false)} onSceneChange={onSceneChange} />
        )}
      </div>
      <div className="topbar__right">
        <div className="topbar__avatar-wrap">
          <img
            src={`${import.meta.env.BASE_URL}icons/topbar-avatar.svg`}
            alt="Tina Le"
            className="topbar__pill"
            width={35}
            height={34}
          />
          <div className="topbar__tooltip" role="tooltip">
            <div className="topbar__tooltip-name">Tina Le</div>
            <div className="topbar__tooltip-sub">Viewing now</div>
          </div>
        </div>
        {ICONS.map(name => (
          <img
            key={name}
            src={`${import.meta.env.BASE_URL}icons/topbar-${name}.svg`}
            alt={name}
            className="topbar__pill"
            width={35}
            height={34}
          />
        ))}
        <button className="topbar__btn">Invite</button>
        <button className="topbar__btn topbar__btn--primary">Publish</button>
      </div>
    </header>
  );
}
