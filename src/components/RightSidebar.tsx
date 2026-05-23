import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import type {
  Scene, SceneSetter, LayoutOpts, VectorKind, VectorEl, VectorFill, VectorStroke, Issue,
  TextEl,
} from '../types';
import EditorPanel from './EditorPanel';
import {
  IconBase, IconGrid, IconText, IconVector, IconElement, IconComponent,
  ComponentBadge, Chevron,
} from '../icons';
import GridPopout from './GridPopout';
import ElementPopout from './ElementPopout';
import LayoutOptions from './LayoutOptions';
import VectorPopout from './VectorPopout';
import ComponentPopout from './ComponentPopout';
import BaseHoverPopout from './BaseHoverPopout';
import ColorPicker from './ColorPicker';

type InsertProps = {
  scene: Scene;
  onSceneChange: SceneSetter;
  onPickElement: (id: string, src?: string) => void;
  onRequestImageUpload: () => void;
  onArmText: () => void;
  textArmed: boolean;
  onArmVector: (kind: VectorKind) => void;
  vectorArmed: boolean;
};
type Props = InsertProps & {
  layoutOpts: LayoutOpts;
  onLayoutChange: (next: LayoutOpts) => void;
  layoutTouched: boolean;
  stackSelected: boolean;
  selectedShapeEl: VectorEl | null;
  onSetShapeFill: (key: number, fill: VectorFill) => void;
  onSetShapeStroke: (key: number, stroke: VectorStroke) => void;
  selectedTextEl: TextEl | null;
  onSetTextStyle: (key: number, patch: Partial<TextEl>) => void;
  editorOpen: boolean;
  issues: Issue[];
  currentIssueIdx: number;
  previewedFixIdx: number | null;
  onSelectFix: (i: number | null) => void;
  onPrevIssue: () => void;
  onNextIssue: () => void;
  onCloseEditor: () => void;
};

// The Shape (props) panel is shown when the stack is selected; the demo
// steps that guide the user through the Layout panel also force it on.
const FORCE_PROPS_SCENES: Scene[] = [
  'demo-7-layout-prompt',
  'demo-7-layout-panel',
  'demo-completed-modal',
];

const INSERT_TABS = ['Design', 'Prototype'] as const;
type InsertTab = typeof INSERT_TABS[number];

export default function RightSidebar({
  scene, onSceneChange, onPickElement, onRequestImageUpload, onArmText, textArmed,
  onArmVector, vectorArmed, layoutOpts, onLayoutChange, layoutTouched, stackSelected,
  selectedShapeEl, onSetShapeFill, onSetShapeStroke,
  selectedTextEl, onSetTextStyle,
  editorOpen, issues, currentIssueIdx, previewedFixIdx,
  onSelectFix, onPrevIssue, onNextIssue, onCloseEditor,
}: Props) {
  // The Editor panel takes precedence over everything else when open.
  if (editorOpen) {
    return (
      <EditorPanel
        issues={issues}
        currentIdx={currentIssueIdx}
        previewedFixIdx={previewedFixIdx}
        onSelectFix={onSelectFix}
        onPrev={onPrevIssue}
        onNext={onNextIssue}
        onClose={onCloseEditor}
      />
    );
  }
  if (selectedShapeEl || selectedTextEl || stackSelected || FORCE_PROPS_SCENES.includes(scene)) {
    return (
      <PropsPanel
        scene={scene}
        onSceneChange={onSceneChange}
        layoutOpts={layoutOpts}
        onLayoutChange={onLayoutChange}
        layoutTouched={layoutTouched}
        shape={selectedShapeEl}
        onSetFill={fill => selectedShapeEl && onSetShapeFill(selectedShapeEl.key, fill)}
        onSetStroke={stroke => selectedShapeEl && onSetShapeStroke(selectedShapeEl.key, stroke)}
        text={selectedTextEl}
        onSetTextStyle={patch => selectedTextEl && onSetTextStyle(selectedTextEl.key, patch)}
      />
    );
  }
  return (
    <InsertPanel
      scene={scene}
      onSceneChange={onSceneChange}
      onPickElement={onPickElement}
      onRequestImageUpload={onRequestImageUpload}
      onArmText={onArmText}
      textArmed={textArmed}
      onArmVector={onArmVector}
      vectorArmed={vectorArmed}
    />
  );
}

