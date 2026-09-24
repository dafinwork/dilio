# PRD — Website Katalog "Kaos Dilio"

## 1. Ringkasan Proyek

**Nama Brand:** Kaos Dilio
**Tagline:** Kaos Polos Custom
**Title Tab Browser:** `Kaos Dilio - Kaos Polos Custom`

**Deskripsi singkat:**
Website katalog untuk brand kaos polos & custom sablon "Kaos Dilio". Website menampilkan koleksi kaos polos harian, koleksi desain eksklusif/limited edition, dan layanan custom sablon (DTF & Plastisol) untuk kebutuhan clothing brand, event, komunitas, dan merchandise.

**Fase pengerjaan:**
1. **Fase 1 (sekarang):** Bangun tampilan website statis — replikasi desain 1:1 dari mockup yang sudah ada (data masih hardcoded/dummy).
2. **Fase 2 (berikutnya, belum digarap sekarang):** Bangun dashboard CMS agar user (admin toko) bisa upload & kelola katalog produk sendiri, yang otomatis tampil di website ini.

> ⚠️ Untuk Fase 1, AI hanya perlu fokus membangun front-end statis dulu. Tapi struktur data produk (lihat Bagian 5) HARUS sudah dirancang agar mudah dikonversi ke database saat Fase 2 dikerjakan.

---

## 2. Referensi Desain

Ada 4 halaman yang perlu dibangun, berdasarkan mockup (screenshot terlampir):

| # | Nama Halaman | File Referensi | Elemen Utama |
|---|---|---|---|
| 1 | **Homepage** | `Cari_Kaos_Harian.png` | Hero banner, 3 trust badges, section Limited Edition, section Cari Kaos Harian, section Bikin Kaos Custom |
| 2 | **Halaman Koleksi Kaos** | `Cari_Kaos_Harian.png` (bagian bawah) | Grid produk kaos harian dengan filter cutting |
| 3 | **Halaman Bikin Kaos Custom** | `Bikin_Kaos_Custom.png` | Grid produk sablon custom dengan filter jenis sablon, + 3 kartu layanan (Clothing Brand, Event, Merchandise) |
| 4 | **Halaman Desain Eksklusif** | `Kaos_Eksklusif.png` | Grid produk limited edition dengan filter kategori brand |

Semua halaman berbagi **Navbar** dan **Footer** yang sama.

---

## 3. Struktur Navigasi (Navbar)

Tampil di semua halaman, sticky di atas:

- **Logo:** "Kaos Dilio" (kiri)
- **Menu:**
  - 👑 Desain Eksklusif → ke Halaman Desain Eksklusif
  - 👕 Koleksi Kaos → ke Halaman Koleksi Kaos
  - ✨ Bikin Kaos Custom → ke Halaman Bikin Kaos Custom
- **CTA Button (kanan, outline dark):** 💬 Konsultasi Admin → link ke WhatsApp Admin

