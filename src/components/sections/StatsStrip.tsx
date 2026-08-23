import stats from '@/content/site/stats.json'
import CountUp from '@/components/reactbits/CountUp'
import { Card, CardContent } from '@/components/ui/card'

export function StatsStrip() {
  return (
    <div className="stats-strip">
      <div className="container">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.items.map((item) => (
            <Card key={item.label} className="border-border/60 bg-card/90 text-center">
              <CardContent className="flex flex-col items-center gap-1 py-2">
                <div className="stat-value">
                  <CountUp to={item.value} duration={2} />
                  {item.suffix}
                </div>
                <div className="stat-label">{item.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
