/* 轻笺官网 交互脚本 —— 零后端、纯静态 */
(function () {
  'use strict';

  var REPO = 'lpf-exclusive/QingJian';
  var FALLBACK_VERSION = '1.3.30';
  var API = 'https://api.github.com/repos/' + REPO + '/releases/latest';

  /* ---------- 主题切换 ---------- */
  var THEME_KEY = 'qj-site-theme';
  var root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var btn = document.getElementById('themeToggle');
    if (btn) btn.setAttribute('aria-label', theme === 'dark' ? '切换到浅色' : '切换到深色');
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (!saved) {
      saved = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark' : 'light';
    }
    applyTheme(saved);
  }

  function bindTheme() {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  /* ---------- 移动端导航 ---------- */
  function bindNav() {
    var burger = document.getElementById('navBurger');
    var links = document.getElementById('navLinks');
    if (!burger || !links) return;
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 版本拉取 ---------- */
  function setVersion(v) {
    var nodes = document.querySelectorAll('#heroVersion, #downloadVersion');
    Array.prototype.forEach.call(nodes, function (n) { n.textContent = v; });
  }

  function assetUrl(assets, re) {
    if (!assets) return null;
    for (var i = 0; i < assets.length; i++) {
      if (re.test(assets[i].name)) return assets[i].browser_download_url;
    }
    return null;
  }

  function fetchLatest() {
    if (!window.fetch) return; // 老浏览器回退静态版本
    fetch(API, { headers: { 'Accept': 'application/vnd.github+json' } })
      .then(function (r) { if (!r.ok) throw new Error('bad status ' + r.status); return r.json(); })
      .then(function (data) {
        var tag = (data.tag_name || '').replace(/^v/i, '');
        if (tag) setVersion(tag);
        var setup = assetUrl(data.assets, /QingJian-Setup-.*\.(exe)$/i);
        var portable = assetUrl(data.assets, /QingJian-Portable-.*\.(exe|zip)$/i);
        if (setup) {
          var hs = document.getElementById('heroDownload');
          var ds = document.getElementById('dlSetup');
          if (hs) hs.href = setup;
          if (ds) ds.href = setup;
        }
        if (portable) {
          var dp = document.getElementById('dlPortable');
          if (dp) dp.href = portable;
        }
      })
      .catch(function () { /* 静默回退到静态 v1.3.29 */ });
  }

  /* ---------- 初始化 ---------- */
  function init() {
    initTheme();
    bindTheme();
    bindNav();
    fetchLatest();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
