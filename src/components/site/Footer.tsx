import contact from '@/content/site/contact.json'
import { ContactLinks } from './ContactLinks'

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <p className="footer-name">
          © {new Date().getFullYear()} {contact.footerLocation}
        </p>
        <p className="footer-updated">{contact.footerUpdated}</p>
      </div>
      <ContactLinks className="contact-links footer-links" />
    </footer>
  )
}
