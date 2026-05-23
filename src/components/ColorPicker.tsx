import { useEffect, useMemo, useRef, useState } from 'react';

// ---- HSV(+A) <-> hex helpers (HSV is the picker's source of truth so
// dragging hue past pure black doesn't collapse S/V to 0). ----
export function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = h * 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}
export function hexToHsva(hex: string): { h: number; s: number; v: number; a: number } {
  const clean = hex.replace('#', '');
  const rgb = hexToRgb('#' + clean.slice(0, 6));
  const a = clean.length >= 8 ? parseInt(clean.slice(6, 8), 16) / 255 : 1;
  return { ...rgbToHsv(rgb.r, rgb.g, rgb.b), a };
}
export function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) { r = c; g = x; }
  else if (hp < 2) { r = x; g = c; }
  else if (hp < 3) { g = c; b = x; }
  else if (hp < 4) { g = x; b = c; }
  else if (hp < 5) { r = x; b = c; }
  else { r = c; b = x; }
  const m = v - c;
  const toHex = (n: number) =>
    clamp(Math.round((n + m) * 255), 0, 255).toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}
export function hsvaToHex(h: number, s: number, v: number, a: number): string {
  const rgbHex = hsvToHex(h, s, v);
  if (a >= 1) return rgbHex;
  const aa = clamp(Math.round(a * 255), 0, 255).toString(16).padStart(2, '0');
  return rgbHex + aa;
}

// ---- WCAG contrast against white (the canvas background). All measures
// composite the color over white first using alpha, so a translucent fill
// reports the contrast actually visible on the page. ----
function srgbToLinear(c: number): number {
  const n = c / 255;
  return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}
function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}
function effectiveLuminanceOverWhite(r: number, g: number, b: number, a: number): number {
  const er = r * a + 255 * (1 - a);
  const eg = g * a + 255 * (1 - a);
  const eb = b * a + 255 * (1 - a);
  return relativeLuminance(er, eg, eb);
}
export function contrastOverWhite(r: number, g: number, b: number, a: number): number {
  const L = effectiveLuminanceOverWhite(r, g, b, a);
  const lighter = Math.max(L, 1);
  const darker = Math.min(L, 1);
  return (lighter + 0.05) / (darker + 0.05);
}
// Luminance of an HSV triple (alpha-composited over white) — drives the
// iso-contrast curve and the AA-snap solver.
function lumFromHsva(h: number, s: number, v: number, a: number): number {
  const { r, g, b } = hexToRgb(hsvToHex(h, s, v));
  return effectiveLuminanceOverWhite(r, g, b, a);
}
// For a hue / saturation / alpha, return the value v at which the
// alpha-composited color's contrast against white equals the threshold.
// Binary-searched (L is monotone in v). If even v=0 can't reach (alpha too
// low to meet AA at this hue), the darkest value is returned as best effort.
export function vForContrast(h: number, s: number, threshold: number, a: number): number {
  // The contrast formula: ratio = 1.05 / (L + 0.05) against white. So the
  // target luminance for a given ratio T is L = 1.05/T - 0.05. L is monotone
  // increasing in v (alpha just shifts the floor up); binary-search for it.
  const targetL = 1.05 / threshold - 0.05;
  if (targetL <= 0) return 0; // need maximum contrast — pure black
  if (targetL >= 1) return 1; // need no contrast — pure white
  if (lumFromHsva(h, s, 0, a) > targetL) return 0;
  let lo = 0, hi = 1;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    const L = lumFromHsva(h, s, mid, a);
    if (L > targetL) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}
function buildContrastCurve(h: number, threshold: number, a: number): string {
  const N = 56;
  let d = '';
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    const v = vForContrast(h, s, threshold, a);
    d += (i === 0 ? 'M' : 'L') + (s * 100).toFixed(2) + ' ' + ((1 - v) * 100).toFixed(2) + ' ';
  }
  return d.trim();
}

