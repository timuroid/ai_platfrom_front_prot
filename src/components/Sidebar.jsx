import React, { useState } from 'react'
import {
  Plus,
  MessageSquare,
  User,
  Settings,
  Shield,
  ArrowLeft,
  LayoutDashboard,
  Users,
  FileText,
  Wrench,
  Cpu,
  List
} from 'lucide-react'

const SECTION_ICONS = {
  dashboards: LayoutDashboard,
  users: Users,
  dialogs: MessageSquare,
  files: FileText,
  tools: Wrench,
  models: Cpu
}

const ADMIN_SECTIONS = [
  { id: 'dashboards', label: 'Дашборды' },
  { id: 'users', label: 'Пользователи' },
  { id: 'dialogs', label: 'Диалоги' },
  { id: 'files', label: 'Файлы' }
]

export default function Sidebar({
  mode = 'chat', // 'chat' или 'admin'
  isOpen = true,
  onToggle = () => {},
  // Props для режима chat
  chats = [],
  activeChat = null,
  onChatSelect = () => {},
  onNewChat = () => {},
  onShowSettings = () => {},
  // Props для режима admin
  activeSection = 'dashboards',
  onSectionSelect = () => {}
}) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleBackToChat = () => {
    window.location.hash = '/'
  }

  const handleGoToAdmin = () => {
    window.location.hash = '/admin'
    setShowUserMenu(false)
  }

  const handleToggleSidebar = () => {
    onToggle(!isOpen)
    if (!isOpen) {
      setShowUserMenu(false)
    }
  }

  const handleNewChat = () => {
    if (!isOpen) {
      // Если панель закрыта, открываем её и создаём новый чат
      onToggle(true);
      // Небольшая задержка для плавного открытия перед созданием чата
      setTimeout(() => {
        onNewChat();
      }, 300);
    } else {
      // Если панель открыта, просто создаём новый чат
      onNewChat();
    }
  };

  const handleViewAllChats = () => {
    window.location.hash = '/chats'
  }

  const renderChatMode = () => (
    <>
      <div className="sidebar-action">
        <button
          type="button"
          className="sidebar-button"
          onClick={handleNewChat}
          title="Новый чат"
        >
          <span className="sidebar-button-icon">
            <Plus size={20} />
          </span>
          <span className="sidebar-button-text">Новый чат</span>
        </button>
      </div>

      <div className="sidebar-action sidebar-action-secondary">
        <button
          type="button"
          className="sidebar-button sidebar-button-secondary"
          onClick={handleViewAllChats}
          title="Смотреть все чаты"
        >
          <span className="sidebar-button-icon">
            <List size={20} />
          </span>
          <span className="sidebar-button-text">Смотреть все чаты</span>
        </button>
      </div>

      <div className={`chat-list ${!isOpen ? 'is-collapsed' : ''}`}>
        {chats.map((chat) => (
          <button
            key={chat.id}
            type="button"
            onClick={() => onChatSelect(chat)}
            className={`chat-item ${activeChat === chat.id ? 'is-active' : ''}`}
          >
            <span className="chat-item-icon">
              <MessageSquare size={18} />
            </span>
            <span className="chat-item-text truncate">{chat.title}</span>
          </button>
        ))}
      </div>

      <div className="user-section">
        <button
          type="button"
          className="user-button"
          onClick={() => {
            if (!isOpen) {
              onToggle(true);
              setTimeout(() => setShowUserMenu(true), 300);
            } else {
              setShowUserMenu((prev) => !prev);
            }
          }}
          title="Пользователь"
        >
          <span className="user-avatar">
            <User size={18} />
          </span>
          <span className="user-label">Пользователь</span>
        </button>

        {showUserMenu && isOpen && (
          <div className="user-menu">
            <button type="button" onClick={() => {
              setShowUserMenu(false);
              onShowSettings();
            }}>
              <Settings size={18} />
              <span>Настройки</span>
            </button>
            <button type="button" onClick={handleGoToAdmin}>
              <Shield size={18} />
              <span>Админ панель</span>
            </button>
          </div>
        )}
      </div>
    </>
  )

  const renderAdminMode = () => {
    const renderSectionButton = (section) => {
      const Icon = SECTION_ICONS[section.id] || LayoutDashboard
      const isActive = activeSection === section.id

      return (
        <button
          type="button"
          key={section.id}
          className={`chat-item ${isActive ? 'is-active' : ''}`}
          title={section.label}
          onClick={() => onSectionSelect(section.id)}
        >
          <span className="chat-item-icon">
            <Icon size={18} />
          </span>
          <span className="chat-item-text truncate">{section.label}</span>
        </button>
      )
    }

    return (
      <>
        <div className="chat-list admin-nav-list">
          {ADMIN_SECTIONS.map((section) => renderSectionButton(section))}
        </div>

        <div className="user-section">
          <button
            type="button"
            className="user-button"
            onClick={handleBackToChat}
            title="Назад к чату"
          >
            <span className="user-avatar">
              <ArrowLeft size={16} />
            </span>
            <span className="user-label">Назад к чату</span>
          </button>
        </div>
      </>
    )
  }

  return (
    <aside className={`app-sidebar ${mode === 'admin' ? 'admin-sidebar' : ''} ${isOpen ? '' : 'is-collapsed'}`}>
      <div className="sidebar-header">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={handleToggleSidebar}
          aria-label={isOpen ? 'Свернуть панель' : 'Развернуть панель'}
        >
        </button>
      </div>

      {mode === 'chat' ? renderChatMode() : renderAdminMode()}
    </aside>
  )
}

