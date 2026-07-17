/* ============================================================
   新宸企业服务 - 公共组件加载器
   自动注入 Header / Footer，修改一次全站同步
   ============================================================ */

(function() {
  'use strict';

  // 根据当前页面 URL 设置导航 active 状态
  function setActiveNav() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    var navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(function(link) {
      var href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  // 加载公共组件
  function loadComponent(url, targetId) {
    return fetch(url)
      .then(function(response) {
        if (!response.ok) throw new Error('Failed to load ' + url);
        return response.text();
      })
      .then(function(html) {
        var target = document.getElementById(targetId);
        if (target) {
          target.innerHTML = html;
        }
      });
  }

  // 动态加载 main.js
  function loadMainScript() {
    var script = document.createElement('script');
    script.src = 'js/main.js';
    document.body.appendChild(script);
  }

  // 主流程：加载组件 → 注入 DOM → 设置 active → 加载 main.js
  Promise.all
   loadComponent('components/footer.html', 'site-footer')
  .then(function() {
    setActiveNav();
    loadMainScript();
  }).catch(function(err) {
    console.error('Component load error:', err);
    // 即使组件加载失败，仍然尝试加载 main.js 以保证其他功能正常
    loadMainScript();
  });

})();
