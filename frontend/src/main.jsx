import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
// App handles SPA navigation internally (custom events)
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
