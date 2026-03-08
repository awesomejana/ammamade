/**
 * Amma Made — Site interactions, scroll animations, parallax, 3D glass tilt
 */

(function () {
  'use strict';

  // ----- Theme selector -----
  const themeSelect = document.getElementById('theme-select');
  const THEME_KEY = 'ammamade-theme';

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme && theme !== 'light') {
      root.setAttribute('data-theme', theme);
    } else {
      root.removeAttribute('data-theme');
    }
    if (themeSelect) themeSelect.value = theme || 'light';
    try { localStorage.setItem(THEME_KEY, theme || 'light'); } catch (e) {}
  }

  if (themeSelect) {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved) applyTheme(saved);
    } catch (e) {}
    themeSelect.addEventListener('change', function () {
      applyTheme(this.value);
    });
  }

  // ----- Header scroll state -----
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      header.classList.toggle('scrolled', y > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ----- Mobile nav toggle -----
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const open = navList.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    navList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navList.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
        document.body.style.overflow = '';
      });
    });
  }

  // ----- Parallax: hero background container moves slower (image keeps Ken Burns) -----
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroBgContainer = document.querySelector('.hero-bg');
  if (heroBgContainer && !prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY || window.pageYOffset;
      const vh = window.innerHeight;
      if (y <= vh) {
        heroBgContainer.style.transform = `translate3d(0, ${y * 0.2}px, 0)`;
      }
    }, { passive: true });
  }

  // ----- 3D tilt on hero glass panel (mouse move) -----
  const tiltPanel = document.querySelector('.hero-glass-panel[data-tilt]');
  if (tiltPanel && !prefersReducedMotion) {
    const maxTilt = 8;
    const smooth = 0.15;
    let currentX = 0, currentY = 0, targetX = 0, targetY = 0;

    tiltPanel.addEventListener('mouseenter', () => tiltPanel.classList.add('is-tilt-active'));
    tiltPanel.addEventListener('mouseleave', () => {
      tiltPanel.classList.remove('is-tilt-active');
      targetX = 0;
      targetY = 0;
    });

    tiltPanel.addEventListener('mousemove', (e) => {
      const rect = tiltPanel.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const x = (e.clientX - rect.left) / w - 0.5;
      const y = (e.clientY - rect.top) / h - 0.5;
      targetX = -y * maxTilt;
      targetY = x * maxTilt;
    });

    function animateTilt() {
      currentX += (targetX - currentX) * smooth;
      currentY += (targetY - currentY) * smooth;
      tiltPanel.style.transform = `rotateX(${currentX}deg) rotateY(${currentY}deg)`;
      requestAnimationFrame(animateTilt);
    }
    animateTilt();
  }

  // ----- Scroll-triggered animations -----
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.08
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));

  // ----- Hero: staggered reveal on load -----
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    const items = heroContent.querySelectorAll('.animate-in');
    items.forEach((el, i) => {
      el.classList.add(`delay-${Math.min(i + 1, 4)}`);
    });
    requestAnimationFrame(() => {
      items.forEach(el => el.classList.add('is-visible'));
    });
  }

  // ----- Footer year -----
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ----- Impact slider: update output, KPIs, and description -----
  function initImpactSlider() {
    const impactSlider = document.getElementById('impact-slider');
    const impactOutput = document.getElementById('impact-slider-value');
    const impactDescN = document.getElementById('impact-desc-n');
    const impactDescFamily = document.getElementById('impact-desc-family');
    const kpiFamily = document.getElementById('kpi-family');
    const kpiEducation = document.getElementById('kpi-education');
    const kpiMeals = document.getElementById('kpi-meals');
    const kpiCommunities = document.getElementById('kpi-communities');

    function formatNum(n) {
      return n.toLocaleString('en-IN');
    }

    function updateImpactSlider() {
      if (!impactSlider) return;
      const n = parseInt(impactSlider.value, 10);
      const family = n * 4;
      const education = Math.round(n * 2);
      const meals = Math.round(n * 4.5);
      const communities = Math.max(1, Math.round(n / 50));

      if (impactOutput) impactOutput.textContent = formatNum(n);
      if (kpiFamily) kpiFamily.textContent = formatNum(family);
      if (kpiEducation) kpiEducation.textContent = formatNum(education);
      if (kpiMeals) kpiMeals.textContent = formatNum(meals);
      if (kpiCommunities) kpiCommunities.textContent = formatNum(communities);
      if (impactDescN) impactDescN.textContent = formatNum(n);
      if (impactDescFamily) impactDescFamily.textContent = formatNum(family);
    }

    if (impactSlider) {
      impactSlider.addEventListener('input', updateImpactSlider);
      impactSlider.addEventListener('change', updateImpactSlider);
      updateImpactSlider();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImpactSlider);
  } else {
    initImpactSlider();
  }

  // ----- Smooth scroll for anchor links -----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ----- Back to top (floating arrow, bottom right) -----
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    const showAfter = 400;
    const onScrollTop = () => {
      const y = window.scrollY || window.pageYOffset;
      backToTop.classList.toggle('is-visible', y > showAfter);
    };
    window.addEventListener('scroll', onScrollTop, { passive: true });
    onScrollTop();
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }

  // ----- Access log (client-side: store current visit for admin) -----
  const ACCESS_LOG_KEY = 'ammamade-access-log';
  const LOG_MAX = 500;

  function getISTHHMMYEAR() {
    const d = new Date();
    const parts = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',
      hour12: false
    }).formatToParts(d);
    const hour = parts.find(p => p.type === 'hour').value.padStart(2, '0');
    const minute = parts.find(p => p.type === 'minute').value.padStart(2, '0');
    const year = parts.find(p => p.type === 'year').value;
    return hour + minute + year;
  }

  function getISTString() {
    return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  }

  function getAccessLog() {
    try {
      const raw = localStorage.getItem(ACCESS_LOG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function appendAccessLog(entry) {
    const log = getAccessLog();
    log.push(entry);
    const trimmed = log.slice(-LOG_MAX);
    try {
      localStorage.setItem(ACCESS_LOG_KEY, JSON.stringify(trimmed));
    } catch (e) {}
  }

  // On load: record this visit (IP fetched async)
  (function recordVisit() {
    const timeIST = getISTString();
    const userAgent = navigator.userAgent || '';
    const referrer = document.referrer || '';
    let ip = '—';
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(data => {
        ip = data.ip || ip;
        appendAccessLog({ ip, timeIST, userAgent, referrer });
      })
      .catch(() => {
        appendAccessLog({ ip: '—', timeIST, userAgent, referrer });
      });
  })();

  // ----- Admin: hidden key opens popup, password IST HHMMYEAR -----
  const adminKeyBtn = document.getElementById('admin-key-btn');
  const adminPopup = document.getElementById('admin-popup');
  const adminAuth = document.getElementById('admin-auth');
  const adminDashboard = document.getElementById('admin-dashboard');
  const adminForm = document.getElementById('admin-form');
  const adminPassword = document.getElementById('admin-password');
  const adminAuthError = document.getElementById('admin-auth-error');
  const adminClose = document.getElementById('admin-close');

  function openAdminPopup() {
    if (!adminPopup) return;
    adminPopup.setAttribute('aria-hidden', 'false');
    adminPopup.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    adminAuth.hidden = false;
    adminDashboard.hidden = true;
    if (adminPassword) {
      adminPassword.value = '';
      adminPassword.focus();
    }
    if (adminAuthError) adminAuthError.textContent = '';
  }

  function closeAdminPopup() {
    if (!adminPopup) return;
    adminPopup.setAttribute('aria-hidden', 'true');
    adminPopup.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function showAdminDashboard() {
    adminAuth.hidden = true;
    adminDashboard.hidden = false;
    if (adminAuthError) adminAuthError.textContent = '';

    const log = getAccessLog();
    const uniqueIPs = new Set(log.map(e => e.ip)).size;
    const todayStart = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    const todayCount = log.filter(e => {
      const d = e.timeIST ? e.timeIST.split(',')[0] : '';
      return d === todayStart;
    }).length;

    const kpiPageviews = document.getElementById('kpi-pageviews');
    const kpiUnique = document.getElementById('kpi-unique');
    const kpiToday = document.getElementById('kpi-today');
    if (kpiPageviews) kpiPageviews.textContent = log.length;
    if (kpiUnique) kpiUnique.textContent = uniqueIPs;
    if (kpiToday) kpiToday.textContent = todayCount;

    const tbody = document.getElementById('admin-table-body');
    if (tbody) {
      tbody.innerHTML = '';
      const reversed = log.slice().reverse();
      reversed.forEach((entry, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML =
          '<td>' + (reversed.length - i) + '</td>' +
          '<td>' + escapeHtml(entry.ip || '—') + '</td>' +
          '<td>' + escapeHtml(entry.timeIST || '—') + '</td>' +
          '<td title="' + escapeHtml(entry.userAgent || '') + '">' + escapeHtml(truncate(entry.userAgent || '—', 40)) + '</td>' +
          '<td title="' + escapeHtml(entry.referrer || '') + '">' + escapeHtml(truncate(entry.referrer || '—', 30)) + '</td>';
        tbody.appendChild(tr);
      });
    }
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function truncate(s, len) {
    if (s.length <= len) return s;
    return s.slice(0, len) + '…';
  }

  if (adminKeyBtn) {
    adminKeyBtn.addEventListener('click', openAdminPopup);
  }

  if (adminForm) {
    adminForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const expected = getISTHHMMYEAR();
      const entered = (adminPassword && adminPassword.value.trim()) || '';
      if (entered === expected) {
        showAdminDashboard();
      } else {
        if (adminAuthError) {
          adminAuthError.textContent = 'Incorrect. Current IST (HHMMYEAR): ' + expected;
        }
      }
    });
  }

  if (adminPopup && adminPopup.querySelector('.admin-popup-backdrop')) {
    adminPopup.querySelector('.admin-popup-backdrop').addEventListener('click', closeAdminPopup);
  }

  if (adminClose) {
    adminClose.addEventListener('click', closeAdminPopup);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && adminPopup && adminPopup.classList.contains('is-open')) {
      closeAdminPopup();
    }
  });
})();