**Footer** (sama di semua halaman):
- Kolom 1: Logo "Kaos Dilio" + deskripsi singkat + ikon sosial (Instagram, TikTok, WhatsApp)
- Kolom 2 "KOLEKSI": Kaos Oversized, Kaos Reguler Fit, Kaos Boxy Cut, Kaos Long Sleeve
- Kolom 3 "LAYANAN": Sablon Satuan & Grosir, Bikin Clothing Brand, Bikin Kaos Event & Komunitas, Bikin Merchandise
- Kolom 4 "HUBUNGI KAMI": Alamat (Studio Dilio, Jakarta Barat), Nomor telepon (0899-0809-822)
- Background: dark navy/almost-black (#1A1A1A atau serupa)

---

## 4. Detail Tiap Halaman

### 4.1 Homepage

**Section 1 — Hero Banner**
- Background: foto kaos warna-warni digantung (full width, dark overlay tipis untuk kontras teks)
- Headline besar: "Kaos Polos Masa Kini"
- Subheadline: "Berbagai Cutting & Custom Sablon"
- Paragraf pendek: "Kaos polos premium berbagai warna, cuttingan dan jenis sablon untuk outfit harian, clothing brand, event hingga merchandise."
- Semua teks putih, center-aligned

**Section 2 — Trust Badges (3 kolom dengan ikon)**
1. 🏆 "Tidak ada pesanan minimum!" — Kustomisasi bahkan untuk satu barang saja.
2. ⚡ "Desain hari ini, cetak hari ini." — Siap hanya dalam satu hari.
3. 🏪 "Lebih dari 90+ toko di seluruh Indonesia" — yang mudah dijangkau.

**Section 3 — Limited Edition (background biru navy full-width)**
- Judul: "[LIMITED EDITION] Koleksi Kaos Desain Eksklusif"
- Card putih besar berisi:
  - Filter tab: **Semua | Dilio | Thinking Out | Dilio x One Piece**
  - Link "Lihat Semua" (kanan atas) → ke Halaman Desain Eksklusif
  - Grid 4 kolom produk, tiap card: badge "Exclusive" (pojok kiri atas, hitam), gambar/placeholder produk, kategori kecil (misal "STREETWEAR"), nama produk, deskripsi 1 baris, harga bold

**Section 4 — Cari Kaos Harian**
- Judul: "Cari Kaos Harian" + link "Lihat Semua" (kanan) → ke Halaman Koleksi Kaos
- Subteks: "Pilih cuttingan yang paling cocok dengan gaya dan kebutuhan outfit harianmu."
- Grid 4 kolom produk (Oversized Fit, Regular Fit, Boxy Crop, Long Sleeve), tiap card: gambar/placeholder, label bahan kecil (misal "COTTON COMBED 24S"), nama produk, deskripsi 1-2 baris, harga bold, swatch warna bulat kecil + "+N" jumlah varian warna lain

**Section 5 — Bikin Kaos Custom**
- Judul: "Bikin Kaos Custom" + link "Lihat Semua" (kanan) → ke Halaman Bikin Kaos Custom
- Subteks: "Pilih jenis sablon yang cocok untuk kebutuhan clothing brand, event hingga merchandise."
- Grid 4 kolom (sama style card dengan Section 4, produk custom)

### 4.2 Halaman Koleksi Kaos (`Cari_Kaos_Harian.png`)

- Judul: "Kaos Polos Premium Untuk Berbagai Gaya dan Aktivitas Harianmu" (center)
- Filter tab: **Semua | Oversized Fit | Reguler Fit | Boxy Cut | Long Sleeve**
- Sort dropdown (kanan): "Urutkan: Terbaru"
- Grid 4 kolom x 2 baris (8 produk contoh), tiap card:
  - Gambar/placeholder produk (background pastel berbeda tiap tipe)
  - Badge "New" opsional (pojok kiri atas card, warna ungu)
  - Label bahan kecil (uppercase, abu-abu): misal "COTTON COMBED 24S"
  - Nama produk (bold)
  - Deskripsi singkat 1-2 baris (abu-abu)
  - Harga (bold, besar)
  - Swatch warna (lingkaran kecil, max 3 ditampilkan + "+N" sisanya)

### 4.3 Halaman Bikin Kaos Custom (`Bikin_Kaos_Custom.png`)

- Judul: "Bikin Kaos Desain Sendiri Dengan Pilihan Sablon Berkualitas" (center)
- Filter tab: **Semua | DTF | Plastisol**
- Sort dropdown (kanan): "Urutkan: Terbaru"
- Grid 4 kolom x 1 baris (4 produk contoh), style card sama seperti Koleksi Kaos, kategori label misal "GRAPHIC TEES" / "STREETWEAR"
- **Section tambahan di bawah grid:**
  - Judul: "Kami siap jadi partner untuk keperluan event hingga bisnis clothing Anda."
  - 3 kartu jasa berdampingan (background abu-abu terang, ikon oranye di pojok, dekorasi lengkung peach di pojok kanan atas):
    1. 👕 **Bikin Kaos Clothing Brand** — Mulai dari pemilihan kain custom, pola potong (cutting) khusus, hingga pemasangan label leher (woven/satin) dan hangtag untuk brand Anda.
    2. 📅 **Bikin Kaos Event & Komunitas** — Solusi tepat dan cepat untuk kaos panitia, peserta jalan sehat, family gathering, atau seragam komunitas dengan harga efisien.
    3. 💼 **Bikin Kaos Merchandise** — Tingkatkan branding perusahaan dengan seragam kantor (Polo Shirt, Kemeja PDH) dan merchandise promosi eksklusif berkualitas.

### 4.4 Halaman Desain Eksklusif (`Kaos_Eksklusif.png`)

- Judul: "Koleksi Eksklusif dan Terbatas" (center)
- Filter tab: **Semua | Dilio | Thinking Out | Dilio x One Piece**
  - ℹ️ **Catatan penting untuk arti tab ini (dokumentasikan sebagai data kategori, bukan hardcode UI):**
    - `Dilio` = kategori produk milik brand Kaos Dilio sendiri
    - `Thinking Out` = kategori produk dari brand lain (partner/reseller)
    - `Dilio x One Piece` = kategori produk hasil kolaborasi (collab) antara Dilio dan brand/IP lain
  - Filter ini harus difungsikan sebagai **kategori/tag produk**, bukan sekadar teks statis, karena nantinya di CMS (Fase 2) admin akan memilih salah satu kategori ini saat upload produk.
- Sort dropdown (kanan): "Urutkan: Terbaru"
- Grid 4 kolom x 2 baris (8 produk contoh), tiap card:
  - Badge "Exclusive" (pojok kiri atas, hitam, teks putih)
  - Gambar/placeholder produk
  - Kategori kecil (misal "STREETWEAR")
  - Nama produk
  - Deskripsi singkat
  - Harga bold

---

## 5. Struktur Data Produk (untuk kesiapan Fase 2/CMS)

Meskipun Fase 1 masih statis/dummy, susun data produk dalam format terstruktur (misal `products.json` atau array of objects di kode) dengan skema berikut, supaya nanti tinggal disambungkan ke database:

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
  "cutting_type": "enum: 'oversized' | 'reguler' | 'boxy' | 'long-sleeve' | null (khusus product_group: harian)",
  "sablon_type": "enum: 'dtf' | 'plastisol' | null (khusus product_group: custom)",
  "exclusive_category": "enum: 'dilio' | 'thinking-out' | 'dilio-x-one-piece' | null (khusus product_group: eksklusif)",
  "category_label": "string (label kecil di card, misal 'STREETWEAR', 'GRAPHIC TEES')",
  "created_at": "datetime (untuk fitur 'Urutkan: Terbaru')"
}
```

Struktur ini penting supaya:
- Filter tab di setiap halaman bisa langsung difungsikan dengan filter array berdasarkan field yang relevan.
- Saat Fase 2 (CMS) dibangun, admin cukup mengisi field yang sama lewat form upload, tanpa perlu ubah struktur frontend.

---

## 6. Spesifikasi Teknis

- **Tipe:** Single-page atau multi-page website (disarankan multi-route: `/`, `/koleksi-kaos`, `/bikin-kaos-custom`, `/desain-eksklusif`)
- **Styling:** Responsive (mobile-first), gunakan grid/flexbox, breakpoint standar (mobile, tablet, desktop)
- **Font:** Bold sans-serif untuk headline (mengikuti gaya di mockup — tebal, modern), regular sans-serif untuk body text
- **Warna dasar:**
  - Dark navy/black untuk navbar text & footer background
  - Biru navy (`#1E3A5F` atau serupa) untuk section Limited Edition
  - Background produk card: warna-warna pastel lembut berbeda per kategori (abu-abu, biru muda, dsb — sesuai mockup, ini placeholder sebelum ada foto produk asli)
  - Badge "Exclusive"/"New": hitam solid atau ungu untuk aksen
  - Aksen oranye untuk ikon di section jasa (Bikin Kaos Custom)
