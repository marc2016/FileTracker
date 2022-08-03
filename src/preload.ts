// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron'
import { AccountService } from 'services/AccountService'
import { FtpSyncService } from 'services/FtpSyncService'
import { IAccountService } from 'services/IAccountService'
import { ISyncService } from 'services/ISyncService'

contextBridge.exposeInMainWorld('windowOperations', {
  close: () => ipcRenderer.send('window-operations', 'close'),
  minimize: () => ipcRenderer.send('window-operations', 'minimize'),
  maximize: () => ipcRenderer.send('window-operations', 'maximize'),
})

const accountService: IAccountService = new AccountService()
const syncService: ISyncService = new FtpSyncService(accountService)

contextBridge.exposeInMainWorld('services', {
  syncService: syncService,
  accountService: accountService,
})
