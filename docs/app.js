/* 轻笺官网 交互脚本 —— 零后端、纯静态 */
(function () {
  'use strict';

  var REPO = 'lpf-exclusive/QingJian';
  var API = 'https://api.github.com/repos/' + REPO + '/releases/latest';
  // 版本号与下载直链一律在运行时取自 GitHub Releases，本文件不写死任何版本。
  // 不读 releases/latest/download/latest.json 直链：它走 objects CDN，实测有
  // 504 / 502 抖动且拿不到稳定 CORS 头；api.github.com 明确 ACAO:*，且返回
  // 同一份发布事实（tag_name + assets.browser_download_url）。
  // 拉取失败时保留 HTML 里的「最新版」占位与 releases/latest 页面链接，
  // 绝不回退到写死的旧版本号或旧安装包。

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
  // 接收完整版本标签（形如 v2.x）；未取到数据时 HTML 占位为「最新版」
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

  // 体积同样取自 Release 资产（GitHub API 的 assets[].size），不写死 MB 数字
  function assetSizeMB(assets, re) {
    if (!assets) return null;
    for (var i = 0; i < assets.length; i++) {
      var a = assets[i];
      if (re.test(a.name) && typeof a.size === 'number' && a.size > 0) {
        return Math.max(1, Math.ceil(a.size / 1048576));
      }
    }
    return null;
  }

  function setSize(id, mb) {
    if (!mb) return; // 取不到就保留 HTML 里的「数 MB 量级」占位
    var n = document.getElementById(id);
    if (n) n.textContent = '约 ' + mb + ' MB';
  }

  function fetchLatest() {
    if (!window.fetch) return; // 老浏览器：保留「最新版」占位与 Releases 页链接
    // cache-buster：releases/latest 同一 URL 可能返缓存旧值（此前发版时踩过）
    window.fetch(API + '?_cb=' + Date.now(), { headers: { 'Accept': 'application/vnd.github+json' } })
      .then(function (r) { if (!r.ok) throw new Error('bad status ' + r.status); return r.json(); })
      .then(function (data) {
        var tag = data.tag_name || '';
        if (tag) setVersion(/^v/i.test(tag) ? tag : 'v' + tag);
        var setup = assetUrl(data.assets, /QingJian_.*_x64-setup\.(exe)$/i);
        if (setup) {
          var hs = document.getElementById('heroDownload');
          var ds = document.getElementById('dlSetup');
          if (hs) hs.href = setup;
          if (ds) ds.href = setup;
        }
        var deb = assetUrl(data.assets, /QingJian_.*_amd64\.(deb)$/i);
        if (deb) {
          var dl = document.getElementById('dlLinux');
          if (dl) dl.href = deb;
        }
        setSize('heroWinSize', assetSizeMB(data.assets, /QingJian_.*_x64-setup[.]exe$/i));
        setSize('heroDebSize', assetSizeMB(data.assets, /QingJian_.*_amd64[.]deb$/i));
      })
      .catch(function (err) {
        // 失败要出声；页面仍可用：按钮指向永远有效的 releases/latest 页面
        if (window.console && console.warn) {
          console.warn('[QingJian] 最新版本获取失败，已保留 Releases 页链接：',
            err && err.message ? err.message : err);
        }
      });
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
