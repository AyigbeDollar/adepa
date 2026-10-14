# Product images

Each catalogue item looks for `public/products/<product-id>.jpg`. The shop
renders it automatically; any item without a file gracefully falls back to its
emoji. Replace any file here to change a product's photo — no code change.

## Current status

**Official brand pack shots (Oct 2026).** These 9 come from each brand's
official Ghana Instagram account, cropped to the pack (captions, promo text
and prices removed). Use them only with the brand's or distributor's OK.

| Product | Source post |
|---|---|
| `p-cowbell-400` | [cowbellghana](https://www.instagram.com/cowbellghana/reel/DcBtjIBEWFx/) |
| `p-frytol-1l` | [frytolghana](https://www.instagram.com/frytolghana/reel/DSt0C2QjPnU/) |
| `p-goldentree` | [goldentree_gh](https://www.instagram.com/goldentree_gh/p/DUSxScLDPhW/) |
| `p-ideal-160` | [idealmilkghana](https://www.instagram.com/idealmilkghana/reel/DeGu3_-FD3Z/) |
| `p-kalyppo-6` | [kalyppojuice](https://www.instagram.com/kalyppojuice/p/Dd574gLFhan/) |
| `p-keysoap` | [keysoapghana](https://www.instagram.com/keysoapghana/p/Cyi3-t0rSYX/) |
| `p-milo-400` | [officialmiloghana](https://www.instagram.com/officialmiloghana/reel/DeMwi-XCV6K/) |
| `p-onga-pk` | [ongaghana](https://www.instagram.com/ongaghana/reel/Ddh08umIxgk/) |
| `p-voltic-6` | [voltic_gh](https://www.instagram.com/voltic_gh/reel/C6_I4FWNaJx/) |

**Still from open product databases** (Open Food Facts / Open Beauty Facts,
via `scripts/fetch-images.mjs`). Several are not the Ghana SKU and are worth
replacing: `p-beans-1kg`, `p-exeter-340`, `p-indomie-5`, `p-lux-soap`,
`p-maggi-60`, `p-rice-5kg`, `p-softcare-4`, `p-titus-125`,
`p-plantain-150`, `p-gari-1kg`, `p-nescafe-50`, `p-pepsodent`,
`p-omo-900`, `p-dettol-250`, `p-nivea-200`, `p-geisha`, `p-gino-210`.

**No image yet (emoji):** `p-sugar-1kg`, `p-cracker` — no official brand
account found; source from the distributor.

## Image specs

- **Format:** JPG (current), or PNG/WebP if you also update the path
- **Size:** ~800×800 px works well; the card uses `object-contain` on white
- **Background:** white or transparent
- **Content:** product packshot, centred

## Licensing

Add only images you have the right to use — distributor/manufacturer media
kits, an official product feed, open-licensed databases, or photos you shot.

## Going live (Supabase)

When the catalogue moves to Supabase, set each product's `image_url` column
(e.g. a Supabase Storage URL) instead of relying on the local path. The same
render + emoji fallback applies.
