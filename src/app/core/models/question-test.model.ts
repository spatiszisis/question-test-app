import { Question } from "./question.model";

export interface QuestionTest {
    id?: string;
    title: string;
    questions: Question[];
}