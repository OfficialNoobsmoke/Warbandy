import { ipcMain, dialog, app } from 'electron'
import * as fileService from './services/fileService'
import { getCharacters } from './services/characterService'

export function registerIpcHandlers(): void {
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('folder-exists', (_, path) => fileService.folderExists(path))

  ipcMain.handle('file-exists', (_, path) => fileService.fileExists(path))

  ipcMain.handle('read-file', (_, path) => fileService.readFile(path))

  ipcMain.handle('write-file', (_, path, content) => fileService.writeFile(path, content))

  ipcMain.handle('get-characters', (_, wowPath) => getCharacters(wowPath))

  ipcMain.handle('get-app-path', () => app.getAppPath())
}
