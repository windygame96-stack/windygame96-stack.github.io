/* Fixed, build-time English UI dictionary. No translation service or visitor-data upload. */
(() => {
  'use strict';
  const routes = ['/tests', '/life-drive', '/relationship-fit', '/shared-black-cat', '/boss-translator', '/learning-workshop'];
  if (!routes.some((route) => location.pathname === route || location.pathname.startsWith(route + '/'))) return;
  const dictionary = WENDI_PRODUCT_ENGLISH;
  const safeShort = new Set(['返回', '保存', '取消', '继续', '开始', '提交', '确认', '删除', '关闭', '复制', '跳过', '需求', '边界', '协商', '自主', '精进', '创造', '探索', '归属', '贡献', '成就', '安全', '房间', '进入', '留下', '摸摸', '对方']);
  const keys = Object.keys(dictionary).filter((key) => key.length >= 2 || safeShort.has(key)).sort((a, b) => b.length - a.length);
  const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = new RegExp(keys.map(escape).join('|'), 'g');
  const originals = new WeakMap();
  const attributes = new WeakMap();
  const skip = 'script,style,noscript,textarea,code,pre,[contenteditable="true"],[data-user-content="true"],.rf-report blockquote';
  let language;
  try { language = new URLSearchParams(location.search).get('lang') || localStorage.getItem('wendi-language'); } catch {}
  if (!['zh', 'en'].includes(language)) language = navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  const translate = (value) => {
    const trimmed = value.trim();
    const exact = dictionary[trimmed];
    if (exact) return value.replace(trimmed, exact);
    return value.replace(parts, (match) => ` ${dictionary[match]} `).replace(/ {2,}/g, ' ');
  };
  window.WendiProductLocale = { translate };
  const translatedValue = (node, value) => {
    const previous = originals.get(node);
    const original = previous && previous.translated === value ? previous.original : value;
    const result = language === 'en' ? translate(original) : original;
    originals.set(node, { original, translated: result });
    return result;
  };
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; apply(); });
  });
  function apply() {
    if (!document.body) return;
    observer.disconnect();
    language = document.documentElement.lang.startsWith('en') ? 'en' : 'zh';
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.parentElement || node.parentElement.closest(skip) || node.parentElement.closest('#wendi-product-language')) continue;
      const next = translatedValue(node, node.data);
      if (node.data !== next) node.data = next;
    }
    for (const element of document.querySelectorAll('[placeholder],[aria-label],[title]')) {
      if (element.closest('[data-user-content="true"],[contenteditable="true"]')) continue;
      let saved = attributes.get(element);
      if (!saved) { saved = {}; attributes.set(element, saved); }
      for (const name of ['placeholder', 'aria-label', 'title']) {
        if (!element.hasAttribute(name)) continue;
        const value = element.getAttribute(name);
        const previous = saved[name];
        const original = previous && previous.translated === value ? previous.original : value;
        const next = language === 'en' ? translate(original) : original;
        saved[name] = { original, translated: next };
        if (next !== value) element.setAttribute(name, next);
      }
    }
    const title = translatedValue(document, document.title);
    if (document.title !== title) document.title = title;
    let button = document.getElementById('wendi-product-language');
    if (!button) {
      button = document.createElement('button'); button.id = 'wendi-product-language'; button.type = 'button';
      button.style.cssText = 'position:fixed;right:20px;bottom:max(20px,env(safe-area-inset-bottom));z-index:9999;min-height:44px;padding:10px 18px;border:1px solid #171713;border-radius:99px;background:#d9ff43;color:#171713;font:600 14px/1.4 sans-serif;box-shadow:0 4px 18px #0002;cursor:pointer';
      button.onclick = () => {
        language = language === 'en' ? 'zh' : 'en';
        try { localStorage.setItem('wendi-language', language); } catch {}
        const url = new URL(location.href); url.searchParams.set('lang', language); history.replaceState(null, '', url);
        document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
        window.dispatchEvent(new CustomEvent('wendi-language-change', { detail: language }));
        apply();
      };
      document.body.appendChild(button);
    }
    button.hidden = Boolean(document.querySelector('.subpage-language'));
    button.textContent = language === 'en' ? '中文' : 'EN';
    button.setAttribute('aria-label', language === 'en' ? '切换到中文' : 'Switch to English');
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['lang', 'placeholder', 'aria-label', 'title'] });
  }
  // Wait for module scripts and hydration before touching server-rendered text.
  const start = () => {
    // This exported React page hydrates lazily after load. Wait for its final
    // status element to acquire React event props before localizing SSR text.
    if (location.pathname.startsWith('/boss-translator')) {
      const tail = document.querySelector('.notice');
      if (!tail || !Object.keys(tail).some((key) => key.startsWith('__reactProps$'))) {
        setTimeout(start, 100); return;
      }
    }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
      apply();
    }));
  };
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
})();
