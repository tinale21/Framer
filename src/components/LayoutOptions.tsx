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
const DotsI = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect width="20" height="20" rx="5.5" fill="#0099ff" />
    <circle cx="5.7" cy="10" r="1.5" fill="#ffffff" />
    <circle cx="10" cy="10" r="1.5" fill="#ffffff" />
    <circle cx="14.3" cy="10" r="1.5" fill="#ffffff" />
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

/** A gray pill text field. Wrapped in a label so a click anywhere in the
 *  pill — not just the narrow input — focuses it. An optional faint suffix
 *  (e.g. X / Y) sits at the right edge. */
function NumField({ value, onChange, suffix }: {
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <label className="layout-field">
      <input
        className="layout-field__input"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={e => e.target.select()}
        spellCheck={false}
      />
      {suffix && <span className="layout-field__suffix">{suffix}</span>}
    </label>
  );
}

/** A number field paired with a −/+ stepper pill (Grid columns / rows). */
function Stepper({ value, onChange, min = 1 }: {
  value: string;
  onChange: (v: string) => void;
  min?: number;
}) {
  const step = (delta: number) => {
    const n = parseInt(value, 10);
    onChange(String(Math.max(min, (Number.isFinite(n) ? n : min) + delta)));
  };
  return (
    <div className="layout-pair">
      <NumField value={value} onChange={onChange} />
      <div className="layout-seg layout-stepper">
        <button type="button" className="layout-seg__btn" onClick={() => step(-1)} aria-label="Decrease">−</button>
        <span className="layout-seg__divider" />
        <button type="button" className="layout-seg__btn" onClick={() => step(1)} aria-label="Increase">+</button>
      </div>
    </div>
  );
}

/** One side of the individual-padding strip: a centered number field with
 *  a faint T / R / B / L label beneath it. */
function PadCell({ side, value, onChange }: {
  side: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="layout-pad-cell">
      <NumField value={value} onChange={onChange} />
      <span className="layout-pad-cell__label">{side}</span>
    </div>
  );
}

export default function LayoutOptions({ layoutOpts, onLayoutChange }: {
  layoutOpts: LayoutOpts;
  onLayoutChange: (next: LayoutOpts) => void;
}) {
  // Every control drives the real demo stack, so they all read lifted state.
  const {
    type, direction, distribute, align, gap,
    masonry, cols, rows, gapX, gapY,
    padMode, padT, padR, padB, padL,
  } = layoutOpts;
  const patch = (p: Partial<LayoutOpts>) => onLayoutChange({ ...layoutOpts, ...p });
  const setType = (v: string) => patch({ type: v as LayoutOpts['type'] });
  const setDirection = (v: string) => patch({ direction: v as LayoutOpts['direction'] });
  const setDistribute = (v: string) => patch({ distribute: v });
  const setAlign = (v: string) => patch({ align: v as LayoutOpts['align'] });
  const setPadMode = (v: string) => patch({ padMode: v as LayoutOpts['padMode'] });
  // Uniform padding edits all four sides at once.
  const setPadUniform = (v: string) => patch({ padT: v, padR: v, padB: v, padL: v });
  const [distOpen, setDistOpen] = useState(false);
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
        </>
      )}

      {!isStack && (
        <>
          <div className="layout-opt-row">
            <span className="layout-opt-row__label">Masonry</span>
            <Seg
              value={masonry}
              onChange={v => patch({ masonry: v as LayoutOpts['masonry'] })}
              options={[{ v: 'yes', label: 'Yes' }, { v: 'no', label: 'No' }]}
            />
          </div>

          <div className="layout-opt-row">
            <span className="layout-opt-row__label">Columns</span>
            <Stepper value={cols} onChange={v => patch({ cols: v })} />
          </div>

          {masonry === 'no' && (
            <div className="layout-opt-row">
              <span className="layout-opt-row__label">Rows</span>
              <Stepper value={rows} onChange={v => patch({ rows: v })} />
            </div>
          )}
        </>
      )}

      <div className="layout-opt-row">
        <span className="layout-opt-row__label">Gap</span>
        {isStack ? (
          <NumField value={gap} onChange={v => patch({ gap: v })} />
        ) : (
          <div className="layout-pair">
            <NumField value={gapX} onChange={v => patch({ gapX: v })} suffix="X" />
            <NumField value={gapY} onChange={v => patch({ gapY: v })} suffix="Y" />
          </div>
        )}
      </div>

      <div className="layout-opt-row">
        <span className="layout-opt-row__label">Padding</span>
        <div className="layout-pair layout-pair--pad">
          {padMode === 'uniform'
            ? <NumField value={padT} onChange={setPadUniform} />
            : <div className="layout-field" />}
          <Seg
            value={padMode} onChange={setPadMode}
            options={[
              { v: 'uniform', icon: <PadUniformI /> },
              { v: 'individual', icon: <PadSidesI /> },
            ]}
          />
        </div>
      </div>

      {padMode === 'individual' && (
        <div className="layout-opt-row">
          <span className="layout-opt-row__label" />
          <div className="layout-pad-strip">
            <PadCell side="T" value={padT} onChange={v => patch({ padT: v })} />
            <PadCell side="R" value={padR} onChange={v => patch({ padR: v })} />
            <PadCell side="B" value={padB} onChange={v => patch({ padB: v })} />
            <PadCell side="L" value={padL} onChange={v => patch({ padL: v })} />
          </div>
        </div>
      )}

      {!isStack && masonry === 'no' && (
        <div className="layout-opt-row">
          <span className="layout-opt-row__label" />
          <button type="button" className="layout-advanced">
            <span className="layout-advanced__icon"><DotsI /></span>
            Advanced
          </button>
        </div>
      )}
    </div>
  );
}
