/* =========================================================
   LUCAS PARDEDE — INTERACTIVE SCRIPTS (script.js)
   Institut Teknologi Del · S1 Sistem Informasi
   FINALISASI: Scroll Animations, Skill Bar, Header Effect
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. DYNAMIC TYPEWRITER EFFECT IN HERO ---
  const typedTextEl = document.getElementById('typed-text');
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

  function typeRole() {
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
  }

  if (typedTextEl) {
    typeRole();
  }


  // --- 2. TAB SWITCHER (PROJECTS, EXPERIENCE, CERTIFICATES, TECH STACK) ---
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
          // Re-trigger skill bar animation if tech-stack tab opened
          if (targetTab === 'tech-stack') {
            setTimeout(() => animateVisibleSkillBars(), 100);
          }
          // Re-trigger reveal animations in the newly visible tab
          pane.querySelectorAll('.reveal-on-scroll').forEach(el => {
            el.classList.add('revealed');
          });
        }
      });
    });
  });


  // --- 3. FILTER SEMESTER TABEL TRANSKRIP MATA KULIAH ---
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


  // --- 4. INTERACTIVE GUESTBOOK & COMMENTS SYSTEM ---
  const commentsStream = document.getElementById('comments-stream');
  const commentForm = document.getElementById('comment-form');
  const commentsCountBadge = document.getElementById('comments-count');

  const defaultComments = [
    {
      id: 1,
      name: "Humasak Tommy Argo Simanjuntak, ST, M.ISD",
      avatar: "👨‍🏫",
      time: "18 Sep 2026, 14:20",
      text: "Portofolio yang sangat komprehensif dan mencerminkan kapabilitas mahasiswa Sistem Informasi IT Del. Dedikasi sebagai Asdos Basis Data & Matematika Diskrit serta keaktifan di BEM dan Pojok Statistik terlihat jelas. Terus pertahankan prestasi, Lucas!"
    },
    {
      id: 2,
      name: "Andi Siregar (13SI1 - IT Del)",
      avatar: "👨‍💻",
      time: "19 Sep 2026, 09:15",
      text: "Keren kali bro web porto terbarunya! Mockup proyek DelEats dan sistem DelLib kelihatan professional banget. Sukses bareng sebagai asdos dan di semester 5 ini! 🔥"
    },
    {
      id: 3,
      name: "Dosen Pengampu Praktikum PPW (12S3101)",
      avatar: "👩‍🎓",
      time: "20 Sep 2026, 08:30",
      text: "Implementasi semantik HTML5, tabel KHS, formulir interaktif aksesibel, dan integrasi WhatsApp telah memenuhi seluruh kriteria modul praktikum minggu 02 dengan sangat baik. Finalisasi desain glassmorphism juga sangat impresif."
    }
  ];

  function getStoredComments() {
    try {
      const stored = localStorage.getItem('lucas_portfolio_comments_v2');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Akses penyimpanan lokal dibatasi", e);
    }
    return defaultComments;
  }

  function saveComments(comments) {
    try {
      localStorage.setItem('lucas_portfolio_comments_v2', JSON.stringify(comments));
    } catch (e) {
      console.warn("Gagal menyimpan ke localStorage", e);
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatCurrentDate() {
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const day = String(now.getDate()).padStart(2, '0');
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${mins}`;
  }

  function renderComments(highlightFirst = false) {
    if (!commentsStream) return;
    const comments = getStoredComments();

    if (commentsCountBadge) {
      commentsCountBadge.textContent = `${comments.length} Komentar`;
    }

    commentsStream.innerHTML = comments.map((c, idx) => `
      <div class="comment-card${highlightFirst && idx === 0 ? ' new-comment' : ''}">
        <div class="c-avatar">${escapeHTML(c.avatar || '👨‍💻')}</div>
        <div class="c-body">
          <div class="c-top">
            <span class="c-author">${escapeHTML(c.name)}</span>
            <span class="c-time">${escapeHTML(c.time)}</span>
          </div>
          <p class="c-text">${escapeHTML(c.text)}</p>
        </div>
      </div>
    `).join('');
  }

  if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('gb-name');
      const msgInput = document.getElementById('gb-message');
      const selectedAvatar = document.querySelector('input[name="avatar"]:checked');

      const name = nameInput.value.trim();
      const text = msgInput.value.trim();
      const avatar = selectedAvatar ? selectedAvatar.value : '👨‍💻';

      if (!name || !text) return;

      const newComment = {
        id: Date.now(),
        name: name,
        avatar: avatar,
        time: formatCurrentDate(),
        text: text
      };

      const comments = getStoredComments();
      comments.unshift(newComment);
      saveComments(comments);
      renderComments(true);

      nameInput.value = '';
      msgInput.value = '';
      commentsStream.scrollTop = 0;

      showToast('Komentar Terkirim! 💬', 'Terima kasih atas apresiasi Anda di buku tamu portofolio Lucas Pardede.');
    });
  }

  renderComments();


  // --- 5. FORMULIR LAYANAN KONSULTASI KE LUCAS PARDEDE (Bootstrap 5 Validation) ---
  const serviceForm = document.getElementById('contact-form');
  if (serviceForm) {
    serviceForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Bootstrap 5 Native Constraint Validation Check
      if (!serviceForm.checkValidity()) {
        e.stopPropagation();
        serviceForm.classList.add('was-validated');
        showToast('Form Belum Lengkap ⚠️', 'Silakan lengkapi seluruh kolom yang bertanda bintang (*) sesuai format yang diminta.');
        return;
      }

      serviceForm.classList.add('was-validated');

      const name = (document.getElementById('floatingName') || document.getElementById('nama'))?.value.trim() || '';
      const email = (document.getElementById('floatingEmail') || document.getElementById('email'))?.value.trim() || '';
      const phone = (document.getElementById('floatingPhone') || document.getElementById('telepon'))?.value.trim() || '';
      const selectedService = document.querySelector('input[name="layanan"]:checked');
      const serviceText = selectedService ? selectedService.nextElementSibling.textContent.trim() : 'Konsultasi TI';
      const topicEl = document.getElementById('floatingCategory') || document.getElementById('topik');
      const topic = topicEl ? topicEl.options[topicEl.selectedIndex].text : '';
      const duration = document.getElementById('floatingDuration')?.value || '45';
      const date = document.getElementById('floatingDate')?.value || '-';
      const message = (document.getElementById('floatingMessage') || document.getElementById('pesan'))?.value.trim() || '';

      showToast('Permohonan Terkirim! ✅', `Pengajuan konsultasi "${serviceText}" dari ${name} diterima. Membuka WhatsApp Lucas...`);

      const waText = encodeURIComponent(
        `Halo Lucas Pardede!\n\nSaya ingin berkonsultasi mengenai:\n• Kategori: ${serviceText}\n• Pemohon: ${name}\n• Email: ${email}\n• WhatsApp: ${phone}\n• Topik Matkul: ${topic}\n• Durasi: ${duration} menit\n• Rencana Pertemuan: ${date}\n• Detail Pertanyaan:\n"${message}"\n\nMohon konfirmasi ketersediaan jadwalnya. Terima kasih!`
      );

      setTimeout(() => {
        window.open(`https://wa.me/6285932521713?text=${waText}`, '_blank');
      }, 1200);

      serviceForm.reset();
      serviceForm.classList.remove('was-validated');
    });
  }


  // --- 6. TOAST NOTIFICATION UTILITY ---
  const toastEl = document.getElementById('toast-notify');
  const toastTitle = document.getElementById('toast-title');
  const toastDesc = document.getElementById('toast-desc');
  let toastTimer = null;

  function showToast(title, desc) {
    if (!toastEl) return;
    if (toastTitle) toastTitle.textContent = title;
    if (toastDesc) toastDesc.textContent = desc;

    toastEl.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 4500);
  }


  // --- 7. MOBILE NAVIGATION & BOOTSTRAP COLLAPSE INTEGRATION ---
  const navbarContent = document.getElementById('navbarContent');
  const navLinks = document.querySelectorAll('.nav-link, .lab-badge-nav, .nav-cta-btn');

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


  // --- 8. SCROLL-BASED EFFECTS (Header, Back-to-Top, Nav Active Highlight) ---
  const siteHeader = document.getElementById('navbar');
  const bttBtn = document.getElementById('back-to-top');
  const sections = document.querySelectorAll('section[id], div[id="guestbook"]');

  function onScroll() {
    const scrollY = window.scrollY;

    // Header scrolled state
    if (siteHeader) {
      if (scrollY > 40) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }

    // Back-to-top button visibility
    if (bttBtn) {
      if (scrollY > 350) {
        bttBtn.classList.add('visible');
      } else {
        bttBtn.classList.remove('visible');
      }
    }

    // Active nav link highlight based on scroll position
    let current = '';
    const scrollPos = scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${current}`) {
        link.classList.add('active');
      }
      // Special case: guestbook section is inside layanan section
      if (current === 'guestbook' && href === '#layanan') {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run on load

  if (bttBtn) {
    bttBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  // --- 9. INTERSECTION OBSERVER: SCROLL REVEAL ANIMATIONS ---
  const revealEls = document.querySelectorAll(
    '.glass-card, .section-header, .hero-metrics, .aside-box, .ukm-pill-card, .scholarship-box'
  );

  revealEls.forEach((el, idx) => {
    el.classList.add('reveal-on-scroll');
    // Stagger delay based on position within parent
    const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal-on-scroll'));
    const sibIdx = siblings.indexOf(el);
    if (sibIdx === 1) el.classList.add('delay-1');
    else if (sibIdx === 2) el.classList.add('delay-2');
    else if (sibIdx === 3) el.classList.add('delay-3');
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target); // Only animate once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    revealObserver.observe(el);
  });


  // --- 10. SKILL BAR ANIMATION VIA INTERSECTION OBSERVER ---
  const skillBars = document.querySelectorAll('.skill-progress');

  // Save target widths from inline styles, then reset to 0
  skillBars.forEach(bar => {
    const inlineWidth = bar.style.width;
    if (inlineWidth) {
      bar.setAttribute('data-width', inlineWidth);
      bar.style.setProperty('--target-width', inlineWidth);
      bar.style.width = '0';
    }
  });

  function animateVisibleSkillBars() {
    skillBars.forEach(bar => {
      const targetW = bar.getAttribute('data-width');
      if (targetW && !bar.classList.contains('animated')) {
        const rect = bar.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          bar.classList.add('animated');
          bar.style.width = targetW;
        }
      }
    });
  }

  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const targetW = bar.getAttribute('data-width');
        if (targetW && !bar.classList.contains('animated')) {
          // Small delay for visual polish
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


  // --- 11. HERO SECTION: METRIC COUNTER ANIMATION ---
  const metricNums = document.querySelectorAll('.metric-num');
  const metricObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        metricObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  metricNums.forEach(el => metricObserver.observe(el));


  // --- 12. DOWNLOAD / PRINT PORTFOLIO HANDLER ---
  const downloadCvBtn = document.getElementById('btn-download-cv');
  if (downloadCvBtn) {
    downloadCvBtn.addEventListener('click', () => {
      showToast('Menyiapkan PDF...', 'Dialog cetak browser dibuka. Simpan sebagai PDF untuk mendapatkan portofolio dalam format dokumen.');
      setTimeout(() => window.print(), 600);
    });
  }


  // --- 13. SMOOTH ANCHOR NAVIGATION (Enhanced) ---
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


  // --- 14. KEYBOARD ACCESSIBILITY: ESCAPE CLOSES MOBILE NAV ---
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const navbarCollapse = document.getElementById('navbarContent');
      if (navbarCollapse && typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse && navbarCollapse.classList.contains('show')) {
          bsCollapse.hide();
        }
      }
    }
  });

});
