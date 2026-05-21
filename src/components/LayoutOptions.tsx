import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { Chevron } from '../icons';
import type { LayoutOpts } from '../types';

const DISTRIBUTE_OPTIONS = [
  'Start', 'Center', 'End', 'Space Between', 'Space Around', 'Space Evenly',
];

/* Icons used only by the layout panel. */
const ArrowH = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M2.75 9h12.5M2.75 9 5.5 6.25M2.75 9l2.75 2.75M15.25 9 12.5 6.25M15.25 9l-2.75 2.75"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);
const ArrowV = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M9 2.75v12.5M9 2.75 6.25 5.5M9 2.75l2.75 2.75M9 15.25 6.25 12.5M9 15.25l2.75-2.75"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);
/* Cross-axis align for a horizontal stack: top / middle / bottom. */
const AlignTopI = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M4 3.75h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="6" y="6.25" width="6" height="8" rx="1.5" fill="currentColor" />
  </svg>
);
const AlignMidI = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M4 9h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="6" y="5" width="6" height="8" rx="1.5" fill="currentColor" />
  </svg>
);
const AlignBotI = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M4 14.25h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="6" y="3.75" width="6" height="8" rx="1.5" fill="currentColor" />
  </svg>
);
/* Cross-axis align for a vertical stack: left / center / right. */
const AlignLeftI = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M3.75 4v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="6.25" y="6" width="8" height="6" rx="1.5" fill="currentColor" />
  </svg>
);
const AlignCtrI = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 4v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="5" y="6" width="8" height="6" rx="1.5" fill="currentColor" />
  </svg>
);
const AlignRightI = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M14.25 4v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="3.75" y="6" width="8" height="6" rx="1.5" fill="currentColor" />
  </svg>
);
const PadUniformI = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="3.75" y="3.75" width="10.5" height="10.5" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);
const PadSidesI = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M4 6.75V5.5A1.5 1.5 0 0 1 5.5 4h1.25M11.25 4h1.25A1.5 1.5 0 0 1 14 5.5v1.25M14 11.25v1.25a1.5 1.5 0 0 1-1.5 1.5h-1.25M6.75 14H5.5A1.5 1.5 0 0 1 4 12.5v-1.25"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
    />
  </svg>
);

type SegOption = { v: string; label?: string; icon?: ReactNode };

/** A gray pill segmented control. A divider shows between two adjacent
 *  segments only when neither of them is the active one. */
