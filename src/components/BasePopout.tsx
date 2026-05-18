import type { Scene, SceneSetter } from '../types';
import { IconFrame, IconStack, IconGrid, IconMasonry } from '../icons';

type Props = { scene: Scene; onSceneChange: SceneSetter };

export default function BasePopout({ scene, onSceneChange }: Props) {
  // Stack is highlighted (blue border) on demo-1
  const stackHighlighted = scene === 'demo-1-stack-highlighted';
  // Stack is selected (light grey bg) on base-hover and disabled-tutorial-modal
  const stackSelected = scene === 'base-hover' || scene === 'disabled-tutorial-modal' || scene === 'stack-tutorial-modal';

  return (
    <div className="popout-base">
      <button className="popout-base__item">
        <span className="popout-base__item-icon"><IconFrame /></span>
        Frame
      </button>
      <button
        className={`popout-base__item ${stackSelected ? 'popout-base__item--selected' : ''} ${stackHighlighted ? 'popout-base__item--highlighted' : ''}`}
        onClick={() => {
          if (scene === 'base-hover') onSceneChange('stack-tutorial-modal');
          else if (scene === 'demo-1-stack-highlighted') onSceneChange('demo-2-cursor');
        }}
      >
        <span className="popout-base__item-icon"><IconStack /></span>
        Stack
      </button>
      <button className="popout-base__item">
        <span className="popout-base__item-icon"><IconGrid /></span>
        Grid
      </button>
      <button className="popout-base__item">
        <span className="popout-base__item-icon"><IconMasonry /></span>
        Masonry
      </button>
    </div>
  );
}
