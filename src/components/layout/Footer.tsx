import footer from '@/content/site/footer.json'

export function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-row">
          <div className="f-logo">
            <b>{footer.logo.split(' · ')[0]}</b> · {footer.logo.split(' · ')[1]}
          </div>
          <div className="f-copy">{footer.copy}</div>
        </div>
      </div>
    </footer>
  )
}
