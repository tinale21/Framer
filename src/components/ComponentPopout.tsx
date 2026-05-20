const SVG_W = 153;
const SVG_H = 68;
const CROP_X = 11;   // capture pill left shadow
const CROP_Y = 8;
const CROP_W = 132;  // pill + shadow on both sides
const CROP_H = 46;

const VISIBLE_W = 238; // full popup inner so pill spans like grid pills
const SCALE = VISIBLE_W / CROP_W;

// The pill rect in the SVG (native coords)
const PILL = { x: 14, y: 24, w: 125, h: 26 };

export default function ComponentPopout() {
  return (
    <div className="popout-component">
      <div
        className="popout-component__strip"
        style={{ width: `${VISIBLE_W}px`, height: `${CROP_H * SCALE}px` }}
      >
        <img
          src={`${import.meta.env.BASE_URL}components-popup.svg`}
          alt=""
          className="popout-component__strip-img"
          style={{
            top: `${-CROP_Y * SCALE}px`,
            left: `${-CROP_X * SCALE}px`,
            width: `${SVG_W * SCALE}px`,
            height: `${SVG_H * SCALE}px`,
          }}
        />
        <button
          className="popout-component__zone"
          aria-label="Component option"
          style={{
            left: `${(PILL.x - CROP_X) * SCALE}px`,
            top: `${(PILL.y - CROP_Y) * SCALE}px`,
            width: `${PILL.w * SCALE}px`,
            height: `${PILL.h * SCALE}px`,
          }}
        />
      </div>
    </div>
  );
}
