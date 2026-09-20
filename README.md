# Pengembangan Halaman Web Portofolio & Layanan Interaktif Accessible Berbasis HTML5 dan Modern CSS

**Mata Kuliah:** 12S3101 - Pemrograman dan Pengujian Aplikasi Web  
**Dosen Pengampu:** Chandro Pardede, S.Kom., M.Sc.  
**Program Studi:** S1 Sistem Informasi — Fakultas Informatika dan Teknik Elektro (FITE)  
**Institusi:** Institut Teknologi Del (IT Del), Laguboti, Sumatera Utara  
**Nama Mahasiswa:** Lucas Pardede  
**NIM / Akun:** iss24015  
**Kelas / Angkatan:** 13SI1 / 2024  
**Wali Mahasiswa:** Humasak Tommy Argo Simanjuntak, ST, M.ISD  
**Nama Repositori GitHub:** `ppw-2026-week2-iss24015`  

---

## 1. Deskripsi Proyek

Proyek ini merupakan penugasan mandiri Minggu 02 mata kuliah **Pemrograman dan Pengujian Aplikasi Web (12S3101)**. Halaman web ini dibangun sebagai *Single Page Showcase Webpage* portofolio profesional mahasiswa Sistem Informasi IT Del yang menggabungkan:
- **Arsitektur Semantik HTML5**: Penyusunan dokumen murni menggunakan elemen standar semantik tanpa *div-soup* berlebihan.
- **Penyajian Data Terstruktur**: Rekapitulasi KHS dan transkrip lengkap seluruh mata kuliah (Semester 1 s.d. Semester 5) dalam tabel semantik interaktif berfilter, dilengkapi daftar terurut (`<ol>`) kurikulum dan daftar tak terurut (`<ul>`) keahlian.
- **Formulir Layanan Interaktif & Accessible (WCAG 2.2 Level AA)**: Mengimplementasikan 2 `<fieldset>` dengan `<legend>`, 8 jenis input lengkap (`text`, `email`, `tel`, `number`, `date`, `radio`, `checkbox`, `select`, `textarea`), pasangan `<label for="...">` eksplisit, validasi native `required`, dan penanganan error/bantuan aksesibilitas.
- **Estetika & Tata Letak CSS Modern**: Mengadopsi prinsip desain *Dark Glassmorphism* ultra-modern yang terinspirasi dari referensi standar industri modern, aturan komposisi warna 60-30-10, *Universal Box Sizing Reset*, Flexbox, CSS Grid, serta *media queries* responsif untuk ponsel dan desktop.
- **Fitur Interaktif & Guestbook**: Dilengkapi sistem komentar *live* yang tersimpan di `localStorage` peramban, *dynamic typewriter effect*, dan *filter tab showcase*.

---

## 2. Pemenuhan Rubrik Penilaian Modul (Checklist 100%)

### ✅ 1. Struktur Semantik HTML5 (Bobot 20%)
- [x] Tag `<header>`: Memuat logo brand, avatar mini mahasiswa, dan navigasi utama situs.
- [x] Tag `<nav>`: Memuat tautan navigasi primer dengan status aktif (*anchor jump links*).
- [x] Tag `<main>`: Memuat seluruh konten inti halaman sebagai kontainer utama tunggal.
- [x] Minimal 3 buah `<section>` bertematik (diimplementasikan 4 section):
  1. `<section id="tentang">` — Profil Mahasiswa & Kartu Digital Mahasiswa IT Del.
  2. `<section id="akademik">` — Rekapitulasi KHS & Riwayat Mata Kuliah Lengkap.
  3. `<section id="showcase">` — Portofolio Proyek Terapan, Sertifikasi, & Tech Stack.
  4. `<section id="layanan">` — Formulir Pemesanan Layanan Konsultasi TI & Guestbook.
