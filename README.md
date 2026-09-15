# Benchmark Guides — Shopify theme (Arabic default · English)

قالب Shopify ثنائي اللغة لبيع أدلة هندسية بصيغة PDF. العربية هي اللغة الافتراضية، والإنجليزية لغة ثانية.
An Online Store 2.0 theme that implements the **Benchmark Guides Identity Standard** (`brand/brand-guidelines.html`, BG-ID-001 Rev A):
Vellum ground, Datum Ink text, Survey Bronze datum, Chalk cards, Flagging Orange for badges only; Saira / Source Serif 4 / IBM Plex Mono;
survey grids, dimension callouts, revision stamps, elevation levels and datum tags.

## Arabic is the default

- `locales/ar.default.json` is the theme's default storefront locale, `locales/en.json` the English one
  (and `ar.default.schema.json` / `en.schema.json` for the theme editor).
- The page switches to right-to-left automatically whenever the active locale is Arabic. All layout uses logical CSS properties.
- **In Shopify admin, set Arabic as the store's default language**: Settings → Languages → make Arabic the default, then add English
  and publish it. The header then shows an `العربية / English` toggle and URLs get `/en` for English.
- Theme UI strings are translated in both files. For your own content (titles, descriptions, section text you type into the editor),
  install Shopify's free **Translate & Adapt** app and fill in the English side. Any section field left blank uses the built-in bilingual text.

## Brand identity applied

| Standard | Where in the theme |
| --- | --- |
| Logo: primary at 200–220 px / 150 px mobile, never retyped | `sections/header.liquid` uses `assets/logo-primary.svg`; footer uses `logo-stacked(-reversed).svg`; password page uses stacked; favicon falls back to `app-icon.svg` |
| Colour schemes 1–4 (Vellum, Chalk, Datum Ink, Bronze) | `scheme` setting on announcement bar, footer, rich text, image-with-text, newsletter (`.scheme-*` classes in `base.css`) |
| Discipline colours only on Datum Ink | Cover stripe, code chip, discipline tabs (`snippets/cover.liquid`, `sections/collection-list.liquid`) |
| Type scale (Display 61 · H1 49 · H2 31 · H3 20 · Body 17 · Button 14 caps +7% · Label Plex Mono 12 caps +9%) | `assets/base.css` type roles |
| Survey grid, never behind body text | Title-sheet hero, covers, ink bands |
| Dimension callout = real measurement | Page count on the product page |
| Revision stamp on every cover and product page | `REV C · 2026-08` from `custom.revision` / `custom.revision_date` |
| Elevation levels EL 100/200/300 from the SKU hundreds digit | `snippets/guide-meta.liquid` |
| Datum tag for series base guides | `custom.datum` metafield → "Datum A" badge |
| Radius 2 px, no drop shadows on UI | Buttons, cards, inputs |
| Voice: units always, no exclamation marks, plain first | All locale strings |

## Guide metadata

Products render a Datum Ink document cover when no image is uploaded. Data is read in this order:

| Field | Metafield (namespace `custom`) | Fallback |
| --- | --- | --- |
| Discipline | `discipline` = `gen / civ / str / mec / ele / prc` | product tag `STR`, `Structural`, `disc:str` → `gen` |
| Guide code | `guide_code` | variant SKU → `BG-STR-###` (prefix from theme settings) |
| Level (EL) | `level` = `100 / 200 / 300` | hundreds digit of the code sequence (`BG-STR-204` → EL 200) |
| Revision | `revision` (letter) / `revision_date` (`2026-08`) | `A` / blank |
| Pages / worked examples | `pages` / `examples` (integers) | hidden |
| Subtitle | `subtitle` | hidden |
| Datum | `datum` (letter) | hidden |
| Preview PDF | `preview_url` | section setting |
| Format / language | `format` / `language` | `PDF` / Arabic |
| "New rev" badge | product tag `new` or `new rev` | — |

Create the metafields once under **Settings → Custom data → Products**. Tag each product with its lowercase discipline code
(`str`, `civ`, …) so the collection-page filter (`/collections/all/str`) works.

## Install

- **Zip**: Online Store → Themes → Add theme → Upload zip file → `benchmark-guides-theme.zip`.
- **GitHub**: Online Store → Themes → Add theme → Connect from GitHub → this repository, branch `main`.
- **CLI**: `shopify theme dev` / `shopify theme push`.

## Digital delivery

Install **Digital Downloads** (free, by Shopify) or a similar app, attach the PDF to each product, and mark products as digital so no shipping is required.

## Structure

```
assets/      base.css, theme.js, logo-*.svg, app-icon.svg
config/      settings_schema.json, settings_data.json
layout/      theme.liquid, password.liquid
locales/     ar.default.json, en.json, ar.default.schema.json, en.schema.json
sections/    header/footer groups, hero (title sheet), featured-collection, collection-list, image-with-text,
             rich-text, testimonials, faq, newsletter, apps, main-* (product, collection, cart, search, blog,
             article, page, 404, password, customer accounts)
snippets/    product-card, cover, guide-meta, price, localization, pagination, icon, meta-tags, address-fields
templates/   JSON templates incl. customers/* and gift_card.liquid
brand/       identity standard, tokens and logo masters (source files, not uploaded to Shopify)
```

## Development

```bash
shopify theme check
```

MIT.
