import Client from 'ssh2-sftp-client'
import * as path from 'path'
import * as fs from 'fs-extra'
import { promisify } from 'es6-promisify'
import { ILockingUser } from 'models/ILockingUser'
import { IAccountService } from './IAccountService'
import { ISyncService } from './ISyncService'
import { FTPError } from 'basic-ftp'
import { FileInfo } from 'domain/FileInfo'
import { FileInfoCompare } from 'domain/FileInfoCompare'
import _ from 'lodash'
import { CompareStatus } from 'domain/CompareStatus'

const LOCK_FILE_NAME: string = 'LOCKFILE'
const FILES_TO_IGNORE: string[] = [LOCK_FILE_NAME, '.DS_Store']

export class FtpSyncService implements ISyncService {
  private readonly _client = new Client()
  private _AccountService: IAccountService

  constructor(accountService: IAccountService) {
    this._AccountService = accountService
    this.connectToServer()
  }

  checkLock: () => Promise<ILockingUser> = async () => {
    const localDataPath = path.join(
      this._AccountService.getLocalDataPath(),
      LOCK_FILE_NAME
    )
    try {
      var ftpResponse = await this._client.get(LOCK_FILE_NAME, localDataPath)
      if (ftpResponse != null) {
        var lockingUser = await fs.readJSON(localDataPath)
        lockingUser.LockDate = Date.parse(lockingUser.LockDate)
        return <ILockingUser>lockingUser
      }
    } catch (error: any) {
      if (error instanceof FTPError) {
        const ftpError = error as FTPError
        if (ftpError.code == 550) return null
      }
    }
  }

  lock: () => Promise<boolean> = async () => {
    var user: ILockingUser = {
      name: this._AccountService.getUsername(),
      LockDate: new Date(),
    }
    const localDataPath = path.join(
      this._AccountService.getLocalDataPath(),
      LOCK_FILE_NAME
    )
    await fs.writeJSON(localDataPath, user)
    await this._client.put(localDataPath, LOCK_FILE_NAME)
    return true
  }

  unlock: () => Promise<boolean> = (force?: boolean) => {
    throw new Error('Method not implemented.')
  }

  sync: (fileInfoCompareList: FileInfoCompare[]) => Promise<void> = async (
    fileInfoCompareList: FileInfoCompare[]
  ) => {
    for (const fileInfoCompare of fileInfoCompareList) {
      switch (fileInfoCompare.compareStatus()) {
        case CompareStatus.LocalNewer:
        case CompareStatus.RemoteMissing:
          var remotePath =
            fileInfoCompare.remoteFileInfo?.path ??
            fileInfoCompare.localFileInfo.name
          await this._client.put(fileInfoCompare.localFileInfo.path, remotePath)
          await this.refreshLocalFileStats(
            fileInfoCompare.localFileInfo.path,
            remotePath
          )
          break
        case CompareStatus.RemoteNewer:
        case CompareStatus.LocalMissing:
          var localPath = fileInfoCompare.localFileInfo?.path
          if (localPath == null) {
            localPath = path.join(
              this._AccountService.getLocalDataPath(),
              fileInfoCompare.localFileInfo.name
            )
          }
          await this._client.get(
            fileInfoCompare.remoteFileInfo.path,
            fileInfoCompare.localFileInfo.path
          )
          await this.refreshLocalFileStats(
            fileInfoCompare.localFileInfo.path,
            remotePath
          )
          break
        default:
          break
      }
    }
  }

  async connectToServer(): Promise<void> {
    await this._client.connect({
      host: this._AccountService.getHost(),
      port: this._AccountService.getPort(),
      username: this._AccountService.getUsername(),
      password: this._AccountService.getPassword(),
    })
  }

  getLocalFiles: () => Promise<FileInfo[]> = async () => {
    var filePaths = await fs.readdir(this._AccountService.getLocalDataPath())
    var result: FileInfo[] = []
    for (const filePath of filePaths) {
      if (FILES_TO_IGNORE.includes(filePath)) continue
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
    const files = await this._client.list('.')

    var result: FileInfo[] = []
    for (const file of files) {
      if (file.type !== '-' || FILES_TO_IGNORE.includes(file.name)) continue
      var date = new Date(file.modifyTime)
      var fileInfo = new FileInfo(file.name, file.name, date, false)
      result.push(fileInfo)
    }

    return result
  }

  private async refreshLocalFileStats(
    localPath: string,
    remotePath: string
  ): Promise<void> {
    const remoteStat = await this._client.stat(remotePath)
    await fs.utimes(
      localPath,
      new Date(remoteStat.accessTime),
      new Date(remoteStat.modifyTime)
    )
  }
}
