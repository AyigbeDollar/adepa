// One-off tooling: pull real product packshots from the Open Food Facts /
// Open Beauty Facts / Open Products Facts open databases (images are
// community-contributed under open licenses) and save them as
// public/products/<id>.jpg. Missing matches are left to the emoji fallback.
//
// Run: node scripts/fetch-images.mjs
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "products");

const FOOD = ["world.openfoodfacts.org"];
const BEAUTY = ["world.openbeautyfacts.org", "world.openproductsfacts.org"];
const HOME = ["world.openproductsfacts.org", "world.openbeautyfacts.org"];

// id, search query, which open databases to try
const ITEMS = [
  ["p-rice-5kg", "aroma perfumed rice", FOOD],
  ["p-gari-1kg", "gari cassava", FOOD],
  ["p-beans-1kg", "black eyed beans", FOOD],
  ["p-sugar-1kg", "st louis sugar cubes", FOOD],
  ["p-milo-400", "milo nestle", FOOD],
  ["p-nescafe-50", "nescafe classic", FOOD],
  ["p-voltic-6", "voltic water", FOOD],
  ["p-kalyppo-6", "kalyppo drink", FOOD],
  ["p-ideal-160", "ideal evaporated milk", FOOD],
  ["p-cowbell-400", "cowbell milk powder", FOOD],
  ["p-gino-210", "gino tomato paste", FOOD],
  ["p-frytol-1l", "frytol cooking oil", FOOD],
  ["p-maggi-60", "maggi cube", FOOD],
  ["p-onga-pk", "onga seasoning", FOOD],
  ["p-titus-125", "titus sardines", FOOD],
  ["p-exeter-340", "exeter corned beef", FOOD],
  ["p-indomie-5", "indomie instant noodles chicken", FOOD],
  ["p-goldentree", "golden tree chocolate", FOOD],
  ["p-plantain-150", "plantain chips", FOOD],
  ["p-cracker", "cream crackers", FOOD],
  ["p-omo-900", "omo detergent", HOME],
  ["p-keysoap", "key soap", HOME],
  ["p-dettol-250", "dettol antiseptic liquid", BEAUTY],
  ["p-softcare-4", "toilet tissue roll", HOME],
  ["p-pepsodent", "pepsodent toothpaste", BEAUTY],
  ["p-lux-soap", "lux soap", BEAUTY],
  ["p-nivea-200", "nivea body lotion", BEAUTY],
  ["p-geisha", "geisha soap", BEAUTY],
];

const UA = "AdepaCatalog/1.0 (brightselormkojo@gmail.com)";

async function findImage(query, instances) {
  for (const host of instances) {
    const url =
      `https://${host}/cgi/search.pl?search_terms=${encodeURIComponent(query)}` +
      `&search_simple=1&action=process&json=1&page_size=8` +
      `&fields=code,product_name,brands,image_front_url`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) continue;
      const data = await res.json();
      const hit = (data.products ?? []).find((p) => p.image_front_url);
      if (hit) return { src: hit.image_front_url, name: hit.product_name, brands: hit.brands };
    } catch {
      /* try next instance */
    }
  }
  return null;
}

async function download(src, dest) {
  const res = await fetch(src, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2000) throw new Error("image too small");
  await writeFile(dest, buf);
  return buf.length;
}

await mkdir(OUT, { recursive: true });
const ok = [];
const missing = [];
for (const [id, query, instances] of ITEMS) {
  try {
    const found = await findImage(query, instances);
    if (!found) {
      missing.push(id);
      console.log(`—  ${id.padEnd(16)} no match for "${query}"`);
      continue;
    }
    const bytes = await download(found.src, join(OUT, `${id}.jpg`));
    ok.push(id);
    console.log(
      `✓  ${id.padEnd(16)} ${(bytes / 1024).toFixed(0)}KB  [${found.brands ?? "?"}] ${found.name ?? ""}`
    );
  } catch (err) {
    missing.push(id);
    console.log(`✗  ${id.padEnd(16)} ${err.message}`);
  }
  await new Promise((r) => setTimeout(r, 250));
}

console.log(`\nDone. ${ok.length} images, ${missing.length} missing.`);
if (missing.length) console.log(`Missing (emoji fallback): ${missing.join(", ")}`);
