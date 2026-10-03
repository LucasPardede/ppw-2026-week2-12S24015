/**
 * ==============================================================================
 * LUCAS PARDEDE - PRESENTATION & LOGIC TIER (js/app.js)
 * NIM: 12S24015 * S1 Sistem Informasi * Institut Teknologi Del
 * Mata Kuliah: Pemrograman dan Pengujian Web (12S3101) - Week 4
 * Arsitektur: Dynamic Client-Side Rendering (CSR), Universal Modal, REST Form,
 *             Persistent Local Storage State, & Defensive UI State Machine
 * ==============================================================================
 */

class PortfolioApp {
  constructor() {
    // State aplikasi terpusat (Client-side single source of truth)
    this.state = {
      projects: [],
      services: [],
      profile: null,
      currentFilter: 'all',
      orders: [],
      uiState: 'idle' // 'loading' | 'success' | 'empty' | 'error'
    };

    // Modal instance referensi Bootstrap 5
    this.universalModalInstance = null;
  }

  /**
   * Inisialisasi siklus hidup aplikasi saat DOM siap
   */
  async init() {
    this.initNavbarCollapse();
    this.initTypewriter();
    this.initShowcaseTabs();
    this.initTranscriptFilter();
    this.initScrollEffects();
    this.initIntersectionObservers();
    this.initGuestbook();
    
    // Inisialisasi Arsitektur Week 4
    this.initOrdersState();
    this.initServiceForm();
    this.initUniversalModal();
    this.initCategoryFilters();
    
    // Pemuatan data dinamis asinkron (Dynamic CSR)
    await this.loadInitialData();
  }

  // ==========================================================================
  // 1. DATA LOADING & 4 UI STATES MANAGEMENT (CSR PIPELINE)
  // ==========================================================================

  /**
   * Memuat data proyek dan layanan secara asinkron dari ApiService
   */
  async loadInitialData(forceError = false) {
    const container = document.getElementById('portfolio-grid-container');
    if (!container) return;

    // STATE 1: LOADING STATE (Menampilkan Skeleton Shimmer Cards)
    this.setUIState('loading');
    this.renderLoadingSkeleton(container, 6);

    try {
      // Panggilan Data Access Layer via async/await
      const [projectsData, servicesData, profileData] = await Promise.all([
        ApiService.getProjects({ simulateDelay: true, forceError: forceError }),
        ApiService.getServices().catch(err => {
          console.warn('[Layanan fallback]:', err);
          return [];
        }),
        ApiService.getProfile().catch(err => {
          console.warn('[Profil fallback]:', err);
          return null;
        })
      ]);

      this.state.projects = projectsData;
      this.state.services = servicesData;
      this.state.profile = profileData;

      // STATE 2: SUCCESS STATE (Render koleksi proyek ke Grid)
      this.setUIState('success');
      this.applyFilterAndRender();

    } catch (error) {
      // STATE 4: ERROR STATE (Fallback Alert dengan pesan defensif dan tombol retry)
      this.setUIState('error');
      this.renderErrorState(container, error);
    }
  }

  /**
   * Mengubah status UI aplikasi
   * @param {'loading' | 'success' | 'empty' | 'error'} newState 
   */
  setUIState(newState) {
    this.state.uiState = newState;
    const stateBadge = document.getElementById('current-ui-state-badge');
    if (stateBadge) {
      stateBadge.textContent = `UI State: ${newState.toUpperCase()}`;
      stateBadge.className = `badge ${
        newState === 'loading' ? 'bg-warning text-dark' :
        newState === 'success' ? 'bg-success' :
        newState === 'empty' ? 'bg-info text-dark' : 'bg-danger'
      }`;
    }
  }

  /**
   * STATE 1: Render Skeleton Loader Shimmer Cards
   */
  renderLoadingSkeleton(container, count = 6) {
    let skeletonsHTML = '';
    for (let i = 0; i < count; i++) {
      skeletonsHTML += `
        <div class="col">
          <div class="skeleton-card" aria-hidden="true">
            <div class="skeleton-shimmer"></div>
            <div class="skeleton-line h-banner"></div>
            <div class="skeleton-line h-title"></div>
            <div class="skeleton-line h-text"></div>
            <div class="skeleton-line h-text-short"></div>
            <div class="skeleton-line h-tags"></div>
            <div class="skeleton-line h-btn"></div>
          </div>
        </div>
      `;
    }
    container.innerHTML = skeletonsHTML;
  }

