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
  List,
  ChevronDown,
  ChevronRight,
  Bot,
  Search,
  HelpCircle,
  FileCheck
} from 'lucide-react'

const BOTS = [
  { id: 'five-why', name: 'Пять почему', icon: HelpCircle },
  { id: 'searcher', name: 'Поисковик', icon: Search }
]

const TOOLS = [
  { id: 'tz-expert', name: 'ТЗ-эксперт', icon: FileCheck }
]

const SECTION_ICONS = {
  dashboards: LayoutDashboard,
  users: Users,
  dialogs: MessageSquare,
  files: FileText,
  tools: Wrench,
  models: Cpu,
  bots: Bot
}

const ADMIN_SECTIONS = [
  { id: 'dashboards', label: 'Дашборды' },
  { id: 'users', label: 'Пользователи' },
  { id: 'dialogs', label: 'Диалоги' },
  { id: 'files', label: 'Файлы' },
  { id: 'tools', label: 'Инструменты' },
  { id: 'bots', label: 'Боты' }
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
  onViewAllChats = () => {},
  onBotSelect = () => {},
  onToolSelect = () => {},
  activeBot = null,
  activeTool = null,
  // Props для режима admin
  activeSection = 'dashboards',
  onSectionSelect = () => {}
}) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [botsExpanded, setBotsExpanded] = useState(false)
  const [toolsExpanded, setToolsExpanded] = useState(false)

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

  const handleBotClick = (bot) => {
    if (!isOpen) {
      onToggle(true)
      setTimeout(() => onBotSelect(bot), 300)
    } else {
      onBotSelect(bot)
    }
  }

  const handleToolClick = (tool) => {
    if (!isOpen) {
      onToggle(true)
      setTimeout(() => onToolSelect(tool), 300)
    } else {
      onToolSelect(tool)
    }
  }

  const toggleBotsSection = () => {
    if (!isOpen) {
      onToggle(true)
      setTimeout(() => setBotsExpanded(true), 300)
    } else {
      setBotsExpanded(!botsExpanded)
    }
  }

  const toggleToolsSection = () => {
    if (!isOpen) {
      onToggle(true)
      setTimeout(() => setToolsExpanded(true), 300)
    } else {
      setToolsExpanded(!toolsExpanded)
    }
  }

  const renderChatMode = () => (
    <>
      {/* Раздел Боты */}
      <div className="sidebar-section">
        <button
          type="button"
          className="sidebar-section-header"
          onClick={toggleBotsSection}
          title="Боты"
        >
          <span className="sidebar-section-icon">
            <Bot size={18} />
          </span>
          <span className="sidebar-section-title">Боты</span>
          <span className="sidebar-section-chevron">
            {botsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        </button>
        {botsExpanded && isOpen && (
          <div className="sidebar-section-content">
            {BOTS.map((bot) => {
              const Icon = bot.icon
              return (
                <button
                  key={bot.id}
                  type="button"
                  className={`sidebar-section-item ${activeBot === bot.id ? 'is-active' : ''}`}
                  onClick={() => handleBotClick(bot)}
                  title={bot.name}
                >
                  <span className="sidebar-section-item-icon">
                    <Icon size={16} />
                  </span>
                  <span className="sidebar-section-item-text">{bot.name}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Раздел Инструменты */}
      <div className="sidebar-section">
        <button
          type="button"
          className="sidebar-section-header"
          onClick={toggleToolsSection}
          title="Инструменты"
        >
          <span className="sidebar-section-icon">
            <Wrench size={18} />
          </span>
          <span className="sidebar-section-title">Инструменты</span>
          <span className="sidebar-section-chevron">
            {toolsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        </button>
        {toolsExpanded && isOpen && (
          <div className="sidebar-section-content">
            {TOOLS.map((tool) => {
              const Icon = tool.icon
              return (
                <button
                  key={tool.id}
                  type="button"
                  className={`sidebar-section-item ${activeTool === tool.id ? 'is-active' : ''}`}
                  onClick={() => handleToolClick(tool)}
                  title={tool.name}
                >
                  <span className="sidebar-section-item-icon">
                    <Icon size={16} />
                  </span>
                  <span className="sidebar-section-item-text">{tool.name}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

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

        <button
          type="button"
          className="chat-item view-all-chats-btn"
          onClick={onViewAllChats}
          title="Смотреть все чаты"
        >
          <span className="chat-item-icon">
            <List size={18} />
          </span>
          <span className="chat-item-text">Смотреть все чаты</span>
        </button>
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
