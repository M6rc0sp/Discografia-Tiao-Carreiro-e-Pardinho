import React from 'react'

export default function Header({ user, onLogout }) {
  return (
    <header className="site-header">
      <img src="/tiao-carreiro-pardinho.png" alt="Tião Carreiro" className="artist-img" />
      <h1>Top 5 Músicas Mais Tocadas</h1>
      <h2>Tião Carreiro & Pardinho</h2>
      <div style={{ position: 'absolute', right: 16, top: 16, zIndex: 3, maxWidth: 'calc(100vw - 32px)', overflow: 'hidden' }}>
        {user ? (
          <>
            <span style={{ marginRight: 8, whiteSpace: 'nowrap' }}>{user.name}</span>
            <button className="submit-button" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'manage' } }))} style={{ marginRight: 8 }}>Gerenciar</button>
            <button className="submit-button" onClick={onLogout}>Sair</button>
          </>
        ) : (
          <>
            <button className="submit-button" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'login' } }))} style={{ marginRight: 8 }}>Entrar</button>
          </>
        )}
      </div>
    </header>
  )
}
