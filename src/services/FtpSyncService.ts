import { ILockingUser } from 'models/ILockingUser'
import { ISyncService } from './ISyncService'

export class FtpSyncService implements ISyncService {
  checkLock(): Promise<ILockingUser> {
    throw new Error('Method not implemented.')
  }
  lock(): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  unlock(force?: boolean): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  sync(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
