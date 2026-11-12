// Owner-only API for the notes wall: list every note (to download as PNG) and
// delete any note. Access requires a Netlify Identity login — the same
// invite-only account used for the CMS — checked by asking the site's own
// Identity service whether the bearer token is valid.
import { getStore } from '@netlify/blobs'
import { isSignedIn } from '../lib/auth.mjs'
import { blobsAdapter, handleAdmin } from '../lib/notes-core.mjs'

export default async (req) => {
  try {
    if (!(await isSignedIn(req))) return Response.json({ error: 'Please log in with GitHub (only the site owner can see this).' }, { status: 401 })
    const store = blobsAdapter(getStore({ name: 'love-notes', consistency: 'strong' }))
    return await handleAdmin(req, store)
  } catch (err) {
    console.error('notes-admin error', err)
    return Response.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export const config = { path: ['/api/notes-admin', '/api/notes-admin/*'] }
