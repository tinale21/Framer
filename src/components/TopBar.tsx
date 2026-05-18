const ICONS = ['globe', 'hexagon', 'signal', 'play'] as const;

export default function TopBar() {
  return (
    <header className="topbar">
      <img
        src={`${import.meta.env.BASE_URL}framer-logo.svg`}
        alt="Framer"
        className="topbar__logo"
        width={29}
        height={29}
      />
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
