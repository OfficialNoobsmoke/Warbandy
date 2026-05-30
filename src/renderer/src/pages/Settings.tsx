import { useState } from 'react'

function Settings(): React.JSX.Element {
  const [folderPath, setFolderPath] = useState('')
  const handleSelectFolder = async (): Promise<void> => {
    const path = await window.electronAPI.selectFolder()

    if (path) {
      setFolderPath(path)
    }
  }
  return (
    <div style={{ padding: 40 }}>
      <h1>Settings Page</h1>

      <div style={{ padding: 40 }}>
        <button onClick={handleSelectFolder}>Select Folder</button>

        <div style={{ marginTop: 20 }}>{folderPath || 'No folder selected'}</div>
      </div>
    </div>
  )
}

export default Settings
