let n = 0, timer = null, slow = null, veil = null, note = null;
function ensure() {
  if (veil) return;
  veil = document.createElement('div');
  veil.className = 'iaep-veil';
  veil.setAttribute('role', 'status');
  veil.setAttribute('aria-live', 'polite');
  veil.innerHTML = '<div class="iaep-dots"><i></i><i></i><i></i><i></i><i></i></div><p class="iaep-note"></p>';
  document.body.appendChild(veil);
  note = veil.querySelector('.iaep-note');
}
function show() {
  ensure(); veil.classList.add('on'); note.textContent = '';
  slow = setTimeout(() => { note.textContent = 'Connecting to the server. This can take a moment.'; }, 5000);
}
function hide() { if (!veil) return; veil.classList.remove('on'); note.textContent = ''; clearTimeout(slow); }
const orig = window.fetch.bind(window);
window.fetch = (...a) => {
  n++; if (n === 1) timer = setTimeout(show, 200);
  return orig(...a).finally(() => { n--; if (n <= 0) { n = 0; clearTimeout(timer); hide(); } });
};