- [x] Tag `<article>`: Memuat kartu identitas digital mahasiswa serta kartu proyek portofolio yang mandiri.
- [x] Tag `<aside>`: Sidebar data sekilas akademik (Jalur USM 2, Dosen Wali, Tanggal Masuk, Rekapitulasi Nilai Perilaku 7 semester A, dan Kebijakan Privasi data sensitif NIK/NISN).
- [x] Tag `<footer>`: Penutup dokumen resmi memuat hak cipta, alamat kampus IT Del, dan navigasi sekunder.
- [x] Menghindari *div-soup* tanpa makna; struktur dokumen teruji semantik dan valid.

### ✅ 2. Penyajian Data Tabular & Lists (Bobot 15%)
- [x] **Tabel Semantik Lengkap**: Memuat elemen `<table>`, `<caption>`, `<thead>`, `<tbody>`, `<tfoot>`, serta atribut `scope="col"` pada header dan `scope="row"` pada baris kategori.
- [x] **Data Riwayat Akademik Riil**: 
  - Tabel 1: Rekapitulasi KHS Kumulatif (IPS Semester 1 s.d. 5, SKS selesai 97, IPK 3.60).
  - Tabel 2: Transkrip rinci 30+ mata kuliah resmi S1 Sistem Informasi IT Del (Matematika Diskrit, Basis Data, Algoritma, UI/UX, APS, PBO, Pemrograman Web, Keamanan Sistem, dll.) lengkap dengan filter semester interaktif.
- [x] **HTML Lists Beragam**:
  - `<ol>` (Ordered List): Daftar terurut 6 fokus mata kuliah Semester 5 (Gasal 2026/2027) lengkap dengan beban SKS.
  - `<ul>` (Unordered List): Daftar kompetensi inti Sistem Informasi & rekayasa web.
  - `<dl>`, `<dt>`, `<dd>`: Pasangan deskripsi metadata mahasiswa pada kartu identitas dan sidebar `<aside>`.

### ✅ 3. Komponen Formulir Interaktif & Accessible (Bobot 20%)
- [x] Pengelompokan formulir dengan **2 blok `<fieldset>` dan `<legend>`**:
  - Blok 1: `<legend>Data Identitas Pemohon</legend>`
  - Blok 2: `<legend>Detail Permintaan Layanan & Kebutuhan Proyek</legend>`
- [x] **8 Kontrol Input Lengkap**:
  1. `text` — Nama Lengkap Pemohon
  2. `email` — Alamat Email Aktif
  3. `tel` — Nomor WhatsApp Aktif dengan validasi `pattern="[0-9]{9,15}"`
  4. `radio` — Pilihan Layanan (Website / Basis Data / Analisis Sistem)
  5. `select` — Topik Peminatan Mata Kuliah (Frontend / Database / PM / AI / Security)
  6. `number` — Estimasi Jumlah Halaman / Modul (`min="1" max="50"`)
  7. `date` — Target Tanggal Selesai / Deadline
  8. `checkbox` — Fitur Tambahan (Responsif / Aksesibel / Normalisasi 3NF)
  9. `textarea` — Deskripsi Kebutuhan Proyek
- [x] **Standar Aksesibilitas WCAG 2.2 Level AA**:
  - Seluruh elemen input memiliki pasangan `<label for="...">` eksplisit.
  - Keterhubungan teks bantuan menggunakan `aria-describedby="telepon-help"`.
  - Atribut validasi native HTML5 (`required`, `pattern`, `min`, `max`).
  - Indikator fokus kontras (*focus ring*) saat elemen diakses menggunakan keyboard / tab.

### ✅ 4. Estetika & Tata Letak Modern CSS (Bobot 25%)
- [x] Seluruh styling didefinisikan secara modular di berkas eksternal `style.css`.
- [x] **Universal Box Sizing Reset**:
  ```css
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  ```
- [x] **Penerapan Aturan 60-30-10**:
  - **60% Dominan Netral**: Latar gelap elegan `#090a10` dan `#0d0f17`.
  - **30% Konten & Teks**: Kontras teks `#f8fafc` dan slate lembut `#cbd5e1`.
  - **10% Aksen Aksi**: Biru Del `#0284c7`, Cyan Elektrik `#38bdf8`, dan Zamrud `#10b981`.
