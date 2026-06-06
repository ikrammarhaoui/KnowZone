import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Quiz, Question, Score } from '../../models/quiz.model';

interface AnswerState {
  selected: number[];
  validated: boolean;
  correct: boolean;
}

@Component({
  selector: 'app-quiz-play',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- LOADING -->
    <div class="loading-screen" *ngIf="!quiz">
      <div class="spinner"></div>
    </div>

    <!-- QUIZ -->
    <div class="quiz-play" *ngIf="quiz && !finished">
      <!-- Header bar -->
      <div class="quiz-header-bar">
        <div class="quiz-title-bar">
          <span class="quiz-name">{{ quiz.title }}</span>
        </div>
        <div class="progress-section">
          <span class="q-counter">{{ currentIndex + 1 }} / {{ quiz.questions.length }}</span>
          <div class="progress-bar">
            <div class="progress-fill" [style.width]="progressPct + '%'"></div>
          </div>
        </div>
        <div class="timer-section" [class.warning]="timeLeft <= 30" [class.danger]="timeLeft <= 10">
          <svg class="timer-ring" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(232,167,181,0.3)" stroke-width="5"/>
            <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" stroke-width="5"
              stroke-dasharray="213.5" [style.stroke-dashoffset]="timerOffset"
              stroke-linecap="round" transform="rotate(-90 40 40)"/>
          </svg>
          <div class="timer-text">
            <strong>{{ formatTime(timeLeft) }}</strong>
          </div>
        </div>
      </div>

      <!-- Question area -->
      <div class="question-area" *ngIf="currentQuestion">
        <div class="question-card" [class.validated]="answerState.validated">
          <!-- Type badge -->
          <div class="q-type-badge">
            <span *ngIf="currentQuestion.type === 'qcm'">QCM — 1 réponse</span>
            <span *ngIf="currentQuestion.type === 'multiple'">Choix multiple — plusieurs réponses</span>
            <span *ngIf="currentQuestion.type === 'vf'">Vrai ou Faux</span>
          </div>

          <h2 class="q-text">{{ currentQuestion.question }}</h2>

          <!-- Options -->
          <div class="options-grid">
            <button
              *ngFor="let opt of currentQuestion.options; let i = index"
              class="option-btn"
              [class.selected]="answerState.selected.includes(i)"
              [class.correct-answer]="answerState.validated && currentQuestion.correct.includes(i)"
              [class.wrong-answer]="answerState.validated && answerState.selected.includes(i) && !currentQuestion.correct.includes(i)"
              [class.disabled]="answerState.validated"
              (click)="selectOption(i)"
              [disabled]="answerState.validated"
            >
              <span class="opt-letter">{{ letters[i] }}</span>
              <span class="opt-text">{{ opt }}</span>
              <span class="opt-icon" *ngIf="answerState.validated">
                {{ currentQuestion.correct.includes(i) ? '✓' : answerState.selected.includes(i) ? '✗' : '' }}
              </span>
            </button>
          </div>

          <!-- Explanation -->
          <div class="explanation" *ngIf="answerState.validated">
            <div class="expl-header">
              <span *ngIf="answerState.correct">Bonne réponse !</span>
              <span *ngIf="!answerState.correct">Pas tout à fait...</span>
            </div>
            <p>{{ currentQuestion.explanation }}</p>
          </div>

          <!-- Warning -->
          <div class="warning-msg" *ngIf="showWarning">
            Veuillez sélectionner au moins une réponse
          </div>
        </div>

        <!-- Actions -->
        <div class="quiz-actions">
          <button class="btn btn-primary btn-lg" (click)="validate()" *ngIf="!answerState.validated">
            Valider
          </button>
          <button class="btn btn-primary btn-lg" (click)="next()" *ngIf="answerState.validated">
            {{ isLast ? 'Voir les résultats' : 'Question suivante' }}
          </button>
        </div>

        <!-- Score live -->
        <div class="live-score">
          Score actuel : <strong>{{ currentScore }} pts</strong>
          · {{ correctCount }} / {{ currentIndex + (answerState.validated ? 1 : 0) }} correctes
        </div>
      </div>
    </div>

    <!-- RESULTS PREVIEW -->
    <div class="results-screen" *ngIf="finished">
      <div class="results-card">
        <div class="results-status">
          {{ scoreStatus }}
        </div>
        <h2>Quiz terminé !</h2>
        <div class="final-score">{{ finalScore }}</div>
        <p class="score-label">points</p>
        <div class="score-breakdown">
          <div>{{ correctCount }} / {{ quiz!.questions.length }} correctes</div>
          <div>Temps : {{ formatTime(timeUsed) }}</div>
        </div>
        <div class="score-bar-wrap">
          <div class="score-bar" [style.width]="scorePercent + '%'"
            [style.background]="scorePercent >= 80 ? 'var(--olive-mist)' : scorePercent >= 60 ? 'var(--berry-velvet)' : 'var(--rose-cloud)'">
          </div>
        </div>
        <p class="score-message">{{ scoreMessage }}</p>
        <div class="result-btns">
          <button class="btn btn-primary btn-lg" (click)="goResults()">Voir le détail</button>
          <button class="btn btn-secondary" (click)="goHome()">Retour à l'accueil</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-screen {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
    }
    .quiz-play {
      min-height: 100vh; background: linear-gradient(160deg, var(--vanilla-glow) 0%, white 50%);
      padding-bottom: 40px;
    }

    /* Header bar */
    .quiz-header-bar {
      position: sticky; top: 72px; z-index: 50;
      background: white;
      border-bottom: 1px solid rgba(232,167,181,0.3);
      padding: 14px 32px;
      display: flex; align-items: center; gap: 32px;
      box-shadow: 0 2px 12px rgba(178,58,93,0.08);
    }
    .quiz-title-bar {
      display: flex; align-items: center; gap: 10px;
      min-width: 0; flex-shrink: 0;
    }
    .quiz-icon { font-size: 1.4rem; }
    .quiz-name {
      font-weight: 600; font-size: 0.95rem; color: var(--text-dark);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;
    }
    .progress-section { flex: 1; display: flex; align-items: center; gap: 12px; }
    .q-counter { font-size: 0.85rem; font-weight: 600; color: var(--text-mid); flex-shrink: 0; }
    .progress-bar {
      flex: 1; height: 8px; background: var(--vanilla-glow); border-radius: 4px; overflow: hidden;
    }
    .progress-fill {
      height: 100%; background: var(--berry-velvet);
      border-radius: 4px; transition: width 0.4s ease;
    }

    .timer-section {
      position: relative; width: 60px; height: 60px; flex-shrink: 0;
      color: var(--olive-mist); transition: color 0.3s;
    }
    .timer-section.warning { color: #d4840a; }
    .timer-section.danger { color: var(--berry-velvet); animation: pulse 0.5s infinite; }
    .timer-ring { width: 100%; height: 100%; }
    .timer-text {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .timer-text strong { font-size: 0.85rem; font-weight: 700; color: inherit; }

    /* Question area */
    .question-area {
      max-width: 760px; margin: 40px auto; padding: 0 24px;
      display: flex; flex-direction: column; gap: 20px;
    }
    .question-card {
      background: white; border-radius: var(--r-xl);
      padding: 36px; border: 1.5px solid rgba(232,167,181,0.2);
      box-shadow: 0 4px 24px var(--shadow);
      transition: var(--transition);
    }
    .question-card.validated { box-shadow: 0 4px 32px var(--shadow-deep); }

    .q-type-badge {
      display: inline-flex; margin-bottom: 20px;
      background: var(--vanilla-glow); padding: 5px 14px;
      border-radius: var(--r-full); font-size: 0.82rem; font-weight: 600;
      color: var(--text-mid);
    }
    .q-text {
      font-size: 1.2rem; font-weight: 600; color: var(--text-dark);
      line-height: 1.5; margin-bottom: 28px;
    }

    .options-grid { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
    .option-btn {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 18px; border: 2px solid var(--vanilla-glow);
      border-radius: var(--r-md); background: white;
      cursor: pointer; transition: var(--transition);
      text-align: left; width: 100%;
      font-family: var(--font-body); font-size: 0.95rem; color: var(--text-dark);
    }
    .option-btn:hover:not(.disabled) {
      border-color: var(--rose-cloud); background: rgba(248,198,160,0.1);
      transform: translateX(4px);
    }
    .option-btn.selected {
      border-color: var(--berry-velvet); background: rgba(178,58,93,0.06);
    }
    .option-btn.correct-answer {
      border-color: var(--olive-mist); background: rgba(157,170,119,0.12);
      color: #2d4a0a;
    }
    .option-btn.wrong-answer {
      border-color: var(--berry-velvet); background: rgba(178,58,93,0.08);
    }
    .option-btn.disabled { cursor: default; transform: none !important; }

    .opt-letter {
      width: 28px; height: 28px; border-radius: 50%;
      background: var(--vanilla-glow); display: flex; align-items: center; justify-content: center;
      font-size: 0.78rem; font-weight: 700; color: var(--text-mid);
      flex-shrink: 0;
    }
    .option-btn.selected .opt-letter { background: var(--berry-velvet); color: white; }
    .option-btn.correct-answer .opt-letter { background: var(--olive-mist); color: white; }
    .opt-text { flex: 1; }
    .opt-icon { font-size: 1rem; margin-left: auto; font-weight: 700; }

    .explanation {
      margin-top: 20px; padding: 16px 20px;
      background: var(--vanilla-glow); border-radius: var(--r-md);
      border-left: 4px solid var(--berry-velvet);
      animation: fadeInUp 0.3s ease;
    }
    .expl-header { font-weight: 700; color: var(--text-dark); margin-bottom: 6px; font-size: 0.95rem; }
    .explanation p { font-size: 0.9rem; color: var(--text-mid); line-height: 1.6; }

    .warning-msg {
      margin-top: 12px; padding: 10px 16px;
      background: rgba(178,58,93,0.08); border-radius: var(--r-md);
      color: var(--berry-velvet); font-size: 0.88rem; font-weight: 500;
      animation: fadeIn 0.2s;
    }

    .quiz-actions { display: flex; justify-content: center; }
    .live-score { text-align: center; font-size: 0.85rem; color: var(--text-light); }
    .live-score strong { color: var(--berry-velvet); font-size: 1rem; }

    /* Results */
    .results-screen {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(160deg, var(--vanilla-glow) 0%, white 60%);
      padding: 40px 24px;
    }
    .results-card {
      background: white; border-radius: var(--r-xl);
      padding: 48px; text-align: center; max-width: 480px; width: 100%;
      box-shadow: 0 20px 60px var(--shadow-deep);
      border: 1.5px solid rgba(232,167,181,0.3);
      animation: bounceIn 0.5s ease;
    }
    .results-emoji { font-size: 4rem; margin-bottom: 16px; }
    .results-card h2 { margin-bottom: 20px; }
    .final-score { font-size: 4rem; font-weight: 900; color: var(--berry-velvet); line-height: 1; }
    .score-label { color: var(--text-light); margin-bottom: 20px; }
    .score-breakdown {
      display: flex; gap: 20px; justify-content: center;
      font-size: 0.9rem; color: var(--text-mid); margin-bottom: 20px;
    }
    .score-bar-wrap {
      height: 10px; background: var(--vanilla-glow); border-radius: 5px;
      margin-bottom: 12px; overflow: hidden;
    }
    .score-bar { height: 100%; border-radius: 5px; transition: width 1s ease; }
    .score-message { color: var(--text-mid); font-size: 0.9rem; margin-bottom: 28px; }
    .result-btns { display: flex; flex-direction: column; gap: 12px; }

    @media (max-width: 640px) {
      .quiz-header-bar { padding: 12px 16px; gap: 16px; }
      .quiz-name { max-width: 120px; }
      .question-card { padding: 24px; }
    }
  `]
})
export class QuizPlayComponent implements OnInit, OnDestroy {
  quiz?: Quiz;
  currentIndex = 0;
  timeLeft = 0;
  totalTime = 0;
  timeUsed = 0;
  timer?: ReturnType<typeof setInterval>;
  finished = false;
  correctCount = 0;
  currentScore = 0;
  finalScore = 0;
  showWarning = false;
  letters = ['A', 'B', 'C', 'D', 'E'];

  answerState: AnswerState = { selected: [], validated: false, correct: false };

  get currentQuestion(): Question | undefined {
    return this.quiz?.questions[this.currentIndex];
  }
  get isLast(): boolean {
    return this.currentIndex === (this.quiz?.questions.length || 1) - 1;
  }
  get progressPct(): number {
    return ((this.currentIndex + (this.answerState.validated ? 1 : 0)) / (this.quiz?.questions.length || 1)) * 100;
  }
  get timerOffset(): number {
    const circumference = 213.5;
    return (1 - this.timeLeft / this.totalTime) * circumference;
  }
  get scorePercent(): number {
    return Math.round((this.correctCount / (this.quiz?.questions.length || 1)) * 100);
  }
  get scoreMessage(): string {
    if (this.scorePercent >= 80) return 'Excellent ! Vous maîtrisez ce sujet.';
    if (this.scorePercent >= 60) return 'Bien joué ! Quelques révisions s\'imposent.';
    if (this.scorePercent >= 40) return 'Continuez à pratiquer, vous progressez !';
    return 'Ne vous découragez pas, réessayez !';
  }

  get scoreStatus(): string {
    if (this.scorePercent >= 80) return 'Très bon score';
    if (this.scorePercent >= 60) return 'Bon score';
    if (this.scorePercent >= 40) return 'Score moyen';
    return 'Besoin d\'amélioration';
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.quiz = this.dataService.getQuizById(id);
    if (!this.quiz) { this.router.navigate(['/quizzes']); return; }
    this.totalTime = this.quiz.duration * 60;
    this.timeLeft = this.totalTime;
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.endQuiz();
      }
    }, 1000);
  }

  selectOption(i: number) {
    if (this.answerState.validated) return;
    const q = this.currentQuestion!;
    if (q.type === 'qcm' || q.type === 'vf') {
      this.answerState.selected = [i];
    } else {
      const idx = this.answerState.selected.indexOf(i);
      if (idx >= 0) this.answerState.selected.splice(idx, 1);
      else this.answerState.selected.push(i);
    }
    this.showWarning = false;
  }

  validate() {
    if (this.answerState.selected.length === 0) {
      this.showWarning = true;
      return;
    }
    const q = this.currentQuestion!;
    const correct = q.correct.sort().toString() === [...this.answerState.selected].sort().toString();
    this.answerState.validated = true;
    this.answerState.correct = correct;
    if (correct) {
      this.correctCount++;
      const basePoints = 100;
      const half = this.totalTime / (this.quiz!.questions.length * 2);
      const elapsed = this.totalTime - this.timeLeft;
      const bonus = elapsed < half ? 50 : 0;
      this.currentScore += basePoints + bonus;
    }
  }

  next() {
    if (this.isLast) {
      this.endQuiz();
    } else {
      this.currentIndex++;
      this.answerState = { selected: [], validated: false, correct: false };
      this.showWarning = false;
    }
  }

  endQuiz() {
    clearInterval(this.timer);
    this.timeUsed = this.totalTime - this.timeLeft;
    this.finalScore = this.currentScore;
    this.finished = true;
    this.saveScore();
  }

  saveScore() {
    const user = this.auth.currentUser!;
    const score: Score = {
      id: 0,
      userId: user.id,
      userName: user.firstName + ' ' + user.lastName[0] + '.',
      quizId: this.quiz!.id,
      quizTitle: this.quiz!.title,
      score: this.finalScore,
      correctAnswers: this.correctCount,
      totalQuestions: this.quiz!.questions.length,
      timeSpent: this.timeUsed,
      date: new Date().toISOString().split('T')[0]
    };
    this.dataService.addScore(score);
    // Store for results page
    sessionStorage.setItem('lastResult', JSON.stringify({
      quiz: this.quiz,
      score: this.finalScore,
      correctCount: this.correctCount,
      timeUsed: this.timeUsed,
      totalQuestions: this.quiz!.questions.length
    }));
  }

  goResults() {
    this.router.navigate(['/results']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
