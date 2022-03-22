// browser update library
var $buoop = {
  required: { e: -2, f: -2, o: -2, s: -1, c: -2 },
  insecure: true,
  unsupported: true,
  api: 2022.03,
};
function $buo_f() {
  var e = document.createElement('script');
  e.src = '//browser-update.org/update.min.js';
  document.body.appendChild(e);
}
try {
  document.addEventListener('DOMContentLoaded', $buo_f, false);
} catch (e) {
  window.attachEvent('onload', $buo_f);
}
