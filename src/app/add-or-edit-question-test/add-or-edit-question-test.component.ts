import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { QuestionTest } from '../core/models/question-test.model';
import { PopupService } from '../core/services/popup.service';
import { QuestionTestsService } from '../core/services/question-tests.service';
import { UploadFileComponent } from './upload-file/upload-file.component';

@Component({
  selector: 'app-add-or-edit-question-test',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    UploadFileComponent,
    RouterLink,
  ],
  templateUrl: './add-or-edit-question-test.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddQuestionTestComponent implements OnInit {
  formBuilder = inject(FormBuilder);
  questionTestsService = inject(QuestionTestsService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  popupService = inject(PopupService);

  questionTestForm: FormGroup;
  closeAccordion = true;
  importedFiled: any;
  uploadedFiles: any[] = [];
  subscription: Subscription;
  existingQuestionTest: QuestionTest;
  loadingUpdateOrAdd = signal(false);
  loadingDelete = signal(false);
  loading = signal(true);

  constructor() {
    this.questionTestsService.questionTests.subscribe((data: any) => {
      this.existingQuestionTest = data.find(
        (qt) => qt.id === this.route.snapshot.params.id
      );

      this.questionTestForm = this.formBuilder.group({
        title: [
          this.existingQuestionTest ? this.existingQuestionTest.title : '',
        ],
        questions: this.existingQuestionTest
          ? this.setExistingQuestionTest()
          : new FormArray([]),
      });

      if (this.existingQuestionTest) {
        this.scrollToBottom();
      }
      this.loading.set(false);
    });
  }

  ngOnInit(): void {}

  addQuestion() {
    const questionIndex = this.questionsArray().length;
    this.questionsArray().push(this.getQuestionList());
    setTimeout(() => {
      document
        .getElementById(`question${questionIndex}`)
        .setAttribute('open', 'true');
      if (questionIndex > 0)
        document
          .getElementById(`question${questionIndex - 1}`)
          .removeAttribute('open');
    }, 10);
    this.scrollToBottom();
  }

  removeQuestion(questionIndex: number) {
    this.questionsArray().removeAt(questionIndex);
  }

  addAnswer(questionIndex: number) {
    this.answersArray(questionIndex).push(this.getAnswersList());
  }

  removeAnswer(questionIndex: number, answerIndex: number) {
    this.answersArray(questionIndex).removeAt(answerIndex);
  }

  onSubmit() {
    this.loadingUpdateOrAdd.set(true);
    if (!this.questionTestForm.valid && this.uploadedFiles.length === 0) {
      return;
    }

    if (this.route.snapshot.params.id) {
      this.subscription = this.questionTestsService
        .changeQuestionTest({
          id: this.route.snapshot.params.id,
          ...this.questionTestForm.value,
        })
        .subscribe({
          complete: () => this.onComplete(),
          error: (err) => this.onError(err),
        });
      return;
    }

    if (this.uploadedFiles.length > 0) {
      this.uploadedFiles.forEach((file) => {
        this.subscription = this.questionTestsService
          .addQuestionTest(file)
          .subscribe({
            complete: () => this.onComplete(),
            error: (err) => this.onError(err),
          });
      });
      return;
    }

    this.subscription = this.questionTestsService
      .addQuestionTest(this.questionTestForm.value)
      .subscribe({
        complete: () => this.onComplete(),
        error: (err) => this.onError(err),
      });
  }

  questionsArray() {
    return this.questionTestForm.get('questions') as FormArray;
  }

  answersArray(questionIndex: number) {
    return this.questionsArray().controls[questionIndex].get(
      'answers'
    ) as FormArray;
  }

  onFilesUploaded(file: any) {
    this.uploadedFiles.push(file);
  }

  onDelete() {
    this.loadingDelete.set(true);
    this.subscription = this.questionTestsService
      .removeQuestionTest(this.existingQuestionTest)
      .subscribe({
        complete: () => this.onComplete(true),
        error: (err) => this.onError(err),
      });
  }

  private onComplete(onDelete?: boolean) {
    this.questionTestForm.reset();
    this.loadingUpdateOrAdd.set(false);
    this.loadingDelete.set(false);
    this.popupService.setShownPopup(true);
    this.popupService.setPopupContext(
      onDelete
        ? 'The question test has been deleted'
        : 'The question test has been saved.'
    );
    this.router.navigate(['/intro']);
  }

  private onError(err: any) {
    this.popupService.setPopupContext(err);
  }

  private getQuestionList(): FormGroup {
    return new FormGroup({
      question: new FormControl(''),
      answers: new FormArray([]),
    });
  }

  private getAnswersList(): FormGroup {
    return new FormGroup({
      answer: new FormControl(''),
      isCorrect: new FormControl(false),
    });
  }

  private setExistingQuestionTest() {
    const formArray = new FormArray([]);
    this.existingQuestionTest.questions.forEach((question) => {
      const answers = new FormArray([]);
      question.answers.forEach((answer) => {
        answers.push(
          new FormGroup({
            answer: new FormControl(answer.answer),
            isCorrect: new FormControl(answer.isCorrect),
          })
        );
      });
      formArray.push(
        new FormGroup({
          question: new FormControl(question.question),
          answers,
        })
      );
    });
    return formArray;
  }

  private scrollToBottom() {
    setTimeout(() => {
      const wordsHeight = document.getElementById('questionsList');
      if (wordsHeight != null) {
        wordsHeight.scrollTop = wordsHeight.scrollHeight;
      }
    }, 50);
  }
}
