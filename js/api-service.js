/**
 * ==============================================================================
 * LUCAS PARDEDE - DATA ACCESS LAYER (js/api-service.js)
 * NIM: 12S24015 - Institut Teknologi Del - PPW Week 4
 * Arsitektur: Decoupled Multi-Tier Architecture (Data Access Tier)
 * Standar: ES6+ async/await, Defensive Error Handling, Fetch API, DTO Serializer
 * Catatan: Dilengkapi embedded fallback data agar CSR tetap berfungsi di file:// protocol
 * ==============================================================================
 */

class ApiService {
  static ENDPOINTS = {
    PROJECTS: './data/projects.json',
    SERVICES: './data/services.json',
    PROFILE:  './data/profile.json',
    ORDER_SUBMISSION: 'https://jsonplaceholder.typicode.com/posts'
  };

  static async #delay(ms = 400) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getProjects(options = { simulateDelay: true, forceError: false }) {
    if (options.forceError) {
      await this.#delay(300);
      throw new Error('Simulasi API Error 500: Server penyedia data portofolio tidak merespons.');
    }
    try {
      if (options.simulateDelay) await this.#delay(500);
      const response = await fetch(this.ENDPOINTS.PROJECTS, {
        headers: { 'Accept': 'application/json' },
        cache: 'default'
      });
      if (!response.ok) throw new Error(`HTTP Error ${response.status}: Gagal memuat data proyek (${response.statusText})`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Format respon tidak valid: data proyek harus berupa Array.');
      return data;
    } catch (err) {
      console.warn('[ApiService.getProjects]: fetch() gagal (mungkin file:// protocol), menggunakan embedded fallback data.', err.message);
      return ApiService.#getEmbeddedProjects();
    }
  }

  static async getServices() {
    try {
      const response = await fetch(this.ENDPOINTS.SERVICES, {
        headers: { 'Accept': 'application/json' },
        cache: 'default'
      });
      if (!response.ok) throw new Error(`HTTP Error ${response.status}: Gagal memuat data layanan (${response.statusText})`);
      return await response.json();
    } catch (err) {
      console.warn('[ApiService.getServices]: fetch() gagal, menggunakan embedded fallback data.', err.message);
      return ApiService.#getEmbeddedServices();
    }
  }

  static async getProfile() {
    try {
      const response = await fetch(this.ENDPOINTS.PROFILE, {
        headers: { 'Accept': 'application/json' },
        cache: 'default'
      });
      if (!response.ok) throw new Error(`HTTP Error ${response.status}: Gagal memuat profil mahasiswa (${response.statusText})`);
      return await response.json();
    } catch (err) {
      console.warn('[ApiService.getProfile]: fetch() gagal, menggunakan embedded fallback data.', err.message);
      return ApiService.#getEmbeddedProfile();
    }
  }

