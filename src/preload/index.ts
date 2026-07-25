import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  folderExists: (p:string)=>ipcRenderer.invoke('folder-exists',p),
  fileExists:(p:string)=>ipcRenderer.invoke('file-exists',p),
  readFile:(p:string)=>ipcRenderer.invoke('read-file',p),
  writeFile:(p:string,c:string)=>ipcRenderer.invoke('write-file',p,c),
  getCharacters:(w:string)=>ipcRenderer.invoke('get-characters',w),
  getAppPath:()=>ipcRenderer.invoke('get-app-path')
})
