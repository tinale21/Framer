type Props = { onSelect: (id: string) => void };

const SVG_W = 229;
const SVG_H = 715;
const INNER_W = 238; // popout width 270 - 16 padding * 2
const SCALE = INNER_W / SVG_W;

type Tile = { id: string; x: number; y: number; w: number; h: number };
type Section = { name: string; yStart: number; height: number; tiles: Tile[] };

const SECTIONS: Section[] = [
  {
    name: 'Image',
    yStart: 39,
    height: 110.859,
    tiles: [
      { id: 'gif', x: 0, y: 39, w: 110, h: 110.859 },
      { id: 'gif', x: 118, y: 39, w: 110, h: 110.859 },
    ],
  },
  {
    name: 'Video',
    yStart: 209,
    height: 230,
    tiles: [
      { id: 'video', x: 0, y: 209, w: 111, h: 111 },
      { id: 'youtube', x: 118, y: 209, w: 111, h: 111 },
      { id: 'vimeo', x: 0, y: 328, w: 111, h: 111 },
    ],
  },
  {
    name: 'Music',
    yStart: 485,
    height: 230,
    tiles: [
      { id: 'spotify', x: 0, y: 485, w: 110, h: 110.859 },
      { id: 'applemusic', x: 118, y: 485, w: 110, h: 110.859 },
      { id: 'mp3', x: 0, y: 604, w: 111, h: 111 },
    ],
  },
];

export default function ElementPopout({ onSelect }: Props) {
  return (
    <div className="popout-element">
      {SECTIONS.map(section => (
        <div key={section.name} className="popout-element__section">
          <div className="popout-element__label">{section.name}</div>
          <div className="popout-element__strip" style={{ height: `${section.height * SCALE}px` }}>
            <img
              src={`${import.meta.env.BASE_URL}elements-popup.svg`}
              alt=""
              className="popout-element__strip-img"
              style={{
                top: `${-section.yStart * SCALE}px`,
                width: `${INNER_W}px`,
                height: `${SVG_H * SCALE}px`,
              }}
            />
            {section.tiles.map((t, i) => (
              <button
                key={i}
                className="popout-element__zone"
                aria-label={t.id}
                onClick={() => onSelect(t.id)}
                style={{
                  left: `${t.x * SCALE}px`,
                  top: `${(t.y - section.yStart) * SCALE}px`,
                  width: `${t.w * SCALE}px`,
                  height: `${t.h * SCALE}px`,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