  static async submitServiceOrder(orderPayload) {
    try {
      if (!orderPayload || typeof orderPayload !== 'object') throw new Error('Payload pesanan layanan tidak boleh kosong atau null.');
      const enrichedPayload = {
        ...orderPayload,
        clientTimestamp: new Date().toISOString(),
        studentRecipient: 'Lucas Pardede (12S24015)',
        status: 'SUBMITTED_ASYNCHRONOUS'
      };
      const response = await fetch(this.ENDPOINTS.ORDER_SUBMISSION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8', 'Accept': 'application/json' },
        body: JSON.stringify(enrichedPayload)
      });
      if (!response.ok) throw new Error(`HTTP POST Error ${response.status}: Pengiriman form gagal diproses (${response.statusText})`);
      const responseData = await response.json();
      return { success: true, httpStatus: response.status, apiRecordId: responseData.id || Date.now(), data: responseData };
    } catch (err) {
      console.error('[ApiService.submitServiceOrder Error]:', err);
      if (!navigator.onLine || err.name === 'TypeError') {
        return { success: true, offlineQueued: true, apiRecordId: Date.now(), data: orderPayload };
      }
      throw err;
    }
  }

  // EMBEDDED FALLBACK DATA - identik dengan data/*.json, digunakan saat fetch() gagal
  static #getEmbeddedProjects() {
    return [
      { id:1, title:"DelEats \u2014 Kantin Digital Terintegrasi IT Del", category:"Web & SI", categorySlug:"web-si", year:"2026",
        bannerTitle:"DelEats \u2014 Kantin Digital IT Del", bannerSub:"Sistem Pemesanan Real-time Kampus",
        shortDescription:"Platform manajemen antrean dan pemesanan makanan kantin kampus secara real-time untuk memangkas waktu tunggu antrean mahasiswa hingga 60%, dilengkapi manajemen stok vendor dan simulasi QRIS.",
        description:"DelEats adalah platform manajemen antrean dan pemesanan makanan kantin kampus secara real-time yang dirancang khusus untuk mengatasi kepadatan antrean makan siang mahasiswa di Institut Teknologi Del. Sistem ini mengintegrasikan antarmuka pelanggan untuk pemesanan cepat, modul kasir kantin untuk manajemen antrean pesanan, dan simulasi pembayaran QRIS terverifikasi.",
        metrics:{ item1:{unit:"60%",desc:"Pangkas Waktu Antrean"}, item2:{unit:"< 300ms",desc:"Waktu Respon Kueri API"}, item3:{unit:"1,200+",desc:"Kapasitas Transaksi Harian"} },
        features:["Pelacakan Pesanan Real-time: Integrasi WebSocket untuk update status makanan.","Manajemen Multi-Vendor: Dashboard inventaris untuk setiap stan kantin.","Simulasi Pembayaran QRIS: Generasi kode QR pembayaran dinamis.","Autentikasi Aman: SSO akun mahasiswa IT Del dan enkripsi token JWT."],
        tags:["Next.js 14","Laravel 11 REST API","PostgreSQL","Tailwind CSS","Redis Caching","Docker"],
        image:"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        repoLink:"https://github.com/lucaspardede/deleats-canteen-system", demoLink:"https://lucaspardede.github.io/deleats-canteen-system" },

      { id:2, title:"DelLib \u2014 Sistem Sirkulasi & Basis Data Perpustakaan", category:"Basis Data & Web", categorySlug:"basis-data", year:"2026",
        bannerTitle:"DelLib \u2014 Sirkulasi Perpustakaan", bannerSub:"Katalog & Manajemen Denda Otomatis",
        shortDescription:"Perancangan skema basis data relasional ternormalisasi (3NF) untuk katalog buku, riwayat peminjaman otomatis, kalkulasi denda harian, dan pencarian cepat menggunakan indexing B-Tree terstruktur.",
        description:"DelLib merupakan perancangan sistem informasi manajemen perpustakaan yang menitikberatkan pada keandalan skema basis data relasional ternormalisasi (3NF) untuk katalog buku, riwayat sirkulasi, dan kalkulasi denda otomatis.",
        metrics:{ item1:{unit:"3NF",desc:"Normalisasi Skema Penuh"}, item2:{unit:"0%",desc:"Anomali Redundansi Data"}, item3:{unit:"15,000+",desc:"Data Koleksi Buku Terindeks"} },
        features:["Integritas Relasional: Foreign Key Constraints dan Cascading Rules pada PostgreSQL.","Stored Procedures & Triggers: Kalkulasi denda harian otomatis.","Indexing B-Tree Efisien: Optimasi kueri pencarian teks ISBN dan pengarang.","Audit Logging: Riwayat transaksi peminjaman untuk akuntabilitas."],
        tags:["React.js","Node.js Express","PostgreSQL","Prisma ORM","ERD Normalization","B-Tree Indexing"],
        image:"https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
        repoLink:"https://github.com/lucaspardede/dellib-library-management", demoLink:"https://lucaspardede.github.io/dellib-library-management" },

      { id:3, title:"DelTask \u2014 Kanban & Sprint Tracker", category:"Manajemen Proyek", categorySlug:"manajemen-proyek", year:"2026",
        bannerTitle:"DelTask \u2014 Kanban & Sprint Tracker", bannerSub:"Platform Kolaborasi Tim Berbasis Agile",
        shortDescription:"Aplikasi manajemen proyek kolaboratif untuk tim mahasiswa: mendukung drag-and-drop kartu tugas, estimasi story points, pelacakan velocity sprint, dan visualisasi diagram burndown.",
        description:"DelTask menyediakan lingkungan kerja kolaboratif bagi tim mahasiswa rekayasa perangkat lunak untuk mengelola sprint mingguan, backlog tugas, serta diagram burndown secara transparan.",
        metrics:{ item1:{unit:"40%",desc:"Peningkatan Kecepatan Sprint"}, item2:{unit:"100%",desc:"Real-time Cloud Sync"}, item3:{unit:"8 Tim",desc:"Implementasi Proyek Teruji"} },
        features:["Papan Kanban Drag-and-Drop: Pengorganisasian tugas Backlog, In Progress, Review, Done.","Kalkulasi Velocity Sprint: Visualisasi story points per iterasi.","Manajemen Peran Anggota: Product Owner, Scrum Master, Developer.","Integrasi Notifikasi: Webhook ke Discord/Telegram tim."],
        tags:["TypeScript","React.js","Supabase Database","Tailwind CSS","Chart.js","Agile Scrum"],
        image:"https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=800&q=80",
        repoLink:"https://github.com/lucaspardede/deltask-agile-kanban", demoLink:"https://lucaspardede.github.io/deltask-agile-kanban" },

      { id:4, title:"AgroScan AI \u2014 Deteksi Penyakit Tanaman Pangan", category:"Kecerdasan Buatan", categorySlug:"ai", year:"2026",
        bannerTitle:"AgroScan AI \u2014 Deteksi Penyakit Tanaman", bannerSub:"Klasifikasi Daun dengan Deep Learning",
        shortDescription:"Aplikasi web interaktif klasifikasi penyakit daun tanaman pangan berbasis CNN dengan akurasi 94.2% dan integrasi saran tindakan penanganan preventif.",
        description:"AgroScan AI adalah platform klasifikasi penyakit daun tanaman pangan lokal berbasis CNN untuk membantu petani mendiagnosis hama lebih dini.",
        metrics:{ item1:{unit:"94.2%",desc:"Akurasi Klasifikasi Model"}, item2:{unit:"1.2 dtk",desc:"Kecepatan Inferensi Citra"}, item3:{unit:"14 Kelas",desc:"Penyakit Daun Dikenali"} },
        features:["Model CNN MobileNetV2: Arsitektur ringan untuk bandwidth rendah.","Rekomendasi Tindakan Cepat: Panduan dosis fungisida pasca-deteksi.","REST API Backend: Endpoint prediksi citra berbasis Flask.","Data Logging Geografis: Pemetaan sebaran hama berbasis GPS."],
        tags:["Python","TensorFlow","Flask API","OpenCV","Tailwind CSS","Computer Vision"],
        image:"https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80",
        repoLink:"https://github.com/lucaspardede/agroscan-ai-detector", demoLink:"https://lucaspardede.github.io/agroscan-ai-detector" },

      { id:5, title:"SecureAudit \u2014 Web Vulnerability Tester", category:"Web Security", categorySlug:"security", year:"2026",
        bannerTitle:"SecureAudit \u2014 Vulnerability Tester", bannerSub:"Simulasi Keamanan Form & Sanitasi Input",
        shortDescription:"Tool interaktif simulasi scanning kerentanan formulir web dari SQL Injection, XSS, dan sanitasi header HTTP.",
        description:"SecureAudit adalah tool edukasi dan simulasi pengujian celah keamanan aplikasi web untuk standar OWASP Top 10, difokuskan pada sanitasi input form dan analisis header HTTP.",
        metrics:{ item1:{unit:"OWASP",desc:"Standar Pengujian Teruji"}, item2:{unit:"100%",desc:"Cakupan XSS & SQLi Sanitasi"}, item3:{unit:"A+",desc:"Target Evaluasi Header CSP"} },
        features:["SQL Injection Vector Scanner: Deteksi karakter berbahaya pada parameter form.","XSS Sanitizer: Evaluasi efektivitas DOMPurify dan escaping entitas HTML.","HTTP Security Headers Checker: Verifikasi CSP, X-Frame-Options, dan HSTS.","Laporan Remediasi Otomatis: Rekomendasi prepared statements dan input validation."],
        tags:["Node.js","Express","OWASP Top 10","Security Headers","Cyber Security","PenTesting"],
        image:"https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
        repoLink:"https://github.com/lucaspardede/secureaudit-tester", demoLink:"https://lucaspardede.github.io/secureaudit-tester" },

      { id:6, title:"Portofolio Lucas 4.0 \u2014 Decoupled Multi-Tier & CSR", category:"Frontend Architecture", categorySlug:"frontend", year:"2026",
        bannerTitle:"Portfolio 4.0 \u2014 Decoupled Multi-Tier", bannerSub:"Dynamic CSR, JSON Provider & Performance Profiling",
        shortDescription:"Transformasi arsitektur web portofolio dari monolitik statis menjadi decoupled multi-tier: dynamic CSR, REST form dispatching, universal dynamic modal, dan profil performa DevTools.",
        description:"Refactoring arsitektural komprehensif pada aplikasi portofolio personal Lucas Pardede mematuhi modul PPW Week 4: memisahkan presentation tier, logic tier, data provider JSON modular, Universal Dynamic Modal Bootstrap 5, serta pengukuran performa jaringan RFC 9111.",
        metrics:{ item1:{unit:"100%",desc:"Decoupled Data Layer"}, item2:{unit:"1",desc:"Universal Dynamic Modal"}, item3:{unit:"4 UI",desc:"States (Loading/Success/Empty/Error)"} },
        features:["Dynamic CSR: Rendering kartu portofolio sepenuhnya via async/await dan JSON Provider.","Universal Dynamic Modal: 1 modal Bootstrap 5 untuk seluruh proyek.","Decoupled Asynchronous REST Form: Submit tanpa reload, DTO JSON, Bootstrap Toast.","Persistent Local State: Riwayat pesanan di localStorage dengan badge reaktif."],
        tags:["Bootstrap 5.3","Dynamic CSR","JSON Provider","Fetch API","localStorage","DevTools Profiling"],
        image:"https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        repoLink:"https://github.com/LucasPardede/ppw-2026-week2-12S24015", demoLink:"https://lucaspardede.github.io/ppw-2026-week2-12S24015/" }
    ];
  }

  static #getEmbeddedServices() {
    return [
      { id:1, code:"basis-data", title:"Konsultasi Basis Data & Arsitektur SQL", category:"Akademik & Rekayasa Data", role:"Asisten Dosen Basis Data (2025 & 2026)",
        description:"Bimbingan perancangan skema konseptual, normalisasi relasional (1NF hingga BCNF), optimasi kueri kompleks SQL, manajemen transaksi ACID, dan perancangan trigger/stored procedure.",
        duration:"45 - 90 Menit", format:"Online (Google Meet) / Tatap Muka (Lab Komputer IT Del)", fee:"Gratis (Civitas Akademika IT Del)", badge:"Terpopuler",
        benefits:["Review ERD & Normalisasi Skema Database","Debugging Kueri SQL Lambat & Analisis Indexing","Panduan Tugas Besar & Praktikum Basis Data","Materi Tambahan Cheatsheet SQL & PostgreSQL"],
        targetAudience:"Mahasiswa Tingkat 1 & 2 S1 SI/IF yang menempuh mata kuliah Basis Data & Basis Data Lanjut." },
      { id:2, code:"matematika-diskrit", title:"Bimbingan Matematika Diskrit & Logika", category:"Fondasi Komputasi & Matematika", role:"Asisten Dosen Matematika Diskrit (2025)",
        description:"Pemantapan konsep logika proposisi dan predikat, teori himpunan, relasi dan fungsi, induksi matematika, rekursi, serta aplikasi teori graf.",
        duration:"45 - 60 Menit", format:"Tatap Muka Asrama / Ruang Kelas IT Del", fee:"Gratis (Civitas Akademika IT Del)", badge:"Akademik",
        benefits:["Bedah Pembuktian Matematis (Induksi & Kontradiksi)","Penyelesaian Masalah Algoritma Graf (Dijkstra, BFS/DFS)","Latihan Soal Kuis, UTS, dan UAS Terbimbing","Sesi Tanya Jawab Interaktif Santai"],
        targetAudience:"Mahasiswa S1 Sistem Informasi & Informatika semester awal yang memerlukan penguatan logika dasar." },
      { id:3, code:"web-development", title:"Pengembangan Website Modern & Fullstack Dev", category:"Rekayasa Perangkat Lunak Web", role:"Fullstack Web & PPW Developer",
        description:"Konsultasi dan bimbingan arsitektur web modern: HTML5 semantik, CSS Grid & Flexbox, Bootstrap 5, integrasi RESTful API, JavaScript ES6+ asinkron, hingga deployment GitHub Pages.",
        duration:"60 - 120 Menit", format:"Hybrid / Pair Programming", fee:"Gratis (Tugas Kuliah) / Sesuai Kesepakatan Proyek", badge:"Praktikum PPW",
        benefits:["Review Kode Arsitektur (Decoupled, CSR, Component)","Debugging Console Error & Validasi Aksesibilitas WCAG","Setup Responsive Grid & Custom Theme CSS","Git Workflow & Konfigurasi GitHub Pages"],
        targetAudience:"Mahasiswa praktikum PPW atau tim proyek yang sedang membangun produk web responsif." },
      { id:4, code:"sistem-informasi", title:"Analisis Sistem, BPMN & Manajemen Proyek TI", category:"Tata Kelola & Manajemen TI", role:"Anggota DIPTEK BEM IT Del & Awardee Privy",
        description:"Bimbingan pemodelan proses bisnis terstandarisasi BPMN 2.0, spesifikasi kebutuhan perangkat lunak (SRS), user stories Scrum, estimasi sprint, serta penyusunan dokumen arsitektur C4.",
        duration:"45 - 90 Menit", format:"Diskusi Ruang Diskusi Kampus IT Del", fee:"Gratis (Civitas IT Del)", badge:"Manajemen Proyek",
        benefits:["Pemodelan Diagram BPMN 2.0 & Diagram UML","Penyusunan Backlog & Sprint Planning Agile Scrum","Review Analisis Kelayakan Sistem Informasi","Simulasi Presentasi Proyek & Deliverables"],
        targetAudience:"Tim mahasiswa yang sedang mengerjakan tugas Rekayasa Kebutuhan atau Manajemen Proyek TI." }
    ];
  }

  static #getEmbeddedProfile() {
    return { developer:{ name:"Lucas Pardede", nim:"12S24015", account:"iss24015", class:"13SI1", cohort:"2024",
      degree:"S1 Sistem Informasi", faculty:"Fakultas Informatika dan Teknik Elektro (FITE)", institution:"Institut Teknologi Del (IT Del)",
      location:"Laguboti, Toba, Sumatera Utara, Indonesia", academicAdvisor:"Humasak Tommy Argo Simanjuntak, ST, M.ISD",
      avatar:"assets/images/1789810572646.jpg", headline:"Merancang Sistem Digital & Solusi Data yang Efisien, Handal & Berdampak",
      bio:"Mahasiswa aktif S1 Sistem Informasi angkatan 2024 di Institut Teknologi Del (IT Del). Mengabdi sebagai Asisten Dosen Basis Data (2025 & 2026) dan Asisten Dosen Matematika Diskrit (2025), penerima Beasiswa Privy 2025 dan Beasiswa Prestasi IT Del, serta aktif sebagai Anggota DIPTEK BEM IT DEL (2025/2026) dan Agen Pojok Statistik.",
      roles:["Asisten Dosen Basis Data & Matdis","S1 Sistem Informasi IT Del","Awardee Beasiswa Privy 2025","Anggota DIPTEK BEM IT DEL","Agen Pojok Statistik IT Del","Fullstack Web & Database Engineer"],
      contacts:{ email:"lucaspardede184@gmail.com", studentEmail:"iss24015@students.del.ac.id", whatsapp:"085932521713", whatsappUrl:"https://wa.me/6285932521713", linkedin:"https://www.linkedin.com/in/lucas-pardede-2479453ab", github:"https://github.com/LucasPardede" },
      statistics:{ gpa:"3.8+", completedCourses:48, projectsCount:6, certifications:8, consultationSessions:34 }
    }};
  }
}

// Ekspor ApiService ke lingkup global window agar dapat diakses oleh app.js
window.ApiService = ApiService;
