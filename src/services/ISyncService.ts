import { FileInfo } from 'domain/FileInfo'
import { ILockingUser } from 'models/ILockingUser'

export interface ISyncService {
  checkLock(): Promise<ILockingUser>
  lock(): Promise<boolean>
  unlock(force?: boolean): Promise<boolean>
  sync(): Promise<void>
  getLocalFiles(): Promise<FileInfo[]>
  getRemoteFiles(): Promise<FileInfo[]>
}
