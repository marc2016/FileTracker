import { IProgramProcess } from './IProgramProcess'
import { IProgramProcessService } from './IProgramProcessService'
import { ProgramProcess } from './ProgramProcess'

export class ProgramProcessService implements IProgramProcessService {
  newProgramProcess = (programPath: string) => {
    return new ProgramProcess(programPath)
  }
}
