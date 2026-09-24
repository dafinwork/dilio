# Kaos Dilio — Website Katalog Kaos Polos & Custom Sablon

Website katalog modern & responsif untuk brand **Kaos Dilio** (Kaos Polos Custom). Direplikasi 1:1 dari mockup desain resmi dengan data produk terstruktur berbasis JSON untuk kemudahan migrasi ke CMS / Database pada Fase 2.

---

## 🚀 Halaman & Fitur (Fase 1)

1. **Homepage (`/`)**
   - **Hero Banner:** Headline *"Kaos Polos Masa Kini - Berbagai Cutting & Custom Sablon"*, background t-shirt rack dengan dark contrast overlay.
   - **3 Trust Badges:**
     - 🏆 *"Tidak ada pesanan minimum!"* — Kustomisasi bahkan untuk satu barang saja.
     - ⚡ *"Desain hari ini, cetak hari ini."* — Siap hanya dalam satu hari.
     - 🏪 *"Lebih dari 90+ toko di seluruh Indonesia"* — yang mudah dijangkau.
   - **Section Limited Edition:** Kontainer navy khusus (`#1E3A5F`) dengan filter tab interaktif (`Semua`, `Dilio`, `Thinking Out`, `Dilio x One Piece`), link *"Lihat Semua"*, dan grid card eksklusif.
   - **Section Cari Kaos Harian:** Preview 4 koleksi harian (Oversized, Regular, Boxy, Long Sleeve) dengan color swatches dan link *"Lihat Semua"*.
   - **Section Bikin Kaos Custom:** Preview 4 koleksi custom sablon DTF & Plastisol.

2. **Halaman Koleksi Kaos (`/koleksi-kaos`)**
   - Filter tab kategori cutting: **Semua | Oversized Fit | Reguler Fit | Boxy Cut | Long Sleeve**.
   - Dropdown sorting interaktif: **Terbaru, Harga Terendah, Harga Tertinggi, Nama A-Z**.
   - Card produk: Badge *"New"*, label bahan (contoh: *COTTON COMBED 24S*), harga tebal, swatch warna, dan detail modal.

3. **Halaman Bikin Kaos Custom (`/bikin-kaos-custom`)**
   - Filter tab jenis sablon: **Semua | DTF | Plastisol**.
   - Dropdown sorting interaktif.
   - Grid produk sablon grafis & vintage wash.
   - **3 Kartu Layanan Partner:**
     - 👕 *Bikin Kaos Clothing Brand*
     - 📅 *Bikin Kaos Event & Komunitas*
     - 💼 *Bikin Kaos Merchandise*
     - Dilengkapi tombol konsultasi WhatsApp spesifik per layanan.

4. **Halaman Desain Eksklusif (`/desain-eksklusif`)**
   - Filter tab brand & kolaborasi: **Semua | Dilio | Thinking Out | Dilio x One Piece**.
   - Dropdown sorting interaktif.
   - Grid produk limited edition dengan badge *"Exclusive"*.

5. **Komponen Global:**
   - **Sticky Navbar:** Logo Kaos Dilio, link navigasi aktif, dan tombol CTA *"Konsultasi Admin"* (WhatsApp).
   - **Dark Footer:** 4 kolom (Brand + Sosmed, Koleksi, Layanan, Hubungi Kami).
   - **Interactive Product Modal:** Menampilkan detail spesifikasi bahan, cutting, sablon, pilihan warna, dan tombol *"Order via WhatsApp"*.

---

## 📁 Struktur Data Produk (`src/data/products.json`)

Struktur data dirancang sesuai Bagian 5 PRD untuk kesiapan Fase 2 (CMS & Database):

```json
{
  "id": "string (unique)",
  "name": "string",
  "slug": "string",
  "description": "string",
  "price": "number",
  "image_url": "string",
  "material": "string (contoh: 'Cotton Combed 24s')",
  "colors": ["array of hex/nama warna"],
  "is_new": "boolean",
  "is_exclusive": "boolean",
  "product_group": "enum: 'harian' | 'custom' | 'eksklusif'",
  "cutting_type": "enum: 'oversized' | 'reguler' | 'boxy' | 'long-sleeve' | null",
  "sablon_type": "enum: 'dtf' | 'plastisol' | null",
  "exclusive_category": "enum: 'dilio' | 'thinking-out' | 'dilio-x-one-piece' | null",
  "category_label": "string",
  "created_at": "datetime"
}
```

---

## 🛠️ Cara Menjalankan Project

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Mode Development
```bash
npm run dev
```
Akses di browser pada: `http://localhost:5173`

### 3. Build untuk Production
```bash
npm run build
```
Hasil build siap disajikan di folder `dist/`.
