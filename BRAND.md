# PicoRunner identity

Use **PicoRunner** in visible copy and **picorunner.com** for public links.
The desktop bundle identifier is `com.bigmints.picorunner`.

The approved identity is **Folded P**: an original geometric P with heavy
mixed-case lettering. Primary artwork is black (`#080808`) on white; use the
white reverse version on dark backgrounds. Keep the wordmark transparent.
Do not add a play triangle, colored gradient, outline, or shadow to the mark.

The lettering is stored as vector outlines in `scripts/brand/wordmark.json`.
It was outlined from locally licensed Arial Black; no font software is
embedded or distributed. It has no runtime font dependency.

Regenerate SVGs with:

```sh
node scripts/build-brand.mjs
```

With ImageMagick installed, regenerate PNGs and synchronize the desktop:

```sh
node scripts/render-brand.mjs --desktop ../node-launcher
```

This copies shared SVGs, regenerates the transparent 36-by-36 RGBA tray
silhouette, and invokes Tauri's icon builder. A desktop build and new signing/
notarization are required after changing its icons or embedded assets.

Use `lockup.svg` in website navigation, `wordmark.svg` in About, and
`icon.svg` in compact app UI. `app-icon.svg` contains its own macOS-safe
inset. The share card is `social-card.png` at 1200 by 630 pixels.

The selected concept and its exploration board are archived in
`design/brand-v2`. The canonical production artwork is `site/brand`.
Historical repository names and the legacy `oven://` protocol remain only
for compatibility.
