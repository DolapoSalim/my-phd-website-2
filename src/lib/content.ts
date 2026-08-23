/** Loads a Decap-CMS-managed folder collection (one JSON file per entry
 *  under src/content/<folder>/) and returns the entries sorted by their
 *  `order` field, ascending. */
function loadCollection<T extends { order: number }>(modules: Record<string, unknown>): T[] {
  return Object.values(modules)
    .map((m) => (m as { default: T }).default)
    .sort((a, b) => a.order - b.order)
}

const educationModules = import.meta.glob('../content/education/*.json', { eager: true })
const publicationModules = import.meta.glob('../content/publications/*.json', { eager: true })
const projectModules = import.meta.glob('../content/projects/*.json', { eager: true })
const skillModules = import.meta.glob('../content/skills/*.json', { eager: true })
const newsModules = import.meta.glob('../content/news/*.json', { eager: true })

export interface EducationEntry {
  order: number
  years: string
  degree: string
  institution: string
  note: string
}
export interface PublicationEntry {
  order: number
  year: string
  type: string
  title: string
  authors: string
  journal: string
  doi: string
  doiUrl: string
}
export interface ProjectEntry {
  order: number
  name: string
  year: string
  desc: string
  tags: string[]
  url: string
}
export interface SkillGroupEntry {
  order: number
  title: string
  tags: string[]
}
export interface NewsEntry {
  order: number
  date: string
  title: string
  body: string
  url: string
}

export const educationEntries = loadCollection<EducationEntry>(educationModules)
export const publicationEntries = loadCollection<PublicationEntry>(publicationModules)
export const projectEntries = loadCollection<ProjectEntry>(projectModules)
export const skillGroupEntries = loadCollection<SkillGroupEntry>(skillModules)
export const newsEntries = loadCollection<NewsEntry>(newsModules)
