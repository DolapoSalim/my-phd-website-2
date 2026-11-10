import contact from '@/content/site/contact.json'
import { Link } from '@/lib/router'
import { ContactLinks } from './ContactLinks'

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <p className="footer-name">
          © {new Date().getFullYear()} {contact.footerLocation}
        </p>
        <p className="footer-updated">
          {contact.footerUpdated} ·{' '}
          <Link to="/privacy" className="footer-privacy">
            Privacy
          </Link>
        </p>
      </div>
      <ContactLinks className="contact-links footer-links" />
    </footer>
  )
}
