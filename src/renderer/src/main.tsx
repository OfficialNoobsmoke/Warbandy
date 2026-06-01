import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ApplicationSettingsPage from './pages/ApplicationSettingsPage'
import GameSettingsPage from './pages/GameSettingsPage'
import CharactersPage from './pages/CharactersPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/charactersPage" element={<CharactersPage />} />
        <Route path="/applicationSettingsPage" element={<ApplicationSettingsPage />} />
        <Route path="/gameSettingsPage" element={<GameSettingsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
