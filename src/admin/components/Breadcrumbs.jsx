import React from 'react'
import { ChevronRight } from 'lucide-react'
import './Breadcrumbs.css'

const Breadcrumbs = ({ items, onNavigate }) => {
  if (!items || items.length === 0) return null

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={item.id || index} className="breadcrumbs-item">
              {!isLast ? (
                <>
                  <button
                    type="button"
                    className="breadcrumbs-link"
                    onClick={() => onNavigate(item)}
                  >
                    {item.label}
                  </button>
                  <ChevronRight size={14} className="breadcrumbs-separator" />
                </>
              ) : (
                <span className="breadcrumbs-current">{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
