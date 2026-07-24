# Product images

Each catalogue item looks for `public/products/<product-id>.jpg`. The shop
renders it automatically; any item without a file gracefully falls back to its
emoji. Replace any file here to change a product's photo — no code change.

## Current status

21 of 28 photos are pre-populated from open product databases
(Open Food Facts / Open Beauty Facts, community-contributed under open
licenses) via `scripts/fetch-images.mjs`.

**Awaiting a proper packshot (currently emoji):** `p-frytol-1l`,
`p-voltic-6`, `p-onga-pk`, `p-goldentree`, `p-sugar-1kg`, `p-cracker`,
`p-cowbell-400`. These are mostly Ghana-specific brands the open databases
don't carry — best sourced from the distributor/manufacturer.

**Approximate matches worth replacing with the exact SKU** when you have it:
`p-titus-125` (generic sardine tin), `p-ideal-160` (evaporated-milk tin, other
brand), `p-kalyppo-6` (generic juice), `p-milo-400` (Milo UHT pack, not the
tin), `p-keysoap`, `p-pepsodent` (Pepsodent oral-care, not the toothpaste
tube).

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
