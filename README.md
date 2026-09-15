# Benchmark Guides — Shopify theme (Arabic / English)

A bilingual Online Store 2.0 theme for selling Arabic-language engineering guides as digital PDFs.
Design language: vellum ground, datum ink, survey bronze accent, registration marks and paper grain,
numbered "drawing-sheet" covers. Inspired by the Perennial print-studio aesthetic, built on the
Benchmark Guides brand tokens (`brand/tokens.css`).

## What's inside

| Folder | Contents |
| --- | --- |
| `layout/` | `theme.liquid` (sets `lang` and `dir="rtl"` automatically for Arabic), `password.liquid` |
| `sections/` | Header/footer groups, hero, featured collection, collection list, image-with-text, rich text + stats, testimonials, FAQ, newsletter, and every `main-*` template section (product, collection, cart, search, blog, article, 404, password, customer accounts) |
| `snippets/` | `product-card`, `cover` (generated document cover), `guide-meta` (discipline/code/revision resolver), `price`, `localization` (language + currency switcher), `pagination`, `icon`, `meta-tags` (hreflang), `address-fields` |
| `templates/` | JSON templates for all page types incl. `customers/*` and `gift_card.liquid` |
| `locales/` | `en.default.json`, `ar.json` (storefront) and `en.default.schema.json`, `ar.schema.json` (theme editor) |
| `assets/` | `base.css` (single stylesheet, logical properties for RTL), `theme.js` (no dependencies) |
| `config/` | `settings_schema.json`, `settings_data.json` with a Vellum preset and a Parchment preset |

## Typography

| Role | English | Arabic |
| --- | --- | --- |
| Display / headings / buttons | Saira (wide, 112% stretch) | IBM Plex Sans Arabic |
| Body | Source Serif 4 | Noto Naskh Arabic |
| Codes, revisions, page counts | IBM Plex Mono | IBM Plex Mono (Latin codes) |

Fonts load from Google Fonts in `layout/theme.liquid`. Letter-spacing and uppercase are disabled
automatically under `[dir="rtl"]` so Arabic ligatures stay intact.

## Install

### Option A — upload the zip
1. Shopify admin → **Online Store → Themes → Add theme → Upload zip file**.
2. Choose `benchmark-guides-theme.zip`.
3. Click **Customize** to review, then **Publish**.

### Option B — connect from GitHub
1. Shopify admin → **Online Store → Themes → Add theme → Connect from GitHub**.
2. Pick this repository and the `main` branch.

### Option C — Shopify CLI
```bash
shopify theme dev
```
```bash
shopify theme push
```

## Make it bilingual (5 minutes)

1. **Settings → Languages → Add language → Arabic** (or English, whichever is not your default).
   Publish it. The header now shows an `English / العربية` toggle and every URL gets `/ar` or `/en`.
2. All theme UI strings (buttons, cart, account pages, FAQ defaults, hero defaults) are already
   translated in `locales/ar.json` and `locales/en.default.json`.
3. For **your own content** (product titles, descriptions, collection names, any section text you
   override in the editor), install Shopify's free **Translate & Adapt** app and fill in the Arabic
   or English side. The theme's section fields say *"Leave blank to use the built-in bilingual text"*:
   as long as a field is blank, the theme serves the right language automatically.
4. The theme flips to right-to-left automatically whenever the active locale is Arabic
   (`ar`, `ar-SA`, `ar-AE`, …). No settings required.

## Guide metadata (covers, codes, revisions)

Products render a generated "document cover" when no image is uploaded, and a discipline-coloured
spine when one is. Metadata is read in this order:

| Field | Source | Fallback |
| --- | --- | --- |
| Discipline (colour + label) | metafield `custom.discipline` = `gen / civ / str / mec / ele / prc` | product tag `CIV`, `Structural`, `disc:mec`, … → `gen` |
| Guide code | metafield `custom.guide_code` | variant SKU → `BG-CIV-014` (prefix from theme settings) |
| Revision | metafield `custom.revision` (e.g. `B`) | `A` |
| Pages / Format / Language | `custom.pages`, `custom.format`, `custom.language` | — / `PDF` / Arabic |
| "New rev" badge | product tag `new` or `new rev` | — |

Create the metafields once under **Settings → Custom data → Products** (namespace `custom`).

The collection page's discipline filter links to `/collections/<handle>/civ` etc., so tag each
product with its lowercase discipline code (`civ`, `str`, …) for filtering to work.

## Digital delivery

Shopify does not deliver files by itself. Install **Digital Downloads** (free, by Shopify) or
**Sky Pilot / SendOwl**, attach the PDF to each product, and mark products as *"This is a digital
product or service"* so no shipping is required.

## Theme settings

- **Colors** — the seven brand tokens plus six discipline colours.
- **Layout & texture** — page width, paper grain, vignette, registration marks.
- **Brand** — favicon, guide code prefix, social links.
- **Products** — dynamic checkout, trust list, SKU display.
- **Custom CSS** — appended after `base.css`.

## Development

```bash
shopify theme check
```
No build step: edit `assets/base.css` and `assets/theme.js` directly.

## License

MIT — do whatever you like with it, attribution appreciated.
