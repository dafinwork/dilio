-- ==========================================
-- 1. Create Products Table
-- ==========================================
create table if not exists public.products (
  id text primary key,
  name text not null,
  slug text,
  description text,
  price numeric default 0,
  image_url text default '',
  material text default '',
  colors jsonb default '[]'::jsonb,
  is_new boolean default false,
  is_exclusive boolean default false,
  product_group text not null,
  cutting_type text,
  sablon_type text,
  exclusive_category text,
  category_label text,
  placeholder_title text,
  placeholder_bg text,
  placeholder_text_color text,
  extra_colors_count integer default 0,
  created_at timestamptz default now()
);

-- ==========================================
-- 2. Enable Row Level Security (RLS)
-- ==========================================
alter table public.products enable row level security;

-- Drop old policies if they exist
drop policy if exists "Public Read Access" on public.products;
drop policy if exists "Public Insert Access" on public.products;
drop policy if exists "Public Update Access" on public.products;
drop policy if exists "Public Delete Access" on public.products;

-- Allow Public (anon) to Read, Insert, Update, and Delete
create policy "Public Read Access" on public.products for select using (true);
create policy "Public Insert Access" on public.products for insert with check (true);
create policy "Public Update Access" on public.products for update using (true);
create policy "Public Delete Access" on public.products for delete using (true);

