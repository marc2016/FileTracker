import { FileInfo } from 'domain/FileInfo'
import { FileInfoCompare } from 'domain/FileInfoCompare'
import { ILockingUser } from 'models/ILockingUser'

export interface ISyncService {
  checkLock(): Promise<ILockingUser>
  lock(): Promise<boolean>
  unlock(force?: boolean): Promise<boolean>
  sync(fileInfoCompareList: FileInfoCompare[]): Promise<void>
  getLocalFiles(): Promise<FileInfo[]>
  getRemoteFiles(): Promise<FileInfo[]>
}
