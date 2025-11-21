import React from 'react'
import { MessageSquare, User, Calendar, Clock, Cpu, Wrench, Mic, FileText, DollarSign, Bot } from 'lucide-react'
import Breadcrumbs from './Breadcrumbs.jsx'
import './DetailPage.css'

// Моковые сообщения диалога
const MOCK_MESSAGES = [
  {
    id: 1,
    role: 'user',
    content: 'Привет! Помоги мне разобраться с техническим заданием для нового проекта.',
    timestamp: '2025-11-10T08:00:15'
  },
  {
    id: 2,
    role: 'assistant',
    content: 'Здравствуйте! Конечно, помогу вам с техническим заданием. Расскажите подробнее о проекте: какова его цель, основные функции и целевая аудитория?',
    timestamp: '2025-11-10T08:00:45'
  },
  {
    id: 3,
    role: 'user',
    content: 'Мы разрабатываем систему управления задачами для команды из 50 человек. Нужна возможность создавать проекты, задачи, назначать исполнителей и отслеживать прогресс.',
    timestamp: '2025-11-10T08:02:30'
  },
  {
    id: 4,
    role: 'assistant',
    content: 'Отлично! Для системы управления задачами с такими требованиями я рекомендую включить следующие модули:\n\n1. **Управление проектами** - создание, редактирование, архивирование проектов\n2. **Управление задачами** - создание задач с приоритетами, дедлайнами, статусами\n3. **Система ролей** - администраторы, менеджеры, исполнители\n4. **Дашборд** - обзор активности и прогресса\n5. **Уведомления** - email и push-уведомления\n\nХотите, чтобы я детализировал каждый модуль?',
    timestamp: '2025-11-10T08:03:15'
  },
  {
    id: 5,
    role: 'user',
    content: 'Да, давай начнем с модуля управления задачами.',
    timestamp: '2025-11-10T08:05:00'
  }
]

const DialogDetails = ({ dialog, onBack }) => {
  if (!dialog) return null

  const breadcrumbItems = [
    { id: 'dialogs', label: 'Диалоги', section: 'dialogs' },
    { id: 'dialog-detail', label: dialog.dialogNumber }
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
        <h1 className="page-heading">Диалог {dialog.dialogNumber}</h1>
      </header>

      <div className="admin-viewport">
        <div className="admin-content">
          {/* Информация о диалоге */}
          <section className="card detail-card">
            <header className="card-header">
              <p className="card-title">Информация о диалоге</p>
            </header>
            <div className="card-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-icon">
                    <User size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Пользователь</span>
                    <span className="detail-value">{dialog.user}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <Calendar size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Дата создания</span>
                    <span className="detail-value">
                      {new Date(dialog.createdAt).toLocaleString('ru-RU')}
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
                      {new Date(dialog.lastActivity).toLocaleString('ru-RU')}
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <MessageSquare size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Глубина диалога</span>
                    <span className="detail-value">{dialog.depth} сообщений</span>
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
                    <Mic size={24} />
                  </div>
                  <div className="stat-content">
                    <span className={`badge ${dialog.voiceInput === 'Да' ? 'badge-success' : 'badge-neutral'}`}>
                      {dialog.voiceInput}
                    </span>
                    <span className="stat-label">Голосовой ввод</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <FileText size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{dialog.filesCount}</span>
                    <span className="stat-label">Файлов</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <DollarSign size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">${dialog.cost.toFixed(2)}</span>
                    <span className="stat-label">Стоимость</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Использованные модели и инструменты */}
          <section className="card detail-card">
            <header className="card-header">
              <p className="card-title">Использованные ресурсы</p>
            </header>
            <div className="card-body">
              <div className="detail-grid">
                <div className="detail-item detail-item-full">
                  <div className="detail-icon">
                    <Cpu size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Модели</span>
                    <div className="detail-tags">
                      {dialog.models.split(', ').map((model, index) => (
                        <span key={index} className="detail-tag detail-tag-model">{model}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="detail-item detail-item-full">
                  <div className="detail-icon">
                    <Wrench size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Инструменты</span>
                    <div className="detail-tags">
                      {dialog.tools === 'Нет' ? (
                        <span className="text-small">Не использовались</span>
                      ) : (
                        dialog.tools.split(', ').map((tool, index) => (
                          <span key={index} className="detail-tag">{tool}</span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* История диалога */}
          <section className="card detail-card">
            <header className="card-header">
              <p className="card-title">История диалога</p>
            </header>
            <div className="card-body">
              <div className="dialog-messages">
                {MOCK_MESSAGES.map((message) => (
                  <div
                    key={message.id}
                    className={`dialog-message ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}
                  >
                    <div className="message-header">
                      <div className="message-avatar">
                        {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <span className="message-role">
                        {message.role === 'user' ? 'Пользователь' : 'Ассистент'}
                      </span>
                      <span className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="message-content">
                      {message.content.split('\n').map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default DialogDetails
