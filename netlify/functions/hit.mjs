// Cookieless page-view counter (see netlify/lib/stats-core.mjs and the Privacy page).
import { getStore } from '@netlify/blobs'
import { blobsAdapter } from '../lib/store.mjs'
import { recordHit } from '../lib/stats-core.mjs'

export default async (req, context) => {
  try {
    const store = blobsAdapter(getStore({ name: 'visitor-stats', consistency: 'strong' }))
    return await recordHit(req, store, { ip: context.ip, ua: req.headers.get('user-agent') || '' })
  } catch (err) {
    console.error('hit error', err)
    // visitors never see this (the beacon is fire-and-forget), but it keeps failures detectable
    return new Response(null, { status: 500 })
  }
}

export const config = { path: '/api/hit' }
