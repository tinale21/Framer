export default function GridPopout() {
  return (
    <div className="popout-grid">
      <button className="popout-grid__item">
        <span className="popout-grid__item-icon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
            <rect width="22" height="22" />
          </svg>
        </span>
        Frame
      </button>
      <button className="popout-grid__item">
        <span className="popout-grid__item-icon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
            <rect x="0" width="10" height="22" />
            <rect x="12" width="10" height="22" />
          </svg>
        </span>
        Stack
      </button>
      <button className="popout-grid__item">
        <span className="popout-grid__item-icon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
            <rect x="0" y="0" width="10" height="10" />
            <rect x="12" y="0" width="10" height="10" />
            <rect x="0" y="12" width="10" height="10" />
            <rect x="12" y="12" width="10" height="10" />
          </svg>
        </span>
        Grid
      </button>
      <button className="popout-grid__item">
        <span className="popout-grid__item-icon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
            <rect x="0" y="0" width="10" height="4" />
            <rect x="0" y="6" width="10" height="16" />
            <rect x="12" y="0" width="10" height="10" />
            <rect x="12" y="12" width="10" height="10" />
          </svg>
        </span>
        Masonry
      </button>
    </div>
  );
}
