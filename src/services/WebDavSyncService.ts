import { createClient, AuthType } from 'webdav/web'
import * as path from 'path'
import * as fs from 'fs-extra'

import { FileInfo } from 'domain/FileInfo'
import { FileInfoCompare } from 'domain/FileInfoCompare'
import { ILockingUser } from 'models/ILockingUser'
import { ISyncService } from './ISyncService'
import { IAccountService } from './IAccountService'
import { FileStat, WebDAVClient } from 'webdav'

const LOCK_FILE_NAME: string = 'LOCKFILE'

export class WebDavSyncService implements ISyncService {
  private _AccountService: IAccountService

  private _client: WebDAVClient

  constructor(accountService: IAccountService) {
    this._AccountService = accountService
    this._client = createClient(this._AccountService.getHost(), {
      username: this._AccountService.getUsername(),
      password: this._AccountService.getPassword(),
    })
  }

  checkLock: () => Promise<ILockingUser> = async () => {
    return null
  }
  lock: () => Promise<boolean> = async () => {
    await this._client.stat('/')
    var user: ILockingUser = {
      name: this._AccountService.getUsername(),
      LockDate: new Date(),
    }
    const localDataPath = path.join(
      this._AccountService.getLocalDataPath(),
      LOCK_FILE_NAME
    )
    await fs.writeJSON(localDataPath, user)
    await this._client.copyFile(LOCK_FILE_NAME, localDataPath)
    return true
  }
  unlock(force?: boolean): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  sync(fileInfoCompareList: FileInfoCompare[]): Promise<void> {
    throw new Error('Method not implemented.')
  }

  getLocalFiles: () => Promise<FileInfo[]> = async () => {
    var filePaths = await fs.readdir(this._AccountService.getLocalDataPath())
    var result: FileInfo[] = []
    for (const filePath of filePaths) {
      if (filePath === LOCK_FILE_NAME) continue
      const completeFilePath = path.join(
        this._AccountService.getLocalDataPath(),
        filePath
      )
      var stat = fs.statSync(completeFilePath)
      var fileInfo = new FileInfo(completeFilePath, filePath, stat.mtime, false)
      result.push(fileInfo)
    }

    return result
  }

  getRemoteFiles: () => Promise<FileInfo[]> = async () => {
    const files: Array<FileStat> = <Array<FileStat>>(
      await this._client.getDirectoryContents('/')
    )
    var result: FileInfo[] = []
    for (const file of files) {
      if (file.type === 'directory' || file.filename === LOCK_FILE_NAME)
        continue
      const lastModDate = new Date(file.lastmod)
      var fileInfo = new FileInfo(
        file.basename,
        file.filename,
        lastModDate,
        true
      )
      result.push(fileInfo)
    }
    return result
  }
}
