// Shared logic for the "My love life" notes wall (netlify/functions/notes*.mjs).
// Kept free of Netlify imports so it can be exercised with an in-memory store.
//
// Store layout: meta/<id> (JSON)  +  img/<id> (PNG bytes)
//
// "Per person" is a random id each browser keeps in localStorage and sends
// as X-Note-Owner. The server stores only its SHA-256, never returns it, and
// uses it to (a) cap notes at 3 per person and (b) allow deleting only your
// own notes. Someone clearing their browser could post more, so there's also
// a per-IP daily cap and a wall-wide cap; Dolapo can delete any note from the
// admin page.
//
// IP addresses are never stored. For the daily cap the server keeps a hash of
// (secret salt + date + IP); the salt is random, generated once and kept only
// in the store, so the hash can't be reversed by trying every IP. Hashes are
// deleted once their day has passed.
//
// Moderation: new notes are saved as pending (approved: false). The public
// wall shows approved notes, plus a visitor's own pending notes (labelled as
// awaiting approval); Dolapo approves or deletes them from the admin page.
// Notes saved before moderation existed have no flag and count as approved.
import { secret, sha256 } from './store.mjs'
export { blobsAdapter } from './store.mjs'

export const REQUIRE_APPROVAL = true
export const MAX_PER_OWNER = 3
export const MAX_PER_IP_PER_DAY = 6
export const MAX_NOTES = 400
export const MAX_PNG_BYTES = 400 * 1024
export const MAX_SIDE = 1600

const DAY_MS = 24 * 60 * 60 * 1000
const isApproved = (m) => m.approved !== false

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
  })

const ID_RE = /^[a-z0-9]{10,40}$/

function newId() {
  const rand = crypto.getRandomValues(new Uint8Array(8))
  return Date.now().toString(36) + [...rand].map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 12)
}

/** Validates a data:image/png;base64 string; returns bytes or an error string. */
export function decodePng(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/png;base64,')) return 'Expected a PNG image.'
  const b64 = dataUrl.slice('data:image/png;base64,'.length)
  if (b64.length > Math.ceil((MAX_PNG_BYTES * 4) / 3) + 8) return 'That note is too large.'
  let bytes
  try {
    bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
  } catch {
    return 'Could not read that image.'
  }
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  if (bytes.length < 33 || sig.some((v, i) => bytes[i] !== v)) return 'Expected a PNG image.'
  const view = new DataView(bytes.buffer)
  const w = view.getUint32(16)
  const h = view.getUint32(20)
  if (!w || !h || w > MAX_SIDE || h > MAX_SIDE) return 'Unexpected image size.'
  if (bytes.length > MAX_PNG_BYTES) return 'That note is too large.'
  return bytes
}

async function allMeta(store) {
  const keys = await store.list('meta/')
  const metas = await Promise.all(keys.map((k) => store.getJSON(k)))
  return metas.filter(Boolean).sort((a, b) => b.createdAt - a.createdAt)
}

