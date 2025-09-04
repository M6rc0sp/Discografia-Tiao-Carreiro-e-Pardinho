import React, { useEffect, useState } from 'react'
import { api, getCurrentUser } from '../api'

export default function Songs(){
  const [songs, setSongs] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [suggestUrl, setSuggestUrl] = useState('')
  const [message, setMessage] = useState(null)

  useEffect(()=>{ fetchPage(1) }, [])
  useEffect(()=>{ (async()=>{ const u = await getCurrentUser(); setUser( u ); })() }, [])

  const [user, setUser] = useState(null)

  async function fetchPage(p){
    try{
      const res = await api.get(`/songs?page=${p}`)
      const payload = res.data || {}
      const list = payload.data || payload
      setSongs(Array.isArray(list) ? list : (list.data || []))
      setPage(p)
      const last = payload.last_page || (payload.meta && payload.meta.last_page) || 1
      setTotalPages(last)
    }catch(e){
      console.error('fetchPage error', e)
      setSongs([])
    }
  }

  function formatViews(n){
    if(!n && n !== 0) return ''
    return n >= 1000000 ? (n/1000000).toFixed(1)+'M' : (n >= 1000 ? (n/1000).toFixed(1)+'K' : n)
  }

  async function handleSuggest(e){
    e.preventDefault()
    if(!suggestUrl) return setMessage({ type:'error', text:'Cole o link do YouTube.' })
    try{
      await api.post('/suggestions', { url: suggestUrl })
      setMessage({ type:'success', text: 'Sugestão enviada — obrigado!' })
      setSuggestUrl('')
      // opcional: recarregar a primeira página
      fetchPage(1)
    }catch(err){
      console.error('suggest error', err)
      setMessage({ type:'error', text: err?.response?.data?.message || 'Erro ao enviar sugestão' })
    }
  }

  return (
    <div className="container-inner">
      <div className="submit-form">
        <h3>Sugerir Nova Música</h3>
        {user ? (
          <>
            {message && <div className={`message ${message.type}`}>{message.text}</div>}
            <form onSubmit={handleSuggest}>
              <div className="input-group">
                <input type="url" placeholder="Cole aqui o link do YouTube" value={suggestUrl} onChange={e=>setSuggestUrl(e.target.value)} required />
                <button className="submit-button" type="submit">Enviar Link</button>
              </div>
            </form>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-text">Você precisa estar logado para sugerir músicas.</div>
            <div style={{marginTop:8}}>
              <a href="/login" className="submit-button">Entrar</a>
            </div>
          </div>
        )}
      </div>

      <h3 className="section-title">Ranking Atual</h3>

      {songs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎵</div>
          <div className="empty-state-text">Nenhuma música cadastrada ainda</div>
          <div className="empty-state-subtext">Seja o primeiro a sugerir uma música usando o formulário acima!</div>
        </div>
      ) : (
        <ol className="music-list">
          {songs.slice(0,5).map((s, idx) => {
            const id = s.id ?? idx
            const youtube = s.youtube_link || (s.youtube_id ? `https://www.youtube.com/watch?v=${s.youtube_id}` : '#')
            return (
              <li key={id}>
                <a className="music-card-link" href={youtube} target="_blank" rel="noopener noreferrer">
                  <div className="music-card">
                    <div className="rank">{idx+1}</div>
                    <div className="music-info">
                      <div className="music-title">{s.title || s.titulo || '—'}</div>
                      <div className="views">{formatViews(s.visualizacoes ?? s.views)} visualizações</div>
                    </div>
                    <img className="thumbnail" src={s.thumb || s.thumbnail || ''} alt={s.title || s.titulo || 'thumb'} />
                  </div>
                </a>
              </li>
            )
          })}
        </ol>
      )}

      <h3 className="section-title">Mais músicas</h3>
      <ul className="music-list">
        {songs.slice(5).map((s, i) => {
          const id = s.id ?? `m-${i}`
          const youtube = s.youtube_link || (s.youtube_id ? `https://www.youtube.com/watch?v=${s.youtube_id}` : '#')
          return (
            <li key={id}>
              <a className="music-card-link" href={youtube} target="_blank" rel="noopener noreferrer">
                <div className="music-card">
                  <div className="rank">{5 + i + 1}</div>
                  <div className="music-info">
                    <div className="music-title">{s.title || s.titulo || '—'}</div>
                    <div className="views">{formatViews(s.visualizacoes ?? s.views)} visualizações</div>
                  </div>
                  <img className="thumbnail" src={s.thumb || s.thumbnail || ''} alt={s.title || s.titulo || 'thumb'} />
                </div>
              </a>
            </li>
          )
        })}
      </ul>

      <div className="pagination">
        <button onClick={()=>fetchPage(Math.max(1, page-1))} disabled={page<=1}>Anterior</button>
        <span> {page} / {totalPages} </span>
        <button onClick={()=>fetchPage(Math.min(totalPages, page+1))} disabled={page>=totalPages}>Próxima</button>
      </div>
    </div>
  )
}
