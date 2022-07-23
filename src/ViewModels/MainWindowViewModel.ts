export class MainWindowViewModel {
  closeWindow() {
    window.windowOperations.close()
  }
  minimizeWindow() {
    window.windowOperations.minimize()
  }
  maximizeWindow() {
    window.windowOperations.maximize()
  }
}
