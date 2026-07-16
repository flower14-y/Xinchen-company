/* ============================================================
   新宸企业服务 - 全局交互脚本 v2
   ============================================================ */

(function() {
  'use strict';

  // === Mobile Menu Toggle ===
  function initMobileMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var nav = document.querySelector('.main-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function() {
      var isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
      var spans = toggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });

    nav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() { nav.classList.remove('open'); toggle.click(); });
    });
  }

  // === Header Scroll ===
  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    window.addEventListener('scroll', function() {
      header.classList.toggle('scrolled', window.scrollY > 10);
    });
  }

  // === Active Nav ===
  function initActiveNav() {
    var current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav a').forEach(function(link) {
      if (link.getAttribute('href') === current || (current === '' && link.getAttribute('href') === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  // === Image Carousel ===
  function initCarousel() {
    document.querySelectorAll('.carousel').forEach(function(carousel) {
      var slides = carousel.querySelectorAll('.carousel-slide');
      var prevBtn = carousel.querySelector('.carousel-prev');
      var nextBtn = carousel.querySelector('.carousel-next');
      var dots = carousel.querySelectorAll('.carousel-dot');
      var current = 0, total = slides.length, interval;
      if (total < 2) return;

      function goTo(idx) {
        slides.forEach(function(s, i) { s.classList.toggle('active', i === idx); });
        dots.forEach(function(d, i) { d.classList.toggle('active', i === idx); });
        current = idx;
      }
      function next() { goTo((current + 1) % total); }
      function prev() { goTo((current - 1 + total) % total); }
      function startAuto() { stopAuto(); interval = setInterval(next, 4000); }
      function stopAuto() { clearInterval(interval); }

      if (prevBtn) prevBtn.addEventListener('click', function() { prev(); startAuto(); });
      if (nextBtn) nextBtn.addEventListener('click', function() { next(); startAuto(); });
      dots.forEach(function(dot) {
        dot.addEventListener('click', function() { goTo(parseInt(dot.getAttribute('data-index'), 10)); startAuto(); });
      });

      var touchStartX = 0;
      carousel.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; });
      carousel.addEventListener('touchend', function(e) {
        var diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); startAuto(); }
      });
      carousel.addEventListener('mouseenter', stopAuto);
      carousel.addEventListener('mouseleave', startAuto);
      startAuto();
    });
  }

  // === Lightbox ===
  function initLightbox() {
    // Create overlay once
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = '<button class="lightbox-close" aria-label="关闭">&times;</button><img src="" alt="">';
    document.body.appendChild(overlay);

    var img = overlay.querySelector('img');
    var closeBtn = overlay.querySelector('.lightbox-close');

    function open(src) {
      img.src = src;
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      img.src = '';
    }

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay || e.target === closeBtn) close();
    });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') close(); });

    // Attach to all images with data-lightbox
    document.addEventListener('click', function(e) {
      var el = e.target.closest('img[data-lightbox]');
      if (el) open(el.getAttribute('data-lightbox') || el.src);
    });
  }

  // === Smooth Scroll ===
  function initSmoothScroll() {
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var target = document.querySelector(link.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  }

  // === Init (supports both direct-include and dynamic-load) ===
  function initAll() {
    initMobileMenu();
    initHeaderScroll();
    initActiveNav();
    initCarousel();
    initLightbox();
    initSmoothScroll();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
