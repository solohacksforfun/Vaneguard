# Corvanta

Marketing site for **Kognar Engine**, Corvanta's AI trading engine.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home: hero, what it is, how it works, track record, reviews, FAQ, contact |
| `explore.html` | Long-form case for automated trading |
| `packages.html` | Package tiers, add-ons, order summary, checkout links |
| `performance.html` | Full 156-week performance data |
| `legal.html` | Terms, Privacy, Risk Disclaimer, License Agreement |

## Shared assets

`design.css`, `engine.js` and `page.js` are the source of truth. Every page
also carries an inlined copy of all three so it renders as a single request —
if you edit one of these files, re-inline it into all four pages rather than
editing a page's `<style>` or `<script>` block directly.

## Brand files

These are the official marks. Everything else is generated from
`kognar-engine-icon.svg`.

| File | Use |
| --- | --- |
| `kognar-engine-icon.svg` | Square product symbol — nav, footer, SVG favicon |
| `kognar-engine-primary.svg` | Full logo, symbol + wordmark, for light backgrounds |
| `kognar-engine-primary-dark.svg` | Full logo for dark backgrounds |
| `corvanta-wordmark.svg` | Company wordmark for light backgrounds |
| `corvanta-wordmark-dark.svg` | Company wordmark — used in the footer bar |

Generated from the icon:

| File | Use |
| --- | --- |
| `favicon.ico` | 16 / 32 / 48 bundle for legacy clients |
| `favicon-16x16.png`, `favicon-32x32.png` | Modern browser tabs, transparent |
| `apple-touch-icon.png` | 180x180 iOS home screen, opaque |
| `android-chrome-192x192.png`, `android-chrome-512x512.png` | Android / PWA |
| `maskable-icon-512x512.png` | Android adaptive icon, 60% safe zone |
| `og-image.png` | 1200x630 social share card |

All of these are generated from `kognar-engine-icon.svg` and the two primary
logos. If the artwork changes, regenerate them rather than editing the PNGs by
hand.

## Performance figures

The numbers on the site are stated in three places that must agree: the stat
rows in the page markup, the donut in `page.js` (`animateDonut`), and the
`missAt` / `aboveAt` arrays that generate the week-by-week bar chart. Current
set: 185 weeks tracked, 156 hit target, 13 above, 16 below, 84% win rate.
Change one, change all three.
