import stats from '@/content/site/stats.json'
import CountUp from '@/components/reactbits/CountUp'

export function StatsStrip() {
  return (
    <div className="stats-strip">
      <div className="container">
        <div className="stats-row">
          {stats.items.map((item) => (
            <div className="stat-item" key={item.label}>
              <div className="stat-value">
                <CountUp to={item.value} duration={2} />
                {item.suffix}
              </div>
              <div className="stat-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
