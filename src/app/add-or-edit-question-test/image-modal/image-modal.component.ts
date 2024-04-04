import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-image-modal',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './image-modal.component.html',
  styleUrl: './image-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageModalComponent {
  @Input() images: AbstractControl<any, any>[];
  @Input() selectedQuestionIndex: number;
}
