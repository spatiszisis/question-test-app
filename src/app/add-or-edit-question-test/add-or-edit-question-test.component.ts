import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytes,
} from '@angular/fire/storage';
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
import { Flowbite } from '../core/flowbite';
import { QuestionTest } from '../core/models/question-test.model';
import { PopupService } from '../core/services/popup.service';
import { QuestionTestsService } from '../core/services/question-tests.service';
import { UploadFileComponent } from './upload-file/upload-file.component';
import { saveAs } from 'file-saver';
import { ImageModalComponent } from './image-modal/image-modal.component';
import { ModalService } from '../core/models/modal.service';

@Component({
  selector: 'app-add-or-edit-question-test',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    UploadFileComponent,
    RouterLink,
    ImageModalComponent,
  ],
  templateUrl: './add-or-edit-question-test.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@Flowbite()
export class AddQuestionTestComponent {
  formBuilder = inject(FormBuilder);
  questionTestsService = inject(QuestionTestsService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  popupService = inject(PopupService);
  storage = inject(Storage);
  ref = inject(ChangeDetectorRef);
  modalService = inject(ModalService);

  questionTestForm: FormGroup;
  closeAccordion = true;
  importedFiled: any;
  uploadedFile: any;
  subscription: Subscription;
  existingQuestionTest: QuestionTest;
  loadingUpdateOrAdd = signal(false);
  loadingDelete = signal(false);
  loading = signal(true);
  uploading = signal(false);
  uploadedSrcImages: string[] = [];
  uploadedImages: File[] = [];
  selectedImageToShow: string;
  uploadedSrcURLs: string[] = [];
  selectedQuestionIndex: number;

  constructor() {
    this.questionTestsService.questionTests.subscribe((data: any) => {
      this.existingQuestionTest = data.find(
        (qt) => qt.id === this.route.snapshot.params.id
      );

      // const listRef = ref(this.storage, 'questionImages');

      this.buildForm();

      if (this.existingQuestionTest) {
        this.scrollToBottom();
      }
      this.loading.set(false);
    });
  }

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
    this.scrollToBottom();
  }

  removeAnswer(questionIndex: number, answerIndex: number) {
    this.answersArray(questionIndex).removeAt(answerIndex);
  }

  onSubmit() {
    this.loadingUpdateOrAdd.set(true);
    if (!this.questionTestForm.valid) {
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

    // this.uploadedImages.forEach((image) => {
    //   this.uploadFile(image);
    // });

    this.subscription = this.questionTestsService
      .addQuestionTest(this.questionTestForm.value)
      .subscribe({
        complete: () => this.onComplete(),
        error: (err) => this.onError(err),
      });
  }

  // async uploadFile(image: File) {
  //   this.uploading.set(true);
  //   const storageRef = ref(this.storage, 'questionImages/' + image.name);
  //   const uploadTask = await uploadBytes(storageRef, image);
  //   const downloadUrl = await getDownloadURL(uploadTask.ref);
  //   this.uploadedSrcURLs.push(downloadUrl);
  //   console.log(this.uploadedSrcURLs);
  //   this.uploading.set(false);
  // }

  questionsArray() {
    return this.questionTestForm.get('questions') as FormArray;
  }

  questionImages(questionIndex: number) {
    return this.questionsArray()?.controls[questionIndex]?.get(
      'images'
    ) as FormArray;
  }

  answersArray(questionIndex: number) {
    return this.questionsArray().controls[questionIndex].get(
      'answers'
    ) as FormArray;
  }

  onFilesUploaded(file: any) {
    this.uploadedFile = file;
    this.existingQuestionTest = file;
    this.buildForm();
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

  chooseFile(event: any, index: number) {
    if (event.target.files.length === 0) {
      return;
    }

    if (event.target.files && event.target.files.length > 0) {
      Object.values(event.target.files).forEach((image: File, i) => {
        this.uploadedSrcImages.push(URL.createObjectURL(image));
        this.uploadedImages.push(image);
        this.questionsArray().at(index).get('images');
      });
    }
  }

  removeUploadedImage(index: number) {
    this.uploadedSrcImages.splice(index, 1);
    this.uploadedImages.splice(index, 1);
  }

  exportToJson() {
    let exportData = this.existingQuestionTest;
    return saveAs(
      new Blob([JSON.stringify(exportData, null, 2)], { type: 'JSON' }),
      'sample.json'
    );
  }

  selectedQuestion(questionIndex: number) {
    this.selectedQuestionIndex = questionIndex;
    this.modalService.openModal(
      document.getElementById('image-modal' + this.selectedQuestionIndex)
    );
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
    this.popupService.setDeletePopup(onDelete);
    this.router.navigate(['/intro']);
  }

  private onError(err: any) {
    this.popupService.setPopupContext(err);
  }

  private getQuestionList(): FormGroup {
    return new FormGroup({
      question: new FormControl(''),
      images: new FormArray([]),
      answers: new FormArray([]),
    });
  }

  private getAnswersList(): FormGroup {
    return new FormGroup({
      answer: new FormControl(['']),
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
          images: question.images?.length
            ? new FormArray(
                question.images.map((image) => new FormControl(image))
              )
            : new FormArray([]),
          answers,
        })
      );
    });
    return formArray;
  }

  private scrollToBottom() {
    // setTimeout(() => {
    //   const wordsHeight = document.getElementById('questionsList');
    //   if (wordsHeight != null) {
    //     wordsHeight.scrollTop = wordsHeight.scrollHeight;
    //   }
    // }, 50);
  }

  private buildForm() {
    this.questionTestForm = this.formBuilder.group({
      title: [this.existingQuestionTest ? this.existingQuestionTest.title : ''],
      questions: this.existingQuestionTest
        ? this.setExistingQuestionTest()
        : new FormArray([]),
    });
  }
}
