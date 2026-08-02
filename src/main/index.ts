import { app, BrowserWindow } from 'electron'
import { createWindow } from './window'
import { registerIpcHandlers } from './ipc'
import { watchWarbandyHelperDataFileChanges } from './services/fileWatcher'

app.whenReady().then(() => {
  app.setAppUserModelId('com.electron')

  registerIpcHandlers()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  watchWarbandyHelperDataFileChanges().catch((error) => {
    console.error('Error watching Warbandy Helper data file changes:', error)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
