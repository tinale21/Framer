# 0081 — Stack Modal: Replace Illustration with Looping Video

## Context
The "Using Stacks" onboarding modal (`src/components/modals/StackTutorialModal.tsx`) previously showed a static Before/After CSS illustration (`.stack-compare` grid with two panels of colored rectangles). This checkpoint replaces that illustration with a looping embedded video while preserving all modal behavior, buttons, and layout.

Video source: `/Users/tinale/Downloads/202606092124_1.mov` (QuickTime, 1280×720, 16:9)
Converted to: `public/stack-demo.mp4` (H.264 via `avconvert`, same dimensions)
Asset path in app: `${import.meta.env.BASE_URL}stack-demo.mp4`

Final modal state:
- Modal max-width: 689px (derived: 633px content column + 2×28px CSS padding)
- Video: `width: 100%`, `height: auto`, `borderRadius: 14`, `autoPlay muted loop playsInline`
- Description updated to: "Utilize stacks to automatically manage spacing, alignment, and padding. Similar to Figma's auto-layout or CSS' Flexbox."
- All other modal elements (title, buttons, close, onboarding flow) unchanged

## Human Directions
1. Source video at `/Users/tinale/Downloads/202606092124_1.mov`
2. Convert with `avconvert --source <input> --preset Preset1280x720 --output public/stack-demo.mp4 --replace`
3. In `StackTutorialModal.tsx`, delete the entire `<div className="stack-compare">` block
4. Replace with `<video src={...} autoPlay muted loop playsInline style={{ display:'block', width:'100%', height:'auto', borderRadius:14 }} />`
5. Set modal inline style to include `maxWidth: '689px'` alongside existing `transform: 'scale(0.85)'`
6. Update description copy as above

## Records of Resistance
- **`.mov` format invisible in Chrome**: Initial implementation used the raw `.mov` file — no video appeared at all. Chrome does not support Apple QuickTime format natively. Required conversion to H.264 MP4.
- **Base URL path missing**: After conversion, video still didn't appear. Asset was at `/stack-demo.mp4` but Vite's `base: '/Framer/'` config means the correct path requires `import.meta.env.BASE_URL` prefix. All other assets in the codebase already used this pattern.
- **`overflow: hidden` cropping**: First wrapping approach used `overflow: hidden` on the container for border-radius clipping; this cropped the video. Fixed by moving `borderRadius` directly onto the `<video>` element.
- **Centering vs. alignment tension**: Several iterations to resolve the conflict between "video should be smaller than full width" and "all content should share the same column." Resolved by deriving modal max-width from content column width + existing CSS padding, so the CSS padding alone provides all horizontal breathing room without a separate inner inset div.

## Successes
- "This is much closer. The video size is now correct." — after `maxWidth: 75%` on the container
- "This is almost exactly what I want." — after inner `padding: '0 12.5%'` wrapper aligned all elements
- Final layout: 689px modal, full-width video within CSS-padded column, description updated
