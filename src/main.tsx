import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'
// Self-hosted so the site makes no external font request and can't be broken
// by a CDN going down. The variable build covers every weight we use.
import '@fontsource-variable/jetbrains-mono'
import '@/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
