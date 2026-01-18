import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// For production, you can add StrictMode back
// For development with AdSense, it's better to keep it off to avoid double ad initialization
const isDevelopment = import.meta.env.DEV;

ReactDOM.createRoot(document.getElementById('root')).render(
  isDevelopment ? (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  ) : (
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
)