function InsertPanel({
  scene, onSceneChange, onPickElement, onRequestImageUpload, onArmText, textArmed,
  onArmVector, vectorArmed,
}: InsertProps) {
  const [activeTab, setActiveTab] = useState<InsertTab>('Design');
  const [gridHovered, setGridHovered] = useState(false);
  const [elementHovered, setElementHovered] = useState(false);
  const [vectorHovered, setVectorHovered] = useState(false);
  const [componentHovered, setComponentHovered] = useState(false);
  const [baseHoverPopoutShown, setBaseHoverPopoutShown] = useState(false);
  const hideTimerRef = useRef<number | null>(null);
  const hideElementTimerRef = useRef<number | null>(null);
  const hideVectorTimerRef = useRef<number | null>(null);
  const hideComponentTimerRef = useRef<number | null>(null);
  const hideBaseTimerRef = useRef<number | null>(null);
  const sceneRef = useRef(scene);
  useEffect(() => { sceneRef.current = scene; }, [scene]);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  useEffect(() => () => {
    if (hideTimerRef.current !== null) clearTimeout(hideTimerRef.current);
    if (hideElementTimerRef.current !== null) clearTimeout(hideElementTimerRef.current);
    if (hideVectorTimerRef.current !== null) clearTimeout(hideVectorTimerRef.current);
    if (hideComponentTimerRef.current !== null) clearTimeout(hideComponentTimerRef.current);
    if (hideBaseTimerRef.current !== null) clearTimeout(hideBaseTimerRef.current);
  }, []);

  const showElementPopout = () => {
    if (hideElementTimerRef.current !== null) {
      clearTimeout(hideElementTimerRef.current);
      hideElementTimerRef.current = null;
    }
    setElementHovered(true);
  };
  const hideElementPopoutSoon = () => {
    if (hideElementTimerRef.current !== null) clearTimeout(hideElementTimerRef.current);
    hideElementTimerRef.current = window.setTimeout(() => {
      setElementHovered(false);
      hideElementTimerRef.current = null;
    }, 120);
  };

  const showVectorPopout = () => {
    if (hideVectorTimerRef.current !== null) {
      clearTimeout(hideVectorTimerRef.current);
      hideVectorTimerRef.current = null;
    }
    setVectorHovered(true);
  };
  const hideVectorPopoutSoon = () => {
    if (hideVectorTimerRef.current !== null) clearTimeout(hideVectorTimerRef.current);
    hideVectorTimerRef.current = window.setTimeout(() => {
      setVectorHovered(false);
      hideVectorTimerRef.current = null;
    }, 120);
  };

  const showComponentPopout = () => {
    if (hideComponentTimerRef.current !== null) {
      clearTimeout(hideComponentTimerRef.current);
      hideComponentTimerRef.current = null;
    }
    setComponentHovered(true);
  };
  const hideComponentPopoutSoon = () => {
    if (hideComponentTimerRef.current !== null) clearTimeout(hideComponentTimerRef.current);
    hideComponentTimerRef.current = window.setTimeout(() => {
      setComponentHovered(false);
      hideComponentTimerRef.current = null;
    }, 120);
  };

  const showBaseHoverPopout = () => {
    if (hideBaseTimerRef.current !== null) {
      clearTimeout(hideBaseTimerRef.current);
      hideBaseTimerRef.current = null;
    }
    setBaseHoverPopoutShown(true);
  };
  const hideBaseHoverPopoutSoon = () => {
    if (hideBaseTimerRef.current !== null) clearTimeout(hideBaseTimerRef.current);
    hideBaseTimerRef.current = window.setTimeout(() => {
      setBaseHoverPopoutShown(false);
      hideBaseTimerRef.current = null;
    }, 120);
  };

  // Scenes that pin the grid popout open regardless of hover.
  const isGridPinnedScene = (s: Scene) =>
    s === 'stack-tutorial-modal' || s === 'demo-1-stack-highlighted';

  // While a pinned scene is active, force the popout to stay mounted.
  // When it closes, reset hover state so the popout doesn't linger.
  useEffect(() => {
    if (isGridPinnedScene(scene)) {
      return () => setGridHovered(false);
    }
  }, [scene]);

  const showGridPopout = () => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setGridHovered(true);
  };
  const hideGridPopoutSoon = () => {
    if (isGridPinnedScene(sceneRef.current)) return;
    if (hideTimerRef.current !== null) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      if (isGridPinnedScene(sceneRef.current)) return;
      setGridHovered(false);
      hideTimerRef.current = null;
    }, 120);
  };

  const showGridPopup = gridHovered || isGridPinnedScene(scene);

  useLayoutEffect(() => {
    const el = tabRefs.current[INSERT_TABS.indexOf(activeTab)];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
  }, [activeTab]);

  const baseHovered = scene === 'base-hover' || scene === 'stack-tutorial-modal' || scene === 'disabled-tutorial-modal';
  const highlightTriple = scene === 'demo-5-insert-highlighted';

  return (
    <aside className="right-sidebar">
      <div className="pill-tabs">
        <div
          className="pill-tabs__indicator"
          style={{ left: indicator.left, width: indicator.width, opacity: indicator.ready ? 1 : 0 }}
        />
        {INSERT_TABS.map((tab, i) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              ref={el => { tabRefs.current[i] = el; }}
              className={'pill-tab' + (isActive ? ' pill-tab--active' : '')}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="divider" />

      <div className={'insert-section' + (highlightTriple ? ' insert-section--demo' : '')}>
      {highlightTriple && (
        <div className="insert-demo-callout">Add several elements into the stack.</div>
      )}
      <div className="section-title" style={{ marginTop: 6 }}>Insert</div>

      <div className="insert-list">
        <div
          className="insert-tile-wrap"
          onMouseEnter={showBaseHoverPopout}
          onMouseLeave={hideBaseHoverPopoutSoon}
        >
          <button
            className={`insert-tile ${baseHovered ? 'insert-tile--selected' : ''}`}
            onClick={() => { if (scene === 'base') onSceneChange('base-hover'); }}
          >
            <span className="insert-tile__icon"><IconBase /></span>
            Base
          </button>
          {baseHoverPopoutShown && !baseHovered && (
            <div onMouseEnter={showBaseHoverPopout} onMouseLeave={hideBaseHoverPopoutSoon}>
              <BaseHoverPopout />
            </div>
          )}
        </div>
        <div
          className="insert-tile-wrap"
          onMouseEnter={showGridPopout}
          onMouseLeave={hideGridPopoutSoon}
        >
          <button className="insert-tile">
            <span className="insert-tile__icon"><IconGrid /></span>
            Grid
          </button>
          {showGridPopup && (
            <div onMouseEnter={showGridPopout} onMouseLeave={hideGridPopoutSoon}>
              <GridPopout scene={scene} onSceneChange={onSceneChange} />
            </div>
          )}
        </div>
        <button
          className={
            'insert-tile' +
            (highlightTriple ? ' insert-tile--highlighted' : '') +
            (textArmed ? ' insert-tile--selected' : '')
          }
          onClick={onArmText}
        >
          <span className="insert-tile__icon"><IconText /></span>
          Text
        </button>
        <div
          className="insert-tile-wrap"
          onMouseEnter={showVectorPopout}
          onMouseLeave={hideVectorPopoutSoon}
        >
          <button
            className={
              'insert-tile' +
              (highlightTriple ? ' insert-tile--highlighted' : '') +
              (vectorArmed ? ' insert-tile--selected' : '')
            }
          >
            <span className="insert-tile__icon"><IconVector /></span>
            Vector
          </button>
          {vectorHovered && (
            <div onMouseEnter={showVectorPopout} onMouseLeave={hideVectorPopoutSoon}>
              <VectorPopout
                onArmVector={kind => {
                  onArmVector(kind);
                  setVectorHovered(false);
                }}
              />
            </div>
          )}
        </div>
        <div
          className="insert-tile-wrap"
          onMouseOver={showElementPopout}
          onMouseLeave={hideElementPopoutSoon}
        >
          <button className={`insert-tile ${highlightTriple ? 'insert-tile--highlighted' : ''}`}>
            <span className="insert-tile__icon"><IconElement /></span>
            Element
          </button>
          {elementHovered && (
            <div onMouseEnter={showElementPopout} onMouseLeave={hideElementPopoutSoon}>
              <ElementPopout onSelect={onPickElement} onRequestImageUpload={onRequestImageUpload} />
            </div>
          )}
        </div>
        <div
          className="insert-tile-wrap"
          onMouseEnter={showComponentPopout}
          onMouseLeave={hideComponentPopoutSoon}
        >
          <button className="insert-tile">
            <span className="insert-tile__icon"><IconComponent /></span>
            Component
          </button>
          {componentHovered && (
            <div onMouseEnter={showComponentPopout} onMouseLeave={hideComponentPopoutSoon}>
              <ComponentPopout />
            </div>
          )}
        </div>
      </div>
      </div>

      <div className="divider" style={{ marginTop: 6 }} />

      <p className="marketplace-note">
        Looking for something specific? Browse <a href="#">Framer Marketplace</a> for effects, components, and more.
      </p>
    </aside>
  );
}

function PropsPanel({
  scene, onSceneChange, layoutOpts, onLayoutChange, layoutTouched,
  shape, onSetFill, onSetStroke,
  text, onSetTextStyle,
}: {
  scene: Scene;
  onSceneChange: SceneSetter;
  layoutOpts: LayoutOpts;
  onLayoutChange: (next: LayoutOpts) => void;
  layoutTouched: boolean;
  shape: VectorEl | null;
  onSetFill: (fill: VectorFill) => void;
  onSetStroke: (stroke: VectorStroke) => void;
  text: TextEl | null;
  onSetTextStyle: (patch: Partial<TextEl>) => void;
}) {
  // Color-picker popover state — which swatch opened it, and its fixed
  // position (right edge + top, so the picker pops to the left of the row).
  const [picker, setPicker] = useState<{ for: 'fill' | 'stroke'; right: number; top: number } | null>(null);
  const [strokeExpanded, setStrokeExpanded] = useState(true);
  const [typoExpanded, setTypoExpanded] = useState(true);
  const shapeKey = shape?.key ?? null;
  useEffect(() => { setPicker(null); }, [shapeKey]);
  const togglePicker = (which: 'fill' | 'stroke') => (e: React.MouseEvent) => {
    if (picker?.for === which) { setPicker(null); return; }
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPicker({
      for: which,
      right: window.innerWidth - r.left + 8,
      top: Math.max(8, Math.min(window.innerHeight - 320, r.top - 24)),
    });
  };
  // Fill / Stroke rows are decorative (static "+") for the stack context;
  // when a vector shape is selected they become interactive editors.
  const renderFillRow = () => {
    // For a selected text the Fill row controls the text color; for a shape
    // it controls the SVG fill. Either way the swatch opens the same picker.
    if (text) {
      if (!text.color) {
        return (
          <div
            className="props-row props-row--plus"
            style={{ justifyContent: 'space-between', cursor: 'pointer' }}
            onClick={() => onSetTextStyle({ color: '#000000' })}
          >
            <span>Fill</span>
          </div>
        );
      }
      const c = text.color;
      return (
        <div className="props-row" style={{ justifyContent: 'space-between' }}>
          <span>Fill</span>
          <span className="color-control">
            <button
              type="button"
              className="color-control__swatch"
              data-color-trigger
              style={{ background: c }}
              onClick={togglePicker('fill')}
              aria-label="Text color"
            />
            <span className="color-control__hex">{c.replace('#', '').toUpperCase()}</span>
            <button type="button" className="color-control__x"
              onClick={() => { onSetTextStyle({ color: undefined }); setPicker(null); }}
              aria-label="Remove fill">×</button>
          </span>
        </div>
      );
    }
    if (!shape) {
      return (
        <div className="props-row props-row--plus" style={{ justifyContent: 'space-between' }}>
          <span>Fill</span>
        </div>
      );
    }
    if (shape.fill === null) {
      return (
        <div
          className="props-row props-row--plus"
          style={{ justifyContent: 'space-between', cursor: 'pointer' }}
          onClick={() => onSetFill('#cccccc')}
        >
          <span>Fill</span>
        </div>
      );
    }
    const fill = shape.fill;
    return (
      <div className="props-row" style={{ justifyContent: 'space-between' }}>
        <span>Fill</span>
        <span className="color-control">
          <button
            type="button"
            className="color-control__swatch"
            data-color-trigger
            style={{ background: fill }}
            onClick={togglePicker('fill')}
            aria-label="Fill color"
          />
          <span className="color-control__hex">{fill.replace('#', '').toUpperCase()}</span>
          <button type="button" className="color-control__x"
            onClick={() => { onSetFill(null); setPicker(null); }}
            aria-label="Remove fill">×</button>
        </span>
      </div>
    );
  };
  const renderStrokeRow = () => {
    if (!shape) {
      return (
        <div className="props-row props-row--plus" style={{ justifyContent: 'space-between' }}>
          <span>Stroke</span>
        </div>
      );
    }
    if (shape.stroke === null) {
      return (
        <div
          className="props-row props-row--plus"
          style={{ justifyContent: 'space-between', cursor: 'pointer' }}
          onClick={() => {
            onSetStroke({ color: '#aaaaaa', width: 1 });
            setStrokeExpanded(true);
          }}
        >
          <span>Stroke</span>
        </div>
      );
    }
    const stroke = shape.stroke;
    return (
      <>
        <div
          className="props-row"
          style={{ justifyContent: 'space-between', cursor: 'pointer' }}
          onClick={() => setStrokeExpanded(e => !e)}
        >
          <span>Stroke</span>
          <span className="props-layout__chev">
            <Chevron dir={strokeExpanded ? 'down' : 'right'} size={12} />
          </span>
        </div>
        {strokeExpanded && (
          <>
            <div className="props-row props-row--sub">
              <span>Color</span>
              <span className="color-control">
                <button
                  type="button"
                  className="color-control__swatch"
                  data-color-trigger
                  style={{ background: stroke.color }}
                  onClick={togglePicker('stroke')}
                  aria-label="Stroke color"
                />
                <span className="color-control__hex">{stroke.color.replace('#', '').toUpperCase()}</span>
                <button type="button" className="color-control__x"
                  onClick={() => { onSetStroke(null); setPicker(null); }}
                  aria-label="Remove stroke">×</button>
              </span>
            </div>
            <div className="props-row props-row--sub">
              <span>Width</span>
              <input type="number" min={0} max={20} step={1} className="vec-num-input"
                value={stroke.width}
                onChange={e => {
                  const v = parseInt(e.target.value, 10);
                  onSetStroke({ ...stroke, width: Math.max(0, Number.isFinite(v) ? v : 0) });
                }} />
            </div>
          </>
        )}
      </>
    );
  };
  const promptLayout = scene === 'demo-7-layout-prompt';
  // The guided demo opens the Layout options at the layout-panel step.
  const demoPanelOpen = scene === 'demo-7-layout-panel';
  // Otherwise the panel is shown for a hand-selected stack — the Layout row
  // is then a plain accordion the user opens and closes themselves.
  const freeMode = !promptLayout && !demoPanelOpen;
  // The guided panel starts open (collapsible); the free accordion starts shut.
  const [layoutCollapsed, setLayoutCollapsed] = useState(false);
  const [layoutOpenFree, setLayoutOpenFree] = useState(false);
  const showOptions = freeMode ? layoutOpenFree : (demoPanelOpen && !layoutCollapsed);
  // Once a layout control is used, the spotlight/highlight clears.
  const demoLayout = (promptLayout || demoPanelOpen) && !layoutTouched;
  return (
    <aside className="right-sidebar">
      <div className="right-sidebar__header">
        <div className="right-sidebar__header-left">
          <span className="tab tab--active">Design</span>
          <span className="tab">Prototype</span>
        </div>
      </div>

      <div className="divider" />

      <div className="shape-header" style={{ marginTop: 6 }}>
        <span className="shape-header__title">{text ? 'Text' : shape ? 'Vector' : 'Stack'}</span>
        <span className="shape-header__icon"><ComponentBadge /></span>
      </div>

      <div className="props-section" style={{ marginTop: 2 }}>
        <div className="props-section-title" style={{ padding: 0 }}>Positioning</div>
        <div className="props-row">Alignment</div>
        <img
          className="alignment-controls"
          src={`${import.meta.env.BASE_URL}alignment-controls.svg`}
          alt=""
        />
        <div className="props-row">Rotation</div>
      </div>

      <div className="divider" />

      <div className="props-section">
        <div className={
          'props-layout'
          + (demoLayout ? ' props-layout--demo' : '')
          + (showOptions && demoPanelOpen && !layoutTouched ? ' layout-demo-ring' : '')
        }>
          <div
            className={
              'props-section-title props-layout__title props-layout__title--clickable'
              + (promptLayout ? ' layout-demo-ring' : '')
            }
            style={{ padding: 0 }}
            onClick={
              promptLayout ? () => onSceneChange('demo-7-layout-panel')
              : freeMode ? () => setLayoutOpenFree(o => !o)
              : () => setLayoutCollapsed(c => !c)
            }
          >
            Layout
            <span className="props-layout__chev">
              <Chevron dir={showOptions ? 'down' : 'right'} size={12} />
            </span>
          </div>
          {showOptions && (
            <LayoutOptions layoutOpts={layoutOpts} onLayoutChange={onLayoutChange} />
          )}
          {demoLayout && !layoutCollapsed && (
            <div className="props-layout__callout">
              {promptLayout
                ? (<>Click <span className="props-layout__callout-bold">Layout</span> to change the stack’s layout.</>)
                : 'These are the stack’s layout options.'}
            </div>
          )}
        </div>
        <div className="props-row">Size</div>
        <div className="props-row">Stack</div>
        <div className="props-row">Gaps/Padding</div>
      </div>

      <div className="divider" />

      <div className="props-section">
        <div className="props-section-title" style={{ padding: 0 }}>Appearance</div>
        {text ? (
          <>
            <div
              className="props-row"
              style={{ justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => setTypoExpanded(e => !e)}
            >
              <span>Typography</span>
              <span className="props-layout__chev">
                <Chevron dir={typoExpanded ? 'down' : 'right'} size={12} />
              </span>
            </div>
            {typoExpanded && <TypographyEditor text={text} onSet={onSetTextStyle} />}
          </>
        ) : (
          <div className="props-row">Typography</div>
        )}
        <div className="props-row">Opacity</div>
        {renderFillRow()}
        {renderStrokeRow()}
        <div className="props-row props-row--plus" style={{ justifyContent: 'space-between' }}><span>Effects</span></div>
      </div>
      {picker && (
        text && picker.for === 'fill' && text.color
          ? (
            <div style={{ position: 'fixed', right: picker.right, top: picker.top, zIndex: 1000 }}>
              <ColorPicker
                value={text.color}
                onChange={hex => onSetTextStyle({ color: hex })}
                onClose={() => setPicker(null)}
              />
            </div>
          )
          : shape
            && (picker.for === 'fill' ? shape.fill !== null : shape.stroke !== null) && (
            <div style={{ position: 'fixed', right: picker.right, top: picker.top, zIndex: 1000 }}>
              <ColorPicker
                value={picker.for === 'fill' ? shape.fill! : shape.stroke!.color}
                onChange={hex => {
                  if (picker.for === 'fill') onSetFill(hex);
                  else if (shape.stroke) onSetStroke({ ...shape.stroke, color: hex });
                }}
                onClose={() => setPicker(null)}
              />
            </div>
          )
      )}
    </aside>
  );
}

// Inline Typography editor for the selected text — font / weight / size /
// line-height / letter-spacing / alignment, like Figma's Typography section.
const FONTS = ['Inter', 'Helvetica', 'Arial', 'Georgia', 'Courier New'];
const WEIGHTS: { value: number; label: string }[] = [
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semi Bold' },
  { value: 700, label: 'Bold' },
];

function TypographyEditor({ text, onSet }: {
  text: TextEl;
  onSet: (patch: Partial<TextEl>) => void;
}) {
  const font = text.font ?? 'Inter';
  const weight = text.weight ?? 400;
  const size = text.size ?? 16;
  const align = text.align ?? 'left';
  // Local input state lets the user type freely; we only parse + clamp on
  // blur or Enter so intermediate keystrokes don't snap the value.
  const [sizeInput, setSizeInput] = useState(String(size));
  const [lineInput, setLineInput] = useState(text.lineHeight != null ? String(text.lineHeight) : '');
  const [spaceInput, setSpaceInput] = useState(String(text.letterSpacing ?? 0));
  // Resync when the user switches to a different text.
  useEffect(() => {
    setSizeInput(String(text.size ?? 16));
    setLineInput(text.lineHeight != null ? String(text.lineHeight) : '');
    setSpaceInput(String(text.letterSpacing ?? 0));
  }, [text.key]);  // eslint-disable-line react-hooks/exhaustive-deps
  const commitSize = () => {
    const n = parseInt(sizeInput, 10);
    if (Number.isFinite(n)) {
      const v = Math.max(6, Math.min(120, n));
      onSet({ size: v });
      setSizeInput(String(v));
    } else {
      setSizeInput(String(text.size ?? 16));
    }
  };
  const commitLine = () => {
    const v = lineInput.trim();
    if (v === '') { onSet({ lineHeight: undefined }); return; }
    const n = parseFloat(v);
    if (Number.isFinite(n)) {
      onSet({ lineHeight: n });
      setLineInput(String(n));
    } else {
      setLineInput(text.lineHeight != null ? String(text.lineHeight) : '');
    }
  };
  const commitSpace = () => {
    const n = parseFloat(spaceInput);
    if (Number.isFinite(n)) {
      onSet({ letterSpacing: n });
      setSpaceInput(String(n));
    } else {
      setSpaceInput(String(text.letterSpacing ?? 0));
    }
  };
  const enterBlur = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
  };
  // Preset font sizes for the dropdown — Figma-style.
  const SIZE_PRESETS = [8, 10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 64, 72, 96];
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);
  const sizeWrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sizeMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (sizeWrapRef.current && !sizeWrapRef.current.contains(e.target as Node)) {
        setSizeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [sizeMenuOpen]);
  const setSize = (v: number) => {
    const clamped = Math.max(6, Math.min(120, v));
    setSizeInput(String(clamped));
    onSet({ size: clamped });
    setSizeMenuOpen(false);
  };
  return (
    <div className="typo">
      <select
        className="typo__field typo__field--full"
        value={font}
        onChange={e => onSet({ font: e.target.value })}
      >
        {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
      </select>
      <div className="typo__row">
        <select
          className="typo__field"
          value={weight}
          onChange={e => onSet({ weight: parseInt(e.target.value, 10) })}
        >
          {WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
        </select>
        <div className="typo__num-wrap" ref={sizeWrapRef}>
          <input
            type="number"
            className="typo__field--num-input"
            min={6} max={120} step={1}
            value={sizeInput}
            onChange={e => setSizeInput(e.target.value)}
            onBlur={commitSize}
            onKeyDown={enterBlur}
          />
          <button type="button" className="typo__size-drop" tabIndex={-1}
            aria-label="Size presets" onClick={() => setSizeMenuOpen(o => !o)}>
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none" stroke="currentColor"
              strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 1l3 3 3-3" />
            </svg>
          </button>
          {sizeMenuOpen && (
            <div className="typo__size-menu">
              {SIZE_PRESETS.map(s => (
                <button
                  key={s}
                  type="button"
                  className={'typo__size-menu-item' + (s === size ? ' typo__size-menu-item--active' : '')}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="typo__row">
        <label className="typo__labeled">
          <span>Line height</span>
          <div className="typo__icon-input">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
              stroke="currentColor" strokeWidth="1" strokeLinecap="round">
              <line x1="2" y1="2" x2="12" y2="2" />
              <text x="7" y="10" fontSize="8" textAnchor="middle"
                fill="currentColor" fontWeight="600" stroke="none">A</text>
              <line x1="2" y1="12" x2="12" y2="12" />
            </svg>
            <input
              type="text"
              placeholder="Auto"
              value={lineInput}
              onChange={e => setLineInput(e.target.value)}
              onBlur={commitLine}
              onKeyDown={enterBlur}
            />
          </div>
        </label>
        <label className="typo__labeled">
          <span>Letter spacing</span>
          <div className="typo__icon-input">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
              stroke="currentColor" strokeWidth="1" strokeLinecap="round">
              <line x1="2" y1="2" x2="2" y2="12" />
              <text x="7" y="10" fontSize="8" textAnchor="middle"
                fill="currentColor" fontWeight="600" stroke="none">A</text>
              <line x1="12" y1="2" x2="12" y2="12" />
            </svg>
            <input
              type="number"
              step={0.1}
              value={spaceInput}
              onChange={e => setSpaceInput(e.target.value)}
              onBlur={commitSpace}
              onKeyDown={enterBlur}
            />
          </div>
        </label>
      </div>
      <div className="typo__align">
        {(['left', 'center', 'right'] as const).map(a => (
          <button
            key={a}
            type="button"
            className={'typo__align-btn' + (align === a ? ' typo__align-btn--active' : '')}
            onClick={() => onSet({ align: a })}
            aria-label={`Align ${a}`}
          >
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <line x1="1" y1="2" x2="13" y2="2" />
              <line
                x1={a === 'right' ? 5 : a === 'center' ? 3 : 1}
                y1="6"
                x2={a === 'left' ? 9 : a === 'center' ? 11 : 13}
                y2="6"
              />
              <line x1="1" y1="10" x2="13" y2="10" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

