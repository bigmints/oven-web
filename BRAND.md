# PicoRunner visual identity

PicoRunner uses a dark charcoal interface, teal accents, and **Manrope**. The
intertwined symbol remains the PicoRunner mark. The website wordmark is set in
Manrope at weight 750 rather than the previous heavy outlined lettering.

## Shared foundation

`site/tokens.css` is the source of truth for colors, typography, spacing, borders,
radii, and focus states. It is intended for both the website and desktop app.
The bundled variable font is `site/fonts/Manrope-Variable.ttf`; its SIL Open Font
License is included beside it. Font loading makes no request to Google Fonts.

- Background: `#111414`
- Card: `#181c1c`
- Raised surface: `#202626`
- Border: `#2b3332`
- Primary text: `#f0f5f4`
- Secondary text: `#a2aeab`
- Teal: `#36d6c0`, hover `#6ee7d7`
- Text on teal: `#082d28`

Use teal for primary actions, selected navigation, focus, and a small amount of
headline emphasis. Use neutral borders and surfaces to organize content. Amber
and violet identify independent apps; they are not alternate brand colors.
Avoid ornamental gradients, oversized pills, and unnecessary panels. Keep
shadows restrained; reserve the larger shadow for windows or floating messages.

## Typography and components

Use Manrope 400 for body text, 550–600 for headings, 650 for buttons, and 750 for
the wordmark. Code uses the system monospace stack. Main buttons have a 6px
radius, cards 10px, and large window previews 12–16px. Preserve a visible teal
keyboard focus ring and respect reduced-motion settings.

The website’s app-library illustration is a preview of the new visual direction,
not a screenshot of the currently released app. Its cards link to real app pages.
When applying this design to the desktop, reuse the token values and font,
including the same surface hierarchy, selected sidebar style, icons, and buttons.
The current task changes the website; desktop integration is a follow-up.

## Voice

Explain the action in everyday words: choose an app, install it, open it, update
it. Say what the person gets. Keep instructions short and specific. Technical
names belong only in developer instructions or where an app genuinely requires
them. Do not claim an app is ready when testing is incomplete. Do not fill empty
ratings with placeholder marketing text.

## Assets

The website uses `site/brand/mark-teal.svg`, a live Manrope wordmark,
`site/favicon.svg`, and `site/brand/social-card.png` (1200 × 630).
Regenerate these with ImageMagick installed:

```sh
node scripts/build-web-brand.mjs
```

Older outlined wordmarks and app icon assets remain in `site/brand` for existing
desktop releases. `scripts/build-brand.mjs` and `scripts/render-brand.mjs` are
legacy desktop asset tooling; if used, rerun `build-web-brand.mjs` afterwards to
restore the current website favicon and social card. App icon and signing work
should be done as part of the desktop adoption, not the website build.

Use **PicoRunner** in visible copy and **picorunner.com** for public links. The
desktop bundle identifier is `com.bigmints.picorunner`. Historical repository
names and the legacy `oven://` protocol remain only for compatibility.

## Positioning

PicoRunner makes open-source projects easier for people without technical skills
to run, and easier for developers—including first-time builders and vibe
coders—to share with their community. Keep these audiences separate: the homepage helps people find and run apps;
the For developers page explains the benefits and steps for sharing a project.
Connect them through navigation, without competing creator calls to action on
the homepage. Do not define the product by a specific operating system. Mac is the currently available download; more platforms are
planned. Do not name unreleased platforms or promise release dates.

The developer benefit is a simpler path to a first run: reusable setup steps, a
launch link or README button, and a way to invite people beyond other developers
to try the app and give feedback. Do not imply guaranteed users, revenue,
automatic collection inclusion, a built-in feedback inbox, or universal project
compatibility. Keep current download requirements explicit.
