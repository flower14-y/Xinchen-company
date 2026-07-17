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

  // === Image Carousel — clean crossfade, no black screen ===
  function initCarousel() {
    document.querySelectorAll('.carousel').forEach(function(carousel) {
      var slides = carousel.querySelectorAll('.carousel-slide');
      var prevBtn = carousel.querySelector('.carousel-prev');
      var nextBtn = carousel.querySelector('.carousel-next');
      var dots = carousel.querySelectorAll('.carousel-dot');
      var current = 0, total = slides.length, interval, transitioning = false;
      if (total < 2) return;

      // 预加载并解码所有图片，确保 GPU 纹理就绪
      function preloadImages(callback) {
        var pending = total;
        function done() { pending--; if (pending <= 0) callback(); }
        slides.forEach(function(slide) {
          var img = slide.querySelector('img');
          if (!img) { done(); return; }
          if (img.complete && img.naturalWidth > 0) {
            img.decode().then(done, done);
          } else {
            img.addEventListener('load', function() { img.decode().then(done, done); }, { once: true });
            img.addEventListener('error', done, { once: true });
          }
        });
        if (pending <= 0) callback();
      }

      // 核心切换逻辑：crossfade 过渡，绝不露出背景
      function goTo(idx) {
        if (idx === current || transitioning) return;
        transitioning = true;

        var leavingSlide  = slides[current];
        var enteringSlide = slides[idx];
        var dur = 800; // 与 CSS transition 时长保持一致

        // ---- Phase 1: 将新幻灯片置于顶层，完全透明，关闭过渡 ----
        enteringSlide.style.transition = 'none';
        enteringSlide.style.opacity    = '0';
        enteringSlide.style.zIndex     = '2';

        // 强制浏览器计算当前样式，锁定 opacity:0 的渲染状态
        window.getComputedStyle(enteringSlide).opacity;

        // ---- Phase 2: 同时启动两个幻灯片的 opacity 过渡（crossfade）----
        enteringSlide.style.transition = 'opacity ' + dur + 'ms cubic-bezier(0.4, 0, 0.2, 1)';
        leavingSlide.style.transition  = 'opacity ' + dur + 'ms cubic-bezier(0.4, 0, 0.2, 1)';

        enteringSlide.style.opacity = '1';  // 0 → 1 淡入
        leavingSlide.style.opacity  = '0';  // 1 → 0 淡出

        // 立即更新指示点
        dots.forEach(function(d, i) { d.classList.toggle('active', i === idx); });

        // ---- Phase 3: 过渡完成后清理内联样式，交还 CSS class 控制 ----
        var cleaned = false;
        function cleanup() {
          if (cleaned) return;
          cleaned = true;
          transitioning = false;

          leavingSlide.style.transition = '';
          leavingSlide.style.opacity    = '';
          leavingSlide.style.zIndex     = '';
          leavingSlide.classList.remove('active');

          enteringSlide.style.transition = '';
          enteringSlide.style.opacity    = '';
          enteringSlide.style.zIndex     = '';
          enteringSlide.classList.add('active');
        }

        enteringSlide.addEventListener('transitionend', cleanup, { once: true });
        setTimeout(cleanup, dur + 200);

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

      // 全部图片解码完成后启动自动轮播
      preloadImages(function() { startAuto(); });
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

  // === Scroll Reveal — Intersection Observer 滚动渐入 ===
  function initScrollReveal() {
    var revealEls = document.querySelectorAll('.reveal, .reveal-img');
    if (!revealEls.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    revealEls.forEach(function(el) { observer.observe(el); });
  }

  // === Lazy-load contact map iframe — 避免页面切换黑屏 ===
  function initMapLazyLoad() {
    var iframe = document.querySelector('.contact-map iframe[data-src]');
    if (!iframe) return;
    var src = iframe.getAttribute('data-src');
    var loaded = false;
    // 视口进入时加载
    var observer = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting && !loaded) {
        loaded = true;
        iframe.src = src;
        iframe.removeAttribute('data-src');
        observer.unobserve(iframe);
      }
    }, { threshold: 0.05 });
    observer.observe(iframe);
  }

  // === Init (supports both direct-include and dynamic-load) ===
  function initAll() {
    initMobileMenu();
    initHeaderScroll();
    initActiveNav();
    initCarousel();
    initLightbox();
    initSmoothScroll();
    initScrollReveal();
    initMapLazyLoad();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
