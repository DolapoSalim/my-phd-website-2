// Tells the visitor roughly where they are, for the header's "field
// station" readout (city + coordinates). Uses Netlify's IP-based geo for
// this request only: nothing is logged or stored, and the browser is never
// asked for permission. City-level precision at best.
export default async (req, context) => {
  const g = context.geo || {}
  const round = (n) => (typeof n === 'number' ? Math.round(n * 100) / 100 : null)
  return Response.json(
    {
      city: g.city || null,
      country: g.country?.name || null,
      latitude: round(g.latitude),
      longitude: round(g.longitude),
      timezone: g.timezone || null,
    },
    { headers: { 'cache-control': 'private, no-store' } },
  )
}

export const config = { path: '/api/where' }
