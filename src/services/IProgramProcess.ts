import { IEvent } from 'strongly-typed-events'

export interface IProgramProcess {
  start(): boolean
  stop(): boolean
  onCloseEvent(): IEvent<IProgramProcess, number | null>
  processId(): number
}
