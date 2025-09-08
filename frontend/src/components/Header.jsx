import React from 'react'
import UiButton from './UiButton'

export default function Header({ user, onLogout, page }) {
  return (
    <header className="site-header">
      <img src="/tiao-carreiro-pardinho.png" alt="Tião Carreiro" className="artist-img" />
      <h1>Top 5 Músicas Mais Tocadas</h1>
      <h2>Tião Carreiro & Pardinho</h2>
      <div style={{ position: 'absolute', right: 16, top: 16, zIndex: 3, maxWidth: 'calc(100vw - 32px)', overflow: 'hidden' }}>
        {/* If we're on login page, hide all header actions */}
        {page === 'login' ? null : (
          user ? (
            <>
              <span style={{ marginRight: 8, whiteSpace: 'nowrap' }}>{user.name}</span>
              {/* On manage page we don't need a Gerenciar shortcut (we're already there) */}
              {page !== 'manage' && (
                <UiButton className="submit-button" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'manage' } }))} style={{ marginRight: 8 }}>Gerenciar</UiButton>
              )}
              <UiButton className="submit-button logout" onClick={onLogout}>Sair</UiButton>
            </>
          ) : (
            <>
              <UiButton className="submit-button" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'login' } }))} style={{ marginRight: 8 }}>Entrar</UiButton>
            </>
          )
        )}
      </div>
    </header>
  )
}
