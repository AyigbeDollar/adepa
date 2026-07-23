import type { Distributor, Product } from "./types";

/**
 * Demo catalog + distributors used when Supabase env vars are not configured.
 * Mirrors supabase/seed.sql — keep the two in sync.
 */

export const DEMO_DISTRIBUTORS: Distributor[] = [
  {
    id: "d1a0c1e0-0000-4000-8000-000000000001",
    name: "Makola Prime Distribution",
    area: "Makola, Accra Central",
    city: "Accra",
    lat: 5.556,
    lng: -0.1969,
    service_radius_km: 15,
    subaccount_code: null,
    active: true,
  },
  {
    id: "d1a0c1e0-0000-4000-8000-000000000002",
    name: "Tema Harbour Wholesale",
    area: "Community 1, Tema",
    city: "Tema",
    lat: 5.6698,
    lng: -0.0166,
    service_radius_km: 12,
    subaccount_code: null,
    active: true,
  },
  {
    id: "d1a0c1e0-0000-4000-8000-000000000003",
    name: "Adum Trade Centre",
    area: "Adum, Kumasi",
    city: "Kumasi",
    lat: 6.6885,
    lng: -1.6244,
    service_radius_km: 18,
    subaccount_code: null,
    active: true,
  },
  {
    id: "d1a0c1e0-0000-4000-8000-000000000004",
    name: "Market Circle Supplies",
    area: "Market Circle, Takoradi",
    city: "Takoradi",
    lat: 4.8956,
    lng: -1.7557,
    service_radius_km: 15,
    subaccount_code: null,
    active: true,
  },
];

const P = (
  id: string,
  name: string,
  brand: string,
  category: Product["category"],
  unit: string,
  ghs: number,
  emoji: string
): Product => ({
  id,
  name,
  brand,
  category,
  unit,
  price_pesewas: Math.round(ghs * 100),
  emoji,
  active: true,
});

export const DEMO_PRODUCTS: Product[] = [
  // Staples & Grains
  P("p-rice-5kg", "Perfumed Rice 5kg", "Royal Aroma", "Staples & Grains", "5 kg bag", 120, "🍚"),
  P("p-gari-1kg", "Premium Gari 1kg", "Neat Foods", "Staples & Grains", "1 kg pack", 15, "🥣"),
  P("p-beans-1kg", "Black Eyed Beans 1kg", "Home Fresh", "Staples & Grains", "1 kg pack", 28, "🫘"),
  P("p-sugar-1kg", "St Louis Sugar Cubes", "St Louis", "Staples & Grains", "1 kg box", 18, "🍬"),
  // Beverages
  P("p-milo-400", "Milo Activ-Go 400g", "Nestlé", "Beverages", "400 g tin", 42, "🍫"),
  P("p-nescafe-50", "Nescafé Classic 50g", "Nestlé", "Beverages", "50 g jar", 25, "☕"),
  P("p-voltic-6", "Voltic Mineral Water", "Voltic", "Beverages", "6 × 1.5 L", 30, "💧"),
  P("p-kalyppo-6", "Kalyppo Fruit Drink", "Aquafresh", "Beverages", "6-pack", 18, "🧃"),
  P("p-ideal-160", "Ideal Evaporated Milk", "Ideal", "Beverages", "160 g tin", 7.5, "🥛"),
  P("p-cowbell-400", "Cowbell Milk Powder", "Cowbell", "Beverages", "400 g pack", 35, "🥛"),
  // Cooking Essentials
  P("p-gino-210", "Gino Tomato Mix 210g", "Gino", "Cooking Essentials", "210 g tin", 6.5, "🍅"),
  P("p-frytol-1l", "Frytol Cooking Oil 1L", "Frytol", "Cooking Essentials", "1 L bottle", 38, "🫒"),
  P("p-maggi-60", "Maggi Cubes ×60", "Maggi", "Cooking Essentials", "60 cubes", 15, "🧂"),
  P("p-onga-pk", "Onga Seasoning Pack", "Onga", "Cooking Essentials", "10 sachets", 10, "🧂"),
  P("p-titus-125", "Titus Sardines 125g", "Titus", "Cooking Essentials", "125 g tin", 12, "🐟"),
  P("p-exeter-340", "Exeter Corned Beef", "Exeter", "Cooking Essentials", "340 g tin", 45, "🥩"),
  // Snacks & Biscuits
  P("p-indomie-5", "Indomie Chicken ×5", "Indomie", "Snacks & Biscuits", "5-pack", 22, "🍜"),
  P("p-goldentree", "Golden Tree Chocolate", "Golden Tree", "Snacks & Biscuits", "100 g bar", 20, "🍫"),
  P("p-plantain-150", "Plantain Chips 150g", "Deelight", "Snacks & Biscuits", "150 g pack", 10, "🍌"),
  P("p-cracker", "King Cracker Biscuits", "King", "Snacks & Biscuits", "12-pack", 8, "🍪"),
  // Home & Cleaning
  P("p-omo-900", "Omo Detergent 900g", "Omo", "Home & Cleaning", "900 g pack", 28, "🧺"),
  P("p-keysoap", "Key Soap Bar", "Key Soap", "Home & Cleaning", "1 bar", 9, "🧼"),
  P("p-dettol-250", "Dettol Antiseptic", "Dettol", "Home & Cleaning", "250 ml bottle", 24, "🧴"),
  P("p-softcare-4", "Softcare Tissue ×4", "Softcare", "Home & Cleaning", "4 rolls", 16, "🧻"),
  // Personal Care
  P("p-pepsodent", "Pepsodent Toothpaste", "Pepsodent", "Personal Care", "130 g tube", 14, "🪥"),
  P("p-lux-soap", "Lux Beauty Soap", "Lux", "Personal Care", "1 bar", 7, "🧼"),
  P("p-nivea-200", "Nivea Body Lotion", "Nivea", "Personal Care", "200 ml bottle", 30, "🧴"),
  P("p-geisha", "Geisha Bathing Soap", "Geisha", "Personal Care", "1 bar", 8, "🧼"),
];

export const CATEGORIES: Product["category"][] = [
  "Staples & Grains",
  "Beverages",
  "Cooking Essentials",
  "Snacks & Biscuits",
  "Home & Cleaning",
  "Personal Care",
];
