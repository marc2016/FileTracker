import { IProgramProcess } from './IProgramProcess'

export interface IProgramProcessService {
  newProgramProcess(programPath: string): IProgramProcess
}
