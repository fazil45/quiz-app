import { IoManager } from "./managers/IoManager";

const PROBLEM_TIME_S = 20;

export type AllowedSubmission = 0 | 1 | 2 | 3;

interface Submission {
  problemId: string;
  userId: string;
  isCorrect: boolean;
  optionSelected: AllowedSubmission;
}

interface User {
  name: string;
  id: string;
  point: number;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  startTime: number;
  image: string;
  answer: AllowedSubmission;
  option: {
    id: number;
    title: string;
  }[];
  submission: Submission[];
}

export class Quiz {
  private hasStarted: boolean;
  private problems: Problem[];
  public roomId: string;
  private activeProblem: number;
  private users: User[];
  private activeState: "leaderboard" | "question" | "not_started" | "ended"

  constructor(roomId: string) {
    this.users = [];
    this.problems = [];
    this.hasStarted = false;
    this.roomId = roomId;
    this.activeProblem = 0;
    this.activeState = "not_started"
  }

  addProblem(problem: Problem) {
    this.problems.push(problem);
  }

  start() {
    this.hasStarted = true;
    const io = IoManager.getIo();
    this.setActiveProblem(this.problems[0]!);
  }

  setActiveProblem(problem: Problem) {
    problem.startTime = new Date().getTime();
    problem.submission = [];
    IoManager.getIo().emit("CHANGE_PROBLEM", {
      problem,
    });
    setTimeout(() => {
      this.sendLeaderboard();
    }, PROBLEM_TIME_S);
  }

  sendLeaderboard() {
    const leaderboard = this.getLeaderboard();
    IoManager.getIo().to(this.roomId).emit("leaderboard", {
      leaderboard,
    });
  }

  next() {
    this.activeProblem++;
    const problem = this.problems[this.activeProblem];
    const io = IoManager.getIo();
    if (problem) {
      this.setActiveProblem(problem)
    } else {
      // IoManager.getIo().emit("QUIZ_END", [problem]);
    }
  }

  generateRandomUserId(length: number) {
    const chars = "AABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()";
    const charLength = chars.length;
    let result = "";

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * charLength));
    }
    return result;
  }

  addUser(name: string) {
    const userId = this.generateRandomUserId(10);
    this.users.push({
      name: name,
      id: userId,
      point: 0,
    });
    return userId;
  }

  submit(
    roomId: string,
    problemId: string,
    userId: string,
    submission: AllowedSubmission,
  ) {
    const problem = this.problems.find((x) => x.id == problemId);
    const user = this.users.find((x) => x.id === userId);
    if (!problem || !user) {
      return;
    }
    const existingSubmission = problem.submission.find(
      (x) => x.userId === userId,
    );
    if (existingSubmission) {
      return;
    }
    problem.submission.push({
      problemId,
      userId,
      isCorrect: problem.answer === submission,
      optionSelected: submission,
    });
    user.point +=
      1000 -
      (500 * (new Date().getTime() - problem.startTime)) / PROBLEM_TIME_S;
  }

  getLeaderboard() {
    return this.users.sort((a, b) => (a.point < b.point ? 1 : -1)).splice(0,20);
  }

  getCurrentState(){
    if (this.activeState === "leaderboard") {
      return {
        type:"leaderboard",
        leaderboard: this.getLeaderboard()
      }
    }
    
    if(this.activeState === "question"){
      const problem = this.problems[this.activeProblem]
      return {
        type:"question",
        problem
      }
    }

    if (this.activeState === "ended") {
      return {
        type : "ended",
        leaderboard:this.getLeaderboard()
      }
    }

    if (this.activeState === "not_started") {
      return {
        type:"not_started",
      }
    }
  }
}
