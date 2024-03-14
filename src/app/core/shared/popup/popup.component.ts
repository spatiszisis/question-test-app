import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PopupService } from '../../services/popup.service';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupComponent {
  popupService = inject(PopupService);
  test: number = 0;

  constructor() {
    const test = setInterval(() => {
      this.test += 10;
      if (this.test >= 100) {
        clearInterval(test);
        this.onClose();
      }
    }, 500);
  }

  onClose() {
    this.popupService.setShownPopup(false);
    this.popupService.setPopupContext('');
  }
}
