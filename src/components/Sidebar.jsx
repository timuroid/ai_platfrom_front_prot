import React, { useState, useMemo } from 'react'
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

const MAX_VISIBLE_CHATS = 15

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
  const [chatsExpanded, setChatsExpanded] = useState(false)
  // Nested view states - когда выбран конкретный бот или инструмент
  const [nestedView, setNestedView] = useState(null) // { type: 'bot'|'tool', id: string, name: string, icon: Component }

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
    const activateBot = () => {
      setNestedView({ type: 'bot', id: bot.id, name: bot.name, icon: bot.icon })
      onBotSelect(bot)
    }

    if (!isOpen) {
      onToggle(true)
      setTimeout(activateBot, 300)
    } else {
      activateBot()
    }
  }

  const handleToolClick = (tool) => {
    const activateTool = () => {
      setNestedView({ type: 'tool', id: tool.id, name: tool.name, icon: tool.icon })
      onToolSelect(tool)
    }

    if (!isOpen) {
      onToggle(true)
      setTimeout(activateTool, 300)
    } else {
      activateTool()
    }
  }

  const handleBackFromNestedView = () => {
    setNestedView(null)
    // Сброс активного бота/инструмента при возврате
    if (nestedView?.type === 'bot') {
      onBotSelect(null)
    } else if (nestedView?.type === 'tool') {
      onToolSelect(null)
    }
  }

  const toggleChatsSection = () => {
    if (!isOpen) {
      onToggle(true)
      setTimeout(() => setChatsExpanded(true), 300)
    } else {
      setChatsExpanded(!chatsExpanded)
    }
  }

  // Фильтрация чатов для nested view (чаты конкретного бота)
  const filteredChats = useMemo(() => {
    if (!nestedView) return chats
    if (nestedView.type === 'bot') {
      return chats.filter(chat => chat.botId === nestedView.id)
    }
    if (nestedView.type === 'tool') {
      return chats.filter(chat => chat.toolId === nestedView.id)
    }
    return chats
  }, [chats, nestedView])

  // Ограничение отображаемых чатов
  const visibleChats = useMemo(() => {
    const source = nestedView ? filteredChats : chats
    return source.slice(0, MAX_VISIBLE_CHATS)
  }, [filteredChats, chats, nestedView])

  const hasMoreChats = useMemo(() => {
    const source = nestedView ? filteredChats : chats
    return source.length > MAX_VISIBLE_CHATS
  }, [filteredChats, chats, nestedView])

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

  // Рендер nested view (когда выбран бот или инструмент)
  const renderNestedView = () => {
    const Icon = nestedView.icon
    const typeLabel = nestedView.type === 'bot' ? 'бота' : 'инструмента'

    return (
      <div className="sidebar-nested-view">
        {/* Кнопка Назад */}
        <button
          type="button"
          className="sidebar-back-button"
          onClick={handleBackFromNestedView}
          title="Назад"
        >
          <span className="sidebar-back-icon">
            <ArrowLeft size={18} />
          </span>
          <span className="sidebar-back-text">Назад</span>
        </button>

        {/* Выбранный бот/инструмент */}
        <div className="sidebar-nested-header">
          <span className="sidebar-nested-icon">
            <Icon size={20} />
          </span>
          <span className="sidebar-nested-title">{nestedView.name}</span>
        </div>

        {/* Чаты этого бота/инструмента */}
        <div className="sidebar-nested-chats-label">
          Чаты {typeLabel}
        </div>

        <div className={`chat-list nested-chat-list ${!isOpen ? 'is-collapsed' : ''}`}>
          {visibleChats.length > 0 ? (
            visibleChats.map((chat) => (
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
            ))
          ) : (
            <div className="sidebar-empty-state">
              Нет чатов
            </div>
          )}

          {hasMoreChats && (
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
          )}
        </div>
      </div>
    )
  }

  // Рендер обычного вида сайдбара
  const renderDefaultView = () => (
    <div className="sidebar-default-view">
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

      {/* Отступ между Инструменты и Новый чат */}
      <div className="sidebar-spacer" />

      {/* Кнопка Новый чат */}
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

      {/* Раздел Чаты */}
      <div className="sidebar-section sidebar-chats-section">
        <button
          type="button"
          className="sidebar-section-header"
          onClick={toggleChatsSection}
          title="Чаты"
        >
          <span className="sidebar-section-icon">
            <MessageSquare size={18} />
          </span>
          <span className="sidebar-section-title">Чаты</span>
          <span className="sidebar-section-chevron">
            {chatsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        </button>
        {chatsExpanded && isOpen && (
          <div className={`chat-list ${!isOpen ? 'is-collapsed' : ''}`}>
            {visibleChats.map((chat) => (
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

            {hasMoreChats && (
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
            )}
          </div>
        )}
      </div>
    </div>
  )

  const renderChatMode = () => (
    <div className={`sidebar-content-wrapper ${nestedView ? 'has-nested-view' : ''}`}>
      {nestedView ? renderNestedView() : renderDefaultView()}

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
    </div>
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