- [x] **Kaidah Visual Modern**: Sudut membulat (`border-radius: 12px - 28px`), bayangan lembut berlapis (*diffused soft box-shadow*), efek *glassmorphism* (`backdrop-filter: blur`), dan transisi hover interaktif.
- [x] **Layout Flexbox & CSS Grid**: Penataan grid fleksibel pada kartu profil, KHS, showcase 3-kolom, dan aside.
- [x] **Media Queries Responsif**: Penyesuaian tata letak otomatis untuk mobile dan tablet melalui breakpoint `@media (max-width: 1080px)`, `@media (max-width: 768px)`, dan `@media (max-width: 480px)`.

### ✅ 5. Git & Deployment GitHub Pages (Bobot 20%)
- Repositori Publik: `ppw-2026-week2-iss24015`
- Berkas dokumentasi `README.md` terstruktur dan siap dipublikasikan.

---

## 3. Struktur Berkas Proyek

```plaintext
ppw-2026-week2-iss24015/
├── index.html              # Dokumen HTML5 semantik lengkap
├── style.css               # Styling eksternal (Universal Reset, 60-30-10, Glassmorphism, Responsif)
├── script.js               # Logika interaktivitas (Filter transkrip, guestbook localStorage, typewriter)
├── 1789810572646.jpg       # Foto profil resmi mahasiswa Lucas Pardede
└── README.md               # Dokumentasi resmi proyek dan panduan pengumpulan
```

---

## 4. Panduan Menjalankan & Menguji Proyek

1. **Buka di Komputer Lokal:**
   - Cukup buka berkas `index.html` menggunakan peramban modern (Google Chrome, Microsoft Edge, atau Mozilla Firefox).
   - Atau gunakan ekstensi **Live Server** pada Visual Studio Code: klik kanan `index.html` > *Open with Live Server*.

2. **Verifikasi Fitur:**
   - **Filter Transkrip KHS**: Pada bagian *Akademik*, klik tombol filter `Sem 1`, `Sem 2`, `Sem 3`, `Sem 4`, `Sem 5`, atau `Semua` untuk melihat daftar mata kuliah dinamis.
   - **Formulir Layanan**: Coba lengkapi data formulir pada bagian *Layanan* lalu klik *Kirim Permintaan Layanan* untuk menguji validasi aksesibel dan notifikasi toast.
   - **Guestbook**: Tulis komentar dan pilih avatar emoji untuk melihat komentar baru langsung muncul di daftar atas dan tersimpan di penyimpanan lokal peramban.

---

## 5. Panduan Publikasi ke GitHub Pages

Jalankan perintah berikut pada terminal Git di direktori proyek:

```bash
# 1. Inisialisasi Git
git init

# 2. Tambahkan seluruh berkas ke staging
git add .

# 3. Buat commit perdana dengan pesan standar
git commit -m "feat: complete week 2 html5 and modern css assignment - Lucas Pardede (iss24015)"

# 4. Hubungkan remote repository GitHub
git remote add origin https://github.com/[username-github-anda]/ppw-2026-week2-iss24015.git

# 5. Ganti branch utama menjadi main dan unggah
git branch -M main
git push -u origin main
```

**Langkah Aktivasi GitHub Pages:**
1. Buka halaman repositori di GitHub.
2. Masuk ke tab **Settings** > menu **Pages** di bilah kiri.
3. Pada bagian **Build and deployment > Branch**, pilih cabang `main` dan folder `/ (root)`.
4. Klik **Save**. Tunggu sekitar 1–2 menit hingga tautan live demo aktif.
5. Kirimkan tautan GitHub dan URL GitHub Pages ke formulir submisi resmi perkuliahan: `https://forms.gle/XSsAm2Ukb4Av5pjLA`.

---
*© 2026 Lucas Pardede &middot; S1 Sistem Informasi Institut Teknologi Del*
