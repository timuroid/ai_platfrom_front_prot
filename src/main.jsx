import React, { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'
import AllChats from './AllChats.jsx'

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

  if (route === '/chats') {
    return <AllChats />
  }

  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
