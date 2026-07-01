import { getAppSettings, updateAppSettings } from '@renderer/domain/appSettings'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ApplicationSettingsPage(): React.JSX.Element {
  const navigate = useNavigate()
  const [WowFolderPath, setWowFolderPath] = useState(() => {
    const { wowPath = '' } = getAppSettings()
    return wowPath
  })

  const handleSelectFolder = async (): Promise<void> => {
    const path = await window.electronAPI.selectFolder()

    if (path) {
      const wtfFolderExists = await window.electronAPI.folderExists(path + '/WTF')
      if (!wtfFolderExists) {
        alert('Selected folder is does not have a WTF folder.')
        return
      }
      const addonsFolderExists = await window.electronAPI.folderExists(path + '/interface/addons')
      if (!addonsFolderExists) {
        alert('Selected folder does not have interface/addons folder.')
        return
      }

      updateAppSettings({ wowPath: path })
      setWowFolderPath(path)
    }
  }

  const saveApplicationSettings = (): void => {
    const appPath = localStorage.getItem('appPath')
    const appSettings = getAppSettings()
    window.electronAPI.writeFile(appPath + '/settings.json', JSON.stringify(appSettings))
  }

  return (
    <div>
      <h1>Application Settings</h1>

      <div>
        <button onClick={handleSelectFolder}>Select WoW Folder</button>
        <div>{WowFolderPath || 'No folder selected'}</div>
      </div>
      <button onClick={() => saveApplicationSettings()}>Save</button>
      <button onClick={() => navigate('/')}>Back</button>
    </div>
  )
}
