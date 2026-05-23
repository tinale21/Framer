import type { VectorKind } from '../types';

const ITEMS: { kind: VectorKind; label: string; icon: React.ReactNode }[] = [
  {
    kind: 'rectangle',
    label: 'Rectangle',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
        <rect x="2" y="2" width="18" height="18" rx="1" />
      </svg>
    ),
  },
  {
    kind: 'oval',
    label: 'Oval',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
        <circle cx="11" cy="11" r="9" />
      </svg>
    ),
  },
  {
    kind: 'polygon',
    label: 'Polygon',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
        <path d="M6 2.5H16L21 11L16 19.5H6L1 11L6 2.5Z" />
      </svg>
    ),
  },
  {
    kind: 'star',
    label: 'Star',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
        <path d="M11 2L13.4 7.9L20 8.4L15 12.7L16.5 19L11 15.6L5.5 19L7 12.7L2 8.4L8.6 7.9L11 2Z" />
      </svg>
    ),
  },
  {
    kind: 'path',
    label: 'Path',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 18L9 7L13 14L19 4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="3" cy="18" r="1.6" fill="currentColor" />
        <circle cx="19" cy="4" r="1.6" fill="currentColor" />
      </svg>
    ),
  },
];

export default function VectorPopout({ onArmVector }: { onArmVector: (kind: VectorKind) => void }) {
  return (
    <div className="popout-vector">
      {ITEMS.map(item => (
        <button
          key={item.kind}
          className="popout-vector__item"
          onClick={() => onArmVector(item.kind)}
        >
          <span className="popout-vector__item-icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
