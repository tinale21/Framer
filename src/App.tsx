import { useState } from 'react';
import TopBar from './components/TopBar';
import LeftSidebar from './components/LeftSidebar';
import Canvas from './components/Canvas';
import RightSidebar from './components/RightSidebar';
import BottomToolbar from './components/BottomToolbar';
import BasePopout from './components/BasePopout';
import StackTutorialModal from './components/modals/StackTutorialModal';
import StackDemoCompletedModal from './components/modals/StackDemoCompletedModal';
import DisabledStackTutorialModal from './components/modals/DisabledStackTutorialModal';
import TutorialOverlaysModal from './components/modals/TutorialOverlaysModal';
import type { Scene } from './types';

const SCENE_ORDER: Scene[] = [
  'base',
  'base-hover',
  'stack-tutorial-modal',
  'demo-1-stack-highlighted',
  'demo-2-cursor',
  'demo-3-drawing-frame',
  'demo-4-stack-created',
  'demo-5-insert-highlighted',
  'demo-6-rect-with-text',
  'demo-7-layout-panel',
  'demo-8-restacked',
  'demo-completed-modal',
  'demo-final',
  'disabled-tutorial-modal',
  'tutorial-overlays-settings',
];

const SHOW_POPOUT: Scene[] = [
  'base-hover',
  'stack-tutorial-modal',
  'demo-1-stack-highlighted',
  'disabled-tutorial-modal',
];

export default function App() {
  const [scene, setScene] = useState<Scene>('base');
  const [homeExpanded, setHomeExpanded] = useState(false);
  const idx = SCENE_ORDER.indexOf(scene);
  const toggleHome = () => setHomeExpanded(prev => !prev);

  const showPopout = SHOW_POPOUT.includes(scene);
  const showStackTutorial = scene === 'stack-tutorial-modal';
  const showCompletedModal = scene === 'demo-completed-modal';
  const showDisabledModal = scene === 'disabled-tutorial-modal';
  const showOverlaysSettings = scene === 'tutorial-overlays-settings';

  return (
    <div className="app">
      <TopBar />
      <div className="main">
        <LeftSidebar homeExpanded={homeExpanded} onToggleHome={toggleHome} />
        <Canvas scene={scene} onSceneChange={setScene} onHomeClick={toggleHome} />
        <RightSidebar scene={scene} onSceneChange={setScene} />
      </div>
      <BottomToolbar />
      {showPopout && <BasePopout scene={scene} onSceneChange={setScene} />}
      {showStackTutorial && <StackTutorialModal onSceneChange={setScene} />}
      {showCompletedModal && <StackDemoCompletedModal onSceneChange={setScene} />}
      {showDisabledModal && <DisabledStackTutorialModal onSceneChange={setScene} />}
      {showOverlaysSettings && <TutorialOverlaysModal onSceneChange={setScene} />}

      <div className="dev-nav">
        <span>{idx + 1}/{SCENE_ORDER.length}</span>
        <span style={{ opacity: 0.7 }}>{scene}</span>
        <button onClick={() => setScene(SCENE_ORDER[Math.max(0, idx - 1)])} disabled={idx === 0}>‹</button>
        <button onClick={() => setScene(SCENE_ORDER[Math.min(SCENE_ORDER.length - 1, idx + 1)])} disabled={idx === SCENE_ORDER.length - 1}>›</button>
        <button onClick={() => setScene('base')}>reset</button>
      </div>
    </div>
  );
}
