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
import { ProgramProcess } from 'services/ProgramProcess'
import { IProgramProcess } from 'services/IProgramProcess'
import { IProgramProcessService } from 'services/IProgramProcessService'

export class FileTrackerViewModel extends ViewModelBase {
  private _syncService: ISyncService
  private _accountService: IAccountService
  private _programProcessService: IProgramProcessService

  private _lockCheckInterval: NodeJS.Timer

  private _fileTrackerSyncModal: bootstrap.Modal

  private _nextStatusAfterSync: TrackerStatus = TrackerStatus.None

  constructor(
    syncService: ISyncService,
    accountService: IAccountService,
    programProcessService: IProgramProcessService
  ) {
    super()
    this._syncService = syncService
    this._accountService = accountService
    this._programProcessService = programProcessService

    this.programProcesses = ko.observableArray()

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

  programProcesses: ko.ObservableArray<IProgramProcess>

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
    this.currentLockingUser('')
    this.TrackerStatus(TrackerStatus.Unlocked)
  }

  async syncFilesBeforeProgram() {
    this._nextStatusAfterSync = TrackerStatus.Synced
    await this.syncFiles()
  }

  async syncFilesAfterProgram() {
    this._nextStatusAfterSync = TrackerStatus.SyncedBack
    await this.syncFiles()
  }

  async syncFiles() {
    this.syncReady(false)
    var localFiles = await this._syncService.getLocalFiles()
    var remoteFiles = await this._syncService.getRemoteFiles()

    this.compareFiles.removeAll()
    _.forEach(localFiles, (localFile) => {
      var remoteFile = <FileInfo>_.find(remoteFiles, (rf) => {
        return rf.name == localFile.name
      })

      var compareFile = new FileInfoCompare(localFile, remoteFile)
      this.compareFiles.push(compareFile)
    })

    this._fileTrackerSyncModal.show()
    await this._syncService.sync(this.compareFiles())
    this.syncReady(true)
  }

  startProgram() {
    const programProcess = this._programProcessService.newProgramProcess(
      this._accountService.getProgramPath()
    )
    programProcess.onCloseEvent().one(this.programClosed.bind(this))
    this.programProcesses.push(programProcess)
    programProcess.start()
  }

  confirmSyncResult() {
    this._fileTrackerSyncModal.hide()

    this.TrackerStatus(this._nextStatusAfterSync)
    this._nextStatusAfterSync = TrackerStatus.None
  }

  private async startLockCheckInterval() {
    await this.checkLock()
    this._lockCheckInterval = setInterval(() => this.checkLock(), 30000)
  }

  private stopLockCheckInterval() {
    clearInterval(this._lockCheckInterval)
  }

  private async checkLock() {
    if (this.TrackerStatus() >= 4) return

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

  private programClosed(programProcess: IProgramProcess, code: number) {
    this.programProcesses.remove((item) => {
      return programProcess.processId() == item.processId()
    })
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
