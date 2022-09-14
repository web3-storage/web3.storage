// browser update library
// https://browser-update.org/#install (this file's naming convention from buoop)

var $buoop = {
  // sets which version of each browser acts as the threshold for the outdated
  // browser message to be shown (e is IE/Edge, f is Firefox, o is Opera, etc.)
  required: { e: 11, f: 95, o: 80, s: 10, c: 96 },
  insecure: true,
  unsupported: true,
  api: 2022.03,
};
function $buo_f() {
  // dont load on localhost
  if (document.location.origin.match(/\/\/localhost(\W|$)/)) { return }
  var e = document.createElement('script');
  e.src = '//browser-update.org/update.min.js';
  document.body.appendChild(e);
}
try {
  document.addEventListener('DOMContentLoaded', $buo_f, false);
} catch (e) {
  window.attachEvent('onload', $buo_f);
}
