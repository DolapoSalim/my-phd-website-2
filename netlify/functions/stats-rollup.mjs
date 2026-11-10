// Nightly: turn yesterday's raw page views into totals and delete the raw
// records and the day's random salt (see netlify/lib/stats-core.mjs).
import { getStore } from '@netlify/blobs'
import { blobsAdapter } from '../lib/store.mjs'
import { rollUp } from '../lib/stats-core.mjs'

export default async () => {
  await rollUp(blobsAdapter(getStore({ name: 'visitor-stats', consistency: 'strong' })))
}

export const config = { schedule: '15 0 * * *' }
