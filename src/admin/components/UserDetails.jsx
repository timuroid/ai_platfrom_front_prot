import React from 'react'
import { User, Mail, Calendar, MessageSquare, DollarSign, Wrench, Cpu, Shield, Clock } from 'lucide-react'
import Breadcrumbs from './Breadcrumbs.jsx'
import './DetailPage.css'

const UserDetails = ({ user, onBack }) => {
  if (!user) return null

  const breadcrumbItems = [
    { id: 'users', label: 'Пользователи', section: 'users' },
    { id: 'user-detail', label: user.fio }
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
        <h1 className="page-heading">{user.fio}</h1>
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
                    <User size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">ФИО</span>
                    <span className="detail-value">{user.fio}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <Shield size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Роль</span>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <Clock size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Последняя активность</span>
                    <span className="detail-value">
                      {new Date(user.lastActivity).toLocaleString('ru-RU')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Статистика */}
          <section className="card detail-card">
            <header className="card-header">
              <p className="card-title">Статистика</p>
            </header>
            <div className="card-body">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <MessageSquare size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{user.activeChats}</span>
                    <span className="stat-label">Активных чатов</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <MessageSquare size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{user.messagesCount}</span>
                    <span className="stat-label">Сообщений</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <DollarSign size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">${user.moneySpent.toFixed(2)}</span>
                    <span className="stat-label">Потрачено</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Лимиты и доступы */}
          <section className="card detail-card">
            <header className="card-header">
              <p className="card-title">Лимиты и доступы</p>
            </header>
            <div className="card-body">
              <div className="detail-grid">
                <div className="detail-item detail-item-full">
                  <div className="detail-icon">
                    <Calendar size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Текущие лимиты</span>
                    <span className="detail-value">{user.limits}</span>
                  </div>
                </div>

                <div className="detail-item detail-item-full">
                  <div className="detail-icon">
                    <Wrench size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Доступные инструменты</span>
                    <div className="detail-tags">
                      {user.availableTools.split(', ').map((tool, index) => (
                        <span key={index} className="detail-tag">{tool}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="detail-item detail-item-full">
                  <div className="detail-icon">
                    <Cpu size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Доступные модели</span>
                    <div className="detail-tags">
                      {user.availableModels.split(', ').map((model, index) => (
                        <span key={index} className="detail-tag detail-tag-model">{model}</span>
                      ))}
                    </div>
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

export default UserDetails
