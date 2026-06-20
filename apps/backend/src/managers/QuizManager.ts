import { AllowedSubmission, Quiz } from "../Quiz";
import { IoManager } from "./IoManager";

let globalProblemId = 0;

export class QuizManager {
  private quizes: Quiz[];

  constructor() {
    this.quizes = [];
  }

  public start(roomId: string) {
    const io = IoManager.getIo();
    const quiz = this.getQuiz(roomId);
    if (!quiz) {
      return;
    }
    quiz.start();
  }

  public addProblem(
    roomId: string,
    problem: {
      title: string;
      description: string;
      image: string;
      options: {
        id: number;
        title: string;
      }[];
      answer: AllowedSubmission;
    },
  ) {
    const quiz = this.getQuiz(roomId);
    if (!quiz) {
      return;
    }

    quiz.addProblem({
      ...problem,
      id: (globalProblemId++).toString(),
      startTime: new Date().getTime(),
      submission: [],
      option:problem.options
    });
  }

  public next(roomId: string) {
    const quiz = this.getQuiz(roomId)
    if(!quiz){
      return
    }
    quiz.next()
  }

  addUser(roomId: string, name: string) {
    return this.getQuiz(roomId)?.addUser(name);
  }

  submit(
    roomId: string,
    userId: string,
    problemId: string,
    submission: AllowedSubmission,
  ) {
    this.getQuiz(roomId)?.submit(roomId, problemId, userId, submission);
  }

  getQuiz(roomId: string) {
    return this.quizes.find((x) => x.roomId === roomId) ?? null;
  }

  getCurrentState(roomId: string): any {
    const quiz = this.quizes.find((x) => x.roomId === roomId);
    if (!quiz) {
      return null;
    }
    return quiz.getCurrentState();
  }

  addQuiz(roomId:string){
    const quiz = new Quiz(roomId)
    this.quizes.push(quiz)
  }
}
