import { Injectable, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Firestore, collectionData } from '@angular/fire/firestore';
import {
  CollectionReference,
  addDoc,
  collection,
  deleteDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import { Observable, filter, find, from } from 'rxjs';
import { QuestionTest } from '../models/question-test.model';

@Injectable({
  providedIn: 'root',
})
export class QuestionTestsService {
  firestore: Firestore = inject(Firestore);
  questionTestsCollection = collection(
    this.firestore,
    'question-tests'
  ) as CollectionReference<QuestionTest>;

  questionTests = collectionData(this.questionTestsCollection, {
    idField: 'id',
  });

  addQuestionTest(newQuestionTest: QuestionTest): Observable<any> {
    return from(addDoc(this.questionTestsCollection, { ...newQuestionTest }));
  }

  changeQuestionTest(
    chQuestionTest: QuestionTest
  ): Observable<any> {
    const docRef = doc(this.questionTestsCollection, chQuestionTest.id);
    return from(setDoc(docRef, chQuestionTest));
  }

  removeQuestionTest(remQuestionTest: QuestionTest): Observable<any> {
    const ref = doc(this.questionTestsCollection, remQuestionTest.id);
    return from(deleteDoc(ref));
  }

  getQuestionTest(id: string): any {
    return this.questionTests.pipe(
      filter((qt: any) => qt.id === id)
    );
  }
}
