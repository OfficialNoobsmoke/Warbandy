import { createStorage } from '../services/localStorageService'

export interface AppSettings {
  wowPath: string
}

export const appSettingsStorage = createStorage<AppSettings>('appSettings')
