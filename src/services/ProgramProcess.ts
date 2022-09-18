import { IProgramProcess } from './IProgramProcess'
import * as child from 'child_process'
import * as operativeSystemModule from 'os'
import { EventDispatcher, IEvent } from 'strongly-typed-events'

const osType = operativeSystemModule.type()

export class ProgramProcess implements IProgramProcess {
  private process: child.ChildProcess
  private programPath: string
  private openCommand: string
  private _processId: number

  private _closeEvent = new EventDispatcher<IProgramProcess, number | null>()

  constructor(path: string) {
    this.programPath = path
    if (osType == 'Windows_NT') this.openCommand = ''
    else this.openCommand = 'open -W'
  }

  processId = () => {
    return this._processId
  }

  onCloseEvent = () => {
    var eventObj = this._closeEvent.asEvent()
    eventObj['one'] = eventObj.one.bind(eventObj)
    return eventObj
  }

  start = () => {
    this.process = child.exec(`${this.openCommand} ${this.programPath}`)
    this._processId = this.process.pid
    this.process.addListener('close', (c, s) => this.signal(c))
    return true
  }

  stop = () => {
    this.process.kill()
    this.process.removeAllListeners()
    return true
  }

  private signal(code: number) {
    this._closeEvent.dispatch(this, code)
  }
}
