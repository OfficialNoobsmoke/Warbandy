import { useNavigate } from 'react-router-dom'
import { setAppSettings } from './domain/appSettings'
import { useEffect } from 'react'

function App(): React.JSX.Element {
  const navigate = useNavigate()

  const setAppPath = async (): Promise<void> => {
    localStorage.setItem('appPath', await window.electronAPI.getAppPath())
  }

  const createApplicationSettings = async (): Promise<void> => {
    const appPath = localStorage.getItem('appPath')
    if (!appPath) return

    const settingsFileExists = await window.electronAPI.fileExists(appPath + '/settings.json')

    if (!settingsFileExists) {
      await window.electronAPI.writeFile(appPath + '/settings.json', '{}')
    } else {
      const content = await window.electronAPI.readFile(appPath + '/settings.json')

      if (!content) return

      setAppSettings(JSON.parse(content))
    }
  }

  useEffect(() => {
    const init = async (): Promise<void> => {
      await setAppPath()
      await createApplicationSettings()
    }

    init()
  }, [])

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