export default function ColorPicker({ value, onChange, onClose }: {
  value: string;
  onChange: (hex: string) => void;
  onClose: () => void;
}) {
  const [{ h, s, v, a }, setHsva] = useState(() => hexToHsva(value));
  const [hexInput, setHexInput] = useState(value.replace('#', '').slice(0, 6).toUpperCase());
  const [alphaInput, setAlphaInput] = useState(Math.round((hexToHsva(value).a) * 100).toString());

  // External changes to `value` (rare — usually first mount only) resync.
  useEffect(() => {
    const cur = hsvaToHex(h, s, v, a);
    if (cur.toLowerCase() !== value.toLowerCase()) {
      const next = hexToHsva(value);
      setHsva(next);
      setHexInput(value.replace('#', '').slice(0, 6).toUpperCase());
      setAlphaInput(Math.round(next.a * 100).toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const setColor = (nh: number, ns: number, nv: number, na: number) => {
    setHsva({ h: nh, s: ns, v: nv, a: na });
    setHexInput(hsvToHex(nh, ns, nv).replace('#', '').toUpperCase());
    setAlphaInput(Math.round(na * 100).toString());
    onChange(hsvaToHex(nh, ns, nv, na));
  };

  const wrapRef = useRef<HTMLDivElement>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);

  // Outside-click closes the picker. Clicks on the swatch that opened it are
  // ignored (marked with data-color-trigger) so the swatch's onClick can
  // handle toggle without us closing right before it reopens.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (wrapRef.current?.contains(t)) return;
      if (t.closest('[data-color-trigger]')) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // --- SV square drag ---
  const svDragRef = useRef(false);
  const updateSvFrom = (cx: number, cy: number) => {
    const el = svRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const ns = clamp((cx - r.left) / r.width, 0, 1);
    const nv = 1 - clamp((cy - r.top) / r.height, 0, 1);
    setColor(h, ns, nv, a);
  };
  const startSvDrag = (e: React.MouseEvent) => {
    svDragRef.current = true;
    updateSvFrom(e.clientX, e.clientY);
  };
  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (svDragRef.current) updateSvFrom(e.clientX, e.clientY); };
    const onUp = () => { svDragRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h, a]);

  // --- Hue slider drag ---
  const hueDragRef = useRef(false);
  const updateHueFrom = (cx: number) => {
    const el = hueRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = clamp((cx - r.left) / r.width, 0, 1);
    setColor(x * 360, s, v, a);
  };
  const startHueDrag = (e: React.MouseEvent) => {
    hueDragRef.current = true;
    updateHueFrom(e.clientX);
  };
  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (hueDragRef.current) updateHueFrom(e.clientX); };
    const onUp = () => { hueDragRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, v, a]);

  // --- Alpha slider drag ---
  const alphaDragRef = useRef(false);
  const updateAlphaFrom = (cx: number) => {
    const el = alphaRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const na = clamp((cx - r.left) / r.width, 0, 1);
    setColor(h, s, v, na);
  };
  const startAlphaDrag = (e: React.MouseEvent) => {
    alphaDragRef.current = true;
    updateAlphaFrom(e.clientX);
  };
  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (alphaDragRef.current) updateAlphaFrom(e.clientX); };
    const onUp = () => { alphaDragRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h, s, v]);

  const commitHex = () => {
    const m = hexInput.trim().match(/^#?([0-9a-fA-F]{6})$/);
    if (m) {
      const rgb = hexToRgb('#' + m[1]);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setHsva({ ...hsv, a });
      setHexInput(m[1].toUpperCase());
      onChange(hsvaToHex(hsv.h, hsv.s, hsv.v, a));
    } else {
      setHexInput(hsvToHex(h, s, v).replace('#', '').toUpperCase());
    }
  };
  const commitAlpha = () => {
    const n = parseInt(alphaInput, 10);
    if (Number.isFinite(n)) {
      const na = clamp(n, 0, 100) / 100;
      setColor(h, s, v, na);
    } else {
      setAlphaInput(Math.round(a * 100).toString());
    }
  };

  const cursorHex = hsvToHex(h, s, v);
  const hueColor = `hsl(${Math.round(h)}, 100%, 50%)`;
  const rgb = hexToRgb(cursorHex);
  const ratio = contrastOverWhite(rgb.r, rgb.g, rgb.b, a);
  const passesAA = ratio >= 4.5;
  // The iso-contrast curve depends on hue AND alpha (composited over white);
  // recompute when either changes.
  const curvePath = useMemo(() => buildContrastCurve(h, 4.5, a), [h, a]);

  return (
    <div className="color-picker" ref={wrapRef}>
      <div className="color-picker__contrast-row">
        <div className="color-picker__contrast-left">
          <svg width="14" height="14" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="6" fill="#ffffff" stroke="#d8d8d8" strokeWidth="0.6" />
            <path d="M7 1A6 6 0 0 1 7 13Z" fill={cursorHex} />
          </svg>
          <span className="color-picker__ratio">{ratio.toFixed(2)} : 1</span>
        </div>
        <div className="color-picker__contrast-right">
          <button
            type="button"
            className={'color-picker__aa' + (passesAA ? ' color-picker__aa--pass' : '')}
            disabled={passesAA}
            title={passesAA ? undefined : 'Adjust the color to meet AA contrast'}
            onClick={() => {
              if (passesAA) return;
              // Snap the color's value to the AA contrast threshold for the
              // current hue / saturation / alpha (alpha is composited over
              // the white canvas background when computing contrast).
              setColor(h, s, vForContrast(h, s, 4.5, a), a);
            }}
          >
            {!passesAA && (
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"
                stroke="currentColor" strokeWidth="1.2">
                <circle cx="7" cy="7" r="5.5" />
                <line x1="3" y1="11" x2="11" y2="3" strokeLinecap="round" />
              </svg>
            )}
            <span>AA</span>
          </button>
          <button className="color-picker__tuning" type="button" tabIndex={-1} aria-label="Tuning">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <line x1="3" y1="4" x2="13" y2="4" />
              <circle cx="10" cy="4" r="1.5" fill="white" />
              <line x1="3" y1="8" x2="13" y2="8" />
              <circle cx="5" cy="8" r="1.5" fill="white" />
              <line x1="3" y1="12" x2="13" y2="12" />
              <circle cx="11" cy="12" r="1.5" fill="white" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={svRef}
        className="color-picker__sv"
        style={{
          background:
            'linear-gradient(to bottom, transparent, #000),' +
            'linear-gradient(to right, #fff, transparent),' +
            hueColor,
        }}
        onMouseDown={startSvDrag}
      >
        <svg
          className="color-picker__sv-curve"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path d={curvePath} fill="none" stroke="rgba(0,0,0,0.35)"
            strokeWidth={2} vectorEffect="non-scaling-stroke" />
          <path d={curvePath} fill="none" stroke="#ffffff"
            strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
        <div
          className="color-picker__sv-cursor"
          style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%`, background: cursorHex }}
        />
      </div>

      <div className="color-picker__sliders-row">
        <button
          className="color-picker__eyedropper"
          type="button"
          tabIndex={-1}
          aria-label="Eyedropper"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
            strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13.2 2.8a1.6 1.6 0 0 0-2.3 0L9.4 4.3l2.3 2.3 1.5-1.5a1.6 1.6 0 0 0 0-2.3z" />
            <path d="M9.4 4.3 2.6 11.1V13.4h2.3l6.8-6.8" />
          </svg>
        </button>
        <div className="color-picker__sliders-stack">
          <div
            ref={hueRef}
            className="color-picker__hue"
            onMouseDown={startHueDrag}
            style={{
              background:
                'linear-gradient(to right,' +
                'hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%),' +
                'hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%),' +
                'hsl(360,100%,50%))',
            }}
          >
            <div className="color-picker__slider-cursor" style={{ left: `${(h / 360) * 100}%` }} />
          </div>
          <div
            ref={alphaRef}
            className="color-picker__alpha"
            onMouseDown={startAlphaDrag}
          >
            <div
              className="color-picker__alpha-fill"
              style={{ background: `linear-gradient(to right, transparent, ${cursorHex})` }}
            />
            <div className="color-picker__slider-cursor" style={{ left: `${a * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="color-picker__bottom">
        <div className="color-picker__format">
          Hex
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor"
            strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5l3 3 3-3" />
          </svg>
        </div>
        <input
          className="color-picker__hex-input"
          value={hexInput}
          onChange={e => setHexInput(e.target.value.toUpperCase())}
          onBlur={commitHex}
          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          maxLength={7}
          spellCheck={false}
          aria-label="Hex"
        />
        <div className="color-picker__alpha-wrap">
          <input
            className="color-picker__alpha-input"
            value={alphaInput}
            onChange={e => setAlphaInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
            onBlur={commitAlpha}
            onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            aria-label="Alpha"
          />
          <span className="color-picker__pct">%</span>
        </div>
      </div>
    </div>
  );
}
