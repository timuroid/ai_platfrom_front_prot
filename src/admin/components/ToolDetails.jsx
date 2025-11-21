import React from 'react'
import { Wrench, Users, Zap, CheckCircle, Clock, Calendar, Activity, TrendingUp } from 'lucide-react'
import Breadcrumbs from './Breadcrumbs.jsx'
import './DetailPage.css'

const ToolDetails = ({ tool, onBack }) => {
  if (!tool) return null

  const breadcrumbItems = [
    { id: 'tools', label: 'Инструменты', section: 'tools' },
    { id: 'tool-detail', label: tool.name }
  ]

  const handleBreadcrumbNavigate = (item) => {
    if (item.section) {
      onBack()
    }
  }

  return (
    <div className="detail-page">
      <header className="page-toolbar">
        <Breadcrumbs items={breadcrumbItems} onNavigate={handleBreadcrumbNavigate} />
        <h1 className="page-heading">{tool.name}</h1>
      </header>

      <div className="admin-viewport">
        <div className="admin-content">
          {/* Основная информация */}
          <section className="card detail-card">
            <header className="card-header">
              <p className="card-title">Основная информация</p>
            </header>
            <div className="card-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-icon">
                    <Wrench size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Название</span>
                    <span className="detail-value">{tool.name}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <Activity size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Статус</span>
                    <span className={`status-badge status-${tool.status}`}>
                      {tool.status === 'active' ? 'Активен' : 'Неактивен'}
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <Calendar size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Дата создания</span>
                    <span className="detail-value">
                      {new Date(tool.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>

                <div className="detail-item detail-item-full">
                  <div className="detail-icon">
                    <Wrench size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Описание</span>
                    <span className="detail-value">{tool.description}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Статистика использования */}
          <section className="card detail-card">
            <header className="card-header">
              <p className="card-title">Статистика использования</p>
            </header>
            <div className="card-body">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <Users size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{tool.usersCount}</span>
                    <span className="stat-label">Пользователей</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <Zap size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{tool.runs30d.toLocaleString('ru-RU')}</span>
                    <span className="stat-label">Запусков за 30 дней</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <CheckCircle size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{tool.successRate}%</span>
                    <span className="stat-label">Успешность</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <Clock size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{tool.avgResponseTime}</span>
                    <span className="stat-label">Среднее время ответа</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Метрики производительности */}
          <section className="card detail-card">
            <header className="card-header">
              <p className="card-title">Метрики производительности</p>
            </header>
            <div className="card-body">
              <div className="performance-metrics">
                <div className="metric-item">
                  <div className="metric-header">
                    <span className="metric-label">Успешность выполнения</span>
                    <span className="metric-value">{tool.successRate}%</span>
                  </div>
                  <div className="metric-bar">
                    <div
                      className="metric-bar-fill metric-bar-success"
                      style={{ width: `${tool.successRate}%` }}
                    />
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-header">
                    <span className="metric-label">Нагрузка (от максимума)</span>
                    <span className="metric-value">68%</span>
                  </div>
                  <div className="metric-bar">
                    <div
                      className="metric-bar-fill metric-bar-warning"
                      style={{ width: '68%' }}
                    />
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-header">
                    <span className="metric-label">Доступность</span>
                    <span className="metric-value">99.9%</span>
                  </div>
                  <div className="metric-bar">
                    <div
                      className="metric-bar-fill metric-bar-success"
                      style={{ width: '99.9%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ToolDetails
