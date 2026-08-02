import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { fileExists } from './fileService'
import { getMainWindow } from '../window'

const watchers = new Map<string, fs.FSWatcher>()

export async function watchWarbandyHelperDataFileChanges(): Promise<void> {
  stopWatchingAddonFileChanges()

  const settingsPath = path.join(app.getAppPath(), 'settings.json')
  const { wowPath = '' } = JSON.parse(await fs.promises.readFile(settingsPath, 'utf8'))

  if (!wowPath) {
    return
  }

  const accountsPath = path.join(wowPath, 'WTF', 'Account')
  const accountDirs = await fs.promises.readdir(accountsPath, {
    withFileTypes: true
  })

  for (const accountDir of accountDirs) {
    if (!accountDir.isDirectory()) {
      continue
    }

    const luaPath = path.join(accountsPath, accountDir.name, 'SavedVariables', 'WarbandyHelper.lua')

    if (!(await fileExists(luaPath))) {
      continue
    }

    const mainWindow = getMainWindow()
    watchAddonFile(luaPath, () => mainWindow.webContents.send('warbandy-helper-data-changed'))
  }
}

function watchAddonFile(filePath: string, onChange: (file: string) => void): void {
  const watcher = fs.watch(filePath, (eventType) => {
    if (eventType === 'change') {
      onChange(filePath)
    }
  })

  watchers.set(filePath, watcher)
}

export function stopWatchingAddonFileChanges(): void {
  for (const watcher of watchers.values()) {
    watcher.close()
  }

  watchers.clear()
}
