import React, { useEffect, useState } from 'react'
import { api, publicApi, getCurrentUser } from '../api'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import UiButton from './UiButton'

export default function Songs() {
  const [top, setTop] = useState([])
  const [rest, setRest] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [suggestUrl, setSuggestUrl] = useState('')
  const [message, setMessage] = useState(null)

  const [user, setUser] = useState(null)

  useEffect(() => { fetchPage(1) }, [])
  useEffect(() => { (async () => setUser(await getCurrentUser()))() }, [])

  async function fetchPage(p) {
    try {
      const res = await api.get(`/songs?page=${p}`)
      const payload = res.data || {}

      // API returns { top: [...], rest: paginator }
      setTop(payload.top || [])
      const pager = payload.rest || payload
      setRest(Array.isArray(pager.data) ? pager.data : [])
      setPage(p)
      const last = pager.last_page || (pager.meta && pager.meta.last_page) || 1
      setTotalPages(last)
    } catch (e) {
      console.error('fetchPage error', e)
      setTop([])
      setRest([])
    }
  }

  function formatViews(n) {
    if (!n && n !== 0) return ''
    if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B'
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return String(n)
  }

  async function handleSuggest(e) {
    e.preventDefault()
    if (!suggestUrl) return setMessage({ type: 'error', text: 'Cole o link do YouTube.' })
    try {
      // v1 behaviour: send single 'url' field and let backend handle extraction/title
      await publicApi.post('/suggestions', { url: suggestUrl })
      setMessage({ type: 'success', text: 'Sugestão enviada — obrigado!' })
      setSuggestUrl('')
      // opcional: recarregar a primeira página
      fetchPage(1)
    } catch (err) {
      console.error('suggest error', err)
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Erro ao enviar sugestão' })
    }
  }

  return (
    <Container className="container-inner">
      <Box className="submit-form" sx={{ mb: 3 }}>
        <Typography component="h3" variant="h6">Sugerir Nova Música</Typography>
        {/* Formulário sempre disponível: qualquer usuário (anônimo) pode sugerir */}
        {message && <div className={`message ${message.type}`}>{message.text}</div>}
        <Box component="form" onSubmit={handleSuggest}>
          <div className="input-group">
            <input className="submit-input" type="url" placeholder="Cole aqui o link do YouTube" value={suggestUrl} onChange={e => setSuggestUrl(e.target.value)} required />
            <UiButton className="submit-button" type="submit">Enviar Link</UiButton>
          </div>
        </Box>
      </Box>

      <Typography component="h3" variant="h6" className="section-title">Ranking Atual</Typography>

      {top.length === 0 && rest.length === 0 ? (
        <Box className="empty-state" sx={{ textAlign: 'center', py: 4 }}>
          <div className="empty-state-icon">🎵</div>
          <div className="empty-state-text">Nenhuma música cadastrada ainda</div>
          <div className="empty-state-subtext">Seja o primeiro a sugerir uma música usando o formulário acima!</div>
        </Box>
      ) : (
        <ol className="music-list">
          {top.map((s, idx) => {
            const id = s.id ?? idx
            const youtube = s.youtube_link || (s.youtube_id ? `https://www.youtube.com/watch?v=${s.youtube_id}` : '#')
            return (
              <li key={id}>
                <a className="music-card-link" href={youtube} target="_blank" rel="noopener noreferrer">
                  <div className="music-card">
                    <div className="rank">{idx + 1}</div>
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

      <Typography component="h3" variant="h6" className="section-title">Mais músicas</Typography>
      <ul className="music-list">
        {rest.map((s, i) => {
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

      <Box className="pagination" sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <UiButton className="submit-button" onClick={() => fetchPage(Math.max(1, page - 1))} disabled={page <= 1} aria-disabled={page <= 1}>Anterior</UiButton>
        <span> {page} / {totalPages} </span>
        <UiButton className="submit-button" onClick={() => fetchPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} aria-disabled={page >= totalPages}>Próxima</UiButton>
      </Box>
    </Container>
  )
}
