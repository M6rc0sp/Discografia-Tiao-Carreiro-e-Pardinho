import React, {useEffect, useState} from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default function Songs(){
  const [songs, setSongs] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(()=>{ fetchPage(1) }, [])

  async function fetchPage(p){
    try{
      const res = await axios.get(`${API_BASE}/api/songs?page=${p}`)
      setSongs(res.data.data || res.data)
      setPage(p)
      if(res.data.meta && res.data.meta.last_page) setTotalPages(res.data.meta.last_page)
    }catch(e){
      console.error(e)
    }
  }

  return (
    <section>
      <h2>Top 5</h2>
      <ol>
        {songs.slice(0,5).map((s, i)=> (
          <li key={s.id}>{s.title} — <a href={s.youtube_link} target="_blank" rel="noreferrer">ver</a></li>
        ))}
      </ol>

      <h3>Mais músicas</h3>
      <ul>
        {songs.slice(5).map(s=> (
          <li key={s.id}>{s.title} — <a href={s.youtube_link} target="_blank" rel="noreferrer">ver</a></li>
        ))}
      </ul>

      <div className="pagination">
        <button onClick={()=>fetchPage(Math.max(1, page-1))} disabled={page<=1}>Anterior</button>
        <span> {page} / {totalPages} </span>
        <button onClick={()=>fetchPage(Math.min(totalPages, page+1))} disabled={page>=totalPages}>Próxima</button>
      </div>
    </section>
  )
}