/** Public API: GET list, GET image, POST create, DELETE own. */
export async function handlePublic(req, store, { ip = '' } = {}) {
  const url = new URL(req.url)
  const rest = url.pathname.replace(/^\/api\/notes\/?/, '')
  const owner = req.headers.get('x-note-owner') || ''
  const ownerHash = /^[A-Za-z0-9-]{16,80}$/.test(owner) ? await sha256('owner:' + owner) : ''

  // GET /api/notes/<id>.png
  if (req.method === 'GET' && rest.endsWith('.png')) {
    const id = rest.slice(0, -4)
    if (!ID_RE.test(id)) return json({ error: 'Not found' }, 404)
    const bytes = await store.getBytes('img/' + id)
    if (!bytes) return json({ error: 'Not found' }, 404)
    return new Response(bytes, {
      headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=31536000, immutable' },
    })
  }

  // GET /api/notes
  if (req.method === 'GET' && rest === '') {
    const metas = await allMeta(store)
    const notes = metas
      .map((m) => ({ m, mine: !!ownerHash && m.ownerHash === ownerHash }))
      .filter(({ m, mine }) => isApproved(m) || mine)
      .map(({ m, mine }) => ({
        id: m.id,
        createdAt: m.createdAt,
        src: `/api/notes/${m.id}.png`,
        mine,
        pending: !isApproved(m),
      }))
    const mine = notes.filter((n) => n.mine).length
    return json({ notes, mine, limit: MAX_PER_OWNER })
  }

  // POST /api/notes  { image: dataURL }
  if (req.method === 'POST' && rest === '') {
    if (!ownerHash) return json({ error: 'Missing note owner.' }, 400)
    let body
    try {
      body = await req.json()
    } catch {
      return json({ error: 'Bad request.' }, 400)
    }
    const bytes = decodePng(body?.image)
    if (typeof bytes === 'string') return json({ error: bytes }, 400)

    const metas = await allMeta(store)
    if (metas.length >= MAX_NOTES) return json({ error: 'The wall is full for now.' }, 429)
    if (metas.filter((m) => m.ownerHash === ownerHash).length >= MAX_PER_OWNER)
      return json({ error: `You can leave up to ${MAX_PER_OWNER} notes. Delete one to add another.` }, 429)
    const day = new Date().toISOString().slice(0, 10)
    const ipHash = ip ? await sha256(`ip:${await secret(store, 'config/salt')}:${day}:${ip}`) : ''
    // data minimisation: drop IP hashes once they can no longer count toward a daily cap
    await Promise.all(
      metas
        .filter((m) => m.ipHash && Date.now() - m.createdAt > 2 * DAY_MS)
        .map(({ ipHash: _drop, ...rest }) => store.setJSON('meta/' + rest.id, rest)),
    )
    if (ipHash && metas.filter((m) => m.ipHash === ipHash).length >= MAX_PER_IP_PER_DAY)
      return json({ error: 'Too many notes from here today. Try again tomorrow.' }, 429)

    const id = newId()
    const meta = { id, createdAt: Date.now(), ownerHash, ipHash, bytes: bytes.length, approved: !REQUIRE_APPROVAL }
    await store.setBytes('img/' + id, bytes)
    await store.setJSON('meta/' + id, meta)
    return json({ note: { id, createdAt: meta.createdAt, src: `/api/notes/${id}.png`, mine: true, pending: !meta.approved } }, 201)
  }

  // DELETE /api/notes/<id>
  if (req.method === 'DELETE' && ID_RE.test(rest)) {
    const meta = await store.getJSON('meta/' + rest)
    if (!meta) return json({ error: 'Not found' }, 404)
    if (!ownerHash || meta.ownerHash !== ownerHash) return json({ error: 'You can only delete your own notes.' }, 403)
    await store.delete('img/' + rest)
    await store.delete('meta/' + rest)
    return json({ ok: true })
  }

  return json({ error: 'Not found' }, 404)
}

/** Admin API (caller must already be authenticated): list, approve, download, delete any. */
export async function handleAdmin(req, store) {
  const url = new URL(req.url)
  const rest = url.pathname.replace(/^\/api\/notes-admin\/?/, '')

  if (req.method === 'GET' && rest === '') {
    const metas = await allMeta(store)
    return json({
      notes: metas.map((m) => ({ id: m.id, createdAt: m.createdAt, bytes: m.bytes, approved: isApproved(m), src: `/api/notes/${m.id}.png` })),
    })
  }
  // POST /api/notes-admin/<id>/approve  ·  /<id>/hide
  const action = /^([a-z0-9]{10,40})\/(approve|hide)$/.exec(rest)
  if (req.method === 'POST' && action) {
    const meta = await store.getJSON('meta/' + action[1])
    if (!meta) return json({ error: 'Not found' }, 404)
    await store.setJSON('meta/' + meta.id, { ...meta, approved: action[2] === 'approve' })
    return json({ ok: true, approved: action[2] === 'approve' })
  }
  if (req.method === 'DELETE' && ID_RE.test(rest)) {
    await store.delete('img/' + rest)
    await store.delete('meta/' + rest)
    return json({ ok: true })
  }
  return json({ error: 'Not found' }, 404)
}
