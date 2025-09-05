import React, { useEffect, useState } from 'react'
import Songs from './components/Songs'
import Header from './components/Header'
import { getCurrentUser, logout, getCsrf } from './api'
import ManageSuggestions from './components/ManageSuggestions'
import Login from './pages/Login'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('home')

  useEffect(() => {
    function pathToPage(p) {
      if (!p) return 'home'
      if (p.startsWith('/login')) return 'login'
      if (p.startsWith('/manage')) return 'manage'
      return 'home'
    }

    // initialize page from current pathname (direct link support)
    setPage(pathToPage(window.location.pathname))

    function reflectUrl(page) {
      const path = page === 'home' ? '/' : `/${page}`
      try { window.history.pushState({ page }, '', path) } catch (err) { /* ignore */ }
    }

    async function onNavigate(e) {
      const page = e?.detail?.page || 'home'
      setPage(page)
      reflectUrl(page)

      // lazy-check user or CSRF when navigating to sensitive pages
      if (page === 'login') {
        await getCsrf().catch(() => null)
        const u = await getCurrentUser().catch(() => null)
        setUser(u)
      } else if (page === 'manage') {
        await getCsrf().catch(() => null)
        const u = await getCurrentUser().catch(() => null)
        setUser(u)
        // if not logged in, redirect to login
        if (!u) {
          window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'login' } }))
        }
      }
    }

    async function onRefreshUser() {
      const u = await getCurrentUser().catch(() => null)
      setUser(u)
    }

    function onPopState() {
      setPage(pathToPage(window.location.pathname))
    }

    window.addEventListener('navigate', onNavigate)
    window.addEventListener('refreshUser', onRefreshUser)
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('navigate', onNavigate)
      window.removeEventListener('refreshUser', onRefreshUser)
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  async function handleLogout() {
    // Optimistically clear UI then perform logout
    setUser(null)
    try {
      await logout()
    } catch (e) {
      // ignore
    }
    // ensure backend session cleared and refresh user state
    const u = await getCurrentUser()
    setUser(u)
    // go to home after logout
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'home' } }))
  }

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      <div className="app-container overlap">
        <main>
          {page === 'manage' ? (
            <ManageSuggestions />
          ) : page === 'login' ? (
            <Login />
          ) : (
            <Songs user={user} />
          )}
        </main>
      </div>
    </>
  )
}
