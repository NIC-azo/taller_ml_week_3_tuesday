import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useThemeStore } from './store/theme.store.ts'
import './index.css'
import App from './App.tsx'

// Aplicar tema guardado ANTES de montar React (evita parpadeo)
const savedTheme = useThemeStore.getState().theme;
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
