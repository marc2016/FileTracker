import * as ftp from 'basic-ftp'
import * as path from 'path'
import { ILockingUser } from 'models/ILockingUser'
import { IAccountService } from './IAccountService'
import { ISyncService } from './ISyncService'

export class FtpSyncService implements ISyncService {
  private readonly _Client = new ftp.Client()
  private _AccountService: IAccountService

  FtpSyncService(accountService: IAccountService) {
    this._AccountService = accountService
  }

  async checkLock(): Promise<ILockingUser> {
    const localDataPath = path.join(
      this._AccountService.getLocalDataPath(),
      'LOCKFILE'
    )
    var ftpResponse = await this._Client.downloadTo(localDataPath, 'LOCKFILE')
    if (ftpResponse.code != 200) {
      return null
    }
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

  async connectToServer(): Promise<void> {
    await this._Client.access({
      host: this._AccountService.getHost(),
      user: this._AccountService.getUsername(),
      password: this._AccountService.getPassword(),
      secure: true,
    })
  }
}
