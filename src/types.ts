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
  | 'demo-7-layout-panel'
  | 'demo-8-restacked'
  | 'demo-completed-modal'
  | 'demo-final'
  | 'disabled-tutorial-modal'
  | 'tutorial-overlays-settings';

export type SceneSetter = (scene: Scene) => void;

// A demo element instance: a unique key, the element type, a free
// position, and whether it's been dropped into the stack.
export type DemoEl = {
  key: number;
  id: string;
  x: number;
  y: number;
  inStack: boolean;
};
