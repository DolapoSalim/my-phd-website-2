// Netlify Identity invite / password-recovery emails link to the home page;
// once the visitor finishes logging in there, send them on to the CMS.
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', function (user) {
    if (!user) {
      window.netlifyIdentity.on('login', function () {
        document.location.href = '/admin/'
      })
    }
  })
}
