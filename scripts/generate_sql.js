import fs from 'fs';

const products = JSON.parse(fs.readFileSync('src/data/products.json', 'utf8'));

let sql = `-- ==========================================
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
`;

const values = products.map((p) => {
  const esc = (s) => (s ? `'${String(s).replace(/'/g, "''").replace(/\r?\n/g, '\\n')}'` : 'null');
  const escStr = (s) => (s ? `'${String(s).replace(/'/g, "''").replace(/\r?\n/g, '\\n')}'` : "''");
  const colorsJson = `'${JSON.stringify(p.colors || []).replace(/'/g, "''")}'::jsonb`;
  return `(${esc(p.id)}, ${esc(p.name)}, ${esc(p.slug)}, ${esc(p.description)}, ${p.price || 0}, ${escStr(p.image_url)}, ${escStr(p.material)}, ${colorsJson}, ${p.is_new ? true : false}, ${p.is_exclusive ? true : false}, ${esc(p.product_group)}, ${esc(p.cutting_type)}, ${esc(p.sablon_type)}, ${esc(p.exclusive_category)}, ${esc(p.category_label)}, ${esc(p.placeholder_title)}, ${esc(p.placeholder_bg)}, ${esc(p.placeholder_text_color)}, ${p.extra_colors_count || 0}, ${esc(p.created_at || new Date().toISOString())})`;
}).join(',\n');

sql += values + `
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
`;

fs.writeFileSync('supabase_setup.sql', sql + `
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
`);
console.log('supabase_setup.sql generated successfully with Storage setup!');
