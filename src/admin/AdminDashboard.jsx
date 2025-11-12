import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  Users,
  MessageSquare,
  FileUp,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Target,
  Activity,
  FileText,
  Image,
  Search,
  Clock
} from 'lucide-react'
import Sidebar from '../components/Sidebar.jsx'
import EmptyState from './components/EmptyState.jsx'
import './Admin.css'

const MODEL_OPTIONS = [
  { value: 'all', label: 'Все модели' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5', label: 'GPT-3.5 Turbo' },
  { value: 'claude-3', label: 'Claude 3' },
  { value: 'gemini', label: 'Gemini Pro' }
]

const DASHBOARD_MODES = {
  activity: {
    id: 'activity',
    title: 'Активность',
    defaultSeries: ['dau', 'dialogs', 'messages'],
    series: [
      { id: 'dau', label: 'DAU' },
      { id: 'dialogs', label: 'Новые диалоги' },
      { id: 'messages', label: 'Сообщения' }
    ],
    kpis: [
      { id: 'dau', label: 'DAU', icon: Users, trend: 'up', trendValue: '+12%' },
      { id: 'newUsers', label: 'Новые пользователи', icon: TrendingUp, trend: 'up', trendValue: '+8%' },
      { id: 'newDialogs', label: 'Новые диалоги', icon: MessageSquare, trend: 'up', trendValue: '+15%' },
      { id: 'stickiness', label: 'Приверженность', icon: Target, trend: 'neutral', trendValue: '45%' }
    ]
  },
  cost: {
    id: 'cost',
    title: 'Стоимость',
    defaultSeries: ['cost', 'tokensIn', 'tokensOut'],
    series: [
      { id: 'cost', label: 'Стоимость' },
      { id: 'tokensIn', label: 'Tokens in' },
      { id: 'tokensOut', label: 'Tokens out' }
    ],
    kpis: [
      { id: 'totalCost', label: 'Общая стоимость', icon: DollarSign, trend: 'up', trendValue: '$2.4K' },
      { id: 'costPerActive', label: 'Стоимость/активный', icon: Users, trend: 'down', trendValue: '$0.85' },
      { id: 'tokensIn', label: 'Tokens in', icon: TrendingUp, trend: 'up', trendValue: '12.5M' },
      { id: 'tokensOut', label: 'Tokens out', icon: TrendingDown, trend: 'up', trendValue: '8.2M' }
    ]
  }
}

const MANAGEMENT_SECTIONS = {
  users: {
    title: 'Пользователи',
    columns: ['Пользователь', 'Первая активность', 'Последняя активность', 'Диалоги', 'Сообщения', 'Вызовы инструментов', 'Загрузки', 'Tokens in/out', 'Стоимость $', '% отклонённых', '% лайков'],
    filters: [
      { id: 'activityFrom', label: 'Активность с', type: 'date' },
      { id: 'activityTo', label: 'Активность по', type: 'date' },
      { id: 'model', label: 'Модель', type: 'select', options: MODEL_OPTIONS },
      {
        id: 'status',
        label: 'Статус',
        type: 'select',
        options: [
          { value: 'all', label: 'Все' },
          { value: 'new', label: 'Новый' },
          { value: 'return', label: 'Возврат' }
        ]
      }
    ]
  },
  dialogs: {
    title: 'Диалоги',
    columns: ['Диалог', 'Пользователь', 'Старт', 'Сообщений', 'Инструменты', 'Файлы', 'Голос', 'Tokens in/out', 'Стоимость $', 'Ср. TTFT/TTLT', 'Причина завершения'],
    filters: [
      { id: 'periodFrom', label: 'Период с', type: 'date' },
      { id: 'periodTo', label: 'Период по', type: 'date' },
      { id: 'model', label: 'Модель', type: 'select', options: MODEL_OPTIONS },
      {
        id: 'status',
        label: 'Статус',
        type: 'select',
        options: [
          { value: 'all', label: 'Все' },
          { value: 'active', label: 'Активен' },
          { value: 'closed', label: 'Закрыт' }
        ]
      },
      {
        id: 'traits',
        label: 'Признаки',
        type: 'checkbox-group',
        options: [
          { value: 'tools', label: 'Есть инструменты' },
          { value: 'files', label: 'Есть файлы' },
          { value: 'voice', label: 'Есть голос' }
        ]
      }
    ]
  },
  files: {
    title: 'Файлы',
    columns: ['Имя', 'Тип', 'Размер (MB)', 'Загружен', 'Пользователь', 'Диалог', 'DLP отклонён', 'Причина', 'Назначение', 'Модель'],
    filters: [
      { id: 'periodFrom', label: 'Период с', type: 'date' },
      { id: 'periodTo', label: 'Период по', type: 'date' },
      {
        id: 'type',
        label: 'Тип',
        type: 'select',
        options: [
          { value: 'all', label: 'Все' },
          { value: 'docx', label: 'DOCX' },
          { value: 'xlsx', label: 'XLSX' },
          { value: 'csv', label: 'CSV' },
          { value: 'pdf', label: 'PDF' },
          { value: 'img', label: 'Изображения' },
          { value: 'other', label: 'Другие' }
        ]
      },
      {
        id: 'status',
        label: 'Статус',
        type: 'select',
        options: [
          { value: 'all', label: 'Все' },
          { value: 'approved', label: 'Принят' },
          { value: 'rejected', label: 'Отклонён' }
        ]
      },
      { id: 'sizeMin', label: 'Размер от (MB)', type: 'number' },
      { id: 'sizeMax', label: 'Размер до (MB)', type: 'number' }
    ]
  },
  tools: {
    title: 'Инструменты (управление)',
    columns: ['Инструмент', 'Описание', 'Статус', 'Вызовы 30д', 'Ошибки %', '$/Invoke', 'Действия'],
    filters: [
      {
        id: 'status',
        label: 'Статус',
        type: 'select',
        options: [
          { value: 'all', label: 'Все' },
          { value: 'on', label: 'Включён' },
          { value: 'off', label: 'Выключен' }
        ]
      },
      { id: 'search', label: 'Поиск', type: 'text', placeholder: 'Название инструмента' }
    ]
  },
  models: {
    title: 'Модели (управление)',
    columns: ['Модель', 'Статус', 'Запросы 30д', 'Tokens in/out (M)', 'Cost ($)', 'P95 TTFT', 'Error %', 'Pricing (in/out)', 'Действия'],
    filters: [
      {
        id: 'status',
        label: 'Статус',
        type: 'select',
        options: [
          { value: 'all', label: 'Все' },
          { value: 'prod', label: 'Production' },
          { value: 'pilot', label: 'Pilot' },
          { value: 'disabled', label: 'Отключена' }
        ]
      },
      { id: 'provider', label: 'Провайдер', type: 'text', placeholder: 'OpenAI, Anthropic…' }
    ]
  }
}

const DASHBOARD_MODE_IDS = Object.keys(DASHBOARD_MODES)
const DASHBOARD_FILTER_KEYS = ['from', 'to', 'model']

const DEFAULT_FILTERS = {
  dashboards: { from: '', to: '', model: 'all' },
  users: { activityFrom: '', activityTo: '', model: 'all', status: 'all' },
  dialogs: { periodFrom: '', periodTo: '', model: 'all', status: 'all', traits: [] },
  files: { periodFrom: '', periodTo: '', type: 'all', status: 'all', sizeMin: '', sizeMax: '' },
  tools: { status: 'all', search: '' },
  models: { status: 'all', provider: '' }
}

const parseHashState = () => {
  const hash = window.location.hash || '#/admin'
  if (!hash.startsWith('#/admin')) return {}
  const [, query = ''] = hash.split('?')
  const params = new URLSearchParams(query)
  const result = {}
  params.forEach((value, key) => {
    result[key] = value
  })
  return result
}

const pickDashboardFilters = (params = {}) => {
  const next = { ...DEFAULT_FILTERS.dashboards }
  DASHBOARD_FILTER_KEYS.forEach((key) => {
    if (params[key]) next[key] = params[key]
  })
  return next
}

const buildHash = (section, mode, dashboardFilters = {}) => {
  const params = new URLSearchParams()
  params.set('section', section)
  if (section === 'dashboards') {
    params.set('mode', mode)
    DASHBOARD_FILTER_KEYS.forEach((key) => {
      if (dashboardFilters[key]) params.set(key, dashboardFilters[key])
    })
  }
  const query = params.toString()
  return query ? `#/admin?${query}` : '#/admin'
}

const ROOT_SECTIONS = ['dashboards', 'users', 'dialogs', 'files']

export default function AdminDashboard() {
  const initialQuery = useMemo(() => parseHashState(), [])
  const initialSection = ROOT_SECTIONS.includes(initialQuery.section)
    ? initialQuery.section
    : 'dashboards'

  const [section, setSection] = useState(initialSection)
  const [dashboardMode, setDashboardMode] = useState(DASHBOARD_MODES[initialQuery.mode]?.id || 'activity')
  const [filters, setFilters] = useState(() => {
    const base = structuredClone(DEFAULT_FILTERS)
    base.dashboards = pickDashboardFilters(initialQuery)
    return base
  })
  const [seriesState, setSeriesState] = useState({})
  const [navOpen, setNavOpen] = useState(true)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const dropdownRefs = useRef({})

  const dashboardFilters = filters.dashboards || DEFAULT_FILTERS.dashboards
  const currentDashboardMode = DASHBOARD_MODES[dashboardMode]
  const currentManagement = MANAGEMENT_SECTIONS[section]

  useEffect(() => {
    const handler = () => {
      const params = parseHashState()
      if (params.section && ROOT_SECTIONS.includes(params.section)) {
        setSection(params.section)
      }
      if (params.section === 'dashboards' && params.mode && DASHBOARD_MODES[params.mode]) {
        setDashboardMode(params.mode)
        setFilters((prev) => ({ ...prev, dashboards: pickDashboardFilters(params) }))
      }
    }
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  useEffect(() => {
    const nextHash = buildHash(section, dashboardMode, dashboardFilters)
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash
    }
  }, [section, dashboardMode, dashboardFilters])

  useEffect(() => {
    if (!openDropdown) return undefined
    const handleClick = (event) => {
      const node = dropdownRefs.current[openDropdown]
      if (node && !node.contains(event.target)) {
        setOpenDropdown(null)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openDropdown])

  useEffect(() => {
    setOpenDropdown(null)
  }, [section])

  const updateFilter = (sectionId, fieldId, value) => {
    setFilters((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [fieldId]: value }
    }))
  }

  const toggleCheckboxValue = (sectionId, fieldId, option) => {
    const list = Array.isArray(filters[sectionId][fieldId]) ? filters[sectionId][fieldId] : []
    const exists = list.includes(option)
    const next = exists ? list.filter((item) => item !== option) : [...list, option]
    updateFilter(sectionId, fieldId, next)
  }

  const activeSeries = useMemo(() => {
    if (!currentDashboardMode) return []
    const saved = seriesState[dashboardMode]
    if (saved?.length) return saved
    return currentDashboardMode.defaultSeries || []
  }, [dashboardMode, seriesState, currentDashboardMode])

  const toggleSeries = (id) => {
    if (!currentDashboardMode) return
    setSeriesState((prev) => {
      const current = prev[dashboardMode]?.length ? prev[dashboardMode] : currentDashboardMode.defaultSeries || []
      let next
      if (current.includes(id)) {
        next = current.filter((item) => item !== id)
        if (!next.length) next = [id]
      } else {
        next = [...current, id]
        if (next.length > 3) next = next.slice(next.length - 3)
      }
      return { ...prev, [dashboardMode]: next }
    })
  }

  const registerDropdown = (key) => (node) => {
    if (node) {
      dropdownRefs.current[key] = node
    } else {
      delete dropdownRefs.current[key]
    }
  }

  const toggleDropdownMenu = (key) => {
    setOpenDropdown((prev) => (prev === key ? null : key))
  }

  const renderSelectDropdown = ({ sectionId, filter, value, onChange, scope = 'filters' }) => {
    if (!filter?.options?.length) return null
    const dropdownKey = `${scope}:${sectionId}:${filter.id}`
    const resolvedValue =
      value !== undefined ? value : filters[sectionId]?.[filter.id] ?? filter.options[0]?.value ?? ''
    const selectedOption = filter.options.find((option) => option.value === resolvedValue) || filter.options[0]
    const isOpen = openDropdown === dropdownKey
    const handleSelect = (nextValue) => {
      if (onChange) {
        onChange(nextValue)
      } else {
        updateFilter(sectionId, filter.id, nextValue)
      }
      setOpenDropdown(null)
    }

    return (
      <div className="field select-field" key={`${sectionId}-${filter.id}`}>
        <span>{filter.label}</span>
        <div className={`select-control ${isOpen ? 'is-open' : ''}`} ref={registerDropdown(dropdownKey)}>
          <button
            type="button"
            className="select-button"
            onClick={() => toggleDropdownMenu(dropdownKey)}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className="select-value">{selectedOption?.label ?? 'Не выбрано'}</span>
            <ChevronDown size={16} aria-hidden="true" />
          </button>
          {isOpen && (
            <ul className="select-panel" role="listbox">
              {filter.options.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    className={`select-option ${option.value === resolvedValue ? 'is-active' : ''}`}
                    role="option"
                    aria-selected={option.value === resolvedValue}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    )
  }

  const renderSeriesToggles = () => {
    if (!currentDashboardMode) return null
    return (
      <div className="series-toggle-group">
        {currentDashboardMode.series.map((serie) => (
          <button
            type="button"
            key={serie.id}
            className={`series-chip ${activeSeries.includes(serie.id) ? 'is-active' : ''}`}
            onClick={() => toggleSeries(serie.id)}
          >
            {serie.label}
          </button>
        ))}
      </div>
    )
  }

  const renderAnalyticsDetail = () => {
    if (!currentDashboardMode) return null
    const columns = currentDashboardMode.detailColumns || []
    return (
      <section className="card detail-card">
        <header className="card-header">
          <p className="card-title">Детализация</p>
        </header>
        <div className="card-body">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={columns.length} style={{ padding: 0, border: 'none' }}>
                    <EmptyState
                      title="Нет данных"
                      description="Подключите источник данных для отображения детальной информации"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    )
  }

  const renderKpis = () => {
    if (!currentDashboardMode) return null
    return (
      <section className="kpi-grid">
        {currentDashboardMode.kpis.map((kpi) => {
          const Icon = kpi.icon
          const trendClass = `kpi-trend kpi-trend-${kpi.trend}`
          const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : null

          return (
            <div className="kpi-card" key={kpi.id}>
              <div className="kpi-header">
                <div className="kpi-icon-wrapper">
                  {Icon && <Icon size={20} strokeWidth={2} />}
                </div>
                <span className="kpi-label">{kpi.label}</span>
              </div>
              <div className="kpi-body">
                <span className="kpi-value">{kpi.trendValue || '—'}</span>
                {TrendIcon && (
                  <span className={trendClass}>
                    <TrendIcon size={16} strokeWidth={2.5} />
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </section>
    )
  }

  const renderDashboardToolbar = () => (
    <header className="page-toolbar">
      <h1 className="page-heading">Единый дашборд</h1>
    </header>
  )

  const renderDashboardFilters = () => {
    const formatDateRange = () => {
      if (!dashboardFilters.from && !dashboardFilters.to) return 'Выберите период'
      if (dashboardFilters.from && dashboardFilters.to) {
        return `${new Date(dashboardFilters.from).toLocaleDateString('ru-RU')} — ${new Date(dashboardFilters.to).toLocaleDateString('ru-RU')}`
      }
      if (dashboardFilters.from) return `С ${new Date(dashboardFilters.from).toLocaleDateString('ru-RU')}`
      return `До ${new Date(dashboardFilters.to).toLocaleDateString('ru-RU')}`
    }

    return (
      <div className="filters-grid management-filters dashboard-filters">
        <div className="field">
          <span>Период</span>
          <div className="date-range-picker">
            <span className="date-range-display">{formatDateRange()}</span>
            <input
              type="date"
              className="date-range-input"
              value={dashboardFilters.from}
              onChange={(event) => updateFilter('dashboards', 'from', event.target.value)}
              placeholder="От"
            />
            <input
              type="date"
              className="date-range-input"
              value={dashboardFilters.to}
              onChange={(event) => updateFilter('dashboards', 'to', event.target.value)}
              placeholder="До"
            />
          </div>
        </div>
        {renderSelectDropdown({
          sectionId: 'dashboards',
          filter: { id: 'model', label: 'Модель', options: MODEL_OPTIONS },
          value: dashboardFilters.model,
          onChange: (nextValue) => updateFilter('dashboards', 'model', nextValue),
          scope: 'dashboard'
        })}
      </div>
    )
  }

  const renderDashboardAnalytics = () => {
    if (!currentDashboardMode) return null
    return (
      <>
        <section className="card chart-card">
          <header className="card-header">
            <p className="card-title">{currentDashboardMode.title}</p>
            {renderSeriesToggles()}
          </header>
          <div className="card-body">
            <div className="chart-placeholder">
              <p>Комбо-график (линия + столбцы + площадь)</p>
              <p className="placeholder-note">Активные серии: {activeSeries.join(', ')}</p>
            </div>
          </div>
        </section>
        {renderKpis()}
      </>
    )
  }

  const renderFilterControl = (sectionId, filter) => {
    const value = filters[sectionId][filter.id]
    if (filter.type === 'checkbox-group') {
      return (
        <div className="field checkbox-field" key={filter.id}>
          <span>{filter.label}</span>
          <div className="checkbox-row">
            {filter.options.map((option) => (
              <label className="checkbox-pill" key={option.value}>
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={() => toggleCheckboxValue(sectionId, filter.id, option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )
    }

    if (filter.type === 'select') {
      return renderSelectDropdown({ sectionId, filter })
    }

    const inputType = filter.type === 'number' ? 'number' : 'date'
    const fieldClassName = `field ${inputType === 'date' ? 'field-date' : ''}`

    return (
      <label className={fieldClassName} key={filter.id}>
        <span>{filter.label}</span>
        <input
          type={inputType}
          value={value}
          placeholder={filter.placeholder}
          onChange={(event) => updateFilter(sectionId, filter.id, event.target.value)}
        />
      </label>
    )
  }

  const renderManagementView = () => {
    if (!currentManagement) return null

    // Подсчет активных фильтров
    const activeFiltersCount = currentManagement.filters.reduce((count, filter) => {
      const value = filters[section]?.[filter.id]
      if (!value) return count
      if (Array.isArray(value) && value.length > 0) return count + 1
      if (typeof value === 'string' && value !== '' && value !== 'all') return count + 1
      return count
    }, 0)

    return (
      <>
        <header className="page-toolbar">
          <h1 className="page-heading">{currentManagement.title}</h1>
        </header>
        <div className="admin-content">
          <button
            type="button"
            className={`filters-toggle ${filtersOpen ? 'is-open' : ''}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <span>
              Фильтры
              {activeFiltersCount > 0 && (
                <span className="filters-toggle-badge">{activeFiltersCount}</span>
              )}
            </span>
            <ChevronDown size={20} />
          </button>
          <div className={`filters-grid management-filters is-collapsible ${filtersOpen ? 'is-open' : ''}`}>
            {currentManagement.filters.map((filter) => renderFilterControl(section, filter))}
          </div>
          <section className="card table-card">
            <header className="card-header">
              <p className="card-title">{currentManagement.title}</p>
            </header>
            <div className="card-body">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      {currentManagement.columns.map((column) => (
                        <th key={column}>{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={currentManagement.columns.length} style={{ padding: 0, border: 'none' }}>
                        <EmptyState
                          title="Нет данных"
                          description="Подключите источник данных для отображения информации"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </>
    )
  }

  return (
    <div className="admin-shell">
      {navOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setNavOpen(false)}
        />
      )}
      <Sidebar
        mode="admin"
        isOpen={navOpen}
        onToggle={setNavOpen}
        activeSection={section}
        onSectionSelect={setSection}
      />

      <main className="admin-main">
        {section === 'dashboards' ? (
          <>
            {renderDashboardToolbar()}
            <div className="admin-content dashboards-view">
              {renderDashboardFilters()}
              <div className="mode-switch-grid">
                {DASHBOARD_MODE_IDS.map((modeId) => (
                  <button
                    key={modeId}
                    type="button"
                    className={`dashboard-mode-button ${dashboardMode === modeId ? 'is-active' : ''}`}
                    onClick={() => setDashboardMode(modeId)}
                  >
                    <span className="mode-title">{DASHBOARD_MODES[modeId].title}</span>
                  </button>
                ))}
              </div>
              {renderDashboardAnalytics()}
            </div>
          </>
        ) : (
          renderManagementView()
        )}
      </main>
    </div>
  )
}
