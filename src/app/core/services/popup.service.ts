import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PopupService {
  showPopup = signal(false);
  deletePopup = signal(false);
  popupContext = signal('');


  setShownPopup(value: boolean) {
    this.showPopup.set(value);
  }

  setPopupContext(value: string) {
    this.popupContext.set(value);
  }

  setDeletePopup(val: boolean) {
    this.deletePopup.set(val);
  }
}
