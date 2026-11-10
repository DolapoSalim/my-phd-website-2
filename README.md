# Olatoye Dolapo Salim — personal research website

The source of **[dolaposalim.com](https://dolaposalim.com)**: my PhD research in marine ecology and computer vision, publications, CV, news, and life outside the lab.

## Built with

- **React + TypeScript**, bundled with **Vite**, styled with plain CSS (Tailwind is loaded but barely used)
- **Netlify** for hosting, serverless functions and storage (Netlify Blobs)
- **Decap CMS** at `/admin` for editing content without touching code (GitHub login)
- Self-hosted **Geist** fonts; no cookies, no third-party scripts (see the [Privacy page](https://dolaposalim.com/privacy))

## Structure

```text
src/
  pages/           one file per page: Home, Research, Tools, Publications, Cv, News, About, Notes, Privacy
  components/site/ header, footer, folders, fish cursor, media viewer, ...
  content/         all text and lists as JSON, edited through the CMS
  lib/             content loading, tiny router, rich-text helper, page-view counter
netlify/
  functions/       API: notes wall, visitor stats, visitor location
  lib/             shared logic for those functions (tested with an in-memory store)
public/
  admin/           CMS (index.html, config.yml) and owner pages (stats.html, notes.html)
  assets/          images and videos used by the site
  fonts/, vendor/  self-hosted fonts and the Netlify Identity widget
```

## Editing content

- **Text, news, publications, CV, Outside the lab:** [dolaposalim.com/admin](https://dolaposalim.com/admin), log in with GitHub. Every save is a commit to this repository, and Netlify redeploys within a minute or two.
- **Visitor stats** (`/admin/stats.html`) and **love notes** (`/admin/notes.html`): log in with the site email and password (Netlify Identity, invite-only).

## Running locally

```bash
npm install
npm run dev      # development server at http://localhost:5173
npm run build    # production build in dist/
npm run lint
```

The API functions in `netlify/functions` run on Netlify; locally they are only available through the Netlify CLI (`netlify dev`).

## Security & privacy notes

- A strict Content-Security-Policy is added to the built `index.html` by a small plugin in `vite.config.ts`. Any new third-party embed (a YouTube video, an analytics script, external images) has to be allowed there, or the browser will block it.
- Security headers live in `netlify.toml`.
- Visitor statistics are counted by the site itself, without cookies, and IP addresses are never stored. What is processed is described on the Privacy page; keep that page in sync with any change.

## Acknowledgements

The design of this site was inspired by the portfolio of [Ehsan Masoomi](https://ehsandesigns.com), reimagined here for research. Thank you, Ehsan.
