const ITEMS = [
  {
    label: 'Path',
    icon: (
      <svg width="22" height="22" viewBox="22.5 18.5 9 9" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M28.25 19.25V21.1625L25.1625 24.25H23.25V26.75H25.75V24.8417L28.8417 21.75H30.75V19.25H28.25ZM29.0833 20.0833H29.9167V20.9167H29.0833V20.0833ZM24.0833 25.0833H24.9167V25.9167H24.0833V25.0833Z"
        />
      </svg>
    ),
  },
  {
    label: 'Rectangle',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
        <rect x="2" y="2" width="18" height="18" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Ellipse',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
        <circle cx="11" cy="11" r="9" />
      </svg>
    ),
  },
  {
    label: 'Polygon',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
        <path d="M11 2L20 18H2L11 2Z" />
      </svg>
    ),
  },
  {
    label: 'Star',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
        <path d="M11 2L13.4 7.9L20 8.4L15 12.7L16.5 19L11 15.6L5.5 19L7 12.7L2 8.4L8.6 7.9L11 2Z" />
      </svg>
    ),
  },
];

export default function VectorPopout() {
  return (
    <div className="popout-vector">
      {ITEMS.map(item => (
        <button key={item.label} className="popout-vector__item">
          <span className="popout-vector__item-icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
