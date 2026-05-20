import { useState, useEffect, useRef, useCallback, type ChangeEvent } from 'react';
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
import type { Scene, DemoEl } from './types';

const SHOW_POPOUT: Scene[] = [
  'base-hover',
];

export type CanvasSelection = 'none' | 'frame' | 'canvas';

// Rendered height of each element type at the free-element width (150px).
const EL_HEIGHTS: Record<string, number> = {
  gif: 113, video: 84, youtube: 84, vimeo: 84, spotify: 43, applemusic: 56, mp3: 31,
};
const EL_GAP = 12;

export default function App() {
  const [scene, setScene] = useState<Scene>('base');
  const [selection, setSelection] = useState<CanvasSelection>('none');
  const [darkMode, setDarkMode] = useState(false);
  // Every picked element is its own instance (keyed), so dropping more
  // never replaces an earlier one. selection / callout reference the key.
  const [demoElements, setDemoElements] = useState<DemoEl[]>([]);
  const [selectedEl, setSelectedEl] = useState<number | null>(null);
  const [calloutEl, setCalloutEl] = useState<number | null>(null);
  const elKeyRef = useRef(0);
  // The file input lives here (App never unmounts) so it survives the OS
  // file dialog — the Element popout would unmount mid-dialog and lose it.
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickElement = (id: string, src?: string) => {
    const key = elKeyRef.current++;
    // Stack each new free element directly below the previous ones (a real
    // vertical column) so picking several never piles them on top.
    const y = demoElements
      .filter(el => !el.inStack)
      .reduce((bottom, el) => bottom + (EL_HEIGHTS[el.id] ?? 90) + EL_GAP, 300);
    setDemoElements(prev => [
      ...prev,
      { key, id, x: 24, y, inStack: false, src },
    ]);
    setSelectedEl(key);
    // The callout is only for the guided demo step — picking an element
    // from the highlighted Insert section.
    setCalloutEl(scene === 'demo-5-insert-highlighted' ? key : null);
    setScene('demo-6-place-element');
  };
  const requestImageUpload = () => fileInputRef.current?.click();
  const handleImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file later
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') pickElement('image', reader.result);
    };
    reader.readAsDataURL(file);
  };
  const moveElement = useCallback((key: number, x: number, y: number) => {
    setDemoElements(prev => prev.map(el => (el.key === key ? { ...el, x, y } : el)));
  }, []);
  const dropElementInStack = useCallback((key: number) => {
    setDemoElements(prev => prev.map(el => (el.key === key ? { ...el, inStack: true } : el)));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (selectedEl === null) return;
      setDemoElements(prev => prev.filter(el => el.key !== selectedEl));
      setSelectedEl(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEl]);
  const homeExpanded = selection !== 'none';
  const toggleHome = () => setSelection(s => (s === 'none' ? 'frame' : 'none'));
  const selectFrame = () => setSelection('frame');
  const selectCanvas = () => setSelection('canvas');
  const deselect = () => setSelection('none');
  const toggleDarkMode = () => setDarkMode(d => !d);

  const showPopout = SHOW_POPOUT.includes(scene);
  const showDemoTint =
    scene === 'demo-1-stack-highlighted' ||
    scene === 'demo-2-cursor' ||
    scene === 'demo-5-insert-highlighted';
  const showStackTutorial = scene === 'stack-tutorial-modal';
  const showCompletedModal = scene === 'demo-completed-modal';
  const showDisabledModal = scene === 'disabled-tutorial-modal';
  const showOverlaysSettings = scene === 'tutorial-overlays-settings';

  return (
    <div className={'app' + (darkMode ? ' app--dark' : '')}>
      <TopBar />
      <div className="main">
        <LeftSidebar homeExpanded={homeExpanded} onToggleHome={toggleHome} />
        <Canvas
          scene={scene}
          onSceneChange={setScene}
          selection={selection}
          onSelectFrame={selectFrame}
          onSelectCanvas={selectCanvas}
          onDeselect={deselect}
          demoElements={demoElements}
          selectedEl={selectedEl}
          calloutEl={calloutEl}
          onSelectEl={setSelectedEl}
          onMoveElement={moveElement}
          onDropElementInStack={dropElementInStack}
        />
        <RightSidebar
          scene={scene}
          onSceneChange={setScene}
          onPickElement={pickElement}
          onRequestImageUpload={requestImageUpload}
        />
      </div>
      <BottomToolbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        style={{ display: 'none' }}
        onChange={handleImageFile}
      />
      {showDemoTint && <div className="demo-tint" />}
      {showPopout && <BasePopout scene={scene} onSceneChange={setScene} />}
      {showStackTutorial && <StackTutorialModal onSceneChange={setScene} />}
      {showCompletedModal && <StackDemoCompletedModal onSceneChange={setScene} />}
      {showDisabledModal && <DisabledStackTutorialModal onSceneChange={setScene} />}
      {showOverlaysSettings && <TutorialOverlaysModal onSceneChange={setScene} />}
    </div>
  );
}
