import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { QuestionTestsService } from '../core/services/question-tests.service';
import { PopupComponent } from '../core/shared/popup/popup.component';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PopupComponent],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroComponent {
  questionTestService = inject(QuestionTestsService);
  selectedQuestionTestId: any;

  setQuestionTest(id: number | string) {
    if (id !== 'undefined') {
      this.selectedQuestionTestId = id;
    } else {
      this.selectedQuestionTestId = undefined;
    }
  }
}
