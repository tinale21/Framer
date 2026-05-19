import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import type { Scene, SceneSetter } from '../types';
import {
  IconBase, IconGrid, IconText, IconVector, IconElement, IconComponent,
  AlignTop, AlignMidV, AlignBottom, AlignLeft, AlignMidH, AlignRight, Diamond,
} from '../icons';
import GridPopout from './GridPopout';

type Props = { scene: Scene; onSceneChange: SceneSetter };

const PROPS_PANEL_SCENES: Scene[] = [
  'demo-7-layout-panel',
  'demo-8-restacked',
  'demo-completed-modal',
  'demo-final',
];

const INSERT_TABS = ['Design', 'Prototype'] as const;
type InsertTab = typeof INSERT_TABS[number];

export default function RightSidebar({ scene, onSceneChange }: Props) {
  if (PROPS_PANEL_SCENES.includes(scene)) {
    return <PropsPanel scene={scene} />;
  }
  return <InsertPanel scene={scene} onSceneChange={onSceneChange} />;
}

function InsertPanel({ scene, onSceneChange }: Props) {
  const [activeTab, setActiveTab] = useState<InsertTab>('Design');
  const [gridHovered, setGridHovered] = useState(false);
  const hideTimerRef = useRef<number | null>(null);
  const sceneRef = useRef(scene);
  useEffect(() => { sceneRef.current = scene; }, [scene]);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  useEffect(() => () => {
    if (hideTimerRef.current !== null) clearTimeout(hideTimerRef.current);
  }, []);

  // While the Stack tutorial modal is open, force the popout to stay mounted.
  // When it closes, reset hover state so the popout doesn't linger.
  useEffect(() => {
    if (scene === 'stack-tutorial-modal') {
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
    if (sceneRef.current === 'stack-tutorial-modal') return;
    if (hideTimerRef.current !== null) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      if (sceneRef.current === 'stack-tutorial-modal') return;
      setGridHovered(false);
      hideTimerRef.current = null;
    }, 120);
  };

  const showGridPopup = gridHovered || scene === 'stack-tutorial-modal';

  useLayoutEffect(() => {
    const el = tabRefs.current[INSERT_TABS.indexOf(activeTab)];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
  }, [activeTab]);

  const tilesDimmed = scene === 'demo-5-insert-highlighted' ? { opacity: 0.55 } : undefined;
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

      <div className="section-title" style={{ marginTop: 6 }}>Insert</div>

      <div className="insert-list" style={tilesDimmed}>
        <button
          className={`insert-tile ${baseHovered ? 'insert-tile--selected' : ''}`}
          onClick={() => { if (scene === 'base') onSceneChange('base-hover'); }}
        >
          <span className="insert-tile__icon"><IconBase /></span>
          Base
        </button>
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
              <GridPopout
                onSelectStack={() => onSceneChange('stack-tutorial-modal')}
              />
            </div>
          )}
        </div>
        <button className={`insert-tile ${highlightTriple ? 'insert-tile--highlighted' : ''}`}>
          <span className="insert-tile__icon"><IconText /></span>
          Text
        </button>
        <button className={`insert-tile ${highlightTriple ? 'insert-tile--highlighted' : ''}`}>
          <span className="insert-tile__icon"><IconVector /></span>
          Vector
        </button>
        <button className={`insert-tile ${highlightTriple ? 'insert-tile--highlighted' : ''}`}>
          <span className="insert-tile__icon"><IconElement /></span>
          Element
        </button>
        <button className="insert-tile">
          <span className="insert-tile__icon"><IconComponent /></span>
          Component
        </button>
      </div>

      <div className="divider" style={{ marginTop: 6 }} />

      <p className="marketplace-note">
        Looking for something specific? Browse <a href="#">Framer Marketplace</a> for effects, components, and more.
      </p>
    </aside>
  );
}

function PropsPanel({ scene }: { scene: Scene }) {
  const layoutOpen = scene === 'demo-7-layout-panel';
  return (
    <aside className="right-sidebar">
      <div className="right-sidebar__header">
        <div className="right-sidebar__header-left">
          <span className="tab tab--active">Design</span>
          <span className="tab">Interaction</span>
        </div>
      </div>

      <div className="shape-header">
        <span className="shape-header__title">Shape</span>
        <span className="shape-header__icon"><Diamond /></span>
      </div>

      <div className="props-section">
        <div className="props-section-title" style={{ padding: 0 }}>Positioning</div>
        <div className="props-row props-row--sub" style={{ paddingLeft: 0 }}>Alignment</div>
        <div className="alignment-group">
          <div className="alignment-group__cluster">
            <span className="alignment-icon"><AlignTop /></span>
            <span className="alignment-icon"><AlignMidV /></span>
            <span className="alignment-icon"><AlignBottom /></span>
          </div>
          <div className="alignment-group__cluster">
            <span className="alignment-icon"><AlignLeft /></span>
            <span className="alignment-icon"><AlignMidH /></span>
            <span className="alignment-icon"><AlignRight /></span>
          </div>
        </div>
        <div className="props-row props-row--sub" style={{ paddingLeft: 0 }}>Rotation</div>
      </div>

      {layoutOpen ? (
        <div className="layout-popout" style={{ marginTop: 4 }}>
          <div className="layout-popout__title">Layout</div>
          <div className="props-row props-row--sub props-row--muted">Type</div>
          <div className="props-row props-row--sub props-row--muted">Direction</div>
          <div className="props-row props-row--sub props-row--muted">Distribute</div>
          <div className="props-row props-row--sub props-row--muted">Align</div>
          <div className="props-row props-row--sub props-row--muted">Wrap</div>
          <div className="props-row props-row--sub props-row--muted">Gap</div>
          <div className="props-row props-row--sub props-row--muted">Padding</div>
        </div>
      ) : (
        <div className="props-section">
          <div className="props-section-title" style={{ padding: 0 }}>Layout</div>
          <div className="props-row props-row--sub">Type</div>
          <div className="props-row props-row--sub">Direction</div>
          <div className="props-row props-row--sub">Distribute</div>
          <div className="props-row props-row--sub">Align</div>
          <div className="props-row props-row--sub">Wrap</div>
          <div className="props-row props-row--sub">Gap</div>
          <div className="props-row props-row--sub">Padding</div>
        </div>
      )}

      <div className="props-section">
        <div className="props-row">Size</div>
        <div className="props-row">Stack</div>
        <div className="props-row">Gaps/Padding</div>
      </div>

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
