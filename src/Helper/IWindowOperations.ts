export interface IWindowOperations {
  close: () => Promise<void>
  minimize: () => Promise<void>
  maximize: () => Promise<void>
}

declare global {
  interface Window {
    windowOperations: IWindowOperations
  }
}
