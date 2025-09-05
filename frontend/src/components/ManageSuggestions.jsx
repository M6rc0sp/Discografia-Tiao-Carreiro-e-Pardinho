import React, { useEffect, useState } from 'react'
import { api, getCurrentUser, getCsrf } from '../api'

export default function ManageSuggestions() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

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

    if (loading) return <div>Carregando...</div>
    return (
        <div className="container-inner">
            <h3>Sugestões pendentes</h3>
            {error && <div className="message error">{error}</div>}
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
                                <button onClick={() => approve(s.id)}>Aprovar</button>
                                <button onClick={() => remove(s.id)}>Reprovar</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
