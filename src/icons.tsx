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

/* Insert tile icons — extracted from Frame 42-47 SVGs (white on dark square) */
export const IconBase = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="24 20 22 22" fill="currentColor">
    <path d="M27.5 38.5V36.8333H37.5V38.5H27.5ZM27.5 35.1667V33.5H42.5V35.1667H27.5ZM29.1667 31.8333C28.7083 31.8333 28.3161 31.6703 27.99 31.3442C27.6639 31.0181 27.5006 30.6256 27.5 30.1667V25.1667C27.5 24.7083 27.6633 24.3161 27.99 23.99C28.3167 23.6639 28.7089 23.5006 29.1667 23.5H40.8333C41.2917 23.5 41.6842 23.6633 42.0108 23.99C42.3375 24.3167 42.5006 24.7089 42.5 25.1667V30.1667C42.5 30.625 42.3369 31.0175 42.0108 31.3442C41.6847 31.6708 41.2922 31.8339 40.8333 31.8333H29.1667Z" />
  </svg>
);
export const IconGrid = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="24 20 22 22" fill="currentColor">
    <path d="M32.5 38.8125H42.1875C42.5332 38.8125 42.8125 38.5332 42.8125 38.1875V27.6406H32.5V38.8125ZM42.1875 23.1875H32.5V26.3906H42.8125V23.8125C42.8125 23.4668 42.5332 23.1875 42.1875 23.1875ZM27.1875 23.8125V38.1875C27.1875 38.5332 27.4668 38.8125 27.8125 38.8125H31.25V23.1875H27.8125C27.4668 23.1875 27.1875 23.4668 27.1875 23.8125Z" />
  </svg>
);
export const IconText = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="24 20 22 22" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M31.6117 22.6665H38.3883C39.1267 22.6665 39.7633 22.6665 40.2733 22.7348C40.8192 22.8082 41.3433 22.974 41.7675 23.399C42.1925 23.824 42.3583 24.3473 42.4317 24.8932C42.5 25.4032 42.5 26.0398 42.5 26.7782V27.6248C42.5 27.8459 42.4122 28.0578 42.2559 28.2141C42.0996 28.3704 41.8877 28.4582 41.6667 28.4582C41.4457 28.4582 41.2337 28.3704 41.0774 28.2141C40.9211 28.0578 40.8333 27.8459 40.8333 27.6248V26.8332C40.8333 26.024 40.8317 25.5007 40.78 25.1157C40.7308 24.754 40.6525 24.6407 40.5892 24.5773C40.5258 24.514 40.4125 24.4357 40.0508 24.3865C39.6667 24.3348 39.1425 24.3332 38.3333 24.3332H35.8333V38.4998C35.8333 38.7208 35.7455 38.9328 35.5893 39.0891C35.433 39.2454 35.221 39.3332 35 39.3332C34.779 39.3332 34.567 39.2454 34.4107 39.0891C34.2545 38.9328 34.1667 38.7208 34.1667 38.4998V24.3332H31.6667C30.8575 24.3332 30.3342 24.3348 29.9492 24.3865C29.5875 24.4357 29.4742 24.514 29.4108 24.5773C29.3475 24.6407 29.2692 24.754 29.22 25.1157C29.1683 25.4998 29.1667 26.024 29.1667 26.8332V27.6248C29.1667 27.8459 29.0789 28.0578 28.9226 28.2141C28.7663 28.3704 28.5543 28.4582 28.3333 28.4582C28.1123 28.4582 27.9004 28.3704 27.7441 28.2141C27.5878 28.0578 27.5 27.8459 27.5 27.6248V26.7782C27.5 26.0398 27.5 25.4032 27.5683 24.8932C27.6417 24.3473 27.8075 23.8232 28.2325 23.399C28.6575 22.974 29.1808 22.8082 29.7267 22.7348C30.2367 22.6665 30.8733 22.6665 31.6117 22.6665Z" />
    <path d="M30.8333 38.5H39.1666" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);
