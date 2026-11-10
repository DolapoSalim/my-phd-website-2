/** Stand-in artwork for projects without a figure of their own, drawn
 *  from the two things the research actually produces: a quadrat survey
 *  grid (percentage cover) and detector bounding boxes. Decorative only. */

const COVER = [
  0, 1, 1, 0, 2, 0, 0,
  1, 2, 1, 0, 0, 2, 0,
  0, 1, 0, 0, 1, 1, 0,
  2, 0, 0, 1, 1, 0, 0,
  0, 0, 2, 1, 0, 0, 1,
]

export function QuadratVisual() {
  return (
    <div className="pv pv-quadrat" aria-hidden="true">
      <div className="pv-quadrat-grid">
        {COVER.map((c, i) => (
          <span key={i} className={`c${c}`} />
        ))}
      </div>
      <span className="pv-tag">cover 46%</span>
    </div>
  )
}

export function DetectionVisual() {
  return (
    <div className="pv pv-detect" aria-hidden="true">
      <span className="pv-box" style={{ left: '12%', top: '22%', width: '30%', height: '38%' }}>
        <span>fish 0.91</span>
      </span>
      <span className="pv-box b2" style={{ left: '50%', top: '46%', width: '36%', height: '34%' }}>
        <span>algae 0.84</span>
      </span>
      <span className="pv-box b3" style={{ left: '58%', top: '12%', width: '18%', height: '22%' }}>
        <span>fish 0.77</span>
      </span>
    </div>
  )
}

/** Polygon labelling with a class legend — for annotation tooling. */
export function AnnotateVisual() {
  return (
    <div className="pv pv-annotate" aria-hidden="true">
      <svg viewBox="0 0 320 200" preserveAspectRatio="none">
        <polygon points="40,150 70,96 118,88 150,120 132,168 72,176" fill="rgba(127,224,168,0.28)" stroke="#7fe0a8" strokeWidth="2" />
        <polygon points="168,60 214,44 246,72 230,108 186,104" fill="rgba(246,196,83,0.25)" stroke="#f6c453" strokeWidth="2" strokeDasharray="5 4" />
        {[[40,150],[70,96],[118,88],[150,120],[132,168],[72,176]].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x - 3} y={y - 3} width="6" height="6" fill="#fff" stroke="#7fe0a8" strokeWidth="1.5" />
        ))}
      </svg>
      <ul className="pv-classes">
        <li><i style={{ background: '#7fe0a8' }} />seagrass</li>
        <li><i style={{ background: '#f6c453' }} />macroalgae</li>
      </ul>
      <span className="pv-local">● local only</span>
    </div>
  )
}
