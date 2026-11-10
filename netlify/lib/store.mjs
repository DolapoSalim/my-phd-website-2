// Adapts a Netlify Blobs store to the small interface the site's functions
// use, so the logic in notes-core / stats-core can be tested with an
// in-memory map instead.
export function blobsAdapter(blobStore) {
  return {
    async list(prefix) {
      const { blobs } = await blobStore.list({ prefix })
      return blobs.map((b) => b.key)
    },
    getJSON: (key) => blobStore.get(key, { type: 'json' }),
    setJSON: (key, value) => blobStore.setJSON(key, value),
    /** writes only if the key doesn't exist yet; true if this call created it */
    async setJSONIfNew(key, value) {
      const res = await blobStore.setJSON(key, value, { onlyIfNew: true })
      return res?.modified !== false
    },
    async getBytes(key) {
      const buf = await blobStore.get(key, { type: 'arrayBuffer' })
      return buf ? new Uint8Array(buf) : null
    },
    setBytes: (key, bytes) => blobStore.set(key, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)),
    delete: (key) => blobStore.delete(key),
  }
}

export function randomHex(bytes) {
  return [...crypto.getRandomValues(new Uint8Array(bytes))].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** A random server-side secret stored under `key`, created once (race-safe). */
export async function secret(store, key) {
  const existing = await store.getJSON(key)
  if (existing?.value) return existing.value
  await store.setJSONIfNew(key, { value: randomHex(32) })
  return (await store.getJSON(key)).value
}
