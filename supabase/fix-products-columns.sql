-- ============================================================
-- PERBAIKAN: kolom yang hilang di tabel public.products
--
-- Gejala: "harga coret tidak berjalan" & beberapa fitur CMS tidak
-- ter-sync ke cloud Supabase. Penyebab: kolom-kolom berikut tidak
-- ada di tabel products, sehingga insert/update gagal dan kode
-- shell fallback menyimpan data TANPA kolom tersebut ke cloud.
-- Diskon/foto hanya tampak di browser admin (localStorage),
-- tidak tampak di browser pengunjung yang mengambil data cloud.
--
-- CARA: Buka Supabase Dashboard > SQL Editor > paste semua baris
-- di bawah ini > Run. Setelah selesai, refresh CMS admin dan
-- simpan ulang produk yang pakai harga coret sekali (edit > simpan)
-- agar nilainya terkirim ke cloud.
-- ============================================================

alter table public.products add column if not exists original_price int8;
alter table public.products add column if not exists images jsonb;
alter table public.products add column if not exists is_preorder boolean default false;
alter table public.products add column if not exists preorder_duration text default '';
alter table public.products add column if not exists kaos_category text default '';
alter table public.products add column if not exists size_chart jsonb;
alter table public.products add column if not exists mockup_angles jsonb;

-- Opsional: kloning image_url ke images agar produk lama langsung punya harga coret/foto tersinkron
update public.products
set images = case
  when images is null or jsonb_array_length(images) = 0
  then case when image_url is not null then jsonb_build_array(image_url) else images end
  else images
end
where images is null or jsonb_array_length(images) = 0;
