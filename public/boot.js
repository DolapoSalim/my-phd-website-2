// Runs in <head> before the page paints (kept out of index.html so the
// Content-Security-Policy can forbid inline scripts).

// Theme: apply the saved choice before first paint (no light/dark flash).
try {
  document.documentElement.setAttribute('data-theme', localStorage.getItem('ods-theme-v2') || 'light')
} catch (e) {
  document.documentElement.setAttribute('data-theme', 'light')
}

// Home page: fetch the sea video's poster first so it paints immediately.
if (location.pathname === '/') {
  var pre = document.createElement('link')
  pre.rel = 'preload'
  pre.as = 'image'
  pre.href = '/assets/video/posters/sea.jpg'
  pre.setAttribute('fetchpriority', 'high')
  document.head.appendChild(pre)
}
