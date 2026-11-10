import expertise from '@/content/site/expertise.json'

/** Loads a Decap-CMS-managed folder collection (one JSON file per entry
 *  under src/content/<folder>/) and returns the entries sorted by their
 *  `order` field, ascending. */
function loadCollection<T extends { order: number }>(modules: Record<string, unknown>): T[] {
  return Object.values(modules)
    .map((m) => (m as { default: T }).default)
    .sort((a, b) => a.order - b.order)
}

const cvEducationModules = import.meta.glob('../content/cv-education/*.json', { eager: true })
const cvAppointmentModules = import.meta.glob('../content/cv-appointments/*.json', { eager: true })
const publicationModules = import.meta.glob('../content/publications/*.json', { eager: true })
const newsModules = import.meta.glob('../content/news/*.json', { eager: true })
const skillModules = import.meta.glob('../content/skills/*.json', { eager: true })
const awardModules = import.meta.glob('../content/awards/*.json', { eager: true })
const interestModules = import.meta.glob('../content/interests/*.json', { eager: true })
const researchProjectModules = import.meta.glob('../content/research-projects/*.json', { eager: true })

export interface CvEntry {
  order: number
  dateStart: string
  dateEnd: string
  title: string
  org: string
  desc: string
}
export interface PublicationEntry {
  order: number
  year: string
  type: string
  title: string
  desc: string
  authors: string
  journal: string
  journalMeta: string
  doi: string
  doiUrl: string
}
export interface NewsEntry {
  order: number
  date: string
  title: string
  body: string
  tag: string
  image: string
  imageAlt: string
  url: string
  urlLabel: string
}
export interface SkillGroupEntry {
  order: number
  title: string
  tags: string[]
}
export interface AwardEntry {
  order: number
  title: string
  desc: string
  year: string
}

export const cvEducationEntries = loadCollection<CvEntry>(cvEducationModules)
export const cvAppointmentEntries = loadCollection<CvEntry>(cvAppointmentModules)
export const publicationEntries = loadCollection<PublicationEntry>(publicationModules)
export const newsEntries = loadCollection<NewsEntry>(newsModules)
export const skillGroupEntries = loadCollection<SkillGroupEntry>(skillModules)
export const awardEntries = loadCollection<AwardEntry>(awardModules)

export interface InterestMedia {
  file: string
  caption?: string
}
export const isVideo = (file: string) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(file)

export type InterestArtwork = 'reading' | 'fitness' | 'content' | 'piano' | 'growth' | 'design' | 'gaming'
export interface InterestEntry {
  order: number
  title: string
  tagline: string
  desc: string
  artwork: InterestArtwork
  media: InterestMedia[]
  url: string
  urlLabel: string
}
export const interestEntries = loadCollection<InterestEntry>(interestModules)

export interface ResearchProjectEntry {
  order: number
  years: string
  title: string
  role: string
  desc: string
  url: string
  urlLabel: string
}
export const researchProjectEntries = loadCollection<ResearchProjectEntry>(researchProjectModules)

/** "Built & deployed" cards (site/expertise.json). `image` is optional, so
 *  JSON inference can't type it — declare the shape once here. */
export interface BuiltItem {
  kind: string
  meta: string
  title: string
  desc: string
  cta: string
  url: string | null
  image?: string
}
export const builtItems = expertise.built as BuiltItem[]
