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
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  UserX,
  Settings,
  Wrench,
  Cpu
} from 'lucide-react'
import Sidebar from '../components/Sidebar.jsx'
import EmptyState from './components/EmptyState.jsx'
import DateRangePicker from './components/DateRangePicker.jsx'
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
    columns: ['ФИО', 'Роль', 'Дата последней активности', 'Количество активных чатов', 'Количество сообщений', 'Потрачено денег', 'Текущие лимиты', 'Доступные инструменты', 'Доступные модели'],
    sortableColumns: ['fio', 'role', 'lastActivity', 'activeChats', 'messagesCount', 'moneySpent', null, null, null],
    filters: [
      { id: 'period', label: 'Период', type: 'date-range', fromField: 'activityFrom', toField: 'activityTo' },
      { id: 'fio', label: 'Поиск по ФИО', type: 'text', placeholder: 'Введите ФИО' },
      {
        id: 'role',
        label: 'Роль',
        type: 'select',
        options: [
          { value: 'all', label: 'Все' },
          { value: 'admin', label: 'Администратор' },
          { value: 'user', label: 'Пользователь' }
        ]
      }
    ]
  },
  dialogs: {
    title: 'Диалоги',
    columns: ['Номер диалога', 'Дата создания', 'Пользователь', 'Глубина', 'Последняя активность', 'Модели', 'Инструменты', 'Голосовой ввод', 'Количество файлов', 'Стоимость'],
    sortableColumns: ['dialogNumber', 'createdAt', 'user', 'depth', 'lastActivity', 'models', 'tools', 'voiceInput', 'filesCount', 'cost'],
    filters: [
      { id: 'period', label: 'Период', type: 'date-range', fromField: 'periodFrom', toField: 'periodTo' },
      { id: 'user', label: 'Поиск по пользователю', type: 'text', placeholder: 'Введите имя пользователя' }
    ]
  },
  files: {
    title: 'Файлы',
    columns: ['Название', 'Тип', 'Размер', 'Пользователь', 'Диалог', 'Дата загрузки', 'Статус DLP'],
    sortableColumns: ['name', 'type', 'size', 'user', 'dialog', 'uploadedAt', 'dlpStatus'],
    filters: [
      { id: 'period', label: 'Период', type: 'date-range', fromField: 'periodFrom', toField: 'periodTo' },
      {
        id: 'dlpStatus',
        label: 'Статус DLP',
        type: 'select',
        options: [
          { value: 'all', label: 'Все' },
          { value: 'approved', label: 'Принят' },
          { value: 'rejected', label: 'Отклонён' }
        ]
      },
      {
        id: 'type',
        label: 'Формат',
        type: 'select',
        options: [
          { value: 'all', label: 'Все' },
          { value: 'pdf', label: 'PDF' },
          { value: 'png', label: 'PNG' },
          { value: 'jpg', label: 'JPG' },
          { value: 'jpeg', label: 'JPEG' },
          { value: 'xlsx', label: 'XLSX' },
          { value: 'csv', label: 'CSV' },
          { value: 'doc', label: 'DOC' },
          { value: 'docx', label: 'DOCX' },
          { value: 'html', label: 'HTML' },
          { value: 'txt', label: 'TXT' }
        ]
      }
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

// Моковые данные
const MOCK_USERS = [
  { id: 1, fio: 'Иванов Иван Иванович', role: 'admin', lastActivity: '2025-11-12T10:30:00', activeChats: 5, messagesCount: 342, moneySpent: 125.50, limits: '100 msg/day, $10/day', availableTools: 'Web Search, Calculator, Code Interpreter', availableModels: 'GPT-4, GPT-3.5, Claude 3' },
  { id: 2, fio: 'Петрова Мария Сергеевна', role: 'user', lastActivity: '2025-11-11T15:22:00', activeChats: 3, messagesCount: 156, moneySpent: 45.20, limits: '50 msg/day, $5/day', availableTools: 'Web Search', availableModels: 'GPT-3.5' },
  { id: 3, fio: 'Сидоров Петр Александрович', role: 'user', lastActivity: '2025-11-10T09:15:00', activeChats: 7, messagesCount: 521, moneySpent: 189.75, limits: '150 msg/day, $15/day', availableTools: 'Web Search, Code Interpreter, Calculator', availableModels: 'GPT-4, Claude 3, Gemini Pro' },
  { id: 4, fio: 'Козлова Анна Дмитриевна', role: 'user', lastActivity: '2025-11-12T14:45:00', activeChats: 2, messagesCount: 89, moneySpent: 28.90, limits: '50 msg/day, $5/day', availableTools: 'Web Search, Calculator', availableModels: 'GPT-3.5' },
  { id: 5, fio: 'Морозов Алексей Викторович', role: 'admin', lastActivity: '2025-11-12T11:20:00', activeChats: 4, messagesCount: 267, moneySpent: 95.30, limits: '200 msg/day, $20/day', availableTools: 'Web Search, Code Interpreter, Calculator, Image Generation', availableModels: 'GPT-4, GPT-3.5, Claude 3, Gemini Pro' },
  { id: 6, fio: 'Новикова Елена Павловна', role: 'user', lastActivity: '2025-11-09T16:30:00', activeChats: 1, messagesCount: 43, moneySpent: 15.60, limits: '30 msg/day, $3/day', availableTools: 'Web Search', availableModels: 'GPT-3.5' },
  { id: 7, fio: 'Волков Дмитрий Игоревич', role: 'user', lastActivity: '2025-11-12T08:55:00', activeChats: 6, messagesCount: 412, moneySpent: 152.40, limits: '100 msg/day, $10/day', availableTools: 'Web Search, Code Interpreter', availableModels: 'GPT-4, Claude 3' },
  { id: 8, fio: 'Соколова Ольга Николаевна', role: 'user', lastActivity: '2025-11-11T13:10:00', activeChats: 3, messagesCount: 198, moneySpent: 67.80, limits: '75 msg/day, $7.5/day', availableTools: 'Web Search, Calculator', availableModels: 'GPT-4, GPT-3.5' }
]

const MOCK_DIALOGS = [
  { id: 1, dialogNumber: 'DLG-1001', createdAt: '2025-11-10T08:00:00', user: 'Иванов И.И.', depth: 15, lastActivity: '2025-11-12T10:30:00', models: 'GPT-4, Claude 3', tools: 'Web Search, Calculator', voiceInput: 'Да', filesCount: 3, cost: 12.45 },
  { id: 2, dialogNumber: 'DLG-1002', createdAt: '2025-11-09T14:30:00', user: 'Петрова М.С.', depth: 8, lastActivity: '2025-11-11T15:22:00', models: 'GPT-3.5', tools: 'Image Generation', voiceInput: 'Нет', filesCount: 1, cost: 5.20 },
  { id: 3, dialogNumber: 'DLG-1003', createdAt: '2025-11-11T09:15:00', user: 'Сидоров П.А.', depth: 23, lastActivity: '2025-11-12T11:45:00', models: 'GPT-4, Gemini Pro', tools: 'Code Interpreter, Web Search', voiceInput: 'Да', filesCount: 7, cost: 28.90 },
  { id: 4, dialogNumber: 'DLG-1004', createdAt: '2025-11-08T16:20:00', user: 'Козлова А.Д.', depth: 5, lastActivity: '2025-11-12T14:45:00', models: 'Claude 3', tools: 'Нет', voiceInput: 'Нет', filesCount: 0, cost: 3.15 },
  { id: 5, dialogNumber: 'DLG-1005', createdAt: '2025-11-12T07:00:00', user: 'Морозов А.В.', depth: 12, lastActivity: '2025-11-12T11:20:00', models: 'GPT-4', tools: 'Web Search, Calculator, Code Interpreter', voiceInput: 'Да', filesCount: 4, cost: 18.60 },
  { id: 6, dialogNumber: 'DLG-1006', createdAt: '2025-11-07T11:45:00', user: 'Новикова Е.П.', depth: 3, lastActivity: '2025-11-09T16:30:00', models: 'GPT-3.5', tools: 'Image Generation', voiceInput: 'Нет', filesCount: 2, cost: 2.80 },
  { id: 7, dialogNumber: 'DLG-1007', createdAt: '2025-11-11T13:30:00', user: 'Волков Д.И.', depth: 19, lastActivity: '2025-11-12T09:15:00', models: 'GPT-4, Claude 3, Gemini Pro', tools: 'Web Search, Code Interpreter', voiceInput: 'Да', filesCount: 5, cost: 22.75 },
  { id: 8, dialogNumber: 'DLG-1008', createdAt: '2025-11-10T15:00:00', user: 'Соколова О.Н.', depth: 10, lastActivity: '2025-11-11T13:10:00', models: 'GPT-4', tools: 'Calculator', voiceInput: 'Нет', filesCount: 1, cost: 9.40 }
]

const MOCK_FILES = [
  { id: 1, name: 'presentation.pdf', type: 'document', size: '2.5 MB', user: 'Иванов И.И.', dialog: 'DLG-1001', uploadedAt: '2025-11-10T08:15:00', dlpStatus: 'approved' },
  { id: 2, name: 'chart.png', type: 'image', size: '1.2 MB', user: 'Петрова М.С.', dialog: 'DLG-1002', uploadedAt: '2025-11-09T14:45:00', dlpStatus: 'approved' },
  { id: 3, name: 'data.xlsx', type: 'document', size: '3.8 MB', user: 'Сидоров П.А.', dialog: 'DLG-1003', uploadedAt: '2025-11-11T09:30:00', dlpStatus: 'approved' },
  { id: 4, name: 'confidential.docx', type: 'document', size: '0.8 MB', user: 'Козлова А.Д.', dialog: 'DLG-1004', uploadedAt: '2025-11-08T16:25:00', dlpStatus: 'rejected' },
  { id: 5, name: 'video_tutorial.mp4', type: 'video', size: '15.4 MB', user: 'Морозов А.В.', dialog: 'DLG-1005', uploadedAt: '2025-11-12T07:10:00', dlpStatus: 'approved' },
  { id: 6, name: 'audio_note.mp3', type: 'audio', size: '4.2 MB', user: 'Новикова Е.П.', dialog: 'DLG-1006', uploadedAt: '2025-11-07T11:50:00', dlpStatus: 'approved' },
  { id: 7, name: 'code_snippet.py', type: 'document', size: '0.1 MB', user: 'Волков Д.И.', dialog: 'DLG-1007', uploadedAt: '2025-11-11T13:45:00', dlpStatus: 'approved' },
  { id: 8, name: 'screenshot.jpg', type: 'image', size: '2.1 MB', user: 'Соколова О.Н.', dialog: 'DLG-1008', uploadedAt: '2025-11-10T15:15:00', dlpStatus: 'approved' },
  { id: 9, name: 'sensitive_data.csv', type: 'document', size: '5.6 MB', user: 'Иванов И.И.', dialog: 'DLG-1001', uploadedAt: '2025-11-10T09:00:00', dlpStatus: 'rejected' },
  { id: 10, name: 'diagram.svg', type: 'image', size: '0.3 MB', user: 'Сидоров П.А.', dialog: 'DLG-1003', uploadedAt: '2025-11-11T10:20:00', dlpStatus: 'approved' }
]

const DASHBOARD_MODE_IDS = Object.keys(DASHBOARD_MODES)
const DASHBOARD_FILTER_KEYS = ['from', 'to', 'model']

const DEFAULT_FILTERS = {
  dashboards: { from: '', to: '', model: 'all' },
  users: { activityFrom: '', activityTo: '', fio: '', role: 'all' },
  dialogs: { periodFrom: '', periodTo: '', user: '' },
  files: { periodFrom: '', periodTo: '', dlpStatus: 'all', type: 'all' },
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
  const [sortConfig, setSortConfig] = useState({ column: null, direction: null })
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [modalState, setModalState] = useState({ isOpen: false, type: null })
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

  // Функции для работы с данными
  const getDataForSection = (sectionId) => {
    if (sectionId === 'users') return MOCK_USERS
    if (sectionId === 'dialogs') return MOCK_DIALOGS
    if (sectionId === 'files') return MOCK_FILES
    return []
  }

  const getFileExtension = (filename) => {
    const parts = filename.split('.')
    if (parts.length > 1) {
      return parts[parts.length - 1].toUpperCase()
    }
    return 'FILE'
  }

  const getFileTypeColor = (extension) => {
    const imageTypes = ['PNG', 'JPG', 'JPEG', 'GIF', 'SVG', 'WEBP', 'BMP']
    const documentTypes = ['PDF', 'DOC', 'DOCX', 'TXT', 'RTF']
    const spreadsheetTypes = ['XLS', 'XLSX', 'CSV']
    const videoTypes = ['MP4', 'AVI', 'MOV', 'WMV', 'FLV', 'MKV']
    const audioTypes = ['MP3', 'WAV', 'OGG', 'M4A', 'FLAC']
    const codeTypes = ['PY', 'JS', 'JSX', 'TS', 'TSX', 'HTML', 'CSS', 'JSON']

    if (imageTypes.includes(extension)) return 'image'
    if (documentTypes.includes(extension)) return 'document'
    if (spreadsheetTypes.includes(extension)) return 'spreadsheet'
    if (videoTypes.includes(extension)) return 'video'
    if (audioTypes.includes(extension)) return 'audio'
    if (codeTypes.includes(extension)) return 'code'
    return 'other'
  }

  const applyFilters = (data, sectionId) => {
    const sectionFilters = filters[sectionId] || {}

    return data.filter((item) => {
      // Фильтр по периоду
      if (sectionId === 'users') {
        if (sectionFilters.activityFrom) {
          const itemDate = new Date(item.lastActivity)
          const fromDate = new Date(sectionFilters.activityFrom)
          if (itemDate < fromDate) return false
        }
        if (sectionFilters.activityTo) {
          const itemDate = new Date(item.lastActivity)
          const toDate = new Date(sectionFilters.activityTo)
          if (itemDate > toDate) return false
        }
        // Фильтр по ФИО
        if (sectionFilters.fio && sectionFilters.fio.trim()) {
          const searchTerm = sectionFilters.fio.toLowerCase()
          if (!item.fio.toLowerCase().includes(searchTerm)) return false
        }
        // Фильтр по роли
        if (sectionFilters.role && sectionFilters.role !== 'all') {
          if (item.role !== sectionFilters.role) return false
        }
      }

      if (sectionId === 'dialogs') {
        if (sectionFilters.periodFrom) {
          const itemDate = new Date(item.createdAt)
          const fromDate = new Date(sectionFilters.periodFrom)
          if (itemDate < fromDate) return false
        }
        if (sectionFilters.periodTo) {
          const itemDate = new Date(item.createdAt)
          const toDate = new Date(sectionFilters.periodTo)
          if (itemDate > toDate) return false
        }
        // Фильтр по пользователю
        if (sectionFilters.user && sectionFilters.user.trim()) {
          const searchTerm = sectionFilters.user.toLowerCase()
          if (!item.user.toLowerCase().includes(searchTerm)) return false
        }
      }

      if (sectionId === 'files') {
        if (sectionFilters.periodFrom) {
          const itemDate = new Date(item.uploadedAt)
          const fromDate = new Date(sectionFilters.periodFrom)
          if (itemDate < fromDate) return false
        }
        if (sectionFilters.periodTo) {
          const itemDate = new Date(item.uploadedAt)
          const toDate = new Date(sectionFilters.periodTo)
          if (itemDate > toDate) return false
        }
        // Фильтр по статусу DLP
        if (sectionFilters.dlpStatus && sectionFilters.dlpStatus !== 'all') {
          if (item.dlpStatus !== sectionFilters.dlpStatus) return false
        }
        // Фильтр по формату
        if (sectionFilters.type && sectionFilters.type !== 'all') {
          const extension = getFileExtension(item.name).toLowerCase()
          if (extension !== sectionFilters.type.toLowerCase()) return false
        }
      }

      return true
    })
  }

  const applySorting = (data, sectionId) => {
    if (!sortConfig.column || !sortConfig.direction) return data

    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.column]
      const bVal = b[sortConfig.column]

      // Сортировка чисел
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
      }

      // Сортировка дат
      if (sortConfig.column.includes('Activity') || sortConfig.column.includes('At') || sortConfig.column.includes('createdAt') || sortConfig.column.includes('uploadedAt')) {
        const dateA = new Date(aVal).getTime()
        const dateB = new Date(bVal).getTime()
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA
      }

      // Сортировка строк
      const strA = String(aVal).toLowerCase()
      const strB = String(bVal).toLowerCase()
      if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1
      if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }

  const getFilteredAndSortedData = (sectionId) => {
    const rawData = getDataForSection(sectionId)
    const filtered = applyFilters(rawData, sectionId)
    const sorted = applySorting(filtered, sectionId)
    return sorted
  }

  const handleSort = (columnIndex, columnKey) => {
    if (!columnKey) return

    setSortConfig((prev) => {
      if (prev.column === columnKey) {
        if (prev.direction === 'asc') return { column: columnKey, direction: 'desc' }
        if (prev.direction === 'desc') return { column: null, direction: null }
      }
      return { column: columnKey, direction: 'asc' }
    })
  }

  // Функции для работы с выбором пользователей
  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId)
      }
      return [...prev, userId]
    })
  }

  const toggleSelectAll = () => {
    const currentData = getFilteredAndSortedData('users')
    const allIds = currentData.map((user) => user.id)

    if (selectedUsers.length === allIds.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(allIds)
    }
  }

  const handleBulkAction = (action) => {
    if (action === 'disable') {
      // Для отключения пользователей показываем подтверждение
      if (window.confirm(`Вы уверены, что хотите отключить ${selectedUsers.length} пользователей?`)) {
        console.log(`Disabling users:`, selectedUsers)
        // Здесь будет API запрос для отключения пользователей
        alert(`${selectedUsers.length} пользователей отключено`)
        setSelectedUsers([])
      }
    } else {
      // Для остальных действий открываем модальное окно
      setModalState({ isOpen: true, type: action })
    }
  }

  const closeModal = () => {
    setModalState({ isOpen: false, type: null })
  }

  const handleModalSubmit = (data) => {
    console.log(`Modal submit for ${modalState.type}:`, data, 'users:', selectedUsers)
    // Здесь будет API запрос для обновления данных
    alert(`Изменения применены к ${selectedUsers.length} пользователям`)
    closeModal()
    setSelectedUsers([])
  }

  useEffect(() => {
    setShowBulkActions(selectedUsers.length > 0)
  }, [selectedUsers])

  useEffect(() => {
    // Сбрасываем выбор при смене секции
    setSelectedUsers([])
    setSortConfig({ column: null, direction: null })
  }, [section])

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
    const fromDate = dashboardFilters.from ? new Date(dashboardFilters.from) : null
    const toDate = dashboardFilters.to ? new Date(dashboardFilters.to) : null

    return (
      <div className="filters-grid management-filters dashboard-filters">
        <div className="field">
          <span>Период</span>
          <DateRangePicker
            startDate={fromDate}
            endDate={toDate}
            onChange={(start, end) => {
              updateFilter('dashboards', 'from', start ? start.toISOString().split('T')[0] : '')
              updateFilter('dashboards', 'to', end ? end.toISOString().split('T')[0] : '')
            }}
            placeholder="Выберите период"
          />
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

    if (filter.type === 'date-range') {
      const fromValue = filters[sectionId][filter.fromField] || ''
      const toValue = filters[sectionId][filter.toField] || ''
      const fromDate = fromValue ? new Date(fromValue) : null
      const toDate = toValue ? new Date(toValue) : null
      const showBulk = sectionId === 'users' && selectedUsers.length > 0

      return (
        <div className="field period-field-with-actions" key={filter.id}>
          <span>{filter.label}</span>
          <DateRangePicker
            startDate={fromDate}
            endDate={toDate}
            onChange={(start, end) => {
              updateFilter(sectionId, filter.fromField, start ? start.toISOString().split('T')[0] : '')
              updateFilter(sectionId, filter.toField, end ? end.toISOString().split('T')[0] : '')
            }}
            placeholder="Выберите период"
          />
          {showBulk && (
            <div className="bulk-actions-inline">
              <div className="bulk-actions-info">
                <span>Выбрано: {selectedUsers.length}</span>
              </div>
              <div className="bulk-actions-buttons">
                <button
                  type="button"
                  className="bulk-action-btn btn-danger"
                  onClick={() => handleBulkAction('disable')}
                >
                  <UserX size={16} />
                  <span>Отключить</span>
                </button>
                <button
                  type="button"
                  className="bulk-action-btn btn-secondary"
                  onClick={() => handleBulkAction('limits')}
                >
                  <Settings size={16} />
                  <span>Изменить лимиты</span>
                </button>
                <button
                  type="button"
                  className="bulk-action-btn btn-secondary"
                  onClick={() => handleBulkAction('tools')}
                >
                  <Wrench size={16} />
                  <span>Доступ к инструментам</span>
                </button>
                <button
                  type="button"
                  className="bulk-action-btn btn-secondary"
                  onClick={() => handleBulkAction('models')}
                >
                  <Cpu size={16} />
                  <span>Доступ к моделям</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )
    }

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

    const inputType = filter.type === 'number' ? 'number' : filter.type === 'text' ? 'text' : 'date'
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

  const renderTableHeader = () => {
    if (!currentManagement) return null

    const isUsers = section === 'users'
    const sortableColumns = currentManagement.sortableColumns || []

    return (
      <thead>
        <tr>
          {isUsers && (
            <th style={{ width: '40px' }}>
              <button
                type="button"
                className="checkbox-btn"
                onClick={toggleSelectAll}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                {selectedUsers.length > 0 && selectedUsers.length === getFilteredAndSortedData('users').length ? (
                  <CheckSquare size={18} />
                ) : (
                  <Square size={18} />
                )}
              </button>
            </th>
          )}
          {currentManagement.columns.map((column, index) => {
            const columnKey = sortableColumns[index]
            const isSortable = !!columnKey
            const isSorted = sortConfig.column === columnKey

            return (
              <th key={column}>
                {isSortable ? (
                  <button
                    type="button"
                    className="sort-header"
                    onClick={() => handleSort(index, columnKey)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: 0,
                      font: 'inherit',
                      color: 'inherit'
                    }}
                  >
                    <span>{column}</span>
                    {isSorted ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )
                    ) : (
                      <ArrowUpDown size={14} style={{ opacity: 0.3 }} />
                    )}
                  </button>
                ) : (
                  column
                )}
              </th>
            )
          })}
        </tr>
      </thead>
    )
  }

  const renderTableBody = () => {
    const data = getFilteredAndSortedData(section)

    if (data.length === 0) {
      const colspan = currentManagement.columns.length + (section === 'users' ? 1 : 0)
      return (
        <tbody>
          <tr>
            <td colSpan={colspan} style={{ padding: 0, border: 'none' }}>
              <EmptyState
                title="Нет данных"
                description="Попробуйте изменить фильтры или добавить данные"
              />
            </td>
          </tr>
        </tbody>
      )
    }

    if (section === 'users') {
      return (
        <tbody>
          {data.map((user) => (
            <tr key={user.id}>
              <td>
                <button
                  type="button"
                  className="checkbox-btn"
                  onClick={() => toggleUserSelection(user.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  {selectedUsers.includes(user.id) ? (
                    <CheckSquare size={18} />
                  ) : (
                    <Square size={18} />
                  )}
                </button>
              </td>
              <td>{user.fio}</td>
              <td>
                <span className={`role-badge role-${user.role}`}>
                  {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </span>
              </td>
              <td>{new Date(user.lastActivity).toLocaleString('ru-RU')}</td>
              <td>{user.activeChats}</td>
              <td>{user.messagesCount}</td>
              <td>${user.moneySpent.toFixed(2)}</td>
              <td><span className="text-small">{user.limits}</span></td>
              <td><span className="text-small">{user.availableTools}</span></td>
              <td><span className="text-small">{user.availableModels}</span></td>
            </tr>
          ))}
        </tbody>
      )
    }

    if (section === 'dialogs') {
      return (
        <tbody>
          {data.map((dialog) => (
            <tr key={dialog.id}>
              <td><strong>{dialog.dialogNumber}</strong></td>
              <td>{new Date(dialog.createdAt).toLocaleString('ru-RU')}</td>
              <td>{dialog.user}</td>
              <td>{dialog.depth}</td>
              <td>{new Date(dialog.lastActivity).toLocaleString('ru-RU')}</td>
              <td><span className="text-small">{dialog.models}</span></td>
              <td><span className="text-small">{dialog.tools}</span></td>
              <td>
                <span className={`badge ${dialog.voiceInput === 'Да' ? 'badge-success' : 'badge-neutral'}`}>
                  {dialog.voiceInput}
                </span>
              </td>
              <td>{dialog.filesCount}</td>
              <td>${dialog.cost.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      )
    }

    if (section === 'files') {
      return (
        <tbody>
          {data.map((file) => {
            const extension = getFileExtension(file.name)
            const typeColor = getFileTypeColor(extension)
            return (
              <tr key={file.id}>
                <td><strong>{file.name}</strong></td>
                <td>
                  <span className={`type-badge type-${typeColor}`}>
                    {extension}
                  </span>
                </td>
                <td>{file.size}</td>
                <td>{file.user}</td>
                <td>{file.dialog}</td>
                <td>{new Date(file.uploadedAt).toLocaleString('ru-RU')}</td>
                <td>
                  <span className={`dlp-badge dlp-${file.dlpStatus}`}>
                    {file.dlpStatus === 'approved' ? 'Принят' : 'Отклонён'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      )
    }

    return <tbody></tbody>
  }

  const renderBulkActionsBar = () => {
    if (!showBulkActions || section !== 'users') return null

    return (
      <div className="bulk-actions-bar">
        <div className="bulk-actions-info">
          <span>Выбрано: {selectedUsers.length}</span>
        </div>
        <div className="bulk-actions-buttons">
          <button
            type="button"
            className="bulk-action-btn btn-danger"
            onClick={() => handleBulkAction('disable')}
          >
            <UserX size={16} />
            <span>Отключить</span>
          </button>
          <button
            type="button"
            className="bulk-action-btn btn-secondary"
            onClick={() => handleBulkAction('limits')}
          >
            <Settings size={16} />
            <span>Изменить лимиты</span>
          </button>
          <button
            type="button"
            className="bulk-action-btn btn-secondary"
            onClick={() => handleBulkAction('tools')}
          >
            <Wrench size={16} />
            <span>Доступ к инструментам</span>
          </button>
          <button
            type="button"
            className="bulk-action-btn btn-secondary"
            onClick={() => handleBulkAction('models')}
          >
            <Cpu size={16} />
            <span>Доступ к моделям</span>
          </button>
        </div>
      </div>
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

    const data = getFilteredAndSortedData(section)

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
                  {renderTableHeader()}
                  {renderTableBody()}
                </table>
              </div>
            </div>
          </section>
        </div>
      </>
    )
  }

  const renderModal = () => {
    if (!modalState.isOpen) return null

    const getModalTitle = () => {
      switch (modalState.type) {
        case 'limits': return 'Изменить лимиты'
        case 'tools': return 'Доступ к инструментам'
        case 'models': return 'Доступ к моделям'
        default: return 'Настройки'
      }
    }

    const getModalContent = () => {
      switch (modalState.type) {
        case 'limits':
          return (
            <div className="modal-form">
              <label className="modal-field">
                <span>Лимит сообщений в день</span>
                <input type="number" placeholder="100" defaultValue="100" />
              </label>
              <label className="modal-field">
                <span>Лимит токенов в день</span>
                <input type="number" placeholder="50000" defaultValue="50000" />
              </label>
              <label className="modal-field">
                <span>Стоимостной лимит ($)</span>
                <input type="number" placeholder="10" defaultValue="10" step="0.01" />
              </label>
            </div>
          )
        case 'tools':
          return (
            <div className="modal-form">
              <div className="modal-field">
                <span>Доступные инструменты</span>
                <div className="checkbox-list">
                  <label className="checkbox-item">
                    <input type="checkbox" defaultChecked />
                    <span>Web Search</span>
                  </label>
                  <label className="checkbox-item">
                    <input type="checkbox" defaultChecked />
                    <span>Code Interpreter</span>
                  </label>
                  <label className="checkbox-item">
                    <input type="checkbox" />
                    <span>Image Generation</span>
                  </label>
                  <label className="checkbox-item">
                    <input type="checkbox" defaultChecked />
                    <span>Calculator</span>
                  </label>
                </div>
              </div>
            </div>
          )
        case 'models':
          return (
            <div className="modal-form">
              <div className="modal-field">
                <span>Доступные модели</span>
                <div className="checkbox-list">
                  <label className="checkbox-item">
                    <input type="checkbox" defaultChecked />
                    <span>GPT-4</span>
                  </label>
                  <label className="checkbox-item">
                    <input type="checkbox" defaultChecked />
                    <span>GPT-3.5 Turbo</span>
                  </label>
                  <label className="checkbox-item">
                    <input type="checkbox" />
                    <span>Claude 3</span>
                  </label>
                  <label className="checkbox-item">
                    <input type="checkbox" />
                    <span>Gemini Pro</span>
                  </label>
                </div>
              </div>
            </div>
          )
        default:
          return null
      }
    }

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">{getModalTitle()}</h2>
            <button type="button" className="modal-close" onClick={closeModal}>
              ×
            </button>
          </div>
          <div className="modal-body">
            <div className="modal-info">
              Применить изменения для {selectedUsers.length} пользователей
            </div>
            {getModalContent()}
          </div>
          <div className="modal-footer">
            <button type="button" className="modal-button btn-secondary" onClick={closeModal}>
              Отменить
            </button>
            <button type="button" className="modal-button btn-primary" onClick={() => handleModalSubmit({})}>
              Применить
            </button>
          </div>
        </div>
      </div>
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
      {renderModal()}
    </div>
  )
}
