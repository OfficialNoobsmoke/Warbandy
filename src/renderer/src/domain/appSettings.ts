type AppSettings = {
  wowPath: string
}

export function getAppSettings(): Partial<AppSettings> {
  return JSON.parse(localStorage.getItem('appSettings') ?? '{}')
}

export function setAppSettings(settings: Partial<AppSettings>): void {
  localStorage.setItem('appSettings', JSON.stringify(settings))
}

export function updateAppSettings(newSettings: Partial<AppSettings>): void {
  const currentSettings = getAppSettings()
  const updatedSettings = { ...currentSettings, ...newSettings }
  setAppSettings(updatedSettings)
}
