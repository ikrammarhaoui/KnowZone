import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap } from 'rxjs';
import { Quiz, User, Score } from '../models/quiz.model';

interface AppData {
  quizzes: Quiz[];
  users: User[];
  scores: Score[];
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private dataSubject = new BehaviorSubject<AppData | null>(null);
  data$ = this.dataSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadData();
  }

  private loadData() {
    // Load from localStorage (persisted) or fallback to JSON
    const saved = localStorage.getItem('quizAppData');
    if (saved) {
      this.dataSubject.next(JSON.parse(saved));
    } else {
      this.http.get<AppData>('/assets/data.json').subscribe(data => {
        this.dataSubject.next(data);
        this.saveData(data);
      });
    }
  }

  private saveData(data: AppData) {
    localStorage.setItem('quizAppData', JSON.stringify(data));
  }

  get data(): AppData | null {
    return this.dataSubject.value;
  }

  getQuizzes(): Quiz[] {
    return this.data?.quizzes || [];
  }

  getPublishedQuizzes(): Quiz[] {
    return this.getQuizzes().filter(q => q.published);
  }

  getQuizById(id: number): Quiz | undefined {
    return this.getQuizzes().find(q => q.id === id);
  }

  getUsers(): User[] {
    return this.data?.users || [];
  }

  getUserById(id: number): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email === email);
  }

  getScores(): Score[] {
    return this.data?.scores || [];
  }

  getTopScores(limit: number = 10): Score[] {
    return [...this.getScores()]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  getScoresByQuiz(quizId: number): Score[] {
    return this.getScores()
      .filter(s => s.quizId === quizId)
      .sort((a, b) => b.score - a.score);
  }

  getUserScores(userId: number): Score[] {
    return this.getScores().filter(s => s.userId === userId);
  }

  addScore(score: Score) {
    const data = this.data!;
    score.id = Math.max(...data.scores.map(s => s.id), 0) + 1;
    const updated = { ...data, scores: [...data.scores, score] };
    this.dataSubject.next(updated);
    this.saveData(updated);
  }

  addQuiz(quiz: Quiz) {
    const data = this.data!;
    quiz.id = Math.max(...data.quizzes.map(q => q.id), 0) + 1;
    const updated = { ...data, quizzes: [...data.quizzes, quiz] };
    this.dataSubject.next(updated);
    this.saveData(updated);
    return quiz;
  }

  updateQuiz(quiz: Quiz) {
    const data = this.data!;
    const quizzes = data.quizzes.map(q => q.id === quiz.id ? quiz : q);
    const updated = { ...data, quizzes };
    this.dataSubject.next(updated);
    this.saveData(updated);
  }

  deleteQuiz(id: number) {
    const data = this.data!;
    const quizzes = data.quizzes.filter(q => q.id !== id);
    const updated = { ...data, quizzes };
    this.dataSubject.next(updated);
    this.saveData(updated);
  }

  addUser(user: User) {
    const data = this.data!;
    user.id = Math.max(...data.users.map(u => u.id), 0) + 1;
    const updated = { ...data, users: [...data.users, user] };
    this.dataSubject.next(updated);
    this.saveData(updated);
    return user;
  }

  updateUser(user: User) {
    const data = this.data!;
    const users = data.users.map(u => u.id === user.id ? user : u);
    const updated = { ...data, users };
    this.dataSubject.next(updated);
    this.saveData(updated);
  }

  deleteUser(id: number) {
    const data = this.data!;
    const users = data.users.filter(u => u.id !== id);
    const updated = { ...data, users };
    this.dataSubject.next(updated);
    this.saveData(updated);
  }

  resetData() {
    localStorage.removeItem('quizAppData');
    this.http.get<AppData>('/assets/data.json').subscribe(data => {
      this.dataSubject.next(data);
      this.saveData(data);
    });
  }

  getStats() {
    const scores = this.getScores();
    const quizzes = this.getQuizzes();
    const users = this.getUsers().filter(u => u.role !== 'admin');
    return {
      totalUsers: users.length,
      totalQuizzes: quizzes.length,
      totalPlays: scores.length,
      avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length) : 0,
      bestScore: scores.length ? Math.max(...scores.map(s => s.score)) : 0
    };
  }
}
