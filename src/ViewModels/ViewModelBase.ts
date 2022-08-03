import ko from 'knockout'

export class ViewModelBase {
  isVisible: ko.Observable<boolean> = ko.observable(false)

  show() {
    this.isVisible(true)
  }

  hide() {
    this.isVisible(false)
  }
}
