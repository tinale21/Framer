import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import type { Scene, SceneSetter } from '../types';
import {
  IconBase, IconGrid, IconText, IconVector, IconElement, IconComponent,
  ComponentBadge,
} from '../icons';
import GridPopout from './GridPopout';
import ElementPopout from './ElementPopout';
import LayoutOptions from './LayoutOptions';
import VectorPopout from './VectorPopout';
import ComponentPopout from './ComponentPopout';
import BaseHoverPopout from './BaseHoverPopout';

type Props = {
  scene: Scene;
  onSceneChange: SceneSetter;
  onPickElement: (id: string, src?: string) => void;
  onRequestImageUpload: () => void;
  onArmText: () => void;
  textArmed: boolean;
};

const PROPS_PANEL_SCENES: Scene[] = [
  'demo-7-layout-prompt',
  'demo-7-layout-panel',
  'demo-8-restacked',
  'demo-completed-modal',
  'demo-final',
];

const INSERT_TABS = ['Design', 'Prototype'] as const;
type InsertTab = typeof INSERT_TABS[number];

export default function RightSidebar({
  scene, onSceneChange, onPickElement, onRequestImageUpload, onArmText, textArmed,
}: Props) {
  if (PROPS_PANEL_SCENES.includes(scene)) {
    return <PropsPanel scene={scene} onSceneChange={onSceneChange} />;
  }
  return (
    <InsertPanel
      scene={scene}
      onSceneChange={onSceneChange}
      onPickElement={onPickElement}
      onRequestImageUpload={onRequestImageUpload}
      onArmText={onArmText}
      textArmed={textArmed}
    />
  );
}

function InsertPanel({
  scene, onSceneChange, onPickElement, onRequestImageUpload, onArmText, textArmed,
}: Props) {
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
          <button className={`insert-tile ${highlightTriple ? 'insert-tile--highlighted' : ''}`}>
            <span className="insert-tile__icon"><IconVector /></span>
            Vector
          </button>
          {vectorHovered && (
            <div onMouseEnter={showVectorPopout} onMouseLeave={hideVectorPopoutSoon}>
              <VectorPopout />
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

function PropsPanel({ scene, onSceneChange }: { scene: Scene; onSceneChange: SceneSetter }) {
  const layoutOpen = scene === 'demo-7-layout-panel';
  const promptLayout = scene === 'demo-7-layout-prompt';
  const demoLayout = promptLayout || layoutOpen;
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
        <span className="shape-header__title">Shape</span>
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
          + (layoutOpen ? ' layout-demo-ring' : '')
        }>
          <div
            className={
              'props-section-title'
              + (promptLayout ? ' props-layout__title--clickable layout-demo-ring' : '')
            }
            style={{ padding: 0 }}
            onClick={promptLayout ? () => onSceneChange('demo-7-layout-panel') : undefined}
          >
            Layout
          </div>
          {layoutOpen && <LayoutOptions />}
          {demoLayout && (
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
        <div className="props-row">Typography</div>
        <div className="props-row">Opacity</div>
        <div className="props-row props-row--plus" style={{ justifyContent: 'space-between' }}><span>Fill</span></div>
        <div className="props-row props-row--plus" style={{ justifyContent: 'space-between' }}><span>Stroke</span></div>
        <div className="props-row props-row--plus" style={{ justifyContent: 'space-between' }}><span>Effects</span></div>
      </div>
    </aside>
  );
}
