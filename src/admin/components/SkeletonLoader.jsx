import React from 'react'
import './SkeletonLoader.css'

export function SkeletonKPICard() {
  return (
    <div className="kpi-card skeleton-card">
      <div className="skeleton skeleton-text skeleton-text-sm"></div>
      <div className="skeleton skeleton-text skeleton-text-lg"></div>
    </div>
  )
}

export function SkeletonKPIGrid({ count = 4 }) {
  return (
    <section className="kpi-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonKPICard key={i} />
      ))}
    </section>
  )
}

export function SkeletonTable({ rows = 5, cols = 6 }) {
  return (
    <div className="table-scroll">
      <table className="data-table skeleton-table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <div className="skeleton skeleton-text skeleton-text-sm"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: cols }).map((_, colIdx) => (
                <td key={colIdx}>
                  <div className="skeleton skeleton-text"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="chart-placeholder skeleton-chart">
      <div className="skeleton skeleton-chart-area"></div>
    </div>
  )
}
