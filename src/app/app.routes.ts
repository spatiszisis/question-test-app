import { Routes } from '@angular/router';
import { IntroComponent } from './intro/intro.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AddQuestionTestComponent } from './add-or-edit-question-test/add-or-edit-question-test.component';
import { QuestionTestComponent } from './question-test/question-test.component';

export const routes: Routes = [
  { path: '', redirectTo: 'intro', pathMatch: 'full' },
  { path: 'intro', component: IntroComponent },
  { path: 'add-question-test', component: AddQuestionTestComponent },
  { path: 'edit-question-test/:id', component: AddQuestionTestComponent },
  { path: 'question-test/:id', component: QuestionTestComponent },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' },
];
