// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('windowOperations', {
  close: () => ipcRenderer.send('window-operations', 'close'),
  minimize: () => ipcRenderer.send('window-operations', 'minimize'),
  maximize: () => ipcRenderer.send('window-operations', 'maximize'),
})
