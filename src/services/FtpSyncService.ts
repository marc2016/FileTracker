import * as ftp from 'basic-ftp'
import * as path from 'path'
import * as fs from 'fs-extra'
import { promisify } from 'es6-promisify'
import { ILockingUser } from 'models/ILockingUser'
import { IAccountService } from './IAccountService'
import { ISyncService } from './ISyncService'
import { FTPError } from 'basic-ftp'
import { FileInfo } from 'domain/FileInfo'

const LOCK_FILE_NAME: string = 'LOCKFILE'
export class FtpSyncService implements ISyncService {
  private readonly _Client = new ftp.Client()
  private _AccountService: IAccountService

  constructor(accountService: IAccountService) {
    this._AccountService = accountService
    this._Client.ftp.verbose = true
  }

  checkLock: () => Promise<ILockingUser> = async () => {
    await this.connectToServer()
    const localDataPath = path.join(
      this._AccountService.getLocalDataPath(),
      LOCK_FILE_NAME
    )
    try {
      var ftpResponse = await this._Client.downloadTo(
        localDataPath,
        LOCK_FILE_NAME
      )
      if (ftpResponse.code != 200) {
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
    await this.connectToServer()
    var user: ILockingUser = {
      name: this._AccountService.getUsername(),
      LockDate: new Date(),
    }
    const localDataPath = path.join(
      this._AccountService.getLocalDataPath(),
      LOCK_FILE_NAME
    )
    await fs.writeJSON(localDataPath, user)
    await this._Client.uploadFrom(localDataPath, LOCK_FILE_NAME)
    return true
  }
  unlock(force?: boolean): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  async sync(): Promise<void> {
    var filePaths = await fs.readdir(this._AccountService.getLocalDataPath())
  }

  async connectToServer(): Promise<void> {
    await this._Client.access({
      host: this._AccountService.getHost(),
      user: this._AccountService.getUsername(),
      password: this._AccountService.getPassword(),
      secure: false,
    })
  }

  getLocalFiles: () => Promise<FileInfo[]> = async () => {
    var filePaths = await fs.readdir(this._AccountService.getLocalDataPath())
    var result: FileInfo[] = []
    filePaths.forEach((filePath) => {
      if (filePath === LOCK_FILE_NAME) return
      const completeFilePath = path.join(
        this._AccountService.getLocalDataPath(),
        filePath
      )
      var stat = fs.statSync(completeFilePath)
      var fileInfo = new FileInfo(completeFilePath, filePath, stat.mtime, false)
      result.push(fileInfo)
    })

    return result
  }

  getRemoteFiles: () => Promise<FileInfo[]> = async () => {
    await this.connectToServer()
    const files = await this._Client.list()
    var result: FileInfo[] = []
    files.forEach((file) => {
      if (file.isDirectory || file.name === LOCK_FILE_NAME) return
      var fileInfo = new FileInfo(file.name, file.name, file.modifiedAt, false)
      result.push(fileInfo)
    })

    return result
  }
}