export const IconVector = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="24 20 22 22" fill="currentColor">
    <path d="M39.9338 28.5825C39.5038 28.2512 38.9838 27.5738 38.9838 26.125C38.9838 24.1012 37.4988 23.1313 36.2376 22.6913C35.6748 22.5004 35.0931 22.3709 34.5026 22.305C34.2379 22.2725 33.9717 22.2541 33.7051 22.25C31.7501 22.25 30.2688 22.8525 29.1701 23.7875C28.0813 24.7125 27.4038 25.9287 26.9813 27.105C26.6199 28.1424 26.3914 29.2214 26.3013 30.3162C26.2638 30.7513 26.2513 31.1137 26.2488 31.3713C26.2238 34.0475 27.0788 36.9963 29.5301 38.42C31.4601 39.5375 33.9626 39.75 36.3026 39.75C38.4651 39.75 40.3326 39.4025 41.6688 38.4375C43.0463 37.4412 43.7501 35.8725 43.7501 33.7087C43.7501 31.7188 43.1001 30.5175 42.3651 29.8162C42.0734 29.5365 41.7355 29.3094 41.3663 29.145C40.8788 28.9312 40.3701 28.92 39.9338 28.5825Z" />
  </svg>
);
export const IconElement = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="24 20 22 22" fill="currentColor">
    <path d="M33.6633 36.3609L39.1666 31L33.6633 25.6392C33.4285 25.4103 33.1314 25.2558 32.8092 25.195C32.487 25.1341 32.154 25.1697 31.852 25.2971C31.5499 25.4246 31.2921 25.6383 31.1109 25.9116C30.9297 26.1848 30.8331 26.5055 30.8333 26.8334V35.1667C30.8331 35.4946 30.9297 35.8152 31.1109 36.0884C31.2921 36.3617 31.5499 36.5754 31.852 36.7029C32.154 36.8304 32.487 36.8659 32.8092 36.8051C33.1314 36.7442 33.4285 36.5897 33.6633 36.3609Z" />
  </svg>
);
export const IconComponent = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="24 20 22 22" fill="currentColor">
    <path d="M35.4417 23.0583C35.3245 22.9413 35.1657 22.8755 35.0001 22.8755C34.8344 22.8755 34.6756 22.9413 34.5584 23.0583L31.9334 25.6833C31.8164 25.8005 31.7506 25.9594 31.7506 26.125C31.7506 26.2906 31.8164 26.4495 31.9334 26.5667L34.5584 29.1917C34.6756 29.3087 34.8344 29.3744 35.0001 29.3744C35.1657 29.3744 35.3245 29.3087 35.4417 29.1917L38.0667 26.5667C38.1838 26.4495 38.2495 26.2906 38.2495 26.125C38.2495 25.9594 38.1838 25.8005 38.0667 25.6833L35.4417 23.0583ZM40.3167 28.3083C40.1995 28.1913 40.0407 28.1255 39.8751 28.1255C39.7094 28.1255 39.5506 28.1913 39.4334 28.3083L36.8084 30.9333C36.6914 31.0505 36.6256 31.2094 36.6256 31.375C36.6256 31.5406 36.6914 31.6995 36.8084 31.8167L39.4334 34.4417C39.5506 34.5587 39.7094 34.6244 39.8751 34.6244C40.0407 34.6244 40.1995 34.5587 40.3167 34.4417L42.9417 31.8167C43.0588 31.6995 43.1245 31.5406 43.1245 31.375C43.1245 31.2094 43.0588 31.0505 42.9417 30.9333L40.3167 28.3083ZM35.4417 32.8083C35.3245 32.6913 35.1657 32.6255 35.0001 32.6255C34.8344 32.6255 34.6756 32.6913 34.5584 32.8083L31.9334 35.4333C31.8164 35.5505 31.7506 35.7094 31.7506 35.875C31.7506 36.0406 31.8164 36.1995 31.9334 36.3167L34.5584 38.9417C34.6756 39.0587 34.8344 39.1244 35.0001 39.1244C35.1657 39.1244 35.3245 39.0587 35.4417 38.9417L38.0667 36.3167C38.1838 36.1995 38.2495 36.0406 38.2495 35.875C38.2495 35.7094 38.1838 35.5505 38.0667 35.4333L35.4417 32.8083ZM30.5667 27.9333C30.4495 27.8163 30.2907 27.7505 30.1251 27.7505C29.9594 27.7505 29.8006 27.8163 29.6834 27.9333L27.0584 30.5583C26.9414 30.6755 26.8756 30.8344 26.8756 31C26.8756 31.1656 26.9414 31.3245 27.0584 31.4417L29.6834 34.0667C29.8006 34.1837 29.9594 34.2494 30.1251 34.2494C30.2907 34.2494 30.4495 34.1837 30.5667 34.0667L33.1917 31.4417C33.3088 31.3245 33.3745 31.1656 33.3745 31C33.3745 30.8344 33.3088 30.6755 33.1917 30.5583L30.5667 27.9333Z" />
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

export const ComponentBadge = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <path
      d="M6.375 4.5L9 1.875L11.625 4.5L9 7.125L6.375 4.5ZM6.375 13.5L9 10.875L11.625 13.5L9 16.125L6.375 13.5ZM10.875 9L13.5 6.375L16.125 9L13.5 11.625L10.875 9ZM1.875 9L4.5 6.375L7.125 9L4.5 11.625L1.875 9Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Sort = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M4 6h16M7 12h13M10 18h10" />
  </svg>
);

export const CheckSquare = ({ checked = true, thin = false, size = 22, indeterminate = false }: { checked?: boolean; thin?: boolean; size?: number; indeterminate?: boolean }) => (
  <div className={`checkbox ${(checked || indeterminate) ? 'checkbox--checked' : ''} ${thin ? 'checkbox--unchecked-thin' : ''}`} style={{ width: size, height: size }}>
    {indeterminate ? (
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M6 12h12" />
      </svg>
    ) : checked && (
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5L20 7" />
      </svg>
    )}
  </div>
);

export const Close = ({ size = 18 }: IconProps) => wrap(size, undefined, <path d="M6 6l12 12M18 6L6 18" />);
