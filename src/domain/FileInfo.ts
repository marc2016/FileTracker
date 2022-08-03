export class FileInfo {
  constructor(
    path: string,
    name: string,
    lastModification: Date,
    remote: boolean
  ) {
    this.path = path
    this.name = name
    this.lastModification = lastModification
    this.remote = remote
  }

  path: string
  name: string
  lastModification: Date
  remote: boolean
}
