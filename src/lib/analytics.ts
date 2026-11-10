/** Cookieless page-view counting (server side: netlify/functions/hit.mjs).
 *  Sends only the page path and, on the first view, the referring site's
 *  domain. Skipped on localhost, when the browser asks not to be tracked
 *  (Do Not Track / Global Privacy Control) and on browsers where Dolapo
 *  switched counting off from /admin/stats.html. */
let firstView = true

function optedOut(): boolean {
  try {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean }
    if (nav.globalPrivacyControl || navigator.doNotTrack === '1') return true
    return localStorage.getItem('ods-no-count') === '1'
  } catch {
    return false
  }
}

export function countView(path: string) {
  const isFirst = firstView
  firstView = false
  if (['localhost', '127.0.0.1'].includes(location.hostname) || optedOut()) return
  let r = ''
  if (isFirst && document.referrer) {
    try {
      const host = new URL(document.referrer).hostname
      if (host !== location.hostname) r = host
    } catch {
      /* unparseable referrer */
    }
  }
  const body = JSON.stringify({ p: path, r })
  const sent = navigator.sendBeacon?.('/api/hit', new Blob([body], { type: 'text/plain' }))
  if (!sent) fetch('/api/hit', { method: 'POST', body, keepalive: true }).catch(() => {})
}
