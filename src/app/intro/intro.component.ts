import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  router = inject(Router);
  selectedQuestionTestId: any;

  questionTests = computed(() => this.questionTestService.questionTests());

  setQuestionTest(id: number | string) {
    if (id !== 'undefined') {
      this.selectedQuestionTestId = id;
    } else {
      this.selectedQuestionTestId = undefined;
    }
  }

  startTest() {
    if (this.selectedQuestionTestId) {
      this.router.navigateByUrl(
        `/question-test/${this.selectedQuestionTestId}`
      );
    }
  }

  createOrEditQuestionTest() {
    if (this.selectedQuestionTestId) {
      this.router.navigateByUrl(
        `/edit-question-test/${this.selectedQuestionTestId}`
      );
    } else {
      this.router.navigateByUrl('/add-question-test');
    }
  }
}
