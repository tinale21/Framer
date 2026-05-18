import type { Scene, SceneSetter } from '../types';
import {
  IconBase, IconGrid, IconText, IconVector, IconElement, IconComponent,
  AlignTop, AlignMidV, AlignBottom, AlignLeft, AlignMidH, AlignRight, Diamond,
} from '../icons';

type Props = { scene: Scene; onSceneChange: SceneSetter };

const PROPS_PANEL_SCENES: Scene[] = [
  'demo-7-layout-panel',
  'demo-8-restacked',
  'demo-completed-modal',
  'demo-final',
];

export default function RightSidebar({ scene, onSceneChange }: Props) {
  if (PROPS_PANEL_SCENES.includes(scene)) {
    return <PropsPanel scene={scene} />;
  }
  return <InsertPanel scene={scene} onSceneChange={onSceneChange} />;
}

function InsertPanel({ scene, onSceneChange }: Props) {
  const tilesDimmed = scene === 'demo-5-insert-highlighted' ? { opacity: 0.55 } : undefined;
  const baseHovered = scene === 'base-hover' || scene === 'stack-tutorial-modal' || scene === 'disabled-tutorial-modal';
  const highlightTriple = scene === 'demo-5-insert-highlighted';

  return (
    <aside className="right-sidebar">
      <div className="right-sidebar__header">
        <div className="right-sidebar__header-left">
          <span className="tab tab--active">Design</span>
          <span className="tab">Prototype</span>
        </div>
      </div>

      <div className="section-title">Insert</div>

      <div className="insert-list" style={tilesDimmed}>
        <button
          className={`insert-tile ${baseHovered ? 'insert-tile--selected' : ''}`}
          onMouseEnter={() => { if (scene === 'base') onSceneChange('base-hover'); }}
          onClick={() => { if (scene === 'base') onSceneChange('base-hover'); }}
        >
          <span className="insert-tile__icon"><IconBase /></span>
          Base
        </button>
        <button className="insert-tile">
          <span className="insert-tile__icon"><IconGrid /></span>
          Grid
        </button>
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
