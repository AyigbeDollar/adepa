-- Adepa seed data — mirrors lib/demo-data.ts (keep in sync).

insert into public.distributors (id, name, area, city, lat, lng, service_radius_km) values
  ('d1a0c1e0-0000-4000-8000-000000000001', 'Makola Prime Distribution', 'Makola, Accra Central', 'Accra', 5.5560, -0.1969, 15),
  ('d1a0c1e0-0000-4000-8000-000000000002', 'Tema Harbour Wholesale', 'Community 1, Tema', 'Tema', 5.6698, -0.0166, 12),
  ('d1a0c1e0-0000-4000-8000-000000000003', 'Adum Trade Centre', 'Adum, Kumasi', 'Kumasi', 6.6885, -1.6244, 18),
  ('d1a0c1e0-0000-4000-8000-000000000004', 'Market Circle Supplies', 'Market Circle, Takoradi', 'Takoradi', 4.8956, -1.7557, 15);

insert into public.products (id, name, brand, category, unit, price_pesewas, emoji) values
  ('p-rice-5kg',   'Perfumed Rice 5kg',      'Royal Aroma', 'Staples & Grains',   '5 kg bag',      12000, '🍚'),
  ('p-gari-1kg',   'Premium Gari 1kg',       'Neat Foods',  'Staples & Grains',   '1 kg pack',      1500, '🥣'),
  ('p-beans-1kg',  'Black Eyed Beans 1kg',   'Home Fresh',  'Staples & Grains',   '1 kg pack',      2800, '🫘'),
  ('p-sugar-1kg',  'St Louis Sugar Cubes',   'St Louis',    'Staples & Grains',   '1 kg box',       1800, '🍬'),
  ('p-milo-400',   'Milo Activ-Go 400g',     'Nestlé',      'Beverages',          '400 g tin',      4200, '🍫'),
  ('p-nescafe-50', 'Nescafé Classic 50g',    'Nestlé',      'Beverages',          '50 g jar',       2500, '☕'),
  ('p-voltic-6',   'Voltic Mineral Water',   'Voltic',      'Beverages',          '6 × 1.5 L',      3000, '💧'),
  ('p-kalyppo-6',  'Kalyppo Fruit Drink',    'Aquafresh',   'Beverages',          '6-pack',         1800, '🧃'),
  ('p-ideal-160',  'Ideal Evaporated Milk',  'Ideal',       'Beverages',          '160 g tin',       750, '🥛'),
  ('p-cowbell-400','Cowbell Milk Powder',    'Cowbell',     'Beverages',          '400 g pack',     3500, '🥛'),
  ('p-gino-210',   'Gino Tomato Mix 210g',   'Gino',        'Cooking Essentials', '210 g tin',       650, '🍅'),
  ('p-frytol-1l',  'Frytol Cooking Oil 1L',  'Frytol',      'Cooking Essentials', '1 L bottle',     3800, '🫒'),
  ('p-maggi-60',   'Maggi Cubes ×60',        'Maggi',       'Cooking Essentials', '60 cubes',       1500, '🧂'),
  ('p-onga-pk',    'Onga Seasoning Pack',    'Onga',        'Cooking Essentials', '10 sachets',     1000, '🧂'),
  ('p-titus-125',  'Titus Sardines 125g',    'Titus',       'Cooking Essentials', '125 g tin',      1200, '🐟'),
  ('p-exeter-340', 'Exeter Corned Beef',     'Exeter',      'Cooking Essentials', '340 g tin',      4500, '🥩'),
  ('p-indomie-5',  'Indomie Chicken ×5',     'Indomie',     'Snacks & Biscuits',  '5-pack',         2200, '🍜'),
  ('p-goldentree', 'Golden Tree Chocolate',  'Golden Tree', 'Snacks & Biscuits',  '100 g bar',      2000, '🍫'),
  ('p-plantain-150','Plantain Chips 150g',   'Deelight',    'Snacks & Biscuits',  '150 g pack',     1000, '🍌'),
  ('p-cracker',    'King Cracker Biscuits',  'King',        'Snacks & Biscuits',  '12-pack',         800, '🍪'),
  ('p-omo-900',    'Omo Detergent 900g',     'Omo',         'Home & Cleaning',    '900 g pack',     2800, '🧺'),
  ('p-keysoap',    'Key Soap Bar',           'Key Soap',    'Home & Cleaning',    '1 bar',           900, '🧼'),
  ('p-dettol-250', 'Dettol Antiseptic',      'Dettol',      'Home & Cleaning',    '250 ml bottle',  2400, '🧴'),
  ('p-softcare-4', 'Softcare Tissue ×4',     'Softcare',    'Home & Cleaning',    '4 rolls',        1600, '🧻'),
  ('p-pepsodent',  'Pepsodent Toothpaste',   'Pepsodent',   'Personal Care',      '130 g tube',     1400, '🪥'),
  ('p-lux-soap',   'Lux Beauty Soap',        'Lux',         'Personal Care',      '1 bar',           700, '🧼'),
  ('p-nivea-200',  'Nivea Body Lotion',      'Nivea',       'Personal Care',      '200 ml bottle',  3000, '🧴'),
  ('p-geisha',     'Geisha Bathing Soap',    'Geisha',      'Personal Care',      '1 bar',           800, '🧼');
