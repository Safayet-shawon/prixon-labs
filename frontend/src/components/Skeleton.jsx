export function Skeleton({ className = '', style }) {
  return <span className={`skeleton ${className}`} style={style} aria-hidden="true" />
}

export function PageSkeleton() {
  return (
    <div
      className="page-skeleton container"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <Skeleton className="sk-kicker" />
      <Skeleton className="sk-title" />
      <Skeleton className="sk-title sk-title-short" />
      <Skeleton className="sk-line" />
      <Skeleton className="sk-line sk-line-short" />
      <div className="sk-grid">
        <Skeleton className="sk-card" />
        <Skeleton className="sk-card" />
      </div>
    </div>
  )
}

export function CardSkeletons({ count = 4 }) {
  return (
    <div className="projects-grid" role="status" aria-label="Loading projects">
      {Array.from({ length: count }, (_, i) => (
        <div className="sk-project" key={i}>
          <Skeleton className="sk-card" />
          <Skeleton className="sk-line" />
          <Skeleton className="sk-line sk-line-short" />
        </div>
      ))}
    </div>
  )
}
