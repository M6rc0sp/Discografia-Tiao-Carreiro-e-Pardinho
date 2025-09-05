import React, { useState, useEffect } from 'react'
import { login, getCsrf } from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  // SPA navigation via custom events

  useEffect(() => {
    // Initialize CSRF token when component mounts
    getCsrf()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      console.debug('[Login] submit, email=', email)
      await login({ email, password })
      // notify app to refresh user and go to management screen
      window.dispatchEvent(new CustomEvent('refreshUser'))
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'manage' } }))
    } catch (err) {
      console.error('[Login] login error', err)
      setError(err?.response?.data?.message || 'Erro ao efetuar login')
    }
  }

  return (
    <div className="app-container">
      <h2>Entrar</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
        <div style={{ marginBottom: 8 }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <div className="message error">{error}</div>}
        <div>
          <button className="submit-button" type="submit">Entrar</button>
        </div>
      </form>
    </div>
  )
}