-- ==========================================
-- 3. Insert Initial Catalog Products
-- ==========================================
insert into public.products (
  id, name, slug, description, price, image_url, material, colors,
  is_new, is_exclusive, product_group, cutting_type, sablon_type,
  exclusive_category, category_label, placeholder_title, placeholder_bg,
  placeholder_text_color, extra_colors_count, created_at
) values
('harian-oversized-1', 'Oversized Fit', 'oversized-fit-combed-24s', 'Potongan longgar dengan drop shoulder, cocok untuk gaya streetwear.', 65000, '', 'COTTON COMBED 24S', '["#000000","#FFFFFF","#15803D"]'::jsonb, false, false, 'harian', 'oversized', null, null, 'COTTON COMBED 24S', 'Oversized\nFit', '#E5E7EB', '#374151', 12, '2026-03-01T10:00:00Z'),
('harian-regular-1', 'Regular Fit', 'regular-fit-combed-30s', 'Potongan standar yang sangat nyaman untuk dipakai harian atau event.', 45000, '', 'COTTON COMBED 30S', '["#2563EB","#DC2626","#FACC15"]'::jsonb, false, false, 'harian', 'reguler', null, null, 'COTTON COMBED 30S', 'Regular\nFit', '#F3F4F6', '#374151', 24, '2026-03-05T08:00:00Z'),
('harian-boxy-1', 'Boxy Cut', 'boxy-cut-heavyweight-16s', 'Potongan mengotak agak tinggi (crop) dengan bahan tebal premium.', 85000, '', 'HEAVYWEIGHT 16S', '["#1E293B","#94A3B8"]'::jsonb, false, false, 'harian', 'boxy', null, null, 'HEAVYWEIGHT 16S', 'Boxy\nCrop', '#D5DFEA', '#334155', 5, '2026-02-15T09:00:00Z'),
('harian-longsleeve-1', 'Long Sleeve', 'long-sleeve-combed-24s', 'Kaos lengan panjang dengan rib di ujung lengan, pas untuk cuaca dingin.', 60000, '', 'COTTON COMBED 24S', '["#000000","#1E40AF"]'::jsonb, false, false, 'harian', 'long-sleeve', null, null, 'COTTON COMBED 24S', 'Long\nSleeve', '#CDD9E5', '#334155', 8, '2026-02-10T14:30:00Z'),
('harian-oversized-2', 'Oversized Fit Basic', 'oversized-fit-basic-streetwear', 'Potongan longgar dengan drop shoulder, cocok untuk gaya streetwear santai.', 65000, '', 'COTTON COMBED 24S', '["#111827","#10B981"]'::jsonb, false, false, 'harian', 'oversized', null, null, 'COTTON COMBED 24S', 'Oversized\nFit', '#E5E7EB', '#374151', 12, '2026-01-25T11:00:00Z'),
('harian-regular-1', 'Regular Fit', 'regular-fit-combed-30s', 'Potongan standar yang sangat nyaman untuk dipakai harian atau event.', 45000, '', 'COTTON COMBED 30S', '["#2563EB","#DC2626","#F59E0B"]'::jsonb, false, false, 'harian', 'reguler', null, null, 'COTTON COMBED 30S', 'Regular\nFit', '#F3F4F6', '#374151', 24, '2026-02-01T08:00:00Z'),
('harian-boxy-2', 'Boxy Cut Vintage', 'boxy-cut-vintage', 'Potongan mengotak agak tinggi (crop) dengan bahan tebal premium silhouette boxy.', 85000, '', 'HEAVYWEIGHT 16S', '["#1E293B","#64748B"]'::jsonb, false, false, 'harian', 'boxy', null, null, 'HEAVYWEIGHT 16S', 'Boxy\nCrop', '#D5DFEA', '#334155', 5, '2026-01-18T16:00:00Z'),
('harian-longsleeve-2', 'Long Sleeve Ribbed', 'long-sleeve-ribbed', 'Kaos lengan panjang dengan rib di ujung lengan, pas untuk cuaca dingin harian.', 60000, '', 'COTTON COMBED 24S', '["#020617","#2563EB"]'::jsonb, false, false, 'harian', 'long-sleeve', null, null, 'COTTON COMBED 24S', 'Long\nSleeve', '#CDD9E5', '#334155', 8, '2026-01-12T10:00:00Z'),
('custom-chaos-theory-1', 'Dilio "Chaos Theory"', 'dilio-chaos-theory', 'Desain abstrak full print DTF pada bahan heavyweight cotton.', 195000, '', 'HEAVYWEIGHT COTTON 16S', '["#0F172A","#1E293B"]'::jsonb, false, false, 'custom', null, 'dtf', null, 'GRAPHIC TEES', 'DILIO\nAbstract\nArt', '#0B132B', '#F8FAFC', 0, '2026-03-15T09:30:00Z'),
('custom-washed-boxy-1', 'Dilio Washed Boxy Tee', 'dilio-washed-boxy-tee', 'Washed treatment untuk tampilan vintage dengan potongan boxy...', 175000, '', 'WASHED COTTON 20S', '["#3B82F6","#1D4ED8"]'::jsonb, false, false, 'custom', null, 'plastisol', null, 'STREETWEAR', 'DILIO\nVintage\nWash', '#7F95A8', '#1E293B', 0, '2026-03-10T14:15:00Z'),
('custom-chaos-theory-2', 'Dilio "Chaos Theory" White', 'dilio-chaos-theory-white', 'Desain abstrak full print DTF pada bahan heavyweight cotton warna putih pekat.', 195000, '', 'HEAVYWEIGHT COTTON 16S', '["#0F172A","#64748B"]'::jsonb, false, false, 'custom', null, 'dtf', null, 'GRAPHIC TEES', 'DILIO\nAbstract\nArt', '#0B132B', '#F8FAFC', 0, '2026-03-05T11:20:00Z'),
('custom-washed-boxy-2', 'Dilio Washed Boxy Tee Navy', 'dilio-washed-boxy-tee-navy', 'Washed treatment untuk tampilan vintage dengan potongan boxy...', 175000, '', 'WASHED COTTON 20S', '["#3B82F6","#1E40AF"]'::jsonb, false, false, 'custom', null, 'plastisol', null, 'STREETWEAR', 'DILIO\nVintage\nWash', '#7F95A8', '#1E293B', 0, '2026-02-28T16:45:00Z'),
('custom-cyber-dtf-1', 'Dilio "Matrix Glitch" DTF', 'dilio-matrix-glitch-dtf', 'Sablon DTF presisi tinggi dengan warna cerah multi-gradasi.', 185000, '', 'COTTON COMBED 24S', '["#000000"]'::jsonb, true, false, 'custom', null, 'dtf', null, 'GRAPHIC TEES', 'DILIO\nCyber\nGlitch', '#0E1A2F', '#38BDF8', 0, '2026-03-22T08:00:00Z'),
('custom-plastisol-heavy-1', 'Dilio Heavy Metal Plastisol', 'dilio-heavy-metal-plastisol', 'Sablon plastisol tebal tahan cuci berkali-kali dengan feel kokoh.', 190000, '', 'HEAVYWEIGHT 16S', '["#18181B"]'::jsonb, false, false, 'custom', null, 'plastisol', null, 'STREETWEAR', 'DILIO\nHeavy\nPlastisol', '#6B7C8E', '#FFFFFF', 0, '2026-02-18T10:00:00Z'),
('exclusive-dilio-cyber-1', 'Dilio "Cyber City" Tee', 'dilio-cyber-city-tee-1', 'Premium oversized fit dengan sablon plastisol high-density.', 185000, '', 'HEAVYWEIGHT 16S', '["#0F172A"]'::jsonb, false, true, 'eksklusif', null, 'plastisol', 'dilio', 'STREETWEAR', 'DILIO\nCyberpunk\nGraphic', '#DCE4EC', '#1E293B', 0, '2026-03-18T10:00:00Z'),
('exclusive-dilio-cyber-2', 'Dilio "Cyber City" Tee 02', 'dilio-cyber-city-tee-2', 'Premium oversized fit dengan sablon plastisol high-density.', 185000, '', 'HEAVYWEIGHT 16S', '["#0F172A"]'::jsonb, false, true, 'eksklusif', null, 'plastisol', 'dilio', 'STREETWEAR', 'DILIO\nCyberpunk\nGraphic', '#DCE4EC', '#1E293B', 0, '2026-03-17T11:00:00Z'),
('exclusive-thinkingout-mindset', 'Thinking Out "Mindset" Boxy', 'thinking-out-mindset-boxy', 'Official partner collection karya Thinking Out studio dengan cutting boxy kekinian.', 195000, '', 'HEAVYWEIGHT 16S', '["#1E293B"]'::jsonb, false, true, 'eksklusif', null, 'plastisol', 'thinking-out', 'PARTNER BRAND', 'THINKING\nOUT\nMindset', '#D8E2EC', '#1E293B', 0, '2026-03-16T14:00:00Z'),
('exclusive-thinkingout-overthinking', 'Thinking Out "Overthinking" Tee', 'thinking-out-overthinking-tee', 'Grafis eksklusif typography Thinking Out dengan puff print 3D effect.', 190000, '', 'COTTON COMBED 24S', '["#0F172A"]'::jsonb, false, true, 'eksklusif', null, 'plastisol', 'thinking-out', 'PARTNER BRAND', 'THINKING\nOUT\nGraphic', '#D5E0EB', '#1E293B', 0, '2026-03-14T10:30:00Z'),
('exclusive-collab-onepiece-gear5', 'Dilio x One Piece "Gear 5" Tee', 'dilio-x-one-piece-gear-5-tee', 'Limited collaboration drop resmi dengan sablon discharge & glow in the dark.', 225000, '', 'HEAVYWEIGHT 16S', '["#FFFFFF","#0F172A"]'::jsonb, true, true, 'eksklusif', null, 'dtf', 'dilio-x-one-piece', 'LIMITED COLLAB', 'DILIO x OP\nGear 5\nEdition', '#E2E8F0', '#0F172A', 0, '2026-03-23T15:00:00Z'),
('exclusive-collab-onepiece-strawhat', 'Dilio x One Piece "Straw Hat" Vintage', 'dilio-x-one-piece-straw-hat', 'Vintage washed graphic tee edisi spesial Straw Hat pirate crew.', 210000, '', 'WASHED COTTON 20S', '["#334155"]'::jsonb, false, true, 'eksklusif', null, 'plastisol', 'dilio-x-one-piece', 'LIMITED COLLAB', 'DILIO x OP\nStraw Hat\nVintage', '#D6DFEA', '#1E293B', 0, '2026-03-12T11:00:00Z'),
('exclusive-dilio-cyber-3', 'Dilio "Neo Tokyo" Oversized', 'dilio-neo-tokyo-oversized', 'Premium oversized fit dengan sablon plastisol high-density.', 185000, '', 'HEAVYWEIGHT 16S', '["#0B132B"]'::jsonb, false, true, 'eksklusif', null, 'plastisol', 'dilio', 'STREETWEAR', 'DILIO\nCyberpunk\nGraphic', '#DCE4EC', '#1E293B', 0, '2026-03-08T09:00:00Z'),
('exclusive-dilio-cyber-4', 'Dilio "Akira Pulse" Limited', 'dilio-akira-pulse-limited', 'Premium oversized fit dengan sablon plastisol high-density detail tinggi.', 185000, '', 'HEAVYWEIGHT 16S', '["#020617"]'::jsonb, false, true, 'eksklusif', null, 'plastisol', 'dilio', 'STREETWEAR', 'DILIO\nCyberpunk\nGraphic', '#DCE4EC', '#1E293B', 0, '2026-03-02T13:00:00Z')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  price = excluded.price,
  image_url = excluded.image_url,
  material = excluded.material,
  colors = excluded.colors,
  is_new = excluded.is_new,
  is_exclusive = excluded.is_exclusive,
  product_group = excluded.product_group,
  cutting_type = excluded.cutting_type,
  sablon_type = excluded.sablon_type,
  exclusive_category = excluded.exclusive_category,
  category_label = excluded.category_label,
  placeholder_title = excluded.placeholder_title,
  placeholder_bg = excluded.placeholder_bg,
  placeholder_text_color = excluded.placeholder_text_color,
  extra_colors_count = excluded.extra_colors_count;

-- ==========================================
-- 4. Create Public Storage Bucket for Images
-- ==========================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public Access Product Images" on storage.objects;
drop policy if exists "Public Upload Product Images" on storage.objects;
drop policy if exists "Public Update Product Images" on storage.objects;
drop policy if exists "Public Delete Product Images" on storage.objects;

create policy "Public Access Product Images" on storage.objects for select using (bucket_id = 'product-images');
create policy "Public Upload Product Images" on storage.objects for insert with check (bucket_id = 'product-images');
create policy "Public Update Product Images" on storage.objects for update using (bucket_id = 'product-images');
create policy "Public Delete Product Images" on storage.objects for delete using (bucket_id = 'product-images');
