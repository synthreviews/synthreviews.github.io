// Synth Verdict — shared behaviour: starfield, SW registration, install prompt

(function starfield() {
  const field = document.getElementById('starfield');
  if (!field) return;
  const count = Math.min(90, Math.floor(window.innerWidth / 10));
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 60 + '%';
    s.style.animationDelay = (Math.random() * 4).toFixed(2) + 's';
    s.style.opacity = (Math.random() * 0.6 + 0.3).toFixed(2);
    frag.appendChild(s);
  }
  field.appendChild(frag);
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = document.body.getAttribute('data-sw-path') || './sw.js';
    navigator.serviceWorker.register(swPath).catch(() => {});
  });
}

// Install banner (beforeinstallprompt)
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const banner = document.getElementById('install-banner');
  if (banner) banner.style.display = 'flex';
});

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('install-btn');
  if (btn) {
    btn.addEventListener('click', async () => {
      const banner = document.getElementById('install-banner');
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (banner) banner.style.display = 'none';
    });
  }
  const dismiss = document.getElementById('install-dismiss');
  if (dismiss) {
    dismiss.addEventListener('click', () => {
      const banner = document.getElementById('install-banner');
      if (banner) banner.style.display = 'none';
    });
  }
});
