import React, { useEffect, useState } from 'react'
import { api, getCurrentUser, getCsrf } from '../api'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import UiButton from './UiButton'

export default function ManageSuggestions() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [tab, setTab] = useState('suggestions') // 'suggestions' | 'manage' | 'rejected'

    // songs management state
    const [songs, setSongs] = useState([])
    const [creating, setCreating] = useState(false)
    const [createData, setCreateData] = useState({ title: '', youtube_link: '' })
    const [editingId, setEditingId] = useState(null)
    const [editData, setEditData] = useState({ title: '', youtube_link: '' })

    useEffect(() => {
        (async () => {
            // Ensure user is authenticated before fetching management list
            const u = await getCurrentUser()
            if (!u) {
                // redirect to login if not authenticated
                window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'login' } }))
                return
            }
            await fetchList()
        })()
    }, [])

    // fetch songs for manage tab
    async function fetchSongs() {
        try {
            const res = await api.get('/songs')
            const payload = res.data || {}
            const top = payload.top || []
            const rest = Array.isArray(payload.rest?.data) ? payload.rest.data : (Array.isArray(payload.rest) ? payload.rest : [])
            setSongs([...top, ...rest])
        } catch (e) {
            console.error('fetchSongs', e)
        }
    }

    async function fetchList() {
        setLoading(true)
        setError(null)
        try {
            const res = await api.get('/suggestions?only=unapproved')
            setItems(res.data || [])
        } catch (e) {
            console.error('manage fetchList', e)
            if (e?.response?.status === 401) {
                // session expired or not authenticated -> go to login
                window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'login' } }))
                return
            }
            setError('Erro ao carregar sugestões')
        } finally {
            setLoading(false)
        }
    }

    async function fetchListRejected() {
        setLoading(true)
        setError(null)
        try {
            const res = await api.get('/suggestions?only=rejected')
            setItems(res.data || [])
        } catch (e) {
            console.error('manage fetchListRejected', e)
            setError('Erro ao carregar sugestões reprovadas')
        } finally {
            setLoading(false)
        }
    }

    async function approve(id) {
        const attempt = async () => {
            // attach XSRF header manually if cookie present (helps some browsers)
            const cookie = typeof document !== 'undefined' ? document.cookie : null
            const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            if (cookie) {
                const m = cookie.match(/XSRF-TOKEN=([^;]+)/)
                if (m) headers['X-XSRF-TOKEN'] = decodeURIComponent(m[1])
            }

            return api.post(`/suggestions/${id}/approve`, {}, { headers })
        }

        try {
            await attempt()
            setItems(prev => prev.filter(i => i.id !== id))
        } catch (e) {
            console.error('approve error', e)
            // if CSRF mismatch (419) -> refresh CSRF cookie and retry once
            if (e?.response?.status === 419) {
                const ok = await getCsrf()
                if (ok) {
                    try {
                        await attempt()
                        setItems(prev => prev.filter(i => i.id !== id))
                        return
                    } catch (err2) {
                        console.error('approve retry failed', err2)
                    }
                }
            }

            if (e?.response?.status === 401) {
                window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'login' } }))
                return
            }
            setError('Erro ao aprovar')
        }
    }

    async function remove(id) {
        try {
            await api.delete(`/suggestions/${id}`)
            setItems(prev => prev.filter(i => i.id !== id))
        } catch (e) {
            console.error('delete error', e)
            if (e?.response?.status === 401) {
                window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'login' } }))
                return
            }
            setError('Erro ao remover')
        }
    }

    // safeRequest helper: retries once after refreshing CSRF on 419
    async function safeRequest(fn) {
        try {
            return await fn()
        } catch (e) {
            if (e?.response?.status === 419) {
                const ok = await getCsrf()
                if (ok) return await fn()
            }
            throw e
        }
    }

    // create song
    async function handleCreateSong(e) {
        e.preventDefault()
        setError(null)
        try {
            const res = await safeRequest(() => api.post('/songs', createData))
            setSongs(prev => [res.data, ...prev])
            setCreateData({ title: '', youtube_link: '' })
            setCreating(false)
        } catch (err) {
            console.error('create song', err)
            setError(err?.response?.data?.message || 'Erro ao criar música')
        }
    }

    // start editing
    function startEdit(song) {
        setEditingId(song.id)
        setEditData({ title: song.title || '', youtube_link: song.youtube_link || '' })
    }

    async function handleSaveEdit(e, id) {
        e.preventDefault()
        setError(null)
        try {
            const res = await safeRequest(() => api.put(`/songs/${id}`, editData))
            setSongs(prev => prev.map(s => s.id === id ? res.data : s))
            setEditingId(null)
        } catch (err) {
            console.error('save edit', err)
            setError(err?.response?.data?.message || 'Erro ao salvar')
        }
    }

    async function handleDeleteSong(id) {
        if (!confirm('Confirma exclusão desta música?')) return
        try {
            await safeRequest(() => api.delete(`/songs/${id}`))
            setSongs(prev => prev.filter(s => s.id !== id))
        } catch (err) {
            console.error('delete song', err)
            setError('Erro ao deletar')
        }
    }

    if (loading) return <div>Carregando...</div>
    return (
        <Container className="container-inner">
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <UiButton className={`submit-button ${tab === 'suggestions' ? 'active' : ''}`} onClick={async () => { setTab('suggestions'); await fetchList() }}>Sugestões</UiButton>
                <UiButton className={`submit-button ${tab === 'manage' ? 'active' : ''}`} onClick={async () => { setTab('manage'); await fetchSongs() }}>Gerenciar</UiButton>
                <UiButton className={`submit-button ${tab === 'rejected' ? 'active' : ''}`} onClick={async () => { setTab('rejected'); await fetchListRejected() }}>Reprovadas</UiButton>
            </Box>

            {error && <div className="message error">{error}</div>}

            {tab === 'suggestions' && (
                <>
                    <Typography component="h3" variant="h6" sx={{ mb: 1 }}>Sugestões pendentes</Typography>
                    {items.length === 0 ? (
                        <div>Nenhuma sugestão pendente</div>
                    ) : (
                        <ul className="manage-list">
                            {items.map(s => (
                                <li key={s.id} className="manage-item">
                                    <div className="manage-info">
                                        <div className="manage-title">{s.title || s.titulo || s.youtube_link}</div>
                                        <div className="manage-meta">{s.youtube_link}</div>
                                    </div>
                                    <div className="manage-actions">
                                        <UiButton className="submit-button" onClick={() => approve(s.id)}>Aprovar</UiButton>
                                        <UiButton className="submit-button" onClick={() => remove(s.id)}>Reprovar</UiButton>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}

            {tab === 'manage' && (
                <>
                    <Typography component="h3" variant="h6" sx={{ mb: 1 }}>Gerenciar músicas</Typography>
                    <Box className="submit-form" sx={{ mb: 2 }} component="form" onSubmit={handleCreateSong}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input className="submit-input" placeholder="Título (opcional)" value={createData.title} onChange={e => setCreateData({ ...createData, title: e.target.value })} />
                            <input className="submit-input" placeholder="Link do YouTube" value={createData.youtube_link} onChange={e => setCreateData({ ...createData, youtube_link: e.target.value })} />
                            <UiButton className="submit-button" type="submit">Adicionar</UiButton>
                        </div>
                    </Box>

                    {songs.length === 0 ? (
                        <div>Nenhuma música cadastrada</div>
                    ) : (
                        <ul className="music-list">
                            {songs.map(s => (
                                <li key={s.id} style={{ listStyle: 'none' }}>
                                    <div className="music-card" style={{ alignItems: 'center' }}>
                                        <div className="music-info" style={{ flex: 1 }}>
                                            {editingId === s.id ? (
                                                <form onSubmit={(e) => handleSaveEdit(e, s.id)} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <input className="submit-input" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} />
                                                    <input className="submit-input" value={editData.youtube_link} onChange={e => setEditData({ ...editData, youtube_link: e.target.value })} />
                                                    <UiButton className="submit-button" type="submit">Salvar</UiButton>
                                                    <UiButton className="submit-button" onClick={() => setEditingId(null)}>Cancelar</UiButton>
                                                </form>
                                            ) : (
                                                <>
                                                    <div className="music-title">{s.title}</div>
                                                    <div className="views">{s.views ?? ''} visualizações</div>
                                                </>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <UiButton className="submit-button" onClick={() => startEdit(s)}>Editar</UiButton>
                                            <UiButton className="submit-button" onClick={() => handleDeleteSong(s.id)}>Excluir</UiButton>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}

            {tab === 'rejected' && (
                <>
                    <Typography component="h3" variant="h6" sx={{ mb: 1 }}>Sugestões reprovadas</Typography>
                    {items.length === 0 ? (
                        <div>Nenhuma sugestão reprovada</div>
                    ) : (
                        <ul className="manage-list">
                            {items.map(s => (
                                <li key={s.id} className="manage-item">
                                    <div className="manage-info">
                                        <div className="manage-title">{s.title || s.titulo || s.youtube_link}</div>
                                        <div className="manage-meta">{s.youtube_link}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </Container>
    )
}