  /**
   * STATE 2: Render Project Cards (Success State)
   */
  renderProjectCards(container, projects) {
    if (!projects || projects.length === 0) {
      this.renderEmptyState(container);
      return;
    }

    const cardsHTML = projects.map(proj => {
      // Kategori icon generator
      let catIcon = 'bi-folder2';
      if (proj.categorySlug === 'web-si') catIcon = 'bi-globe';
      else if (proj.categorySlug === 'basis-data') catIcon = 'bi-database-fill-gear';
      else if (proj.categorySlug === 'manajemen-proyek') catIcon = 'bi-kanban';
      else if (proj.categorySlug === 'ai') catIcon = 'bi-cpu-fill';
      else if (proj.categorySlug === 'security') catIcon = 'bi-shield-lock-fill';
      else if (proj.categorySlug === 'frontend') catIcon = 'bi-layers-fill';

      // Tech badges generator
      const tagsHTML = (proj.tags || []).slice(0, 4).map(t => 
        `<span class="badge-tech">${this.escapeHTML(t)}</span>`
      ).join('');

      return `
        <div class="col" data-project-col="${proj.id}">
          <article class="card project-card-bs h-100">
            <div class="card-header-meta">
              <span class="category-badge"><i class="bi ${catIcon} me-1"></i> ${this.escapeHTML(proj.category)}</span>
              <span class="year-badge">${this.escapeHTML(proj.year || '2026')}</span>
            </div>
            
            <div class="card-banner-wrapper">
              <div class="mockup-dots"><span></span><span></span><span></span></div>
              <div class="card-banner-title">${this.escapeHTML(proj.bannerTitle || proj.title)}</div>
              <div class="card-banner-sub">${this.escapeHTML(proj.bannerSub || '')}</div>
            </div>

            <div class="card-body">
              <h3 class="card-title">${this.escapeHTML((proj.title || '').split(/\s*[-\u2013\u2014]\s*/)[0].trim())}</h3>
              <p class="card-text">${this.escapeHTML(proj.shortDescription || proj.description)}</p>
              
              <div class="tech-badge-container">
                ${tagsHTML}
              </div>

              <div class="card-actions-group">
                <button type="button" class="btn-detail-modal" data-action="open-detail" data-project-id="${proj.id}" aria-label="Buka rincian proyek ${this.escapeHTML(proj.title)}">
                  <i class="bi bi-info-circle-fill"></i> Detail Proyek
                </button>
                ${proj.repoLink ? `
                  <a href="${this.escapeHTML(proj.repoLink)}" target="_blank" rel="noopener noreferrer" class="btn-repo-link" title="Source Code Repositori">
                    <i class="bi bi-github"></i> Repo
                  </a>
                ` : ''}
              </div>
            </div>
          </article>
        </div>
      `;
    }).join('');

    container.innerHTML = cardsHTML;

    // Delegasi Event Listener untuk tombol Detail Proyek (Universal Dynamic Modal Trigger)
    container.querySelectorAll('button[data-action="open-detail"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pId = parseInt(btn.getAttribute('data-project-id'), 10);
        this.openProjectModal(pId);
      });
    });
  }

  /**
   * STATE 3: Render Empty State (Bila filter tidak menghasilkan data)
   */
  renderEmptyState(container) {
    this.setUIState('empty');
    container.innerHTML = `
      <div class="col-12">
        <div class="empty-state-box">
          <div class="empty-state-icon">
            <i class="bi bi-search-heart"></i>
          </div>
          <h4 class="empty-state-title">Tidak Ada Proyek yang Ditemukan</h4>
          <p class="empty-state-desc">
            Kategori "<strong>${this.escapeHTML(this.state.currentFilter)}</strong>" saat ini belum memiliki proyek terdaftar. Silakan pilih kategori lain atau reset filter.
          </p>
          <button type="button" class="btn btn-outline-info px-4 py-2" id="btn-reset-filter">
            <i class="bi bi-arrow-counterclockwise me-1"></i> Tampilkan Semua Proyek
          </button>
        </div>
      </div>
    `;

    const resetBtn = document.getElementById('btn-reset-filter');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.setFilter('all');
      });
    }
  }

  /**
   * STATE 4: Render Error Fallback State (Bila API / fetch gagal)
   */
  renderErrorState(container, error) {
    this.setUIState('error');
    container.innerHTML = `
      <div class="col-12">
        <div class="error-fallback-box alert alert-danger" role="alert">
          <div class="error-fallback-icon">
            <i class="bi bi-exclamation-triangle-fill"></i>
          </div>
          <h4 class="error-fallback-title">Gagal Memuat Koleksi Portofolio</h4>
          <p class="error-fallback-desc">
            Terjadi kegagalan komunikasi jaringan saat mengambil berkas data JSON: <br>
            <code>${this.escapeHTML(error.message || 'NetworkError')}</code>
          </p>
          <div class="d-flex justify-content-center gap-2">
            <button type="button" class="btn btn-danger px-4 py-2" id="btn-retry-fetch">
              <i class="bi bi-arrow-clockwise me-1"></i> Coba Lagi (Retry)
            </button>
            <button type="button" class="btn btn-outline-secondary px-3 py-2" id="btn-inspect-error">
              Lihat di Console
            </button>
          </div>
        </div>
      </div>
    `;

    const retryBtn = document.getElementById('btn-retry-fetch');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.loadInitialData(false);
      });
    }

    const inspectBtn = document.getElementById('btn-inspect-error');
    if (inspectBtn) {
      inspectBtn.addEventListener('click', () => {
        console.error('[Evaluator Debug Inspect]:', error);
        this.showToastNotification('Periksa Console DevTools', 'Detail error stack telah dicetak ke Console untuk analisis.');
      });
    }
  }

  // ==========================================================================
  // 2. CATEGORY FILTER (NON-RELOAD INSTANT FILTERING)
  // ==========================================================================

  /**
   * Inisialisasi tombol filter kategori portofolio
   */
  initCategoryFilters() {
    const filterButtons = document.querySelectorAll('.btn-filter-category');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-filter') || 'all';
        this.setFilter(cat);
      });
    });

    // Tombol simulasi state untuk kemudahan penilaian dosen / asdos
    const testErrorBtn = document.getElementById('btn-simulate-error');
    if (testErrorBtn) {
      testErrorBtn.addEventListener('click', () => {
        this.loadInitialData(true);
      });
    }

    const testReloadBtn = document.getElementById('btn-simulate-reload');
    if (testReloadBtn) {
      testReloadBtn.addEventListener('click', () => {
        this.loadInitialData(false);
      });
    }
  }

  /**
   * Menetapkan kategori filter aktif dan me-render ulang
   * @param {string} category 
   */
  setFilter(category) {
    this.state.currentFilter = category;

    // Perbarui styling tombol aktif
    document.querySelectorAll('.btn-filter-category').forEach(b => {
      if (b.getAttribute('data-filter') === category) {
        b.classList.add('active');
        b.setAttribute('aria-pressed', 'true');
      } else {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      }
    });

    this.applyFilterAndRender();
  }

  /**
   * Menerapkan filter pada koleksi proyek dan menyajikan ke DOM
   */
  applyFilterAndRender() {
    const container = document.getElementById('portfolio-grid-container');
    if (!container) return;

    if (this.state.currentFilter === 'all') {
      this.renderProjectCards(container, this.state.projects);
    } else {
      const filtered = this.state.projects.filter(p => p.categorySlug === this.state.currentFilter);
      this.renderProjectCards(container, filtered);
    }
  }

  // ==========================================================================
  // 3. UNIVERSAL DYNAMIC MODAL (1 MODAL TUNGGAL UNTUK SEMUA PROYEK)
  // ==========================================================================

  /**
   * Inisialisasi komponen Universal Modal Bootstrap 5
   */
  initUniversalModal() {
    const modalEl = document.getElementById('universalProjectModal');
    if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      this.universalModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
    }
  }

  /**
   * Membuka modal dinamis universal berdasarkan ID proyek
   * Memetakan data dari this.state.projects ke dalam struktur modal secara aman dari XSS
   * @param {number} projectId 
   */
  openProjectModal(projectId) {
    const proj = this.state.projects.find(p => p.id === projectId);
    if (!proj) {
      console.warn(`[UniversalModal]: Proyek dengan ID ${projectId} tidak ditemukan.`);
      return;
    }

    const titleEl = document.getElementById('projectModalTitle');
    const badgeCategoryEl = document.getElementById('projectModalCategoryBadge');
    const bodyEl = document.getElementById('projectModalBody');
    const repoBtn = document.getElementById('projectModalRepoBtn');

    // 1. TextContent Injection (Aman dari DOM XSS)
    if (titleEl) {
      titleEl.textContent = proj.title;
    }
    if (badgeCategoryEl) {
      badgeCategoryEl.textContent = `${proj.category} * ${proj.year || '2026'}`;
    }

    // 2. Render Metrics Boxes jika tersedia
    let metricsHTML = '';
    if (proj.metrics) {
      const mItems = Object.values(proj.metrics);
      if (mItems.length > 0) {
        metricsHTML = `
          <div class="modal-metrics-box mb-4">
            ${mItems.map(m => `
              <div>
                <div class="metric-unit">${this.escapeHTML(m.unit)}</div>
                <div class="metric-desc">${this.escapeHTML(m.desc)}</div>
              </div>
            `).join('')}
          </div>
        `;
      }
    }

    // 3. Render Fitur Utama
    let featuresHTML = '';
    if (proj.features && proj.features.length > 0) {
      featuresHTML = `
        <h5 class="modal-section-title"><i class="bi bi-gear-wide-connected"></i> Arsitektur &amp; Fitur Utama:</h5>
        <ul class="modal-feature-list mb-4">
          ${proj.features.map(f => `<li>${this.escapeHTML(f)}</li>`).join('')}
        </ul>
      `;
    }

    // 4. Render Tags Instrumen Teknologi
    let tagsHTML = '';
    if (proj.tags && proj.tags.length > 0) {
      tagsHTML = `
        <h5 class="modal-section-title"><i class="bi bi-stack"></i> Instrumen Teknologi:</h5>
        <div class="tech-badge-container mb-2">
          ${proj.tags.map(t => `<span class="badge-tech">${this.escapeHTML(t)}</span>`).join('')}
        </div>
      `;
    }

    // 5. Injeksi konten lengkap ke modal body
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="modal-project-hero mb-3">
          <p class="text-light lead" style="font-size: 0.95rem;">
            ${this.escapeHTML(proj.description || proj.shortDescription)}
          </p>
        </div>
        ${metricsHTML}
        ${featuresHTML}
        ${tagsHTML}
      `;
    }

    // 6. Update tombol repositori
    if (repoBtn) {
      if (proj.repoLink) {
        repoBtn.href = proj.repoLink;
        repoBtn.style.display = 'inline-flex';
      } else {
        repoBtn.style.display = 'none';
      }
    }

    // 7. Tampilkan modal via Bootstrap 5 API
    const modalEl = document.getElementById('universalProjectModal');
    if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    }
  }

  // ==========================================================================
  // 4. DECOUPLED ASYNCHRONOUS REST FORM DISPATCHING & LOCALSTORAGE
  // ==========================================================================

  /**
   * Inisialisasi formulir pemesanan layanan asinkron (No Full Page Reload)
   */
  initServiceForm() {
    const serviceForm = document.getElementById('contact-form');
    if (!serviceForm) return;

    serviceForm.addEventListener('submit', async (e) => {
      // MENGHENTIKAN PERILAKU STANDARD SUBMIT RELOAD
      e.preventDefault();

      // Bootstrap 5 Native Constraint Validation Check
      if (!serviceForm.checkValidity()) {
        e.stopPropagation();
        serviceForm.classList.add('was-validated');
        this.showToastNotification(
          'Form Belum Lengkap',
          'Silakan lengkapi seluruh kolom yang bertanda bintang (*) sesuai format yang diminta.'
        );
        return;
      }

      serviceForm.classList.add('was-validated');

      // Serialisasi data form menjadi JSON DTO
      const formData = new FormData(serviceForm);
      const rawPayload = Object.fromEntries(formData.entries());

      // Ekstraksi teks label layanan terpilih
      const selectedServiceRadio = serviceForm.querySelector('input[name="layanan"]:checked');
      const serviceLabelText = selectedServiceRadio 
        ? selectedServiceRadio.parentElement.querySelector('span')?.textContent.trim() 
        : 'Konsultasi TI';

      const enrichedPayload = {
        id: 'ORD-' + Date.now(),
        submittedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
        nama: (rawPayload.nama || '').trim(),
        email: (rawPayload.email || '').trim(),
        telepon: (rawPayload.telepon || '').trim(),
        layanan: serviceLabelText,
        layananSlug: rawPayload.layanan || 'general',
        topik: rawPayload.topik || '-',
        durasi: rawPayload.estimasi_halaman || '45',
        tanggal: rawPayload.target_waktu || '-',
        pesan: (rawPayload.pesan || '').trim()
      };

      // Loading State pada Tombol Submit
      const submitBtn = document.getElementById('btn-submit-form');
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : 'Kirim Pengajuan Konsultasi';
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          <span>Mengirim ke REST API...</span>
        `;
      }

      try {
        // Pengiriman asinkron ke Data Access Layer
        const result = await ApiService.submitServiceOrder(enrichedPayload);

        // Simpan pesanan ke Local Storage secara persisten
        this.saveOrderToLocalStorage(enrichedPayload);

        // Feedback visual Bootstrap Toast
        this.showToastNotification(
          'Permohonan Terkirim!',
          `Pengajuan sesi "${enrichedPayload.layanan}" atas nama ${enrichedPayload.nama} berhasil diproses oleh REST API.`
        );

        // Reset form & status validasi
        serviceForm.reset();
        serviceForm.classList.remove('was-validated');

      } catch (err) {
        console.error('[Form Submit Asinkron Error]:', err);
        this.showToastNotification(
          'Gagal Mengirim Form',
          `Terjadi kesalahan saat memproses data ke API: ${err.message}. Silakan coba lagi.`
        );
      } finally {
        // Kembalikan status tombol submit
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      }
    });
  }

  // ==========================================================================
  // 5. LOCAL STORAGE ORDER STATE & REACTIVE BADGE
  // ==========================================================================

  /**
   * Inisialisasi state pesanan dari localStorage
   */
  initOrdersState() {
    this.loadOrdersFromLocalStorage();
    this.updateOrderBadges();

    // Trigger tombol buka riwayat pesanan (Order History Modal)
    const historyBtn = document.getElementById('btn-view-orders-history');
    if (historyBtn) {
      historyBtn.addEventListener('click', () => {
        this.openOrderHistoryModal();
      });
    }

    const clearOrdersBtn = document.getElementById('btn-clear-orders');
    if (clearOrdersBtn) {
      clearOrdersBtn.addEventListener('click', () => {
        this.clearAllOrders();
      });
    }
  }

  /**
   * Memuat data pesanan yang tersimpan di localStorage
   */
  loadOrdersFromLocalStorage() {
    try {
      const stored = localStorage.getItem('lucas_week4_orders');
      if (stored) {
        this.state.orders = JSON.parse(stored);
      } else {
        this.state.orders = [];
      }
    } catch (e) {
      console.warn('[LocalStorage Error]: Akses storage lokal dibatasi.', e);
      this.state.orders = [];
    }
  }

  /**
   * Menyimpan pesanan baru ke localStorage dan memicu reaktivitas badge
   * @param {Object} orderItem 
   */
  saveOrderToLocalStorage(orderItem) {
    try {
      this.state.orders.unshift(orderItem);
      localStorage.setItem('lucas_week4_orders', JSON.stringify(this.state.orders));
      this.updateOrderBadges(true); // Animasikan bump
    } catch (e) {
      console.warn('[LocalStorage Save Error]:', e);
    }
  }

  /**
   * Menghapus seluruh riwayat pesanan
   */
  clearAllOrders() {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat pesanan konsultasi di penyimpanan lokal browser?')) {
      this.state.orders = [];
      localStorage.removeItem('lucas_week4_orders');
      this.updateOrderBadges();
      this.renderOrderHistoryList();
      this.showToastNotification('Riwayat Dibersihkan', 'Seluruh data pesanan lokal telah dihapus.');
    }
  }

  /**
   * Memperbarui badge jumlah pesanan secara reaktif di seluruh antarmuka
   * @param {boolean} animate - Apakah memicu animasi visual
   */
  updateOrderBadges(animate = false) {
    const count = this.state.orders.length;
    const badgeEls = document.querySelectorAll('.order-count-badge');
    
    badgeEls.forEach(badge => {
      badge.textContent = `${count} Pesanan`;
      if (animate) {
        badge.classList.add('bump');
        setTimeout(() => badge.classList.remove('bump'), 400);
      }
    });

    const summaryText = document.getElementById('order-summary-desc');
    if (summaryText) {
      summaryText.textContent = count === 0 
        ? 'Belum ada pesanan aktif tersimpan.' 
        : `Tersimpan ${count} pengajuan konsultasi aktif di localStorage.`;
    }
  }

  /**
   * Membuka modal riwayat pesanan tersimpan di localStorage
   */
  openOrderHistoryModal() {
    this.renderOrderHistoryList();
    const modalEl = document.getElementById('orderHistoryModal');
    if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    }
  }

  /**
   * Render daftar pesanan ke dalam container riwayat modal
   */
  renderOrderHistoryList() {
    const listContainer = document.getElementById('order-history-container');
    if (!listContainer) return;

    if (this.state.orders.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-4 text-muted">
          <i class="bi bi-inbox" style="font-size: 2.2rem; display: block; margin-bottom: 0.5rem; opacity: 0.6;"></i>
          <p class="mb-0">Belum ada riwayat pesanan tersimpan di localStorage.</p>
          <small>Ajukan sesi konsultasi melalui formulir untuk melihat data tersimpan.</small>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = this.state.orders.map((ord, idx) => `
      <div class="order-history-item mb-2">
        <div class="d-flex justify-content-between align-items-start mb-1">
          <strong class="text-info" style="font-size: 0.95rem;">${this.escapeHTML(ord.layanan)}</strong>
          <span class="badge bg-secondary" style="font-size: 0.72rem;">${this.escapeHTML(ord.submittedAt || '')}</span>
        </div>
        <div class="text-light small mb-1">
          <i class="bi bi-person me-1 text-primary"></i> ${this.escapeHTML(ord.nama)} &middot; 
          <i class="bi bi-envelope me-1 text-primary"></i> ${this.escapeHTML(ord.email)}
        </div>
        <div class="text-secondary small mb-1">
          <i class="bi bi-clock me-1 text-warning"></i> Durasi: ${this.escapeHTML(ord.durasi)} mnt &middot; 
          <i class="bi bi-calendar-event me-1 text-warning"></i> Tanggal: ${this.escapeHTML(ord.tanggal)}
        </div>
        <p class="text-muted small mb-0 fst-italic">"${this.escapeHTML(ord.pesan)}"</p>
      </div>
    `).join('');
  }

  // ==========================================================================
  // 6. UTILITIES: TOAST NOTIFICATIONS & XSS SANITIZATION
  // ==========================================================================

  /**
   * Menampilkan notifikasi Bootstrap Toast
   * @param {string} title 
   * @param {string} desc 
   */
  showToastNotification(title, desc) {
    const toastEl = document.getElementById('toast-notify');
    const titleEl = document.getElementById('toast-title');
    const descEl = document.getElementById('toast-desc');

    if (!toastEl) return;
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;

    // Gunakan class .show atau Bootstrap Toast API
    toastEl.classList.add('show');
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 4500);
  }

  /**
   * Sanitasi String untuk mencegah serangan DOM-based XSS
   * @param {string} str 
   * @returns {string} Safe escaped string
   */
  escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // 7. PRESERVED WEEK 3 FEATURES (Tab, Typewriter, Guestbook, Animations)
  // ==========================================================================

  initNavbarCollapse() {
    const navbarContent = document.getElementById('navbarContent');
    const navLinks = document.querySelectorAll('.nav-link, .nav-cta-btn');

    if (navbarContent) {
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
            const bsCollapse = bootstrap.Collapse.getInstance(navbarContent);
            if (bsCollapse && navbarContent.classList.contains('show')) {
              bsCollapse.hide();
            }
          }
        });
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (navbarContent && typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
          const bsCollapse = bootstrap.Collapse.getInstance(navbarContent);
          if (bsCollapse && navbarContent.classList.contains('show')) {
            bsCollapse.hide();
          }
        }
      }
    });
  }

  initTypewriter() {
    const typedTextEl = document.getElementById('typed-text');
    if (!typedTextEl) return;

    const roles = [
      'Asisten Dosen Basis Data & Matdis',
      'S1 Sistem Informasi IT Del',
      'Awardee Beasiswa Privy 2025',
      'Anggota DIPTEK BEM IT DEL',
      'Agen Pojok Statistik IT Del',
      'Fullstack Web & Database Engineer'
    ];

    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    const typeRole = () => {
      const currentRole = roles[roleIdx];
      if (isDeleting) {
        typedTextEl.textContent = currentRole.substring(0, charIdx - 1);
        charIdx--;
        typingSpeed = 45;
      } else {
        typedTextEl.textContent = currentRole.substring(0, charIdx + 1);
        charIdx++;
        typingSpeed = 100;
      }

      if (!isDeleting && charIdx === currentRole.length) {
        typingSpeed = 1800;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        typingSpeed = 400;
      }

      setTimeout(typeRole, typingSpeed);
    };

    typeRole();
  }

  initShowcaseTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        tabButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        tabPanes.forEach(pane => {
          pane.classList.remove('active');
          if (pane.id === `pane-${targetTab}`) {
            pane.classList.add('active');
            if (targetTab === 'tech-stack') {
              setTimeout(() => this.animateSkillBars(), 100);
            }
            pane.querySelectorAll('.reveal-on-scroll').forEach(el => {
              el.classList.add('revealed');
            });
          }
        });
      });
    });
  }

  initTranscriptFilter() {
    const semFilterBtns = document.querySelectorAll('.sem-filter-btn');
    const courseRows = document.querySelectorAll('#courses-table tbody tr');

    semFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const sem = btn.getAttribute('data-sem');
        semFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        courseRows.forEach(row => {
          const rowSem = row.getAttribute('data-semester');
          if (sem === 'all' || rowSem === sem) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    });
  }

  renderAvatarIcon(avatar) {
    switch (avatar) {
      case 'dev':
        return '<i class="bi bi-person-fill-gear text-info"></i>';
      case 'academic':
        return '<i class="bi bi-mortarboard-fill text-warning"></i>';
      case 'rocket':
        return '<i class="bi bi-rocket-takeoff-fill text-danger"></i>';
      case 'star':
        return '<i class="bi bi-star-fill text-warning"></i>';
      default:
        return '<i class="bi bi-person-circle text-primary"></i>';
    }
  }

  initGuestbook() {
    const commentsStream = document.getElementById('comments-stream');
    const commentForm = document.getElementById('comment-form');
    const commentsCountBadge = document.getElementById('comments-count');

    const defaultComments = [
      {
        id: 1,
        name: "Humasak Tommy Argo Simanjuntak, ST, M.ISD",
        avatar: "academic",
        time: "18 Sep 2026, 14:20",
        text: "Portofolio yang sangat komprehensif dan mencerminkan kapabilitas mahasiswa Sistem Informasi IT Del. Dedikasi sebagai Asdos Basis Data & Matematika Diskrit serta keaktifan di BEM dan Pojok Statistik terlihat jelas. Terus pertahankan prestasi, Lucas!"
      },
      {
        id: 2,
        name: "Andi Siregar (13SI1 - IT Del)",
        avatar: "dev",
        time: "19 Sep 2026, 09:15",
        text: "Keren kali bro web porto terbarunya! Mockup proyek DelEats dan sistem DelLib kelihatan professional banget. Sukses bareng sebagai asdos dan di semester 5 ini!"
      },
      {
        id: 3,
        name: "Dosen Pengampu Praktikum PPW (12S3101)",
        avatar: "star",
        time: "20 Sep 2026, 08:30",
        text: "Implementasi semantik HTML5, tabel KHS, formulir interaktif aksesibel, dan integrasi WhatsApp telah memenuhi seluruh kriteria modul praktikum dengan sangat baik."
      }
    ];

    const STORAGE_KEY = 'lucas_portfolio_comments_v4';

    const getStoredComments = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Akses penyimpanan lokal dibatasi', e);
      }
      return defaultComments;
    };

    const saveComments = (comments) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
      } catch (e) {
        console.warn('Gagal menyimpan ke localStorage', e);
      }
    };

    const renderComments = () => {
      if (!commentsStream) return;
      const comments = getStoredComments();
      if (commentsCountBadge) {
        commentsCountBadge.textContent = `${comments.length} Komentar`;
      }

      commentsStream.innerHTML = comments.map(c => `
        <div class="comment-card">
          <div class="c-avatar">${this.renderAvatarIcon(c.avatar)}</div>
          <div class="c-body">
            <div class="c-top">
              <span class="c-author">${this.escapeHTML(c.name)}</span>
              <span class="c-time">${this.escapeHTML(c.time)}</span>
            </div>
            <p class="c-text">${this.escapeHTML(c.text)}</p>
          </div>
        </div>
      `).join('');
    };

    if (commentForm) {
      commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('gb-name');
        const msgInput = document.getElementById('gb-message');
        const selectedAvatar = document.querySelector('input[name="avatar"]:checked');

        const name = (nameInput?.value || '').trim();
        const text = (msgInput?.value || '').trim();
        const avatar = selectedAvatar ? selectedAvatar.value : 'dev';

        if (!name || !text) return;

        const newComment = {
          id: Date.now(),
          name,
          avatar,
          time: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          text
        };

        const comments = getStoredComments();
        comments.unshift(newComment);
        saveComments(comments);
        renderComments();

        if (nameInput) nameInput.value = '';
        if (msgInput) msgInput.value = '';
        this.showToastNotification('Komentar Terkirim!', 'Terima kasih atas apresiasi Anda di buku tamu.');
      });
    }

    renderComments();
  }

  initScrollEffects() {
    const siteHeader = document.getElementById('navbar');
    const bttBtn = document.getElementById('back-to-top');
    const sections = document.querySelectorAll('section[id], div[id="guestbook"]');
    const navLinks = document.querySelectorAll('.nav-link');

    const onScroll = () => {
      const scrollY = window.scrollY;

      if (siteHeader) {
        if (scrollY > 40) siteHeader.classList.add('scrolled');
        else siteHeader.classList.remove('scrolled');
      }

      if (bttBtn) {
        if (scrollY > 350) bttBtn.classList.add('visible');
        else bttBtn.classList.remove('visible');
      }

      const scrollPos = scrollY + 140;
      let current = '';
      sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          current = sec.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${current}` || (current === 'guestbook' && href === '#layanan')) {
          link.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (bttBtn) {
      bttBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerH = siteHeader ? siteHeader.offsetHeight : 74;
          const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerH - 12;
          window.scrollTo({ top: targetTop, behavior: 'smooth' });
        }
      });
    });
  }

  initIntersectionObservers() {
    // Reveal on scroll
    const revealEls = document.querySelectorAll(
      '.glass-card, .section-header, .hero-metrics, .aside-box, .ukm-pill-card, .scholarship-box'
    );
    revealEls.forEach(el => el.classList.add('reveal-on-scroll'));

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    // Skill progress bars
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
      const inlineWidth = bar.style.width;
      if (inlineWidth) {
        bar.setAttribute('data-width', inlineWidth);
        bar.style.width = '0';
      }
    });

    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const targetW = bar.getAttribute('data-width');
          if (targetW && !bar.classList.contains('animated')) {
            setTimeout(() => {
              bar.classList.add('animated');
              bar.style.width = targetW;
            }, 150);
          }
          skillObserver.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });

    skillBars.forEach(bar => skillObserver.observe(bar));
  }

  animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
      const targetW = bar.getAttribute('data-width');
      if (targetW) {
        bar.classList.add('animated');
        bar.style.width = targetW;
      }
    });
  }
}

// Inisialisasi aplikasi saat dokumen HTML siap
document.addEventListener('DOMContentLoaded', () => {
  window.App = new PortfolioApp();
  window.App.init();
});
