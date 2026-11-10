// Owner-only API for the notes wall: list every note (to download as PNG) and
// delete any note. Access requires a Netlify Identity login — the same
// invite-only account used for the CMS — checked by asking the site's own
// Identity service whether the bearer token is valid.
import { getStore } from '@netlify/blobs'
import { blobsAdapter, handleAdmin } from '../lib/notes-core.mjs'

async function isSignedIn(req) {
  const auth = req.headers.get('authorization') || ''
  if (!/^Bearer\s+\S+/.test(auth)) return false
  // ask this site's own Identity service (its primary URL, set by Netlify),
  // never a host taken from the incoming request
  const origin = process.env.URL || new URL(req.url).origin
  const res = await fetch(`${origin}/.netlify/identity/user`, { headers: { authorization: auth } })
  return res.ok
}

export default async (req) => {
  try {
    if (!(await isSignedIn(req))) return Response.json({ error: 'Please log in.' }, { status: 401 })
    const store = blobsAdapter(getStore({ name: 'love-notes', consistency: 'strong' }))
    return await handleAdmin(req, store)
  } catch (err) {
    console.error('notes-admin error', err)
    return Response.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export const config = { path: ['/api/notes-admin', '/api/notes-admin/*'] }
