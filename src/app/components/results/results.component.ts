import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="results-page">
      <div class="container">
        <div class="results-wrap" *ngIf="result">
          <!-- Score hero -->
          <div class="score-hero">
            <div class="trophy-emoji">Résultat</div>
            <h1>{{ result.score }} <span>pts</span></h1>
            <p class="score-sub">{{ scorePercent }}% de réussite</p>
            <div class="score-bar-wrap">
              <div class="score-bar"
                [style.width]="scorePercent + '%'"
                [style.background]="barColor">
              </div>
            </div>
            <p class="score-msg">{{ scoreMessage }}</p>
          </div>

          <!-- Stats grid -->
          <div class="stats-grid">
            <div class="stat-box">
              <span class="stat-icon">Réussite</span>
              <strong>{{ result.correctCount }} / {{ result.totalQuestions }}</strong>
              <span>Bonnes réponses</span>
            </div>
            <div class="stat-box">
              <span class="stat-icon">Erreur</span>
              <strong>{{ result.totalQuestions - result.correctCount }}</strong>
              <span>Mauvaises réponses</span>
            </div>
            <div class="stat-box">
              <span class="stat-icon">Temps</span>
              <strong>{{ formatTime(result.timeUsed) }}</strong>
              <span>Temps utilisé</span>
            </div>
            <div class="stat-box">
              <span class="stat-icon">Moyenne</span>
              <strong>{{ avgTime }}s</strong>
              <span>Moy. par question</span>
            </div>
          </div>

          <!-- Performance bar -->
          <div class="perf-section">
            <h3>Votre performance</h3>
            <div class="perf-bar-wrap">
              <div class="perf-segment" style="background: var(--olive-mist); width: 20%">
                <span>Débutant</span>
              </div>
              <div class="perf-segment" style="background: var(--peach-whip); width: 20%">
                <span>Apprenti</span>
              </div>
              <div class="perf-segment" style="background: var(--rose-cloud); width: 20%">
                <span>Confirmé</span>
              </div>
              <div class="perf-segment" style="background: var(--berry-velvet); width: 20%; opacity: 0.7">
                <span>Expert</span>
              </div>
              <div class="perf-segment" style="background: var(--berry-velvet); width: 20%">
                <span>Maître</span>
              </div>
              <div class="perf-marker" [style.left]="scorePercent + '%'">
                <div class="perf-label">Vous</div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="result-actions">
            <a [routerLink]="['/quiz', result.quiz?.id, 'play']" class="btn btn-primary btn-lg">
              Rejouer ce quiz
            </a>
            <a routerLink="/quizzes" class="btn btn-secondary btn-lg">
              Autres quiz
            </a>
            <a routerLink="/leaderboard" class="btn btn-ghost btn-lg">
              Voir le classement
            </a>
          </div>
        </div>

        <!-- Fallback if no result -->
        <div class="no-result" *ngIf="!result">
          <span>Résultat</span>
          <h2>Aucun résultat à afficher</h2>
          <p>Passez un quiz pour voir vos résultats ici.</p>
          <a routerLink="/quizzes" class="btn btn-primary">Voir les quiz</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .results-page {
      min-height: 100vh; padding: 60px 0;
      background: linear-gradient(160deg, var(--vanilla-glow) 0%, white 50%);
    }
    .container { max-width: 700px; margin: 0 auto; padding: 0 24px; }
    .results-wrap { display: flex; flex-direction: column; gap: 32px; }

    .score-hero {
      background: white; border-radius: var(--r-xl);
      padding: 48px; text-align: center;
      box-shadow: 0 8px 40px var(--shadow-deep);
      border: 1.5px solid rgba(232,167,181,0.3);
      animation: bounceIn 0.5s ease;
    }
    .trophy-emoji { font-size: 4rem; margin-bottom: 16px; }
    .score-hero h1 {
      font-size: 4.5rem; font-family: 'DM Serif Display', serif;
      color: var(--berry-velvet); line-height: 1; margin-bottom: 8px;
    }
    .score-hero h1 span { font-size: 1.5rem; color: var(--text-light); }
    .score-sub { color: var(--text-mid); font-size: 1.1rem; margin-bottom: 20px; }
    .score-bar-wrap {
      height: 12px; background: var(--vanilla-glow);
      border-radius: 6px; margin-bottom: 16px; overflow: hidden;
    }
    .score-bar { height: 100%; border-radius: 6px; transition: width 1.2s ease; }
    .score-msg { color: var(--text-mid); font-size: 0.95rem; }

    .stats-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
    }
    .stat-box {
      background: white; border-radius: var(--r-lg);
      padding: 24px 16px; text-align: center;
      border: 1.5px solid rgba(232,167,181,0.2);
      display: flex; flex-direction: column; gap: 8px; align-items: center;
    }
    .stat-icon { font-size: 1.8rem; }
    .stat-box strong { font-size: 1.3rem; color: var(--text-dark); }
    .stat-box span { font-size: 0.78rem; color: var(--text-light); }

    .perf-section {
      background: white; border-radius: var(--r-lg);
      padding: 28px; border: 1.5px solid rgba(232,167,181,0.2);
    }
    .perf-section h3 { margin-bottom: 20px; font-size: 1rem; color: var(--text-dark); }
    .perf-bar-wrap {
      display: flex; height: 32px; border-radius: var(--r-md);
      overflow: hidden; position: relative;
    }
    .perf-segment {
      display: flex; align-items: center; justify-content: center;
    }
    .perf-segment span { font-size: 0.7rem; color: white; font-weight: 600; white-space: nowrap; }
    .perf-marker {
      position: absolute; top: -6px; transform: translateX(-50%);
      display: flex; flex-direction: column; align-items: center;
      transition: left 1s ease;
    }
    .perf-label {
      background: var(--text-dark); color: white;
      font-size: 0.72rem; font-weight: 700;
      padding: 3px 8px; border-radius: var(--r-full);
    }
    .perf-marker::after {
      content: ''; width: 2px; height: 32px; background: var(--text-dark); margin-top: 2px;
    }

    .result-actions {
      display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
    }

    .no-result {
      text-align: center; padding: 80px 20px;
      display: flex; flex-direction: column; align-items: center; gap: 16px;
    }
    .no-result span { font-size: 3rem; }

    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .score-hero { padding: 32px 20px; }
      .result-actions { flex-direction: column; }
    }
  `]
})
export class ResultsComponent implements OnInit {
  result: any = null;

  constructor(private router: Router) {}

  ngOnInit() {
    const saved = sessionStorage.getItem('lastResult');
    if (saved) this.result = JSON.parse(saved);
  }

  get scorePercent(): number {
    if (!this.result) return 0;
    return Math.round((this.result.correctCount / this.result.totalQuestions) * 100);
  }
  get trophyEmoji(): string {
    const p = this.scorePercent;
    if (p >= 80) return 'Très bon score';
    if (p >= 60) return 'Bon score';
    if (p >= 40) return 'Score moyen';
    return 'Besoin d\'amélioration';
  }
  get barColor(): string {
    const p = this.scorePercent;
    return p >= 80 ? 'var(--olive-mist)' : p >= 60 ? 'var(--berry-velvet)' : 'var(--rose-cloud)';
  }
  get scoreMessage(): string {
    const p = this.scorePercent;
    if (p >= 80) return 'Excellent ! Vous maîtrisez parfaitement ce sujet.';
    if (p >= 60) return 'Bien joué ! Quelques points à revoir.';
    if (p >= 40) return 'Continuez à pratiquer, vous progressez !';
    return 'Ne vous découragez pas — chaque essai est un progrès !';
  }
  get avgTime(): number {
    if (!this.result) return 0;
    return Math.round(this.result.timeUsed / this.result.totalQuestions);
  }

  formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }
}
