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
})();
