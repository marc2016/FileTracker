import { IAccountService } from 'services/IAccountService'
import { IProgramProcess } from 'services/IProgramProcess'
import { IProgramProcessService } from 'services/IProgramProcessService'
import { ISyncService } from 'services/ISyncService'

export interface IServices {
  syncService: ISyncService
  accountService: IAccountService
  programService: IProgramProcessService
}

declare global {
  interface Window {
    services: IServices
  }
}
