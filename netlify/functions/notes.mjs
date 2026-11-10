// Public API for the "My love life" notes wall. See netlify/lib/notes-core.mjs.
import { getStore } from '@netlify/blobs'
import { blobsAdapter, handlePublic } from '../lib/notes-core.mjs'

export default async (req, context) => {
  const store = blobsAdapter(getStore({ name: 'love-notes', consistency: 'strong' }))
  try {
    return await handlePublic(req, store, { ip: context.ip })
  } catch (err) {
    console.error('notes error', err)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

export const config = { path: ['/api/notes', '/api/notes/*'] }
