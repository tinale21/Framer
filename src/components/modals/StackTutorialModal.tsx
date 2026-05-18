import type { SceneSetter } from '../../types';
import { Close } from '../../icons';

export default function StackTutorialModal({ onSceneChange }: { onSceneChange: SceneSetter }) {
  return (
    <div className="modal-backdrop">
      <div className="modal modal--wide">
        <button className="modal__close" onClick={() => onSceneChange('base')}><Close /></button>
        <h2 className="modal__title">Using Stacks</h2>
        <p className="modal__body">
          Use the stack tool (S) or automatically arrange elements into a frame (⇧A), row (⇧R) or
          column (⇧C) stacks to easily manage spacing, alignment, and padding. Similar to Figma's
          auto-layout or CSS Flexbox.
        </p>

        <div className="stack-compare">
          <div className="stack-compare__panel stack-compare__panel--before">
            <div className="stack-compare__label">Before</div>
            <div className="stack-compare__before-stage">
              <div className="stack-compare__before-title">Title</div>
              <div className="stack-compare__before-line" />
              <div className="stack-compare__before-green" />
              <div className="stack-compare__before-red" />
              <div className="stack-compare__before-text">body text<br />paragraph</div>
            </div>
            <div className="stack-compare__caption">Without Stacks</div>
          </div>

          <div className="stack-compare__panel stack-compare__panel--after">
            <div style={{ gridColumn: '1 / -1' }} className="stack-compare__label">After</div>
            <div>
              <div className="stack-compare__card">
                <div className="stack-compare__card-title stack-compare__card-title-underline">Title</div>
                <div className="stack-compare__card-rect stack-compare__card-rect--green" />
                <div className="stack-compare__card-rect stack-compare__card-rect--red stack-compare__card-rect--lg" />
                <div className="stack-compare__card-text">body text paragraph</div>
              </div>
              <div className="stack-compare__caption">Organize current layout</div>
            </div>
            <div>
              <div className="stack-compare__card">
                <div className="stack-compare__card-title stack-compare__card-title-underline">Title</div>
                <div className="stack-compare__card-rect stack-compare__card-rect--green" />
                <div className="stack-compare__card-rect stack-compare__card-rect--red stack-compare__card-rect--lg" />
                <div className="stack-compare__card-rect stack-compare__card-rect--blue stack-compare__card-rect--lg" />
                <div className="stack-compare__card-text">body text paragraph</div>
              </div>
              <div className="stack-compare__caption">Automate future layout</div>
            </div>
          </div>
        </div>

        <div className="modal__footer">
          <button className="btn" onClick={() => onSceneChange('disabled-tutorial-modal')}>Don't Show Again</button>
          <button className="btn btn--primary" onClick={() => onSceneChange('demo-1-stack-highlighted')}>Practice/Demo</button>
        </div>
      </div>
    </div>
  );
}
