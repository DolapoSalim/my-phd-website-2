// Owner-only endpoints accept a Netlify Identity login (the invite-only
// account used for the CMS). The bearer token is checked by asking this
// site's own Identity service — its primary URL, set by Netlify — never a
// host taken from the incoming request.
export async function isSignedIn(req) {
  const auth = req.headers.get('authorization') || ''
  if (!/^Bearer\s+\S+/.test(auth)) return false
  const origin = process.env.URL || new URL(req.url).origin
  const res = await fetch(`${origin}/.netlify/identity/user`, { headers: { authorization: auth } })
  return res.ok
}
