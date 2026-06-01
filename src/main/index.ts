import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import path, { join } from 'path'
import { Character } from './character'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return result.filePaths[0]
  })
  ipcMain.handle('folder-exists', async (_, folderPath: string) => {
    try {
      const stats = await fs.promises.stat(folderPath)
      return stats.isDirectory()
    } catch {
      return false
    }
  })
  ipcMain.handle('read-file', async (_, filePath: string) => {
    try {
      const data = await fs.promises.readFile(filePath, 'utf8')
      return data
    } catch {
      return null
    }
  })
  ipcMain.handle('write-file', async (_, path: string, content: string) => {
    await fs.promises.writeFile(path, content, 'utf8')
    return true
  })
  ipcMain.handle('get-characters', async (_, wowPath: string) => {
    return getCharacters(wowPath)
  })

  async function getCharacters(wowPath: string): Promise<Character[]> {
    const characters: Character[] = []

    const accountsPath = path.join(wowPath, 'WTF', 'Account')

    const accountDirs = await fs.promises.readdir(accountsPath, { withFileTypes: true })

    for (const accountDir of accountDirs) {
      if (!accountDir.isDirectory()) {
        continue
      }

      const accountName = accountDir.name

      const accountPath = path.join(accountsPath, accountName)

      const realmDirs = await fs.promises.readdir(accountPath, { withFileTypes: true })

      for (const realmDir of realmDirs) {
        if (!realmDir.isDirectory() || realmDir.name === 'SavedVariables') {
          continue
        }

        const realmName = realmDir.name

        const realmPath = path.join(accountPath, realmName)

        const characterDirs = await fs.promises.readdir(realmPath, { withFileTypes: true })

        for (const characterDir of characterDirs) {
          if (!characterDir.isDirectory()) {
            continue
          }

          characters.push({
            account: accountName,
            realm: realmName,
            name: characterDir.name
          })
        }
      }
    }

    return characters
  }

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
