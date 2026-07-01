import { useNavigate } from 'react-router-dom'
import { setAppSettings } from './domain/appSettings'

function App(): React.JSX.Element {
  const navigate = useNavigate()

  const setAppPath = async (): Promise<void> => {
    localStorage.setItem('appPath', await window.electronAPI.getAppPath())
  }

  const createApplicationSettings = async (): Promise<void> => {
    const appPath = localStorage.getItem('appPath')
    const settingsFileExists = await window.electronAPI.folderExists(appPath + '/settings.json')
    if (!settingsFileExists) {
      await window.electronAPI.writeFile(appPath + '/settings.json', '{}')
    } else {
      const content = await window.electronAPI.readFile(appPath + '/settings.json')
      if (!content) return
      setAppSettings(JSON.parse(content))
    }
  }

  setAppPath()
  createApplicationSettings()
  return (
    <>
      <button onClick={() => navigate('/charactersPage')}>Characters Page</button>
      <button onClick={() => navigate('/gameSettingsPage')}>Go To Game Settings Page</button>
      <button onClick={() => navigate('/applicationSettingsPage')}>
        Go To Application Settings Page
      </button>
    </>
  )
}

export default App
