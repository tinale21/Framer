type IconProps = { size?: number; className?: string };

const wrap = (size = 16, className?: string, children?: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);

export const FramerLogo = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 2h14v7H12L5 2zM5 9h14v7l-7 7-7-7V9zm0 14v-7l7 7H5z" />
  </svg>
);

export const Globe = ({ size = 18 }: IconProps) => wrap(size, undefined, (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </>
));

export const Gear = ({ size = 18 }: IconProps) => wrap(size, undefined, (
  <>
    <path d="M12 3l1.5 3.2L17 7l-2.5 2.5L15 13l-3-1.5L9 13l.5-3.5L7 7l3.5-.8L12 3z" />
    <circle cx="12" cy="14" r="3" />
  </>
));

export const Signal = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="14" width="3" height="6" rx="0.6" />
    <rect x="9" y="10" width="3" height="10" rx="0.6" />
    <rect x="15" y="6" width="3" height="14" rx="0.6" />
  </svg>
);

export const Play = ({ size = 18, filled = true }: IconProps & { filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
    <path d="M7 5l12 7-12 7V5z" />
  </svg>
);

export const Chevron = ({ size = 14, dir = 'down' }: IconProps & { dir?: 'down' | 'up' | 'right' }) => {
  const rotate = { down: 0, up: 180, right: -90 }[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${rotate}deg)` }}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
};

export const Plus = ({ size = 14 }: IconProps) => wrap(size, undefined, <path d="M12 5v14M5 12h14" />);

export const Search = ({ size = 14 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10.5" cy="10.5" r="5.5" />
    <path d="M14.5 14.5l3.2 3.2" />
  </svg>
);

export const Monitor = ({ size = 16 }: IconProps) => wrap(size, undefined, (
  <>
    <rect x="3" y="4" width="18" height="12" rx="1.5" />
    <path d="M8 20h8M12 16v4" />
  </>
));

export const Devices = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="6" width="13" height="9" rx="1.2" />
    <rect x="16" y="9" width="6" height="9" rx="1" />
  </svg>
);

export const ViewportPill = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="7" width="20" height="10" rx="2" />
  </svg>
);

export const PageIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="9 6 17 14" fill="currentColor">
    <path d="M11.5873 17.3016C11.1508 17.3016 10.7772 17.1463 10.4666 16.8357C10.1561 16.5252 10.0005 16.1513 9.99998 15.7143V8.57145C9.99998 8.13494 10.1555 7.76139 10.4666 7.45081C10.7778 7.14023 11.1513 6.98468 11.5873 6.98415H22.6984C23.1349 6.98415 23.5087 7.1397 23.8198 7.45081C24.1309 7.76192 24.2862 8.13547 24.2857 8.57145H19.9206C19.1534 8.57145 18.4987 8.84261 17.9563 9.38494C17.414 9.92727 17.1428 10.582 17.1428 11.3492V17.3016H11.5873ZM19.9206 19.6826C19.5899 19.6826 19.309 19.5669 19.0778 19.3357C18.8465 19.1045 18.7307 18.8233 18.7301 18.4921V11.3492C18.7301 11.0185 18.846 10.7376 19.0778 10.5064C19.3095 10.2752 19.5905 10.1593 19.9206 10.1587H23.8889C24.2196 10.1587 24.5008 10.2746 24.7325 10.5064C24.9643 10.7381 25.0799 11.0191 25.0793 11.3492V18.4921C25.0793 18.8228 24.9637 19.104 24.7325 19.3357C24.5013 19.5675 24.2201 19.6831 23.8889 19.6826H19.9206ZM9.20633 19.6826V18.0953H17.1428V19.6826H9.20633ZM21.9047 13.7302C22.0767 13.7302 22.219 13.6707 22.3317 13.5516C22.4444 13.4326 22.5005 13.2937 22.5 13.1349C22.5 12.963 22.4436 12.8209 22.3309 12.7087C22.2182 12.5966 22.0762 12.5402 21.9047 12.5397C21.746 12.5397 21.6071 12.5961 21.4881 12.7087C21.369 12.8214 21.3095 12.9635 21.3095 13.1349C21.3095 13.2937 21.369 13.4326 21.4881 13.5516C21.6071 13.6707 21.746 13.7302 21.9047 13.7302Z" />
  </svg>
);

export const MonitorPC = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="27 35 18 17" fill="currentColor">
    <path d="M43.3333 45.3968H29.0476V37.4603H43.3333V45.3968ZM43.3333 35.873H29.0476C28.1666 35.873 27.4603 36.5794 27.4603 37.4603V46.9841C27.4603 47.4051 27.6275 47.8088 27.9252 48.1065C28.2229 48.4042 28.6266 48.5714 29.0476 48.5714H34.6032L33.0159 50.9524V51.746H39.3651V50.9524L37.7778 48.5714H43.3333C43.7543 48.5714 44.158 48.4042 44.4557 48.1065C44.7534 47.8088 44.9206 47.4051 44.9206 46.9841V37.4603C44.9206 36.5794 44.2063 35.873 43.3333 35.873Z" />
  </svg>
);

export const Triangle = ({ size = 10, dir = 'down' }: IconProps & { dir?: 'down' | 'up' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 10 10"
    fill="currentColor"
    style={{ transform: `rotate(${dir === 'up' ? 0 : 180}deg)`, transition: 'transform 0.2s' }}
  >
    <path d="M0.5 8L5 3L9.5 8H0.5Z" />
  </svg>
);

export const ViewDay = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor">
    <path d="M3.15 15.87c-.22 0-.41-.08-.55-.23-.15-.15-.22-.34-.22-.56 0-.22.08-.41.23-.56.15-.15.34-.23.56-.23h12.72c.22 0 .41.08.55.23.15.15.22.34.22.56 0 .22-.08.41-.23.57-.15.15-.34.23-.56.23H3.15zm.82-3.18c-.44 0-.81-.16-1.12-.47-.31-.31-.47-.68-.47-1.12V7.94c0-.44.16-.81.47-1.12.31-.31.69-.47 1.12-.47h11.11c.44 0 .81.16 1.12.47.31.31.47.69.47 1.12v3.17c0 .44-.16.81-.47 1.12-.31.31-.69.47-1.12.47H3.97zM3.15 4.76c-.22 0-.41-.08-.55-.23-.15-.15-.22-.34-.22-.56 0-.22.08-.41.23-.56.15-.15.34-.23.56-.23h12.72c.22 0 .41.08.55.23.15.15.22.34.22.56 0 .22-.08.41-.23.57-.15.15-.34.23-.56.23H3.15z"/>
  </svg>
);

export const Cursor = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 3l14 8-6 1.5L10 19 5 3z" />
  </svg>
);

export const Chat = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 4v-4H6a2 2 0 0 1-2-2V5z" />
  </svg>
);

export const Moon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10z" />
  </svg>
);

export const GridPlus = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M17.5 14v7M14 17.5h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const People = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9" cy="9" r="3" />
    <circle cx="17" cy="10" r="2.4" />
    <path d="M3 19c0-3 3-5 6-5s6 2 6 5v1H3v-1zm12-1c0-2 2-3.6 4-3.6s4 1.6 4 3.6v1h-5" />
  </svg>
);

export const SearchPlus = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="6" fill="currentColor" stroke="none" />
    <path d="M16 16l5 5" />
  </svg>
);

export const ToolbarFrame = ({ active = false, size = 20 }: IconProps & { active?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? '#0099FF' : 'currentColor'}>
    <rect x="4" y="4" width="14" height="16" rx="2" opacity="0.85" />
    <rect x="8" y="2" width="14" height="16" rx="2" opacity="0.5" />
  </svg>
);

export const ToolbarMonitor = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="6" width="15" height="10" rx="1.5" />
    <rect x="18" y="9" width="4" height="7" rx="1" />
  </svg>
);

export const ToolbarLayers = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="14" height="14" rx="2" opacity="0.4" />
    <rect x="7" y="7" width="14" height="14" rx="2" opacity="0.9" />
  </svg>
);

/* Insert tile icons */
export const IconBase = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="6" width="18" height="12" rx="2.5" />
  </svg>
);
export const IconGrid = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M3 9h18" />
  </svg>
);
export const IconText = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="M8 9h8M12 9v6" stroke="white" strokeWidth={2} strokeLinecap="round" fill="none" />
  </svg>
);
export const IconVector = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path d="M5 5c0 8 6 14 14 14" />
    <circle cx="5" cy="5" r="2" fill="currentColor" />
  </svg>
);
export const IconElement = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M10 9l5 3-5 3V9z" fill="white" />
  </svg>
);
export const IconComponent = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3l4 4-4 4-4-4 4-4zm0 10l4 4-4 4-4-4 4-4zm-5-5l4 4-4 4-4-4 4-4zm10 0l4 4-4 4-4-4 4-4z" />
  </svg>
);

/* Popout secondary icons */
export const IconFrame = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" />
  </svg>
);
export const IconStack = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="4" height="16" rx="1" />
    <rect x="10" y="4" width="4" height="16" rx="1" opacity="0.7" />
    <rect x="16" y="4" width="4" height="16" rx="1" opacity="0.4" />
  </svg>
);
export const IconMasonry = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="8" height="11" rx="1" />
    <rect x="13" y="3" width="8" height="6" rx="1" />
    <rect x="3" y="16" width="8" height="5" rx="1" />
    <rect x="13" y="11" width="8" height="10" rx="1" />
  </svg>
);

export const Diamond = ({ size = 14 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3l9 9-9 9-9-9 9-9z" />
  </svg>
);

/* Alignment icons */
const Bar = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => (
  <rect x={x} y={y} width={w} height={h} fill="currentColor" rx="0.5" />
);
export const AlignTop = () => (
  <svg width="22" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <Bar x={8} y={8} w={3} h={11} /><Bar x={13} y={8} w={3} h={7} />
  </svg>
);
export const AlignMidV = () => (
  <svg width="22" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <Bar x={8} y={6} w={3} h={12} /><Bar x={13} y={9} w={3} h={6} />
  </svg>
);
export const AlignBottom = () => (
  <svg width="22" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <Bar x={8} y={5} w={3} h={11} /><Bar x={13} y={9} w={3} h={7} />
  </svg>
);
export const AlignLeft = () => (
  <svg width="22" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <Bar x={6} y={6} w={12} h={3} /><Bar x={6} y={13} w={7} h={3} />
  </svg>
);
export const AlignMidH = () => (
  <svg width="22" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <Bar x={5} y={6} w={14} h={3} /><Bar x={8} y={13} w={8} h={3} />
  </svg>
);
export const AlignRight = () => (
  <svg width="22" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <Bar x={6} y={6} w={12} h={3} /><Bar x={11} y={13} w={7} h={3} />
  </svg>
);

export const Sort = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M4 6h16M7 12h13M10 18h10" />
  </svg>
);

export const CheckSquare = ({ checked = true, thin = false, size = 22 }: { checked?: boolean; thin?: boolean; size?: number }) => (
  <div className={`checkbox ${checked ? 'checkbox--checked' : ''} ${thin ? 'checkbox--unchecked-thin' : ''}`} style={{ width: size, height: size }}>
    {checked && (
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5L20 7" />
      </svg>
    )}
  </div>
);

export const Close = ({ size = 18 }: IconProps) => wrap(size, undefined, <path d="M6 6l12 12M18 6L6 18" />);
