import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  folderExists: (path: string) => ipcRenderer.invoke('folder-exists', path),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (path: string, content: string) => ipcRenderer.invoke('write-file', path, content),
  getCharacters: (wowPath: string) => ipcRenderer.invoke('get-characters', wowPath),
  getAppPath: () => ipcRenderer.invoke('get-app-path')
})
