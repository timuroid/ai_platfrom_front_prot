import React from 'react'
import { Bot, Users, MessageSquare, CheckCircle, Star, Calendar, Activity, TrendingUp } from 'lucide-react'
import Breadcrumbs from './Breadcrumbs.jsx'
import './DetailPage.css'

const BotDetails = ({ bot, onBack }) => {
  if (!bot) return null

  const breadcrumbItems = [
    { id: 'bots', label: 'Боты', section: 'bots' },
    { id: 'bot-detail', label: bot.name }
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
        <h1 className="page-heading">{bot.name}</h1>
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
                    <Bot size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Название</span>
                    <span className="detail-value">{bot.name}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <Activity size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Статус</span>
                    <span className={`status-badge status-${bot.status}`}>
                      {bot.status === 'active' ? 'Активен' : 'Неактивен'}
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
                      {new Date(bot.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>

                <div className="detail-item detail-item-full">
                  <div className="detail-icon">
                    <Bot size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Описание</span>
                    <span className="detail-value">{bot.description}</span>
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
                    <span className="stat-value">{bot.usersCount}</span>
                    <span className="stat-label">Пользователей</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <MessageSquare size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{bot.dialogs30d.toLocaleString('ru-RU')}</span>
                    <span className="stat-label">Диалогов за 30 дней</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <TrendingUp size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{bot.messages30d.toLocaleString('ru-RU')}</span>
                    <span className="stat-label">Сообщений за 30 дней</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <Star size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{bot.avgRating}</span>
                    <span className="stat-label">Средняя оценка</span>
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
                    <span className="metric-value">{bot.successRate}%</span>
                  </div>
                  <div className="metric-bar">
                    <div
                      className="metric-bar-fill metric-bar-success"
                      style={{ width: `${bot.successRate}%` }}
                    />
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-header">
                    <span className="metric-label">Средняя оценка (из 5)</span>
                    <span className="metric-value">{bot.avgRating}/5</span>
                  </div>
                  <div className="metric-bar">
                    <div
                      className="metric-bar-fill metric-bar-warning"
                      style={{ width: `${(bot.avgRating / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-header">
                    <span className="metric-label">Вовлечённость пользователей</span>
                    <span className="metric-value">85%</span>
                  </div>
                  <div className="metric-bar">
                    <div
                      className="metric-bar-fill metric-bar-success"
                      style={{ width: '85%' }}
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

export default BotDetails
