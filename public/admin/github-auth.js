// GitHub login for the owner pages (/admin/stats.html, /admin/notes.html),
// the same login the CMS uses. If you're already signed in to the CMS on this
// browser, its token is reused; otherwise a GitHub sign-in window opens via
// Netlify's GitHub provider (basic profile only, no repository access).
// The server checks every request against GitHub: only allowed accounts get in.
;(function () {
  var NETLIFY = 'https://api.netlify.com'
  var SITE_ID = 'dolaposalim.com'
  var KEY = 'ods-admin-github-token'
  var listeners = []

  function read(store, key) {
    try { return store.getItem(key) } catch (e) { return null }
  }
  function token() {
    var own = read(sessionStorage, KEY)
    if (own) return own
    if (read(sessionStorage, KEY + '-skip-cms')) return null
    try {
      var cms = JSON.parse(read(localStorage, 'decap-cms-user') || 'null')
      return (cms && (cms.token || cms.access_token)) || null
    } catch (e) {
      return null
    }
  }
  function emit() { listeners.forEach(function (fn) { fn(!!token()) }) }

  function login() {
    return new Promise(function (resolve, reject) {
      var w = 960, h = 600
      var popup = window.open(NETLIFY + '/auth?provider=github&site_id=' + SITE_ID, 'GitHub login',
        'width=' + w + ',height=' + h + ',top=' + (screen.height / 2 - h / 2) + ',left=' + (screen.width / 2 - w / 2))
      if (!popup) return reject(new Error('Please allow pop-ups for this page, then try again.'))
      function onMessage(e) {
        if (e.origin !== NETLIFY || typeof e.data !== 'string') return
        if (e.data === 'authorizing:github') return popup.postMessage(e.data, e.origin)
        var ok = /^authorization:github:success:(.+)$/.exec(e.data)
        var bad = /^authorization:github:error:(.+)$/.exec(e.data)
        if (!ok && !bad) return
        window.removeEventListener('message', onMessage)
        popup.close()
        if (bad) return reject(new Error('GitHub login failed.'))
        var t = JSON.parse(ok[1]).token
        try { sessionStorage.setItem(KEY, t); sessionStorage.removeItem(KEY + '-skip-cms') } catch (err) {}
        emit()
        resolve(t)
      }
      window.addEventListener('message', onMessage)
    })
  }

  function logout() {
    // also stop reusing the CMS login on these pages until you log in again
    try { sessionStorage.removeItem(KEY); sessionStorage.setItem(KEY + '-skip-cms', '1') } catch (e) {}
    emit()
  }

  /** fetch() with the GitHub token; a 401/403 logs you out of these pages. */
  async function authFetch(url, opts) {
    var t = token()
    if (!t) throw new Error('Please log in with GitHub.')
    opts = opts || {}
    var res = await fetch(url, Object.assign({}, opts, { headers: Object.assign({}, opts.headers, { authorization: 'Bearer ' + t }) }))
    if (res.status === 401 || res.status === 403) {
      var msg = (await res.json().catch(function () { return {} })).error
      logout()
      throw new Error(msg || 'Please log in with GitHub.')
    }
    if (!res.ok) throw new Error((await res.json().catch(function () { return {} })).error || 'Request failed (' + res.status + ')')
    return res
  }

  window.githubAuth = {
    isLoggedIn: function () { return !!token() },
    login: login,
    logout: logout,
    fetch: authFetch,
    onChange: function (fn) { listeners.push(fn); fn(!!token()) },
  }
})()
