import React, { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'
import TZExpertView from './components/TZExpertView.jsx'

function Root() {
  const [hash, setHash] = useState(() => window.location.hash || '#/')

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const route = useMemo(() => {
    const normalized = hash.startsWith('#') ? hash.slice(1) : hash
    const [path] = normalized.split('?')
    return path || '/'
  }, [hash])

  if (route === '/admin') {
    return <AdminDashboard />
  }

  if (route === '/tool/tz-expert') {
    return <App initialView="tz-expert" />
  }

  if (route.startsWith('/bot/')) {
    const botId = route.replace('/bot/', '')
    return <App initialView="bot" initialBotId={botId} />
  }

  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
