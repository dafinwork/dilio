-- ============================================================
-- MIGRATION: Tambah kolom mockup_angles di tabel public.products
--
-- Fungsi: Menyimpan URL foto sudut mockup studio custom per produk
-- (Tampak Belakang, Lengan Kiri, Lengan Kanan)
-- Format jsonb: {"back": "https://...", "left": "...", "right": "..."}
--
-- CARA: Buka Supabase Dashboard > SQL Editor > Paste script ini > Run.
-- ============================================================

alter table public.products add column if not exists mockup_angles jsonb;
alter table public.products add column if not exists is_customizable boolean default false;
