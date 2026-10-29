# Official Susi Air assets

Downloaded from the official website on 29 October 2026 and visually inspected. These original images retain their published colors; they are not AI recreations or recolored derivatives.

| Local asset | Official source |
| --- | --- |
| `nuxt/public/susiair-logo.png` | https://susiair.com/images/susiair-logo.png |
| `nuxt/public/favicon.ico` | https://susiair.com/favicon.ico |
| `nuxt/public/apple-touch-icon.png` | https://susiair.com/_nuxt/icons/icon_512x512.ba1a46.png |

The favicon and apple-touch URLs were read from the site's actual HTML icon declarations. The ICO contains multiple original icon sizes; the touch icon is 512×512. Nuxt references the official ICO with a cache-version query so it replaces the old generated airplane SVG in browser tabs.

## UI role palette

The canonical values live in `nuxt/assets/scss/_tokens.scss`. Rendered values and representative CTA/badge/chart colors were inspected in the browser and recorded at `output/ui/brand-audit.json`.

| Role | Exact color |
| --- | --- |
| Navy / primary text | `#0E2138` |
| Brand red / danger | `#E63757` |
| Page background | `#F5F6F8` |
| Surface | `#FFFFFF` |
| Secondary text | `#6B7280` |
| Success | `#1FBF8F` |
| Warning | `#F59E0B` |
| Chart accent | `#22C5E8` |

Borders, shadows and decorative overlays use alpha from these tokens. API-owned duty colors and their contrast-selected black/white text remain separate from brand-role colors, as required by the supplied schedule legend. Small text is paired with appropriate white/navy surfaces, and red filled CTA labels use bold 19px text so readable contrast is retained without substituting darker brand colors.
