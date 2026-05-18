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

const SHOW_POPOUT: Scene[] = [
  'base-hover',
  'stack-tutorial-modal',
  'demo-1-stack-highlighted',
  'disabled-tutorial-modal',
];

export default function App() {
  const [scene, setScene] = useState<Scene>('base');
  const [homeExpanded, setHomeExpanded] = useState(false);
  const toggleHome = () => setHomeExpanded(prev => !prev);
  const openHome = () => setHomeExpanded(true);
  const closeHome = () => setHomeExpanded(false);

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
        <Canvas
          scene={scene}
          onSceneChange={setScene}
          onCanvasClick={openHome}
          onSurroundClick={closeHome}
        />
        <RightSidebar scene={scene} onSceneChange={setScene} />
      </div>
      <BottomToolbar />
      {showPopout && <BasePopout scene={scene} onSceneChange={setScene} />}
      {showStackTutorial && <StackTutorialModal onSceneChange={setScene} />}
      {showCompletedModal && <StackDemoCompletedModal onSceneChange={setScene} />}
      {showDisabledModal && <DisabledStackTutorialModal onSceneChange={setScene} />}
      {showOverlaysSettings && <TutorialOverlaysModal onSceneChange={setScene} />}
    </div>
  );
}
