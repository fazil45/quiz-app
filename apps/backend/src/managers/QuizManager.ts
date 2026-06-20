import { AllowedSubmission, Quiz } from "../Quiz";
import { IoManager } from "./IoManager";

export class QuizManager {
  private quizes: Quiz[];

  constructor() {
    this.quizes = [];
  }

  public start(roomId: string) {
    const io = IoManager.getIo();
    const quiz = this.quizes.find((x) => x.roomId === roomId);
    quiz?.start();
  }

  public next(roomId:string){
    const io = IoManager.getIo()
    io.to(roomId).emit({
      type:"START_ROOM"
    })
  }

  addUser(roomId:string,name:string){
    return this.getQuiz(roomId)?.addUser(name)
  }

  submit(roomId:string ,userId:string, problemId:string, submission: AllowedSubmission){
    this.getQuiz(roomId)?.submit(roomId, problemId,userId,submission)
  }

  getQuiz(roomId:string){
    return this.quizes.find(x => x.roomId === roomId) ?? null;
  }

}
