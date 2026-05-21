export type Scene =
  | 'base'
  | 'base-hover'
  | 'stack-tutorial-modal'
  | 'demo-1-stack-highlighted'
  | 'demo-2-cursor'
  | 'demo-3-drawing-frame'
  | 'demo-4-stack-created'
  | 'demo-5-insert-highlighted'
  | 'demo-6-place-element'
  | 'demo-6-rect-with-text'
  | 'demo-7-layout-prompt'
  | 'demo-7-layout-panel'
  | 'demo-8-restacked'
  | 'demo-completed-modal'
  | 'demo-final'
  | 'disabled-tutorial-modal'
  | 'tutorial-overlays-settings';

export type SceneSetter = (scene: Scene) => void;

// The demo stack's layout, driven by the demo-7 Layout panel. `distribute`
// is one of the panel's options (Start / Center / End / Space Between /
// Space Around / Space Evenly).
export type LayoutOpts = {
  type: 'stack' | 'grid';
  direction: 'h' | 'v';
  distribute: string;
  align: 'start' | 'center' | 'end';
};

// A text element placed on the canvas: a unique key, a free position,
// its typed content, and whether it's been dropped into the demo stack.
export type TextEl = {
  key: number;
  x: number;
  y: number;
  text: string;
  inStack: boolean;
};

// A demo element instance: a unique key, the element type, a free
// position, and whether it's been dropped into the stack. `src` holds a
// user-uploaded image's data URL (set when the element is a picked file).
export type DemoEl = {
  key: number;
  id: string;
  x: number;
  y: number;
  inStack: boolean;
  src?: string;
  // On-screen width to render at while free — set when pulled out of the
  // stack so the element keeps the size it had inside it.
  width?: number;
};
