// Owner-only endpoints accept a GitHub login (the same one as the CMS). The
// browser sends its GitHub token; we ask GitHub who it belongs to and allow
// only the accounts listed below (or in the ADMIN_GITHUB_LOGINS environment
// variable, comma-separated). Verified tokens are remembered for 5 minutes
// (by hash, in memory) to avoid asking GitHub on every request.
import { sha256 } from './store.mjs'

const allowed = () =>
  (process.env.ADMIN_GITHUB_LOGINS || 'DolapoSalim')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

const cache = new Map() // sha256(token) -> expiry time
const TTL = 5 * 60 * 1000

export async function isSignedIn(req) {
  const m = /^Bearer\s+(\S+)$/.exec(req.headers.get('authorization') || '')
  if (!m) return false
  const key = await sha256(m[1])
  if ((cache.get(key) || 0) > Date.now()) return true
  const res = await fetch('https://api.github.com/user', {
    headers: { authorization: `Bearer ${m[1]}`, accept: 'application/vnd.github+json', 'user-agent': 'dolaposalim.com-admin' },
  })
  if (!res.ok) return false
  const user = await res.json()
  if (!allowed().includes(String(user.login || '').toLowerCase())) return false
  cache.set(key, Date.now() + TTL)
  return true
}
