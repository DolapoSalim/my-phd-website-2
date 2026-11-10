// Cookieless, first-party visitor statistics (see the Privacy page).
//
// Each page view stores { page, referrer domain, visitor code } under
// hit/<day>/… . The visitor code is a hash of (that day's random salt + IP +
// browser), so a visitor is counted once per day but can't be followed
// across days or traced back. Once a day is over, its hits are rolled up
// into day/<day> totals and the raw hits and the day's salt are deleted.
// Daily totals are kept for ~13 months.
import { randomHex, secret, sha256 } from './store.mjs'

export const PAGES = ['/', '/research', '/tools', '/publications', '/cv', '/news', '/about', '/notes', '/privacy']
const PAGE_SET = new Set(PAGES)
const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|monitor|curl|wget|python|axios|node-fetch|undici|go-http|java\/|httpclient|facebookexternalhit|embedly|whatsapp|telegram/i
const HOST_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/
const KEEP_DAYS = 400

const isoDay = (t = Date.now()) => new Date(t).toISOString().slice(0, 10)
const dayMinus = (day, n) => isoDay(Date.parse(day + 'T00:00:00Z') - n * 86400000)

/** POST /api/hit — body {"p": "/news", "r": "linkedin.com"}; always fast, never errors loudly. */
export async function recordHit(req, store, { ip = '', ua = '' } = {}) {
  if (req.method !== 'POST') return new Response(null, { status: 405 })
  if (!ua || BOT_RE.test(ua)) return new Response(null, { status: 204 })
  const text = await req.text()
  if (text.length > 500) return new Response(null, { status: 413 })
  let body
  try {
    body = JSON.parse(text)
  } catch {
    return new Response(null, { status: 400 })
  }
  const p = typeof body?.p === 'string' ? body.p : ''
  if (!PAGE_SET.has(p)) return new Response(null, { status: 400 })
  let r = typeof body?.r === 'string' ? body.r.toLowerCase().replace(/^www\./, '').slice(0, 100) : ''
  if (!HOST_RE.test(r)) r = ''

  const day = isoDay()
  const salt = await secret(store, 'salt/' + day)
  const v = (await sha256(`${salt}|${ip}|${ua}`)).slice(0, 16)
  await store.setJSON(`hit/${day}/${Date.now().toString(36)}-${randomHex(4)}`, { p, r, v })
  return new Response(null, { status: 204 })
}

function summarise(hits) {
  const pages = {}
  const referrers = {}
  const visitors = new Set()
  for (const h of hits) {
    pages[h.p] = (pages[h.p] || 0) + 1
    if (h.r) referrers[h.r] = (referrers[h.r] || 0) + 1
    visitors.add(h.v)
  }
  return { views: hits.length, visitors: visitors.size, pages, referrers }
}

function add(a, b) {
  const merge = (x = {}, y = {}) => {
    const out = { ...x }
    for (const [k, n] of Object.entries(y)) out[k] = (out[k] || 0) + n
    return out
  }
  return { views: a.views + b.views, visitors: a.visitors + b.visitors, pages: merge(a.pages, b.pages), referrers: merge(a.referrers, b.referrers) }
}

/** Turns finished days into totals and deletes raw hits, old salts and stale totals. */
export async function rollUp(store) {
  const today = isoDay()
  const byDay = {}
  for (const key of await store.list('hit/')) {
    const day = key.split('/')[1]
    if (day < today) (byDay[day] ||= []).push(key)
  }
  for (const [day, keys] of Object.entries(byDay)) {
    const hits = (await Promise.all(keys.map((k) => store.getJSON(k)))).filter(Boolean)
    const existing = await store.getJSON('day/' + day)
    const summary = existing ? add(existing, summarise(hits)) : summarise(hits)
    await store.setJSON('day/' + day, summary)
    await Promise.all(keys.map((k) => store.delete(k)))
  }
  for (const key of await store.list('salt/')) if (key.slice(5) < today) await store.delete(key)
  const oldest = dayMinus(today, KEEP_DAYS)
  for (const key of await store.list('day/')) if (key.slice(4) < oldest) await store.delete(key)
}

/** Totals for the last `days` days (today included, counted live). */
export async function getStats(store, days = 30) {
  await rollUp(store)
  const today = isoDay()
  const todayHits = (await Promise.all((await store.list(`hit/${today}/`)).map((k) => store.getJSON(k)))).filter(Boolean)
  const series = []
  let total = { views: 0, visitors: 0, pages: {}, referrers: {} }
  for (let i = days - 1; i >= 0; i--) {
    const day = dayMinus(today, i)
    const s = i === 0 ? summarise(todayHits) : (await store.getJSON('day/' + day)) || { views: 0, visitors: 0, pages: {}, referrers: {} }
    series.push({ day, views: s.views, visitors: s.visitors })
    total = add(total, s)
  }
  const top = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 10)
  return { days: series, views: total.views, visitors: total.visitors, pages: top(total.pages), referrers: top(total.referrers) }
}
