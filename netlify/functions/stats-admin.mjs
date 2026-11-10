// Owner-only visitor statistics for /admin/stats.html.
import { getStore } from '@netlify/blobs'
import { isSignedIn } from '../lib/auth.mjs'
import { blobsAdapter } from '../lib/store.mjs'
import { getStats } from '../lib/stats-core.mjs'

export default async (req) => {
  try {
    if (!(await isSignedIn(req))) return Response.json({ error: 'Please log in.' }, { status: 401 })
    const days = Math.min(90, Math.max(7, Number(new URL(req.url).searchParams.get('days')) || 30))
    const store = blobsAdapter(getStore({ name: 'visitor-stats', consistency: 'strong' }))
    return Response.json(await getStats(store, days), { headers: { 'cache-control': 'no-store' } })
  } catch (err) {
    console.error('stats-admin error', err)
    return Response.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export const config = { path: '/api/stats-admin' }
