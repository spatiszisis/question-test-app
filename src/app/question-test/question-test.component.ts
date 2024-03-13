import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Question } from '../core/models/question.model';
import { QuestionTestsService } from '../core/services/question-tests.service';
import { Answer } from '../core/models/answer.model';
import { core } from '@angular/compiler';

@Component({
  selector: 'app-question-test',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './question-test.component.html',
  styleUrl: './question-test.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionTestComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  questionTestService = inject(QuestionTestsService);

  checkAnswer = false;
  selectedQuestionIndex = 0;
  selectedAnswers: Answer[] = [];
  selectedQuestion: Question;
  finishedTest = false;
  score = 0;
  questionTest = computed(() => {
    const selectedQuestionTest = this.questionTestService.getQuestionTest(
      this.route.snapshot.params.id
    );

    if (selectedQuestionTest) {
      this.score = !!sessionStorage.getItem('score')
        ? parseInt(sessionStorage.getItem('score'))
        : 0;
      const questionIndexFromLocalStorage =
        this.getSelectedQuestionIndexFromLocalStorage();
      this.selectedQuestionIndex = !!questionIndexFromLocalStorage
        ? questionIndexFromLocalStorage
        : this.selectedQuestionIndex;
      this.selectedQuestion =
        selectedQuestionTest.questions[this.selectedQuestionIndex];
      this.setSelectedQuestionIndexTolocalStorage();
    }

    return selectedQuestionTest;
  });

  onNextQuestion() {
    this.setScoreOfPreviousQuestion();

    this.selectedQuestionIndex++;
    this.setSelectedQuestionIndexTolocalStorage();

    if (
      this.selectedQuestionIndex === this.questionTest().questions.length - 1 ||
      this.selectedQuestionIndex > this.questionTest().questions.length - 1
    ) {
      this.finishedTest = true;
      sessionStorage.removeItem('selectedQuestionIndex');
      return;
    }

    this.selectedQuestion = this.getSelectedQuestion();

    this.selectedAnswers = [];
    this.checkAnswer = false;
  }

  onCheckAnwser() {
    this.checkAnswer = true;
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

  onClearTest() {
    this.selectedAnswers = [];
    this.selectedQuestionIndex = 0;
    this.score = 0;
    this.finishedTest = false;
    this.setSelectedQuestionIndexTolocalStorage();
    sessionStorage.removeItem('score');
    sessionStorage.removeItem('selectedQuestionIndex');
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

  private setSelectedQuestionIndexTolocalStorage() {
    if (this.selectedQuestionIndex >= 0)
      sessionStorage.setItem(
        'selectedQuestionIndex',
        JSON.stringify(this.selectedQuestionIndex)
      );
  }

  private getSelectedQuestionIndexFromLocalStorage(): number {
    return parseInt(sessionStorage.getItem('selectedQuestionIndex'));
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
    }
  }

  private getSelectedQuestion(): Question {
    return this.questionTest().questions[this.selectedQuestionIndex];
  }
}
