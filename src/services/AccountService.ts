import Store from 'electron-store'
import { IAccountService } from './IAccountService'

export class AccountService implements IAccountService {
  private readonly _Store = new Store()

  getUsername(): string {
    return <string>this._Store.get('username')
  }
  setUsername(username: string): void {
    this._Store.set('username', username)
  }
  getPassword(): string {
    return <string>this._Store.get('password')
  }
  setPassword(password: string): void {
    this._Store.set('password', password)
  }
  getHost(): string {
    return <string>this._Store.get('host')
  }
  setHost(host: string): void {
    this._Store.set('host', host)
  }
  getLocalDataPath(): string {
    return <string>this._Store.get('localDataPath')
  }
  setLocalDataPath(path: string): void {
    this._Store.set('localDataPath', path)
  }
}
