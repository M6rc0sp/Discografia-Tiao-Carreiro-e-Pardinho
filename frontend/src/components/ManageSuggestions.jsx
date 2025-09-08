import React, { useEffect, useState } from 'react'
import { api, getCurrentUser, getCsrf, attachXsrfHeaders } from '../api'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import UiButton from './UiButton'
import SuggestionCards from './SuggestionCards'
import Button from '@mui/material/Button'

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
    const [showEditModal, setShowEditModal] = useState(false)
    const [errors, setErrors] = useState({})

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
            const headers = attachXsrfHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
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
        const attempt = async () => {
            const headers = attachXsrfHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
            return api.post(`/suggestions/${id}/reject`, {}, { headers })
        }

        try {
            await attempt()
            setItems(prev => prev.filter(i => i.id !== id))
        } catch (e) {
            console.error('delete error', e)
            // if CSRF mismatch -> refresh and retry once
            if (e?.response?.status === 419) {
                const ok = await getCsrf()
                if (ok) {
                    try {
                        await attempt()
                        setItems(prev => prev.filter(i => i.id !== id))
                        return
                    } catch (err2) {
                        console.error('delete retry failed', err2)
                    }
                }
            }

            if (e?.response?.status === 401) {
                window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'login' } }))
                return
            }
            setError('Erro ao remover')
        }
    }

    async function restore(id) {
        const attempt = async () => {
            const headers = attachXsrfHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
            return api.post(`/suggestions/${id}/restore`, {}, { headers })
        }

        try {
            await attempt()
            setItems(prev => prev.filter(i => i.id !== id))
        } catch (e) {
            console.error('restore error', e)
            if (e?.response?.status === 419) {
                const ok = await getCsrf()
                if (ok) {
                    try {
                        await attempt()
                        setItems(prev => prev.filter(i => i.id !== id))
                        return
                    } catch (err2) {
                        console.error('restore retry failed', err2)
                    }
                }
            }

            if (e?.response?.status === 401) {
                window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'login' } }))
                return
            }
            setError('Erro ao devolver sugestão')
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
        // populate editData including views compatibility
        setEditData({
            title: song.title || '',
            // if youtube_link missing, try to build from youtube_id
            youtube_link: song.youtube_link || (song.youtube_id ? `https://www.youtube.com/watch?v=${song.youtube_id}` : ''),
        })
        setShowEditModal(true)
    }

    async function handleSaveEdit(e, id) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault()
        setError(null)
        // validation (only link is required — visualizações são automáticas)
        const newErrors = {}
        if (!editData.youtube_link || String(editData.youtube_link).trim() === '') newErrors.youtube_link = 'Link do YouTube é obrigatório'
        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) return
        try {
            const payload = { title: editData.title, youtube_link: editData.youtube_link }
            const headers = attachXsrfHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
            const res = await safeRequest(() => api.put(`/songs/${id}`, payload, { headers }))
            setSongs(prev => prev.map(s => s.id === id ? res.data : s))
            setEditingId(null)
            setShowEditModal(false)
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
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }} role="tablist" aria-label="Gerenciamento">
                <UiButton
                    className={`submit-button ${tab === 'suggestions' ? 'active' : 'outline'}`}
                    onClick={async () => { setTab('suggestions'); await fetchList() }}
                    role="tab"
                    aria-selected={tab === 'suggestions'}
                    aria-controls="panel-suggestions"
                    id="tab-suggestions"
                >Sugestões</UiButton>

                <UiButton
                    className={`submit-button ${tab === 'manage' ? 'active' : 'outline'}`}
                    onClick={async () => { setTab('manage'); await fetchSongs() }}
                    role="tab"
                    aria-selected={tab === 'manage'}
                    aria-controls="panel-manage"
                    id="tab-manage"
                >Gerenciar</UiButton>

                <UiButton
                    className={`submit-button ${tab === 'rejected' ? 'active' : 'outline'}`}
                    onClick={async () => { setTab('rejected'); await fetchListRejected() }}
                    role="tab"
                    aria-selected={tab === 'rejected'}
                    aria-controls="panel-rejected"
                    id="tab-rejected"
                >Reprovadas</UiButton>
            </Box>

            {error && <div className="message error">{error}</div>}

            {tab === 'suggestions' && (
                <div role="tabpanel" id="panel-suggestions" aria-labelledby="tab-suggestions">
                    <Typography component="h3" variant="h6" sx={{ mb: 1 }}>Sugestões pendentes</Typography>
                    {items.length === 0 ? (
                        <div>Nenhuma sugestão pendente</div>
                    ) : (
                        <SuggestionCards items={items} onApprove={approve} onReject={remove} />
                    )}
                </div>
            )}

            {tab === 'manage' && (
                <div role="tabpanel" id="panel-manage" aria-labelledby="tab-manage">
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
                            {songs.map((s, idx) => (
                                <li key={s.id ?? s.youtube_link ?? idx} style={{ listStyle: 'none' }}>
                                    <div className="music-card" style={{ alignItems: 'center' }}>
                                        <div className="music-info" style={{ flex: 1 }}>
                                            <>
                                                <div className="music-title">{s.title}</div>
                                                <div className="views">{s.visualizacoes ?? s.visualizacoes ?? s.views ?? ''} visualizações</div>
                                            </>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <UiButton className="submit-button" onClick={() => startEdit(s)}>Editar</UiButton>
                                            <UiButton className="submit-button outline" onClick={() => handleDeleteSong(s.id)}>Excluir</UiButton>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {tab === 'rejected' && (
                <div role="tabpanel" id="panel-rejected" aria-labelledby="tab-rejected">
                    <Typography component="h3" variant="h6" sx={{ mb: 1 }}>Sugestões reprovadas</Typography>
                    {items.length === 0 ? (
                        <div>Nenhuma sugestão reprovada</div>
                    ) : (
                        <SuggestionCards items={items} showActions={false} onRestore={restore} />
                    )}
                </div>
            )}

            <Dialog open={showEditModal} onClose={() => { setShowEditModal(false); setEditingId(null); setErrors({}) }} maxWidth="sm" fullWidth>
                <DialogTitle>Editar música</DialogTitle>
                <DialogContent>
                    {error && <div className="message error">{error}</div>}
                    <Box component="form" onSubmit={(e) => handleSaveEdit(e, editingId)} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField label="Título" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} fullWidth error={!!errors.title} helperText={errors.title} />
                        <TextField label="Link do YouTube" value={editData.youtube_link} onChange={e => setEditData({ ...editData, youtube_link: e.target.value })} fullWidth error={!!errors.youtube_link} helperText={errors.youtube_link} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <UiButton className="submit-button outline" onClick={() => { setShowEditModal(false); setEditingId(null); setErrors({}) }}>
                        Cancelar
                    </UiButton>
                    <UiButton className="submit-button" onClick={(e) => handleSaveEdit(e, editingId)}>
                        Salvar
                    </UiButton>
                </DialogActions>
            </Dialog>

        </Container>
    )
}
