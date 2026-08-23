import { useEffect, useState } from 'react'

interface GithubRepo {
  name: string
  html_url: string
  stargazers_count: number
}

export interface GithubEnrichment {
  url: string
  stars: number
}

function normalize(name: string) {
  return name.toLowerCase().replace(/[\s\-_]/g, '').replace(/[^a-z0-9]/g, '')
}

/** Silently enriches project cards with live GitHub repo URLs/star counts,
 *  matching by normalized name — same lookup as the legacy initProjects
 *  fetch against the GitHub API. Never throws; failures just leave cards
 *  with their authored `url`. */
export function useGithubStars(username: string) {
  const [byName, setByName] = useState<Record<string, GithubEnrichment>>({})

  useEffect(() => {
    let cancelled = false
    fetch(`https://api.github.com/users/${username}/repos?per_page=100&type=public`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('github fetch failed'))))
      .then((repos: GithubRepo[]) => {
        if (cancelled) return
        const map: Record<string, GithubEnrichment> = {}
        repos.forEach((r) => {
          map[normalize(r.name)] = { url: r.html_url, stars: r.stargazers_count }
        })
        setByName(map)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [username])

  return (projectName: string): GithubEnrichment | undefined => byName[normalize(projectName)]
}
