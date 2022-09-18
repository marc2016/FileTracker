import ko from 'knockout'
import { ViewModelBase } from './ViewModelBase'
import { IAccountService } from 'services/IAccountService'

export class SyncSettingsViewModel extends ViewModelBase {
  private _accountService: IAccountService

  constructor(accountService: IAccountService) {
    super()
    this._accountService = accountService
  }

  username: ko.PureComputed<string> = ko.pureComputed({
    read: function () {
      return this._accountService.getUsername()
    },
    write: function (value) {
      this._accountService.setUsername(value)
    },
    owner: this,
  })
  password: ko.PureComputed<string> = ko.pureComputed({
    read: function () {
      return this._accountService.getPassword()
    },
    write: function (value) {
      this._accountService.setPassword(value)
    },
    owner: this,
  })
  host: ko.PureComputed<string> = ko.pureComputed({
    read: function () {
      return this._accountService.getHost()
    },
    write: function (value) {
      this._accountService.setHost(value)
    },
    owner: this,
  })
  port: ko.PureComputed<number> = ko.pureComputed({
    read: function () {
      return this._accountService.getPort()
    },
    write: function (value) {
      this._accountService.setPort(value)
    },
    owner: this,
  })
  localDataPath: ko.PureComputed<string> = ko.pureComputed({
    read: function () {
      return this._accountService.getLocalDataPath()
    },
    write: function (value) {
      this._accountService.setLocalDataPath(value)
    },
    owner: this,
  })
  programPath: ko.PureComputed<string> = ko.pureComputed({
    read: function () {
      return this._accountService.getProgramPath()
    },
    write: function (value) {
      this._accountService.setProgramPath(value)
    },
    owner: this,
  })
}
