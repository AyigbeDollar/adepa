# Product images

Drop a **licensed** product photo here for each catalogue item, named
`<product-id>.webp` (WebP preferred; `.jpg`/`.png` also work if you rename the
path). The shop renders it automatically — no code change needed. Any item
without a matching file gracefully falls back to its emoji.

## Image specs

- **Format:** WebP (best), or JPG/PNG
- **Size:** ~800×800 px, square
- **Background:** white or transparent (cards sit on white)
- **Content:** the product packshot, centred, minimal empty space

## Licensing — read first

These are branded goods (Nestlé, Gino, Frytol, Unilever, etc.). Only add
images you have the right to use: manufacturer/distributor media kits, an
official product feed, or images you shot yourself. Do not download brand
photos from Google/retail sites and host them without permission.

## Required files (28)

| Filename | Product | Brand |
| --- | --- | --- |
| `p-rice-5kg.webp` | Perfumed Rice 5kg | Royal Aroma |
| `p-gari-1kg.webp` | Premium Gari 1kg | Neat Foods |
| `p-beans-1kg.webp` | Black Eyed Beans 1kg | Home Fresh |
| `p-sugar-1kg.webp` | St Louis Sugar Cubes | St Louis |
| `p-milo-400.webp` | Milo Activ-Go 400g | Nestlé |
| `p-nescafe-50.webp` | Nescafé Classic 50g | Nestlé |
| `p-voltic-6.webp` | Voltic Mineral Water (6×1.5L) | Voltic |
| `p-kalyppo-6.webp` | Kalyppo Fruit Drink (6-pack) | Aquafresh |
| `p-ideal-160.webp` | Ideal Evaporated Milk 160g | Ideal |
| `p-cowbell-400.webp` | Cowbell Milk Powder 400g | Cowbell |
| `p-gino-210.webp` | Gino Tomato Mix 210g | Gino |
| `p-frytol-1l.webp` | Frytol Cooking Oil 1L | Frytol |
| `p-maggi-60.webp` | Maggi Cubes ×60 | Maggi |
| `p-onga-pk.webp` | Onga Seasoning Pack | Onga |
| `p-titus-125.webp` | Titus Sardines 125g | Titus |
| `p-exeter-340.webp` | Exeter Corned Beef 340g | Exeter |
| `p-indomie-5.webp` | Indomie Chicken ×5 | Indomie |
| `p-goldentree.webp` | Golden Tree Chocolate 100g | Golden Tree |
| `p-plantain-150.webp` | Plantain Chips 150g | Deelight |
| `p-cracker.webp` | King Cracker Biscuits ×12 | King |
| `p-omo-900.webp` | Omo Detergent 900g | Omo |
| `p-keysoap.webp` | Key Soap Bar | Key Soap |
| `p-dettol-250.webp` | Dettol Antiseptic 250ml | Dettol |
| `p-softcare-4.webp` | Softcare Tissue ×4 | Softcare |
| `p-pepsodent.webp` | Pepsodent Toothpaste 130g | Pepsodent |
| `p-lux-soap.webp` | Lux Beauty Soap | Lux |
| `p-nivea-200.webp` | Nivea Body Lotion 200ml | Nivea |
| `p-geisha.webp` | Geisha Bathing Soap | Geisha |

When the catalogue moves to Supabase, set each product's `image_url` column
instead (e.g. a Supabase Storage URL); the same rendering + fallback applies.
