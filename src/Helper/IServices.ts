import { IAccountService } from 'services/IAccountService'
import { ISyncService } from 'services/ISyncService'

export interface IServices {
  syncService: ISyncService
  accountService: IAccountService
}

declare global {
  interface Window {
    services: IServices
  }
}
