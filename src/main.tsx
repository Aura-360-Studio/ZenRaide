import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DesktopGate } from './components/DesktopGate.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DesktopGate>
      <App />
    </DesktopGate>
  </StrictMode>,
)
