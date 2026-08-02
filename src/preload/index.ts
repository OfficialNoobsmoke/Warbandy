import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  folderExists: (p: string) => ipcRenderer.invoke('folder-exists', p),
  fileExists: (p: string) => ipcRenderer.invoke('file-exists', p),
  readFile: (p: string) => ipcRenderer.invoke('read-file', p),
  writeFile: (p: string, c: string) => ipcRenderer.invoke('write-file', p, c),
  getWarbandyHelperData: (w: string) => ipcRenderer.invoke('get-warbandy-helper-data', w),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  onWarbandyHelperDataChanged: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('warbandy-helper-data-changed', listener)
    return () => {
      ipcRenderer.removeListener('warbandy-helper-data-changed', listener)
    }
  },
  exit: () => ipcRenderer.invoke('exit')
})