function Seg({ options, value, onChange }: {
  options: SegOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="layout-seg">
      {options.map((o, i) => {
        const active = o.v === value;
        const prev = options[i - 1];
        const divider = i > 0 && !active && prev.v !== value;
        return (
          <Fragment key={o.v}>
            {divider && <span className="layout-seg__divider" />}
            <button
              type="button"
              className={'layout-seg__btn' + (active ? ' layout-seg__btn--active' : '')}
              onClick={() => onChange(o.v)}
            >
              {o.icon ?? o.label}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}

/** A gray pill text field with an optional faint suffix (X / Y / side). */
function NumField({ value, onChange, suffix }: {
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div className="layout-field">
      <input
        className="layout-field__input"
        value={value}
        onChange={e => onChange(e.target.value)}
        spellCheck={false}
      />
      {suffix && <span className="layout-field__suffix">{suffix}</span>}
    </div>
  );
}

export default function LayoutOptions({ layoutOpts, onLayoutChange }: {
  layoutOpts: LayoutOpts;
  onLayoutChange: (next: LayoutOpts) => void;
}) {
  // Type / Direction / Distribute / Align drive the real demo stack, so they
  // live in lifted state. Wrap / Gap / Padding are panel-only for now.
  const { type, direction, distribute, align } = layoutOpts;
  const patch = (p: Partial<LayoutOpts>) => onLayoutChange({ ...layoutOpts, ...p });
  const setType = (v: string) => patch({ type: v as LayoutOpts['type'] });
  const setDirection = (v: string) => patch({ direction: v as LayoutOpts['direction'] });
  const setDistribute = (v: string) => patch({ distribute: v });
  const setAlign = (v: string) => patch({ align: v as LayoutOpts['align'] });
  const [distOpen, setDistOpen] = useState(false);
  const [wrap, setWrap] = useState('yes');
  const [gapX, setGapX] = useState('10');
  const [gapY, setGapY] = useState('10');
  const [padMode, setPadMode] = useState('uniform');
  const [padding, setPadding] = useState('0');
  const [padT, setPadT] = useState('0');
  const [padR, setPadR] = useState('0');
  const [padB, setPadB] = useState('0');
  const [padL, setPadL] = useState('0');
  const distRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!distOpen) return;
    const onDown = (e: MouseEvent) => {
      if (distRef.current && !distRef.current.contains(e.target as Node)) {
        setDistOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [distOpen]);

  // --- derived layout logic (mirrors Framer's stack rules) ---
  const isStack = type === 'stack';
  // Grid is 2D, and a wrapping stack has a line gap — both need X and Y.
  const twoGaps = !isStack || wrap === 'yes';
  // Align is the cross axis, so the icon set flips with Direction.
  const alignOptions: SegOption[] = direction === 'h'
    ? [
        { v: 'start', icon: <AlignTopI /> },
        { v: 'center', icon: <AlignMidI /> },
        { v: 'end', icon: <AlignBotI /> },
      ]
    : [
        { v: 'start', icon: <AlignLeftI /> },
        { v: 'center', icon: <AlignCtrI /> },
        { v: 'end', icon: <AlignRightI /> },
      ];

  return (
    <div className="layout-opts">
      <div className="layout-opt-row">
        <span className="layout-opt-row__label">Type</span>
        <Seg
          value={type} onChange={setType}
          options={[{ v: 'stack', label: 'Stack' }, { v: 'grid', label: 'Grid' }]}
        />
      </div>

      {isStack && (
        <>
          <div className="layout-opt-row">
            <span className="layout-opt-row__label">Direction</span>
            <Seg
              value={direction} onChange={setDirection}
              options={[{ v: 'h', icon: <ArrowH /> }, { v: 'v', icon: <ArrowV /> }]}
            />
          </div>

          <div className="layout-opt-row">
            <span className="layout-opt-row__label">Distribute</span>
            <div className="layout-dropdown" ref={distRef}>
              <button
                type="button"
                className="layout-dropdown__trigger"
                onClick={() => setDistOpen(o => !o)}
              >
                {distribute}
                <span className="layout-dropdown__chev"><Chevron dir="down" /></span>
              </button>
              {distOpen && (
                <div className="layout-dropdown__menu">
                  {DISTRIBUTE_OPTIONS.map(o => (
                    <button
                      type="button"
                      key={o}
                      className={'layout-dropdown__item' + (o === distribute ? ' layout-dropdown__item--active' : '')}
                      onClick={() => { setDistribute(o); setDistOpen(false); }}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="layout-opt-row">
            <span className="layout-opt-row__label">Align</span>
            <Seg value={align} onChange={setAlign} options={alignOptions} />
          </div>

          <div className="layout-opt-row">
            <span className="layout-opt-row__label">Wrap</span>
            <Seg
              value={wrap} onChange={setWrap}
              options={[{ v: 'yes', label: 'Yes' }, { v: 'no', label: 'No' }]}
            />
          </div>
        </>
      )}

      <div className="layout-opt-row">
        <span className="layout-opt-row__label">Gap</span>
        <div className="layout-pair">
          {twoGaps ? (
            <>
              <NumField value={gapX} onChange={setGapX} suffix="X" />
              <NumField value={gapY} onChange={setGapY} suffix="Y" />
            </>
          ) : (
            <NumField value={gapX} onChange={setGapX} />
          )}
        </div>
      </div>

      <div className="layout-opt-row">
        <span className="layout-opt-row__label">Padding</span>
        <div className="layout-pair layout-pair--pad">
          {padMode === 'uniform' ? (
            <NumField value={padding} onChange={setPadding} />
          ) : (
            <div className="layout-pad-grid">
              <NumField value={padT} onChange={setPadT} suffix="T" />
              <NumField value={padR} onChange={setPadR} suffix="R" />
              <NumField value={padB} onChange={setPadB} suffix="B" />
              <NumField value={padL} onChange={setPadL} suffix="L" />
            </div>
          )}
          <Seg
            value={padMode} onChange={setPadMode}
            options={[
              { v: 'uniform', icon: <PadUniformI /> },
              { v: 'individual', icon: <PadSidesI /> },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
