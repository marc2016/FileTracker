import ko from 'knockout'
import { TrackerStatus } from 'domain/TrackerStatus'
import { ISyncService } from 'services/ISyncService'

export class FileTrackerViewModel {
  _SyncService: ISyncService

  FileTrackerViewModel(syncService: ISyncService) {
    this._SyncService = syncService
  }

  TrackerStatus: ko.Observable<TrackerStatus> = ko.observable(
    TrackerStatus.None
  )

  lockSync() {
    console.info('lockSync')
    this.TrackerStatus(TrackerStatus.Locked)
  }
  unlockSync() {
    console.info('unlockSync')
    this.TrackerStatus(TrackerStatus.Unlocked)
  }
  syncFiles() {
    console.info('syncFiles')
    this.TrackerStatus(TrackerStatus.Synced)
  }
  startProgram() {
    console.info('startProgram')
  }
}
