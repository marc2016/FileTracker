import $ from 'jquery'
import ko, { tasks } from 'knockout'
import { format, compareAsc } from 'date-fns'
import _ from 'lodash'

import { TrackerStatus } from 'domain/TrackerStatus'
import { ISyncService } from 'services/ISyncService'
import { ViewModelBase } from './ViewModelBase'
import { IAccountService } from 'services/IAccountService'
import { fstat } from 'original-fs'
import { FileInfoCompare } from 'domain/FileInfoCompare'
import { FileInfo } from 'domain/FileInfo'
import bootstrap from 'bootstrap'

export class FileTrackerViewModel extends ViewModelBase {
  private _syncService: ISyncService
  private _accountService: IAccountService

  private _lockCheckInterval: NodeJS.Timer

  private _fileTrackerSyncModal: bootstrap.Modal

  constructor(syncService: ISyncService, accountService: IAccountService) {
    super()
    this._syncService = syncService
    this._accountService = accountService
    this.startLockCheckInterval()
    this._fileTrackerSyncModal = new bootstrap.Modal('#FileTrackerSyncModal')
  }

  TrackerStatus: ko.Observable<TrackerStatus> = ko.observable(
    TrackerStatus.Unlocked
  )

  currentLockingUser: ko.Observable<string> = ko.observable('')

  currentLockedSince: ko.Observable<string> = ko.observable('')

  compareFiles: ko.ObservableArray<FileInfoCompare> = ko.observableArray()

  syncReady: ko.Observable<boolean> = ko.observable(false)

  async lockSync() {
    var lockingUser = await this._syncService.checkLock()
    if (
      lockingUser == null ||
      lockingUser.name == this._accountService.getUsername()
    ) {
      await this._syncService.lock()
      this.TrackerStatus(TrackerStatus.Locked)
      this.currentLockingUser(this._accountService.getUsername())
      const currentDate = new Date()
      this.currentLockedSince(format(currentDate, 'dd.MM.yyyy, HH:mm'))
    } else {
      this.TrackerStatus(TrackerStatus.LockedByOtherUser)
      this.currentLockingUser(lockingUser.name)
    }
  }
  async unlockSync() {
    await this._syncService.unlock()
    this.TrackerStatus(TrackerStatus.Unlocked)
  }

  async syncFiles() {
    this.syncReady(false)
    var localFiles = await this._syncService.getLocalFiles()
    var remoteFiles = await this._syncService.getRemoteFiles()

    _.forEach(localFiles, (localFile) => {
      var remoteFile = <FileInfo>_.find(remoteFiles, (rf) => {
        return rf.name == localFile.name
      })

      var compareFile = new FileInfoCompare(localFile, remoteFile)
      this.compareFiles.push(compareFile)
    })

    this._fileTrackerSyncModal.show()
    this._syncService.sync(this.compareFiles())

    this.syncReady(true)
  }
  startProgram() {
    console.info('startProgram')
  }

  confirmSyncResult() {
    this._fileTrackerSyncModal.hide()

    this.TrackerStatus(TrackerStatus.Synced)
  }

  private async startLockCheckInterval() {
    await this.checkLock()
    this._lockCheckInterval = setInterval(() => this.checkLock(), 30000)
  }

  private stopLockCheckInterval() {
    clearInterval(this._lockCheckInterval)
  }

  private async checkLock() {
    var lockingUser = await this._syncService.checkLock()
    if (lockingUser == null) {
      this.TrackerStatus(TrackerStatus.Unlocked)
      this.currentLockingUser('')
    } else if (lockingUser.name == this._accountService.getUsername()) {
      this.TrackerStatus(TrackerStatus.Locked)
      this.currentLockingUser(lockingUser.name)
      this.currentLockedSince(format(lockingUser.LockDate, 'dd.MM.yyyy, HH:mm'))
    } else {
      this.TrackerStatus(TrackerStatus.LockedByOtherUser)
      this.currentLockingUser(lockingUser.name)
      this.currentLockedSince(format(lockingUser.LockDate, 'dd.MM.yyyy, HH:mm'))
    }
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
