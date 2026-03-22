// Sara Lemaitre — i18n Language Switcher
// Reads data-i18n attributes and swaps text from translations.js
// Language stored in localStorage, defaults to 'en'

(function() {
  'use strict';

  const STORAGE_KEY = 'sl_lang';
  const DEFAULT_LANG = 'en';

  // Detect language: URL param > localStorage > browser language > default
  function detectLang() {
    const urlParam = new URLSearchParams(window.location.search).get('lang');
    if (urlParam === 'fr' || urlParam === 'en') return urlParam;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'fr' || stored === 'en') return stored;
    const browser = (navigator.language || '').toLowerCase();
    if (browser.startsWith('fr')) return 'fr';
    return DEFAULT_LANG;
  }

  // Apply language to all data-i18n elements
  function applyLang(lang) {
    const t = window.SL_TRANSLATIONS;
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const entry = t[key];
      if (!entry) return;
      const text = entry[lang] || entry[DEFAULT_LANG];
      if (!text) return;

      // Handle placeholder attributes
      const attr = el.getAttribute('data-i18n-attr');
      if (attr) {
        el.setAttribute(attr, text);
      } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.setAttribute('placeholder', text);
      } else {
        el.textContent = text;
      }
    });

    // Update html lang attribute
    document.documentElement.setAttribute('lang', lang === 'fr' ? 'fr' : 'en');

    // Update toggle button state
    const toggles = document.querySelectorAll('.lang-toggle');
    toggles.forEach(btn => {
      const t2 = window.SL_TRANSLATIONS['lang.toggle'];
      const aria = window.SL_TRANSLATIONS['lang.toggle.aria'];
      if (t2) btn.textContent = t2[lang] || t2[DEFAULT_LANG];
      if (aria) btn.setAttribute('aria-label', aria[lang] || aria[DEFAULT_LANG]);
      btn.setAttribute('data-current-lang', lang);
    });

    // Store preference
    localStorage.setItem(STORAGE_KEY, lang);
    document.body.setAttribute('data-lang', lang);
  }

  // Toggle between en and fr
  window.SL_toggleLang = function(btn) {
    const current = btn.getAttribute('data-current-lang') || detectLang();
    const next = current === 'en' ? 'fr' : 'en';
    applyLang(next);
  };

  // Init on DOM ready
  function init() {
    const lang = detectLang();
    if (lang !== DEFAULT_LANG) {
      applyLang(lang);
    } else {
      // Still set toggle state
      const toggles = document.querySelectorAll('.lang-toggle');
      toggles.forEach(btn => btn.setAttribute('data-current-lang', DEFAULT_LANG));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
