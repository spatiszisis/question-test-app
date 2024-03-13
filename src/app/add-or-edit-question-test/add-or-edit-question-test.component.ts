import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, noop } from 'rxjs';
import { AsyncButtonDirective } from '../core/async-button.directive';
import { QuestionTest } from '../core/models/question-test.model';
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
    AsyncButtonDirective,
    RouterLink,
  ],
  templateUrl: './add-or-edit-question-test.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddQuestionTestComponent {
  formBuilder = inject(FormBuilder);
  questionTestsService = inject(QuestionTestsService);
  route = inject(ActivatedRoute);

  questionTestForm: FormGroup;
  closeAccordion = true;
  importedFiled: any;
  uploadedFiles: any[] = [];
  submitSubscription: Subscription;
  existingQuestionTest: QuestionTest;
  questionTests = computed(() => {
    const questionTests = this.questionTestsService.questionTests();
    this.existingQuestionTest = this.questionTestsService.getQuestionTest(
      this.route.snapshot.params.id
    );

    this.questionTestForm = this.formBuilder.group({
      title: [this.existingQuestionTest ? this.existingQuestionTest.title : ''],
      questions: this.existingQuestionTest
        ? this.setExistingQuestionTest()
        : new FormArray([]),
    });
    return questionTests;
  });

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
    if (!this.questionTestForm.valid && this.uploadedFiles.length === 0) {
      return;
    }

    if (this.uploadedFiles.length > 0) {
      this.uploadedFiles.forEach((file) => {
        this.submitSubscription = this.questionTestsService
          .addQuestionTest(file)
          .subscribe({
            next: () => {},
            error: noop,
          });
      });
      return;
    }

    this.submitSubscription = this.questionTestsService
      .addQuestionTest(this.questionTestForm.value)
      .subscribe({
        next: () => {},
        error: noop,
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
}