- **Gambar produk:** Untuk Fase 1, gunakan placeholder (bisa berupa div dengan background warna + teks nama produk besar di tengah, SESUAI mockup — bukan foto asli) karena foto asli akan diupload lewat CMS nanti.
- **Interaktivitas minimum di Fase 1:**
  - Filter tab berfungsi (klik tab → filter produk yang ditampilkan sesuai kategori terkait)
  - Dropdown sort (boleh dummy/UI-only dulu)
  - Navigasi antar halaman berfungsi
  - Tombol "Konsultasi Admin" mengarah ke link WhatsApp (bisa placeholder nomor)

---

## 7. Yang TIDAK termasuk di Fase 1 (scope out)

- Dashboard CMS/admin panel (ini Fase 2, jangan dikerjakan dulu)
- Sistem login/autentikasi
- Database sungguhan (masih data statis/JSON dummy)
- Fitur keranjang belanja / checkout (belum ada di mockup, kemungkinan tidak diperlukan — konfirmasi dulu sebelum ditambahkan)
- Foto produk asli (masih placeholder)

---

## 8. Prompt Siap Pakai untuk Antigravity

Berikut versi ringkas yang bisa langsung kamu paste ke Antigravity sebagai instruksi awal:

```
Bangun website katalog untuk brand "Kaos Dilio" (kaos polos & custom sablon).
Title tab: "Kaos Dilio - Kaos Polos Custom"

Buat 4 halaman dengan Navbar & Footer yang sama di semua halaman:
1. Homepage (/) — hero banner, trust badges, section Limited Edition (background navy),
   section Cari Kaos Harian, section Bikin Kaos Custom
2. Koleksi Kaos (/koleksi-kaos) — grid produk kaos harian, filter: Semua/Oversized Fit/Reguler Fit/Boxy Cut/Long Sleeve
3. Bikin Kaos Custom (/bikin-kaos-custom) — grid produk custom sablon, filter: Semua/DTF/Plastisol,
   plus 3 kartu layanan (Clothing Brand, Event & Komunitas, Merchandise)
4. Desain Eksklusif (/desain-eksklusif) — grid produk limited edition, filter kategori:
   Semua/Dilio/Thinking Out/Dilio x One Piece
   (Dilio = brand sendiri, Thinking Out = brand lain, Dilio x One Piece = koleksi kolaborasi)

Navbar: Logo "Kaos Dilio" kiri, menu (Desain Eksklusif, Koleksi Kaos, Bikin Kaos Custom), 
tombol "Konsultasi Admin" kanan (link WhatsApp).

Footer: 4 kolom (brand+sosmed, Koleksi, Layanan, Hubungi Kami), background dark.

Desain produk card: badge (New/Exclusive), gambar placeholder warna solid dengan nama produk 
besar di tengah, kategori kecil, nama produk, deskripsi singkat, harga, swatch warna (untuk 
produk harian).

Gunakan data produk dummy dalam struktur JSON terpisah (products.json) dengan field: id, name, 
slug, description, price, image_url, material, colors, is_new, is_exclusive, product_group 
(harian/custom/eksklusif), cutting_type, sablon_type, exclusive_category, category_label, 
created_at. Ini penting karena nanti akan dibangun CMS dashboard di fase berikutnya, jadi 
struktur data harus rapi dan siap dikoneksikan ke database.

Style: modern, bold headline, warna dasar navy/hitam/putih dengan aksen warna pastel di card 
produk, fully responsive.

Referensi visual: replikasi tampilan sesuai screenshot mockup yang dilampirkan (4 gambar).
```

---

## 9. Catatan untuk Fase 2 (CMS) — disiapkan sebagai referensi, belum dikerjakan sekarang

Saat Fase 2 dimulai, dashboard CMS idealnya punya:
- Form tambah/edit produk sesuai skema di Bagian 5
- Upload gambar produk (ganti placeholder)
- Pilihan kategori dropdown (product_group, cutting_type/sablon_type/exclusive_category sesuai konteks)
- List semua produk dengan aksi edit/hapus
- Autentikasi admin sederhana (login)

Simpan PRD ini sebagai acuan supaya transisi ke Fase 2 tidak perlu redesain struktur data dari nol.
