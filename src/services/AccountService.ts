import Store from 'electron-store'
import { IAccountService } from './IAccountService'

export class AccountService implements IAccountService {
  private _Store: any = null

  constructor() {
    this._Store = new Store()
  }

  getUsername = () => {
    return <string>this._Store.get('username')
  }
  setUsername = (username: string) => {
    this._Store.set('username', username)
  }
  getPassword = () => {
    return <string>this._Store.get('password')
  }
  setPassword = (password: string) => {
    this._Store.set('password', password)
  }
  getHost = () => {
    return <string>this._Store.get('host')
  }
  setHost = (host: string) => {
    this._Store.set('host', host)
  }
  getLocalDataPath = () => {
    return <string>this._Store.get('localDataPath')
  }
  setLocalDataPath = (path: string) => {
    this._Store.set('localDataPath', path)
  }
}
