import React from 'react'
import UiButton from './UiButton'

export default function SuggestionCards({ items = [], onApprove = () => { }, onReject = () => { }, onRestore = null, showActions = true }) {
    if (!Array.isArray(items) || items.length === 0) {
        return null
    }

    return (
        <div className="manage-cards">
            {items.map(s => {
                const youtube = s.youtube_link || (s.youtube_id ? `https://www.youtube.com/watch?v=${s.youtube_id}` : '#')
                return (
                    <div key={s.id} className="manage-card">
                        <a className="music-card-link" href={youtube} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="manage-card-main">
                                <div className="manage-title">{s.title || s.titulo || s.youtube_link}</div>
                                <div className="manage-meta">{s.youtube_link}</div>
                            </div>
                        </a>

                        {showActions && (
                            <div className="manage-card-actions">
                                <UiButton className="submit-button" onClick={() => onApprove(s.id)}>Aprovar</UiButton>
                                <UiButton className="submit-button outline" onClick={() => onReject(s.id)}>Reprovar</UiButton>
                            </div>
                        )}

                        {!showActions && onRestore && (
                            <div className="manage-card-actions">
                                <UiButton className="submit-button outline" onClick={() => onRestore(s.id)}>Restaurar</UiButton>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
