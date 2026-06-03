import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { registerSW } from 'virtual:pwa-register'
import { AuthProvider } from './context/AuthContext'
import { OfflineBanner } from './components/OfflineBanner'
import App from './App'
import './index.css'

// Auto-update service worker, notify user if a new version is available
registerSW({
  onNeedRefresh() {
    // The new version is downloaded — silently activate on next navigation.
    // For a manual prompt UX, we could surface a toast here instead.
  },
  onOfflineReady() {
    // App is now installable / usable offline.
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <OfflineBanner />
        <Toaster
          position="top-right"
          toastOptions={{ style: { fontFamily: 'Karla, sans-serif' } }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
