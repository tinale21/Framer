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
import type { Scene, DemoEl, TextEl } from './types';

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
  // Text tool: textMode arms it, a canvas click drops a text box that the
  // user types into; editingText is the key of the box being edited.
  const [textMode, setTextMode] = useState(false);
  const [texts, setTexts] = useState<TextEl[]>([]);
  const [editingText, setEditingText] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<number | null>(null);
  const textKeyRef = useRef(0);

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
    setSelectedText(null); // only one thing is selected at a time
    setEditingText(null);
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
  // Selecting an element clears any text selection — only one at a time.
  const selectEl = useCallback((key: number | null) => {
    setSelectedEl(key);
    setSelectedText(null);
    setEditingText(null);
  }, []);

  const armText = () => setTextMode(m => !m); // clicking the tile toggles it
  const placeText = useCallback((x: number, y: number) => {
    const key = textKeyRef.current++;
    setTexts(prev => [...prev, { key, x, y, text: '', inStack: false }]);
    setEditingText(key);
    setSelectedText(key);
    setSelectedEl(null); // only one thing is selected at a time
    setTextMode(false); // the text tool is one-shot, like Figma
  }, []);
  const changeText = useCallback((key: number, text: string) => {
    setTexts(prev => prev.map(t => (t.key === key ? { ...t, text } : t)));
  }, []);
  const moveText = useCallback((key: number, x: number, y: number) => {
    setTexts(prev => prev.map(t => (t.key === key ? { ...t, x, y } : t)));
  }, []);
  const dropTextInStack = useCallback((key: number) => {
    setTexts(prev => prev.map(t => (t.key === key ? { ...t, inStack: true } : t)));
  }, []);
  const selectText = useCallback((key: number) => {
    setSelectedText(key);
    setEditingText(null);
    setSelectedEl(null); // only one thing is selected at a time
  }, []);
  const editText = useCallback((key: number) => {
    setSelectedText(key);
    setEditingText(key);
    setSelectedEl(null); // only one thing is selected at a time
  }, []);
  const deselectText = useCallback(() => {
    setSelectedText(null);
    setEditingText(null);
  }, []);
  const endTextEdit = useCallback((key: number, isEmpty: boolean) => {
    setEditingText(null);
    if (isEmpty) {
      // Drop a text box the user placed but never typed into.
      setTexts(prev => prev.filter(t => t.key !== key));
      setSelectedText(s => (s === key ? null : s));
    } else {
      setSelectedText(key); // stays selected (blue) after committing
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return; // don't hijack typing
      // Escape disarms the text tool so the canvas can be panned again.
      if (e.key === 'Escape') {
        setTextMode(false);
        return;
      }
      // "T" arms the text tool, just like clicking the Text tile.
      if (e.key.toLowerCase() === 't' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setTextMode(true);
        return;
      }
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      if (selectedEl !== null) {
        setDemoElements(prev => prev.filter(el => el.key !== selectedEl));
        setSelectedEl(null);
      }
      if (selectedText !== null) {
        setTexts(prev => prev.filter(t => t.key !== selectedText));
        setSelectedText(null);
        setEditingText(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEl, selectedText]);
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
          onSelectEl={selectEl}
          onMoveElement={moveElement}
          onDropElementInStack={dropElementInStack}
          textMode={textMode}
          texts={texts}
          editingText={editingText}
          selectedText={selectedText}
          onPlaceText={placeText}
          onChangeText={changeText}
          onMoveText={moveText}
          onDropTextInStack={dropTextInStack}
          onSelectText={selectText}
          onEditText={editText}
          onDeselectText={deselectText}
          onEndTextEdit={endTextEdit}
        />
        <RightSidebar
          scene={scene}
          onSceneChange={setScene}
          onPickElement={pickElement}
          onRequestImageUpload={requestImageUpload}
          onArmText={armText}
          textArmed={textMode}
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
