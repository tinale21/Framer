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
import type { Scene, DemoEl, TextEl, LayoutOpts } from './types';

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
  // The demo stack's layout, set by the demo-7 Layout panel. Defaults match
  // the stack's resting look — a vertical, centered column.
  const [layoutOpts, setLayoutOpts] = useState<LayoutOpts>({
    type: 'stack', direction: 'v', distribute: 'Center', align: 'center',
    gap: '8', masonry: 'no', cols: '2', rows: '2', gapX: '10', gapY: '10',
    padMode: 'uniform', padT: '8', padR: '8', padB: '8', padL: '8',
  });
  // Once the user adjusts a layout control, the demo-7 spotlight/highlight
  // turns off — the panel is then used like the normal editor.
  const [layoutTouched, setLayoutTouched] = useState(false);
  if (scene !== 'demo-7-layout-panel' && layoutTouched) setLayoutTouched(false);
  const changeLayout = (next: LayoutOpts) => {
    setLayoutOpts(next);
    setLayoutTouched(true);
  };
  // The demo stack can be selected (in the layout-panel step) so the user
  // can delete it with the keyboard.
  const [stackSelected, setStackSelected] = useState(false);
  if (scene !== 'demo-7-layout-panel' && stackSelected) setStackSelected(false);

  const pickElement = (id: string, src?: string) => {
    const key = elKeyRef.current++;
    // A new element drops in the workspace just left of the frame (negative x
    // in the frame's own space), so the user drags it onto the canvas. Stack
    // each one below the previous so picking several never piles them up.
    const y = demoElements
      .filter(el => !el.inStack)
      .reduce((bottom, el) => bottom + (EL_HEIGHTS[el.id] ?? 90) + EL_GAP, 300);
    setDemoElements(prev => [
      ...prev,
      { key, id, x: -165, y, inStack: false, src },
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
  const moveElement = useCallback((key: number, x: number, y: number, width?: number) => {
    setDemoElements(prev => prev.map(el => (el.key === key
      ? { ...el, x, y, ...(width !== undefined ? { width } : {}) }
      : el)));
  }, []);
  const dropElementInStack = useCallback((key: number) => {
    setDemoElements(prev => prev.map(el => (el.key === key ? { ...el, inStack: true } : el)));
  }, []);
  const popElementFromStack = useCallback((key: number) => {
    setDemoElements(prev => prev.map(el => (el.key === key ? { ...el, inStack: false } : el)));
  }, []);
  // Selecting an element clears any text selection — only one at a time.
  const selectEl = useCallback((key: number | null) => {
    setSelectedEl(key);
    setSelectedText(null);
    setEditingText(null);
    setStackSelected(false);
  }, []);
  // Selecting the whole stack clears any element / text selection — only
  // one thing is selected (and so deletable) at a time.
  const selectStack = useCallback(() => {
    setStackSelected(true);
    setSelectedEl(null);
    setSelectedText(null);
    setEditingText(null);
  }, []);
  // Discarding the demo (or deleting the stack) clears the canvas back to
  // the empty editor.
  const clearCanvas = useCallback(() => {
    setStackSelected(false);
    setSelectedEl(null);
    setSelectedText(null);
    setEditingText(null);
    setDemoElements([]);
    setTexts([]);
    setScene('base');
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
  const popTextFromStack = useCallback((key: number) => {
    setTexts(prev => prev.map(t => (t.key === key ? { ...t, inStack: false } : t)));
  }, []);
  const selectText = useCallback((key: number) => {
    setSelectedText(key);
    setEditingText(null);
    setSelectedEl(null); // only one thing is selected at a time
    setStackSelected(false);
  }, []);
  const editText = useCallback((key: number) => {
    setSelectedText(key);
    setEditingText(key);
    setSelectedEl(null); // only one thing is selected at a time
    setStackSelected(false);
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
      if (stackSelected) {
        clearCanvas(); // deleting the stack blanks the canvas
        return;
      }
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
  }, [selectedEl, selectedText, stackSelected, clearCanvas]);

  // The completion screen appears ~3s after the first layout adjustment.
  useEffect(() => {
    if (!layoutTouched || scene !== 'demo-7-layout-panel') return;
    const t = window.setTimeout(() => setScene('demo-completed-modal'), 3000);
    return () => window.clearTimeout(t);
  }, [layoutTouched, scene]);
  const homeExpanded = selection !== 'none';
  const toggleHome = () => setSelection(s => (s === 'none' ? 'frame' : 'none'));
  const selectFrame = () => { setSelection('frame'); setStackSelected(false); };
  const selectCanvas = () => { setSelection('canvas'); setStackSelected(false); };
  const deselect = () => { setSelection('none'); setStackSelected(false); };
  const toggleDarkMode = () => setDarkMode(d => !d);

  const showPopout = SHOW_POPOUT.includes(scene);
  const showDemoTint =
    scene === 'demo-1-stack-highlighted' ||
    scene === 'demo-2-cursor' ||
    scene === 'demo-5-insert-highlighted' ||
    scene === 'demo-7-layout-prompt' ||
    (scene === 'demo-7-layout-panel' && !layoutTouched);
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
          onPopElementFromStack={popElementFromStack}
          textMode={textMode}
          texts={texts}
          editingText={editingText}
          selectedText={selectedText}
          onPlaceText={placeText}
          onChangeText={changeText}
          onMoveText={moveText}
          onDropTextInStack={dropTextInStack}
          onPopTextFromStack={popTextFromStack}
          onSelectText={selectText}
          onEditText={editText}
          onDeselectText={deselectText}
          onEndTextEdit={endTextEdit}
          layoutOpts={layoutOpts}
          layoutTouched={layoutTouched}
          stackSelected={stackSelected}
          onSelectStack={selectStack}
        />
        <RightSidebar
          scene={scene}
          onSceneChange={setScene}
          onPickElement={pickElement}
          onRequestImageUpload={requestImageUpload}
          onArmText={armText}
          textArmed={textMode}
          layoutOpts={layoutOpts}
          onLayoutChange={changeLayout}
          layoutTouched={layoutTouched}
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
      {showCompletedModal && (
        <StackDemoCompletedModal onSceneChange={setScene} onDiscard={clearCanvas} />
      )}
      {showDisabledModal && <DisabledStackTutorialModal onSceneChange={setScene} />}
      {showOverlaysSettings && <TutorialOverlaysModal onSceneChange={setScene} />}
    </div>
  );
}
