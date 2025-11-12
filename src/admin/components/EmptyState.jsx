import React from 'react'
import { Database, FileQuestion, AlertCircle } from 'lucide-react'
import './EmptyState.css'

export default function EmptyState({
  icon: Icon = Database,
  title = 'Нет данных',
  description = 'Подключите источник данных для отображения информации',
  actionLabel,
  onAction
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <div className="empty-state-content">
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-description">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          className="empty-state-action"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
