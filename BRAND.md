# PicoRunner identity

Use **PicoRunner** in visible copy and **picorunner.com** for public web links.
The desktop bundle identifier is `com.bigmints.picorunner`.

The original geometric wordmark and P/play symbol are path-based SVGs generated
by `node scripts/build-brand.mjs`. Do not substitute a typed font for the logo.
Use the complete lockup in navigation, the wordmark in About, and the symbol or
rounded icon where space is limited. Keep artwork proportions unchanged.

- Pine: `#245344`
- Dark ink: `#19392f`
- Pale lime: `#eaf2cd`
- Warm white: `#f7f8f2`

`site/brand` is the vector source of truth. The desktop uses copies in
`node-launcher/public/brand`; its sidebar mark is `public/picorunner-mark.svg`.
After updating the vectors, copy them to those locations and run
`pnpm tauri icon public/brand/app-icon.svg` in the desktop repository. The
app icon includes its own macOS-safe inset. Tray artwork is a monochrome,
36-by-36 RGBA rendering of `symbol.svg`.

The share image is `site/brand/social-card.png` at 1200 by 630 pixels.
Render SVG strokes with a browser or the Tauri SVG rasterizer: ImageMagick's
SVG reader can omit the wordmark strokes. To reproduce the existing PNG,
copy `social-card.svg` to a temporary file with a 1200-by-1200 viewBox,
run `pnpm tauri icon /tmp/picorunner-social-square.svg -p 1200 -o /tmp/picorunner-social-render`
in the desktop repository, then crop the resulting PNG to the top 1200 by 630
pixels. Inspect the output before committing it.

Historical repository names and the legacy `oven://` protocol remain for
compatibility. They must not replace PicoRunner in product-facing copy.
