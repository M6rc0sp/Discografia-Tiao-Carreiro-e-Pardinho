import React from 'react'
import Songs from './components/Songs'
import Header from './components/Header'

export default function App(){
  return (
    <>
      <Header />
      <div className="app-container overlap">
        <main>
          <Songs />
        </main>
      </div>
    </>
  )
}
