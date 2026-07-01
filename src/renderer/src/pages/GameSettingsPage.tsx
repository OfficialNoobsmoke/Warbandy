import { getAppSettings } from '@renderer/domain/appSettings'
import { GameSettings } from '@renderer/domain/gameSettings'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function GameSettingsPage(): React.JSX.Element {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<GameSettings | null>(null)
  const [settingsFileContent, setSettingsFileContent] = useState<string | null>(null)

  function getSettingValue(content: string, key: string): string | null {
    const regex = new RegExp(`SET\\s+${key}\\s+"([^"]*)"`)

    const match = content.match(regex)

    return match?.[1] ?? null
  }

  function setSettingValue(content: string, key: string, value: string): string {
    const regex = new RegExp(`^(SET\\s+${key}\\s+")([^"]*)(")$`, 'm')

    if (regex.test(content)) {
      return content.replace(regex, `$1${value}$3`)
    }

    return `${content}\nSET ${key} "${value}"`
  }

  function saveSettings(): void {
    if (!settings || !settingsFileContent) return

    const { wowPath } = getAppSettings()
    if (!wowPath) return

    let content = settingsFileContent

    content = setSettingValue(content, 'synchronizeConfig', settings.synchronizeConfig || '0')

    content = setSettingValue(content, 'synchronizeBindings', settings.synchronizeBindings || '0')

    content = setSettingValue(content, 'synchronizeMacros', settings.synchronizeMacros || '0')

    setSettingsFileContent(content)
    window.electronAPI.writeFile(wowPath + '/WTF/Config.wtf', content)
  }

  useEffect(() => {
    const loadSettings = async (): Promise<void> => {
      const { wowPath = '' } = getAppSettings()
      if (!wowPath) return

      const content = await window.electronAPI.readFile(wowPath + '/WTF/Config.wtf')
      if (!content) return
      setSettingsFileContent(content)

      setSettings({
        synchronizeConfig: getSettingValue(content, 'synchronizeConfig'),
        synchronizeBindings: getSettingValue(content, 'synchronizeBindings'),
        synchronizeMacros: getSettingValue(content, 'synchronizeMacros')
      })
    }

    loadSettings()
  }, [])

  if (!settings) {
    return <div>Loading...</div>
  }
  return (
    <>
      <div className="page">
        <h1>Game Settings</h1>

        <label>
          <input
            type="checkbox"
            checked={settings.synchronizeConfig === '1' ? true : false}
            onChange={(e) =>
              setSettings({
                ...settings,
                synchronizeConfig: e.target.checked ? '1' : '0'
              })
            }
          />
          Synchronize Config
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.synchronizeBindings === '1' ? true : false}
            onChange={(e) =>
              setSettings({
                ...settings,
                synchronizeBindings: e.target.checked ? '1' : '0'
              })
            }
          />
          Synchronize Bindings
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.synchronizeMacros === '1' ? true : false}
            onChange={(e) =>
              setSettings({
                ...settings,
                synchronizeMacros: e.target.checked ? '1' : '0'
              })
            }
          />
          Synchronize Macros
        </label>
        <button onClick={() => saveSettings()}>Save</button>
        <button onClick={() => navigate('/')}>Back</button>
      </div>
    </>
  )
}
