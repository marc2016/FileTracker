import ko from 'knockout'
import isBefore from 'date-fns/isBefore'
import isEqual from 'date-fns/isEqual'

import { CompareStatus } from './CompareStatus'
import { FileInfo } from './FileInfo'

export class FileInfoCompare {
  constructor(localFileInfo: FileInfo, remoteFileInfo: FileInfo) {
    this.localFileInfo = localFileInfo
    this.remoteFileInfo = remoteFileInfo
  }

  localFileInfo: FileInfo
  remoteFileInfo: FileInfo
  compareStatus: ko.PureComputed<CompareStatus> = ko.pureComputed<
    CompareStatus,
    FileInfoCompare
  >(function () {
    var that = <FileInfoCompare>this
    var localDate = that.localFileInfo?.lastModification
    var remoteDate = that.remoteFileInfo?.lastModification
    if (localDate == null) return CompareStatus.LocalMissing
    if (remoteDate == null) return CompareStatus.RemoteMissing
    if (isEqual(localDate, remoteDate)) return CompareStatus.Equal
    if (isBefore(localDate, remoteDate)) return CompareStatus.RemoteNewer
    if (isBefore(remoteDate, localDate)) return CompareStatus.LocalNewer
    return CompareStatus.None
  }, this)
}
