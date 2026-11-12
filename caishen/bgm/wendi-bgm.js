(() => {
  'use strict';
  const script = document.currentScript;
  if (!script || document.getElementById('wendi-bgm-toggle')) return;
  const track = new Audio();
  track.preload = 'none';
  track.loop = true;
  track.volume = Number(script.dataset.volume || .24);
  const url = new URL('loop.wav', script.src).href;
  let requested = false;
  let attempt = 0;
  const button = document.createElement('button');
  button.id = 'wendi-bgm-toggle';
  button.type = 'button';
  button.style.cssText = 'position:fixed;left:max(12px,env(safe-area-inset-left));bottom:max(12px,env(safe-area-inset-bottom));z-index:1400;width:40px;height:40px;padding:0;display:grid;place-items:center;border:1px solid #ffffff70;border-radius:50%;color:#fff;background:#15151bea;box-shadow:0 2px 10px #0004;cursor:pointer;font:700 18px/1 system-ui,sans-serif';
  function refresh() {
    const english = document.documentElement.lang.toLowerCase().startsWith('en');
    const label = english ? (requested ? 'Stop background music' : 'Play background music') : (requested ? '关闭背景音乐' : '播放背景音乐');
    button.textContent = requested ? '♫' : '♪';
    button.style.opacity = requested ? '1' : '.72';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(requested));
    button.title = label;
  }
  function pause() { attempt++; track.pause(); }
  function play() {
    if (!requested || document.hidden || !track.paused) return;
    if (!track.getAttribute('src')) track.src = url;
    const id = ++attempt;
    track.play().then(() => {
      if (!requested || document.hidden) track.pause();
    }).catch(() => {
      if (id === attempt) { requested = false; refresh(); }
    });
  }
  // Only a deliberate click on this control opts this page into playback.
  button.addEventListener('click', () => {
    requested = !requested;
    if (requested) play(); else pause();
    refresh();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause(); else play();
  });
  window.addEventListener('pagehide', pause);
  window.addEventListener('pageshow', play);
  track.addEventListener('error', () => {
    requested = false;
    track.removeAttribute('src');
    refresh();
  });
  document.body.appendChild(button);
  refresh();
})();
