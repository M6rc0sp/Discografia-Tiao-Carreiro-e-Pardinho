import React from 'react'
import Songs from './components/Songs'

export default function App(){
  return (
    <div className="app-container">
      <header>
        <h1>Top 5 - Tião Carreiro & Pardinho (v2)</h1>
      </header>
      <main>
        <Songs />
      </main>
    </div>
  )
}
