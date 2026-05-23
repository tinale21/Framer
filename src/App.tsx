import { useState, useEffect, useRef, useCallback, useMemo, type ChangeEvent } from 'react';
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
import {
  hexToHsva, hsvaToHex, hsvToHex, hexToRgb, vForContrast, contrastOverWhite,
} from './components/ColorPicker';
import type {
  Scene, DemoEl, TextEl, LayoutOpts, VectorKind, VectorEl, Pt,
  VectorFill, VectorStroke, Issue,
} from './types';

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
  // Vector tool: the Vector popout arms a shape kind (`vectorTool`); the next
  // drag on the canvas draws it. Shapes persist on the canvas like text.
  const [vectorTool, setVectorTool] = useState<VectorKind | null>(null);
  const [shapes, setShapes] = useState<VectorEl[]>([]);
  const [selectedShape, setSelectedShape] = useState<number | null>(null);
  const shapeKeyRef = useRef(0);
  // Path tool: in-progress anchor points while drafting (click to add). Lives
  // in App so the keydown handler can pop the last point on Delete.
  const [pathDraft, setPathDraft] = useState<Pt[]>([]);
  // Switching away from the Path tool (e.g. Escape) drops the draft.
  if (vectorTool !== 'path' && pathDraft.length > 0) setPathDraft([]);
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
  // Where the demo lands after the completion flow — `demo-final` keeps the
  // user's canvas, `base` is the blank editor.
  const [demoEndScene, setDemoEndScene] = useState<Scene>('base');
  // When the stack tutorial is turned off, the "Using Stacks" popup and the
  // guided steps are skipped — clicking Stack goes straight to the
  // drag-to-create step so the user still draws the stack themselves.
  const [stackTutorialDisabled, setStackTutorialDisabled] = useState(false);
  if (scene === 'stack-tutorial-modal' && stackTutorialDisabled) setScene('demo-2-cursor');
  // The "Disabled Stacks Tutorial" popup is a confirmation — whenever it's
  // shown the tutorial is actually off (this also covers the "Using Stacks"
  // popup's "Don't Show Again" button, which routes straight here).
  if (scene === 'disabled-tutorial-modal' && !stackTutorialDisabled) setStackTutorialDisabled(true);
  // The stack stays selectable in the layout-panel step, the finished canvas,
  // and — with the tutorial off — while placing elements into it.
  const stackSelectScene = scene === 'demo-7-layout-panel' || scene === 'demo-final'
    || (scene === 'demo-6-place-element' && stackTutorialDisabled);
  if (!stackSelectScene && stackSelected) setStackSelected(false);

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
    setSelectedShape(null);
    setVectorTool(null);
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
    setSelectedShape(null);
  }, []);
  // Selecting the whole stack clears any element / text selection — only
  // one thing is selected (and so deletable) at a time.
  const selectStack = useCallback(() => {
    setStackSelected(true);
    setSelectedEl(null);
    setSelectedText(null);
    setEditingText(null);
    setSelectedShape(null);
  }, []);
  // Clears all placed content — used by Discard and the keyboard delete.
  const clearCanvasState = useCallback(() => {
    setStackSelected(false);
    setSelectedEl(null);
    setSelectedText(null);
    setEditingText(null);
    setDemoElements([]);
    setTexts([]);
    setShapes([]);
    setSelectedShape(null);
  }, []);
  // Finishing the demo: Save keeps the canvas (ends at `demo-final`), Discard
  // clears it (ends at `base`). When "Disable stack tutorial" was ticked, both
  // detour through the disabled-tutorial popup, which then lands on that end.
  const finishDemo = useCallback((save: boolean) => {
    const end: Scene = save ? 'demo-final' : 'base';
    if (!save) clearCanvasState();
    setDemoEndScene(end);
    setScene(stackTutorialDisabled ? 'disabled-tutorial-modal' : end);
  }, [clearCanvasState, stackTutorialDisabled]);

  const armText = () => { setTextMode(m => !m); setVectorTool(null); };
  const placeText = useCallback((x: number, y: number) => {
    const key = textKeyRef.current++;
    setTexts(prev => [...prev, { key, x, y, text: '', inStack: false }]);
    setEditingText(key);
    setSelectedText(key);
    setSelectedEl(null); // only one thing is selected at a time
    setSelectedShape(null);
    setTextMode(false); // the text tool is one-shot, like Figma
  }, []);
  // Arming a vector tool from the Vector popout disarms the text tool; the
  // next drag on the canvas draws the shape.
  const armVector = useCallback((kind: VectorKind) => {
    setVectorTool(kind);
    setTextMode(false);
  }, []);
  // Drawing finishes here — the new shape is stored and selected, and the
  // tool disarms (one-shot, like the text tool).
  const createShape = useCallback(
    (kind: 'rectangle' | 'oval' | 'polygon' | 'star',
     x: number, y: number, w: number, h: number) => {
      const key = shapeKeyRef.current++;
      // Default look matches Framer: grey fill, no stroke.
      setShapes(prev => [
        ...prev,
        { key, kind, x, y, w, h, fill: '#cccccc', stroke: null, inStack: false },
      ]);
      setSelectedShape(key);
      setSelectedEl(null);
      setSelectedText(null);
      setEditingText(null);
      setStackSelected(false);
      setVectorTool(null);
    },
    [],
  );
  // Path is committed once the user closes it (clicking the first point) or
  // finishes it open (clicking the last point). Default look: thin grey
  // stroke, no fill — fill can be added from the Shape panel.
  const createPath = useCallback((points: Pt[], closed: boolean) => {
    const key = shapeKeyRef.current++;
    setShapes(prev => [
      ...prev,
      { key, kind: 'path', points, closed,
        fill: null, stroke: { color: '#aaaaaa', width: 1 }, inStack: false },
    ]);
    setSelectedShape(key);
    setSelectedEl(null);
    setSelectedText(null);
    setEditingText(null);
    setStackSelected(false);
    setVectorTool(null);
    setPathDraft([]);
  }, []);
  const addPathPoint = useCallback((p: Pt) => {
    setPathDraft(prev => [...prev, p]);
  }, []);
  const setShapeFill = useCallback((key: number, fill: VectorFill) => {
    setShapes(prev => prev.map(s => (s.key === key ? { ...s, fill } : s)));
  }, []);
  const setShapeStroke = useCallback((key: number, stroke: VectorStroke) => {
    setShapes(prev => prev.map(s => (s.key === key ? { ...s, stroke } : s)));
  }, []);
  const dropShapeInStack = useCallback((key: number) => {
    setShapes(prev => prev.map(s => (s.key === key ? { ...s, inStack: true } : s)));
  }, []);
  const popShapeFromStack = useCallback((key: number) => {
    setShapes(prev => prev.map(s => (s.key === key ? { ...s, inStack: false } : s)));
  }, []);
  const selectShape = useCallback((key: number) => {
    setSelectedShape(key);
    setSelectedEl(null);
    setSelectedText(null);
    setEditingText(null);
    setStackSelected(false);
  }, []);
  // Move a shape — for boxes, set the new top-left; for paths, translate all
  // anchor points so the new bbox top-left matches (x, y).
  const moveShape = useCallback((key: number, x: number, y: number) => {
    setShapes(prev => prev.map(s => {
      if (s.key !== key) return s;
      if (s.kind === 'path') {
        const xs = s.points.map(p => p.x), ys = s.points.map(p => p.y);
        const dx = x - Math.min(...xs), dy = y - Math.min(...ys);
        return { ...s, points: s.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
      }
      return { ...s, x, y };
    }));
  }, []);
  const changeText = useCallback((key: number, text: string) => {
    setTexts(prev => prev.map(t => (t.key === key ? { ...t, text } : t)));
  }, []);
  const moveText = useCallback((key: number, x: number, y: number) => {
    setTexts(prev => prev.map(t => (t.key === key ? { ...t, x, y } : t)));
  }, []);
  const setTextStyle = useCallback((key: number, patch: Partial<TextEl>) => {
    setTexts(prev => prev.map(t => (t.key === key ? { ...t, ...patch } : t)));
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
    setSelectedShape(null);
  }, []);
  const editText = useCallback((key: number) => {
    setSelectedText(key);
    setEditingText(key);
    setSelectedEl(null); // only one thing is selected at a time
    setStackSelected(false);
    setSelectedShape(null);
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
      // Escape disarms the text tool and deselects everything — deselecting
      // the stack brings the Insert panel back (it's hidden, replaced by the
      // Shape panel, while a stack is selected).
      if (e.key === 'Escape') {
        setTextMode(false);
        setVectorTool(null);
        setStackSelected(false);
        setSelectedEl(null);
        setSelectedText(null);
        setSelectedShape(null);
        setSelection('none');
        return;
      }
      // "T" arms the text tool, just like clicking the Text tile.
      if (e.key.toLowerCase() === 't' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setTextMode(true);
        return;
      }
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      // While drafting a path, Delete pops the most recent anchor point
      // (Figma / Illustrator behavior) instead of deleting a selected shape.
      if (pathDraft.length > 0) {
        setPathDraft(prev => prev.slice(0, -1));
        return;
      }
      if (stackSelected) {
        // Delete the stack itself and any items inside it; free items
        // elsewhere on the canvas (shapes, free elements, free texts) stay.
        setStackSelected(false);
        setSelectedEl(null);
        setSelectedText(null);
        setEditingText(null);
        setSelectedShape(null);
        setDemoElements(prev => prev.filter(el => !el.inStack));
        setTexts(prev => prev.filter(t => !t.inStack));
        setShapes(prev => prev.filter(s => !s.inStack));
        setScene('base');
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
      if (selectedShape !== null) {
        setShapes(prev => prev.filter(s => s.key !== selectedShape));
        setSelectedShape(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEl, selectedText, selectedShape, stackSelected, pathDraft.length, clearCanvasState]);

  // The completion screen appears ~3s after the first layout adjustment.
  useEffect(() => {
    if (!layoutTouched || scene !== 'demo-7-layout-panel') return;
    const t = window.setTimeout(() => setScene('demo-completed-modal'), 3000);
    return () => window.clearTimeout(t);
  }, [layoutTouched, scene]);
  const homeExpanded = selection !== 'none';
  const toggleHome = () => setSelection(s => (s === 'none' ? 'frame' : 'none'));
  const selectFrame = () => { setSelection('frame'); setStackSelected(false); setSelectedShape(null); };
  const selectCanvas = () => { setSelection('canvas'); setStackSelected(false); setSelectedShape(null); };
  const deselect = () => { setSelection('none'); setStackSelected(false); setSelectedShape(null); };
  const toggleDarkMode = () => setDarkMode(d => !d);

  const selectedShapeEl: VectorEl | null = selectedShape !== null
    ? shapes.find(s => s.key === selectedShape) ?? null
    : null;
  const selectedTextEl: TextEl | null = selectedText !== null
    ? texts.find(t => t.key === selectedText) ?? null
    : null;

  // Accessibility issues — currently fill-contrast checks against white. For
  // each failing shape, suggest three fixes (target ratios 21 / 7 / 4.5),
  // preserving hue + saturation + alpha.
  const issues: Issue[] = useMemo(() => {
    const out: Issue[] = [];
    for (const s of shapes) {
      if (s.fill === null) continue;
      const { h, s: sa, v, a } = hexToHsva(s.fill);
      const { r, g, b } = hexToRgb(hsvToHex(h, sa, v));
      const ratio = contrastOverWhite(r, g, b, a);
      if (ratio >= 4.5) continue;
      const fixes = [21, 7, 4.5].map(t => {
        const nv = vForContrast(h, sa, t, a);
        const color = hsvaToHex(h, sa, nv, a);
        const frgb = hexToRgb(hsvToHex(h, sa, nv));
        return { color, ratio: contrastOverWhite(frgb.r, frgb.g, frgb.b, a) };
      });
      out.push({
        id: `fill-${s.key}`,
        shapeKey: s.key,
        kind: 'fill-contrast',
        currentColor: s.fill,
        currentRatio: ratio,
        fixes,
      });
    }
    return out;
  }, [shapes]);

  // Editor (right-panel) state — which issue is being viewed and which fix is
  // currently previewed on the canvas.
  const [editorOpen, setEditorOpen] = useState(false);
  const [currentIssueIdx, setCurrentIssueIdx] = useState(0);
  const [previewedFixIdx, setPreviewedFixIdx] = useState<number | null>(null);
  // Clamp the issue index when the list shrinks (e.g. after Apply).
  if (currentIssueIdx > 0 && currentIssueIdx >= issues.length) setCurrentIssueIdx(Math.max(0, issues.length - 1));
  // Close the editor entirely when no issues are left.
  if (editorOpen && issues.length === 0 && previewedFixIdx === null) setEditorOpen(false);
  const currentIssue = issues[currentIssueIdx] ?? null;

  // The shapes Canvas renders — with the previewed fix temporarily applied.
  const renderShapes: VectorEl[] = useMemo(() => {
    if (!editorOpen || previewedFixIdx === null || !currentIssue) return shapes;
    const fix = currentIssue.fixes[previewedFixIdx];
    return shapes.map(s => (s.key === currentIssue.shapeKey ? { ...s, fill: fix.color } : s));
  }, [shapes, editorOpen, previewedFixIdx, currentIssue]);

  const toggleEditor = useCallback(() => {
    setEditorOpen(o => !o);
    setPreviewedFixIdx(null);
  }, []);
  const selectFix = useCallback((i: number | null) => setPreviewedFixIdx(i), []);
  const nextIssue = useCallback(() => {
    setPreviewedFixIdx(null);
    setCurrentIssueIdx(i => (issues.length === 0 ? 0 : (i + 1) % issues.length));
  }, [issues.length]);
  const prevIssue = useCallback(() => {
    setPreviewedFixIdx(null);
    setCurrentIssueIdx(i => (issues.length === 0 ? 0 : (i - 1 + issues.length) % issues.length));
  }, [issues.length]);
  const applyPreview = useCallback(() => {
    if (!currentIssue || previewedFixIdx === null) return;
    const fix = currentIssue.fixes[previewedFixIdx];
    setShapeFill(currentIssue.shapeKey, fix.color);
    setPreviewedFixIdx(null);
  }, [currentIssue, previewedFixIdx, setShapeFill]);

  const showPopout = SHOW_POPOUT.includes(scene);
  const showDemoTint =
    scene === 'demo-1-stack-highlighted' ||
    (scene === 'demo-2-cursor' && !stackTutorialDisabled) ||
    scene === 'demo-5-insert-highlighted' ||
    scene === 'demo-7-layout-prompt' ||
    (scene === 'demo-7-layout-panel' && !layoutTouched);
  const showStackTutorial = scene === 'stack-tutorial-modal';
  const showCompletedModal = scene === 'demo-completed-modal';
  const showDisabledModal = scene === 'disabled-tutorial-modal';
  const showOverlaysSettings = scene === 'tutorial-overlays-settings';

  return (
    <div className={'app' + (darkMode ? ' app--dark' : '')}>
      <TopBar onSceneChange={setScene} />
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
          stackTutorialDisabled={stackTutorialDisabled}
          vectorTool={vectorTool}
          shapes={renderShapes}
          selectedShape={selectedShape}
          onCreateShape={createShape}
          onCreatePath={createPath}
          onSelectShape={selectShape}
          onMoveShape={moveShape}
          onDropShapeInStack={dropShapeInStack}
          onPopShapeFromStack={popShapeFromStack}
          pathDraft={pathDraft}
          onAddPathPoint={addPathPoint}
        />
        <RightSidebar
          scene={scene}
          onSceneChange={setScene}
          onPickElement={pickElement}
          onRequestImageUpload={requestImageUpload}
          onArmText={armText}
          textArmed={textMode}
          onArmVector={armVector}
          vectorArmed={vectorTool !== null}
          layoutOpts={layoutOpts}
          onLayoutChange={changeLayout}
          layoutTouched={layoutTouched}
          stackSelected={stackSelected}
          selectedShapeEl={selectedShapeEl}
          onSetShapeFill={setShapeFill}
          onSetShapeStroke={setShapeStroke}
          selectedTextEl={selectedTextEl}
          onSetTextStyle={setTextStyle}
          editorOpen={editorOpen}
          issues={issues}
          currentIssueIdx={currentIssueIdx}
          previewedFixIdx={previewedFixIdx}
          onSelectFix={selectFix}
          onPrevIssue={prevIssue}
          onNextIssue={nextIssue}
          onCloseEditor={() => { setEditorOpen(false); setPreviewedFixIdx(null); }}
        />
      </div>
      <BottomToolbar
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        issueCount={issues.length}
        editorOpen={editorOpen}
        onToggleEditor={toggleEditor}
        previewing={previewedFixIdx !== null}
        onApplyPreview={applyPreview}
        onCancelPreview={() => setPreviewedFixIdx(null)}
      />
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
        <StackDemoCompletedModal
          onFinish={finishDemo}
          stackTutorialDisabled={stackTutorialDisabled}
          onToggleStackTutorial={() => setStackTutorialDisabled(v => !v)}
        />
      )}
      {showDisabledModal && (
        <DisabledStackTutorialModal onSceneChange={setScene} endScene={demoEndScene} />
      )}
      {showOverlaysSettings && (
        <TutorialOverlaysModal
          onSceneChange={setScene}
          stackTutorialDisabled={stackTutorialDisabled}
          onSetStackTutorialDisabled={setStackTutorialDisabled}
        />
      )}
    </div>
  );
}
