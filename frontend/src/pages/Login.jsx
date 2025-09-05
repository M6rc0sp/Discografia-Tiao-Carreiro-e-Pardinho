import React, { useState, useEffect } from 'react'
import { login, getCsrf } from '../api'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import UiButton from '../components/UiButton'

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
    <Container className="app-container" sx={{ py: 3 }}>
      <Typography component="h2" variant="h5" sx={{ mb: 2 }}>Entrar</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 480 }}>
        <Box sx={{ mb: 1 }}>
          <input className="submit-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        </Box>
        <Box sx={{ mb: 1 }}>
          <input className="submit-input" type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
        </Box>
        {error && <div className="message error">{error}</div>}
        <div>
          <UiButton className="submit-button" type="submit">Entrar</UiButton>
        </div>
      </Box>
    </Container>
  )
}
