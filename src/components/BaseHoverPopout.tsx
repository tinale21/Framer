const SVG_W = 233;
const SVG_H = 181;
const INNER_W = 238; // popup width 270 - 16 padding * 2

const TILES = [
  { x: 0, y: 0, w: 114, h: 116 },
  { x: 121, y: 0, w: 112, h: 68 },
  { x: 121, y: 77, w: 112, h: 58 },
  { x: 0, y: 123, w: 114, h: 58 },
  { x: 123, y: 144, w: 108, h: 37 },
];

export default function BaseHoverPopout() {
  return (
    <div className="popout-base-hover">
      {TILES.map((t, i) => {
        const scale = INNER_W / t.w;
        return (
          <button
            key={i}
            className="popout-base-hover__tile"
            aria-label={`Base option ${i + 1}`}
            style={{ height: `${t.h * scale}px` }}
          >
            <img
              src={`${import.meta.env.BASE_URL}base-popup.svg`}
              alt=""
              className="popout-base-hover__tile-img"
              style={{
                left: `${-t.x * scale}px`,
                top: `${-t.y * scale}px`,
                width: `${SVG_W * scale}px`,
                height: `${SVG_H * scale}px`,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
