const SVG_W = 153;
const SVG_H = 68;
const CROP_X = 11;   // capture pill left shadow
const CROP_Y = 8;
const CROP_W = 132;  // pill + shadow on both sides
const CROP_H = 46;

const VISIBLE_W = 238; // full popup inner so pill spans like grid pills
const SCALE = VISIBLE_W / CROP_W;

// One pill at native y=24, h=26
const PILL = { y: 24, h: 26 };

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
            left: 0,
            top: `${(PILL.y - CROP_Y) * SCALE}px`,
            width: `${VISIBLE_W}px`,
            height: `${PILL.h * SCALE}px`,
          }}
        />
      </div>
    </div>
  );
}
