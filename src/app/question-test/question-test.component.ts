import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Answer } from '../core/models/answer.model';
import { Question } from '../core/models/question.model';
import { QuestionTestsService } from '../core/services/question-tests.service';

@Component({
  selector: 'app-question-test',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './question-test.component.html',
  styleUrl: './question-test.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionTestComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  questionTestsService = inject(QuestionTestsService);

  checkAnswer = false;
  selectedQuestionIndex = 0;
  selectedAnswers: Answer[] = [];
  selectedQuestion: Question;
  finishedTest = false;
  score = 0;
  wrongQuestions: Question[] = [];
  showWrongQuestions = false;
  selectedQuestionTest: any;
  stopLoading = signal(true);

  ngOnInit(): void {
    this.questionTestsService.questionTests.subscribe((data: any) => {
      this.selectedQuestionTest = data.find(
        (qt) => qt.id === this.route.snapshot.params.id
      );

      if (this.selectedQuestionTest) {
        // Check if there are any previous data in the session storage
        this.getDataFromLocalStorage();

        this.selectedQuestion = this.selectedQuestionTest.questions[this.selectedQuestionIndex];
        this.setSelectedQuestionIndexTolocalStorage();
      }
      this.stopLoading.set(false);
    });
  }

  onNextQuestion() {
    this.setScoreOfPreviousQuestion();

    this.selectedQuestionIndex++;
    this.setSelectedQuestionIndexTolocalStorage();

    if (
      this.selectedQuestionIndex ===
        this.selectedQuestionTest.questions.length ||
      this.selectedQuestionIndex > this.selectedQuestionTest.questions.length
    ) {
      this.finishedTest = true;
      sessionStorage.removeItem('selectedQuestionIndex');
      return;
    }

    this.selectedQuestion = this.getSelectedQuestion();

    this.selectedAnswers = [];
    this.checkAnswer = false;
  }

  onSelectAnswer(answer: Answer) {
    if (
      this.selectedAnswers?.find(
        (selAnswer) => selAnswer.answer === answer.answer
      )
    ) {
      const selQuestionIndex = this.selectedAnswers.findIndex(
        (selAnswer) => selAnswer.answer === answer.answer
      );
      this.selectedAnswers.splice(selQuestionIndex, 1);
    } else {
      this.selectedAnswers.push(answer);
    }
  }

  answerIncludedToSelectedAnswers(answer: Answer): boolean {
    return !!this.selectedAnswers?.find(
      (selAnswer) => selAnswer.answer === answer.answer
    );
  }

  onRestartTest() {
    this.onClearTest();
    window.location.reload();
  }

  onRestartWrongQuestions() {
    this.selectedQuestionTest.questions = sessionStorage.getItem(
      'wrongQuestions'
    )
      ? JSON.parse(sessionStorage.getItem('wrongQuestions'))
      : [];
    this.onClearTest();
    this.selectedQuestion = this.getSelectedQuestion();
  }

  onGoToIntro() {
    this.onClearTest();
    this.selectedQuestionTest = undefined;
    this.router.navigate(['/']);
  }

  private onClearTest() {
    this.selectedAnswers = [];
    this.wrongQuestions = [];
    this.score = 0;
    this.finishedTest = false;
    this.selectedQuestion = undefined;
    this.selectedQuestionIndex = 0;
    this.setSelectedQuestionIndexTolocalStorage();
    this.showWrongQuestions = false;
    this.checkAnswer = false;
    sessionStorage.removeItem('score');
    sessionStorage.removeItem('selectedQuestionIndex');
    sessionStorage.removeItem('wrongQuestions');
  }

  private setSelectedQuestionIndexTolocalStorage() {
    if (this.selectedQuestionIndex >= 0)
      sessionStorage.setItem(
        'selectedQuestionIndex',
        JSON.stringify(this.selectedQuestionIndex)
      );
  }

  private setScoreOfPreviousQuestion() {
    const previousQuestion = this.getSelectedQuestion();
    const correctAnswers = previousQuestion.answers.filter(
      (answer) => answer.isCorrect
    );
    const correctSelectedAnswers = this.selectedAnswers.filter((answer) =>
      correctAnswers.find(
        (correctAnswer) => correctAnswer.answer === answer.answer
      )
    );
    if (correctSelectedAnswers.length === correctAnswers.length) {
      this.score++;
      sessionStorage.setItem('score', JSON.stringify(this.score));
    } else {
      this.wrongQuestions.push(previousQuestion);
      sessionStorage.setItem(
        'wrongQuestions',
        JSON.stringify(this.wrongQuestions)
      );
    }
  }

  private getSelectedQuestion(): Question {
    return this.selectedQuestionTest.questions[this.selectedQuestionIndex];
  }

  private getDataFromLocalStorage() {
    const score = sessionStorage.getItem('score');
    const wrongQuestions = sessionStorage.getItem('wrongQuestions');
    const selectedQuestionIndex = sessionStorage.getItem(
      'selectedQuestionIndex'
    );

    this.score = !!score ? parseInt(score) : 0;
    this.wrongQuestions = !!wrongQuestions ? JSON.parse(wrongQuestions) : [];
    this.selectedQuestionIndex = !!selectedQuestionIndex
      ? parseInt(selectedQuestionIndex)
      : this.selectedQuestionIndex;
  }
}
