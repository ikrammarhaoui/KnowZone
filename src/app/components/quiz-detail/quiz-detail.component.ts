import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Quiz, Score } from '../../models/quiz.model';

@Component({
  selector: 'app-quiz-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="quiz-detail-page" *ngIf="quiz">
      <div class="page-bg"></div>
      <div class="container">
        <a routerLink="/quizzes" class="back-link">Retour aux quiz</a>

        <div class="detail-layout">
          <!-- LEFT: Info -->
          <div class="detail-main">
            <div class="quiz-header">
                <div>
                <div class="quiz-tags">
                  <span class="tag-cat">{{ quiz.category }}</span>
                  <span class="badge" [ngClass]="'badge-' + getDifficultyClass(quiz.difficulty)">
                    {{ quiz.difficulty }}
                  </span>
                </div>
                <h1>{{ quiz.title }}</h1>
                <p class="quiz-desc">{{ quiz.description }}</p>
              </div>
            </div>

            <div class="quiz-stats-row">
              <div class="stat-item">
                <span class="stat-icon">Questions</span>
                <div>
                  <strong>{{ quiz.questions.length }}</strong>
                  <span>Questions</span>
                </div>
              </div>
              <div class="stat-item">
                <span class="stat-icon">Durée</span>
                <div>
                  <strong>{{ quiz.duration }} min</strong>
                  <span>Durée totale</span>
                </div>
              </div>
              <div class="stat-item">
                <span class="stat-icon">Meilleur score</span>
                <div>
                  <strong>{{ topScore?.score || '—' }}</strong>
                  <span>Meilleur score</span>
                </div>
              </div>
              <div class="stat-item">
                <span class="stat-icon">Parties</span>
                <div>
                  <strong>{{ quizScores.length }}</strong>
                  <span>Parties jouées</span>
                </div>
              </div>
            </div>

            <!-- Question types preview -->
            <div class="types-section">
              <h3>Types de questions</h3>
              <div class="types-grid">
                <div class="type-card" *ngIf="hasQcm">
                  <strong>QCM</strong>
                  <span>1 bonne réponse</span>
                </div>
                <div class="type-card" *ngIf="hasMultiple">
                  <strong>Choix multiple</strong>
                  <span>Plusieurs réponses</span>
                </div>
                <div class="type-card" *ngIf="hasVF">
                  <strong>Vrai / Faux</strong>
                  <span>2 options</span>
                </div>
              </div>
            </div>

            <!-- Rules -->
            <div class="rules-section">
              <h3>Règles du quiz</h3>
              <ul class="rules-list">
                <li>Le chronomètre démarre dès que vous cliquez sur "Démarrer"</li>
                <li>Le chrono ne peut pas être mis en pause</li>
                <li>Chaque bonne réponse rapporte des points de base</li>
                <li>Un bonus de rapidité est accordé si vous répondez en moins de la moitié du temps</li>
                <li>Les questions non répondues comptent comme incorrectes</li>
                <li>Votre score sera soumis au leaderboard si vous entrez dans le top 10</li>
              </ul>
            </div>
          </div>

          <!-- RIGHT: CTA + Leaderboard -->
          <div class="detail-sidebar">
            <div class="cta-card">
              <div class="cta-top">
                <div class="cta-quiz-icon">{{ quiz.image }}</div>
                <h3>Prêt à commencer ?</h3>
                <p>{{ quiz.questions.length }} questions · {{ quiz.duration }} minutes</p>
              </div>

              <ng-container *ngIf="auth.isLoggedIn; else loginPrompt">
                <a [routerLink]="['/quiz', quiz.id, 'play']" class="btn btn-primary" style="width: 100%; justify-content: center;">
                  Démarrer le Quiz
                </a>
              </ng-container>
              <ng-template #loginPrompt>
                <p class="login-hint">Connectez-vous pour jouer</p>
                <a routerLink="/login" class="btn btn-primary" style="width: 100%; justify-content: center;">
                  Se connecter
                </a>
                <a routerLink="/register" class="btn btn-secondary" style="width: 100%; justify-content: center; margin-top: 10px;">
                  Créer un compte
                </a>
              </ng-template>
            </div>

            <!-- Mini leaderboard -->
            <div class="mini-leaderboard card" *ngIf="quizScores.length > 0">
              <h4>Top scores</h4>
              <div class="lb-row" *ngFor="let s of quizScores.slice(0,5); let i = index">
                <span class="lb-rank" [class.gold]="i===0" [class.silver]="i===1" [class.bronze]="i===2">
                  {{ i + 1 }}
                </span>
                <span class="lb-name">{{ s.userName }}</span>
                <strong class="lb-score">{{ s.score }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="not-found" *ngIf="!quiz">
      <div class="container">
        <h2>Quiz introuvable</h2>
        <a routerLink="/quizzes" class="btn btn-primary">Retour</a>
      </div>
    </div>
  `,
  styles: [`
    .quiz-detail-page { padding-bottom: 80px; min-height: 100vh; position: relative; }
    .page-bg {
      position: fixed; inset: 0; z-index: -1;
      background: linear-gradient(160deg, var(--vanilla-glow) 0%, white 40%);
    }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    .back-link {
      display: inline-block; padding: 20px 0;
      color: var(--text-light); font-size: 0.9rem;
      transition: color 0.2s;
    }
    .back-link:hover { color: var(--berry-velvet); }

    .detail-layout { display: grid; grid-template-columns: 1fr 340px; gap: 40px; }
    .detail-main { display: flex; flex-direction: column; gap: 32px; }

    .quiz-header { display: flex; gap: 24px; align-items: flex-start; }
    .quiz-emoji { font-size: 3rem; flex-shrink: 0; }
    .quiz-tags { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
    .tag-cat {
      font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: var(--text-light);
    }
    .quiz-header h1 { font-size: 2rem; color: var(--text-dark); margin-bottom: 8px; }
    .quiz-desc { color: var(--text-mid); line-height: 1.6; }

    .quiz-stats-row {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 16px; background: white; border-radius: var(--r-lg);
      padding: 20px; border: 1.5px solid rgba(232,167,181,0.2);
    }
    .stat-item { display: flex; gap: 12px; align-items: center; }
    .stat-icon { font-size: 1.5rem; }
    .stat-item div { display: flex; flex-direction: column; }
    .stat-item strong { font-size: 1.1rem; color: var(--text-dark); }
    .stat-item span { font-size: 0.78rem; color: var(--text-light); }

    .types-section, .rules-section {
      background: white; border-radius: var(--r-lg);
      padding: 24px; border: 1.5px solid rgba(232,167,181,0.2);
    }
    .types-section h3, .rules-section h3 { margin-bottom: 16px; color: var(--text-dark); font-size: 1rem; }
    .types-grid { display: flex; gap: 12px; flex-wrap: wrap; }
    .type-card {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 16px 20px; border: 1.5px solid var(--vanilla-glow);
      border-radius: var(--r-md); flex: 1; min-width: 100px;
    }
    .type-card span:first-child { font-size: 1.5rem; }
    .type-card strong { font-size: 0.85rem; color: var(--text-dark); }
    .type-card span:last-child { font-size: 0.75rem; color: var(--text-light); }
    .rules-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .rules-list li { font-size: 0.9rem; color: var(--text-mid); line-height: 1.5; }

    /* Sidebar */
    .detail-sidebar { display: flex; flex-direction: column; gap: 24px; padding-top: 0; }
    .cta-card {
      background: white; border-radius: var(--r-xl);
      padding: 28px; border: 1.5px solid rgba(232,167,181,0.3);
      box-shadow: 0 8px 32px var(--shadow);
      position: sticky; top: 90px;
    }
    .cta-top { text-align: center; margin-bottom: 24px; }
    .cta-quiz-icon { font-size: 3rem; margin-bottom: 12px; }
    .cta-top h3 { font-size: 1.1rem; margin-bottom: 6px; }
    .cta-top p { font-size: 0.85rem; color: var(--text-light); }
    .login-hint { font-size: 0.85rem; color: var(--text-light); text-align: center; margin-bottom: 12px; }

    .mini-leaderboard { padding: 20px !important; }
    .mini-leaderboard h4 { margin-bottom: 14px; font-size: 0.95rem; color: var(--text-dark); }
    .lb-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--vanilla-glow); }
    .lb-row:last-child { border-bottom: none; }
    .lb-rank { font-size: 0.85rem; min-width: 28px; }
    .lb-name { flex: 1; font-size: 0.85rem; color: var(--text-mid); }
    .lb-score { color: var(--berry-velvet); font-size: 0.9rem; }

    .not-found { padding: 80px 0; text-align: center; }

    @media (max-width: 900px) {
      .detail-layout { grid-template-columns: 1fr; }
      .cta-card { position: static; }
      .quiz-stats-row { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .quiz-header { flex-direction: column; }
      .quiz-stats-row { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class QuizDetailComponent implements OnInit {
  quiz?: Quiz;
  quizScores: Score[] = [];
  topScore?: Score;

  get hasQcm() { return this.quiz?.questions.some(q => q.type === 'qcm'); }
  get hasMultiple() { return this.quiz?.questions.some(q => q.type === 'multiple'); }
  get hasVF() { return this.quiz?.questions.some(q => q.type === 'vf'); }

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.quiz = this.dataService.getQuizById(id);
    if (this.quiz) {
      this.quizScores = this.dataService.getScoresByQuiz(id);
      this.topScore = this.quizScores[0];
    }
  }

  getDifficultyClass(d: string): string {
    return d === 'Facile' ? 'easy' : d === 'Moyen' ? 'medium' : 'hard';
  }
}
