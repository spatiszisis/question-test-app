import { Injectable, signal } from '@angular/core';
import { Modal, ModalOptions } from 'flowbite';
import { ImageModalComponent } from '../../add-or-edit-question-test/image-modal/image-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  modal: Modal;

  constructor() {}

  openModal(targetEl: HTMLElement) {
    const options: ModalOptions = {
      placement: 'bottom-right',
      backdrop: 'dynamic',
      backdropClasses: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40',
      closable: true,
      onHide: () => {
        console.log('modal is hidden');
      },
      onShow: () => {
        console.log('modal is shown');
      },
      onToggle: () => {
        console.log('modal has been toggled');
      },
    };

    const instanceOptions = {
      id: targetEl.id,
      override: true,
    };

    this.modal = new Modal(targetEl, options, instanceOptions);
    this.modal.show();
  }

  closeModal() {
    this.modal.hide();
  }
}
