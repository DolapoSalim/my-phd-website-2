// Netlify Identity invite / password-recovery emails link to the home page;
// once you finish logging in there, go to the owner pages that use that
// account (visitor stats, love notes). The CMS itself logs in with GitHub.
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', function (user) {
    if (!user) {
      window.netlifyIdentity.on('login', function () {
        document.location.href = '/admin/stats.html'
      })
    }
  })
}
