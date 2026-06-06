import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Score } from '../../models/quiz.model';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="leaderboard-page">
      <div class="lb-header">
        <div class="container">
          <div class="lb-hero">
            <h1>🏆 Classement <em>Global</em></h1>
            <p>Les meilleurs scores de la plateforme. Votre nom ici ?</p>
          </div>
        </div>
      </div>

      <div class="container">
        <!-- Filters -->
        <div class="lb-filters">
          <div class="filter-group">
            <label>Quiz</label>
            <select [(ngModel)]="selectedQuiz" (ngModelChange)="applyFilter()" class="form-select">
              <option value="">Tous les quiz</option>
              <option *ngFor="let q of quizTitles" [value]="q">{{ q }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Période</label>
            <div class="period-btns">
              <button
                *ngFor="let p of periods"
                class="period-btn"
                [class.active]="selectedPeriod === p.value"
                (click)="setPeriod(p.value)"
              >{{ p.label }}</button>
            </div>
          </div>
        </div>

        <!-- Top 3 podium -->
        <div class="podium" *ngIf="filtered.length >= 3">
          <div class="podium-place second">
            <div class="podium-avatar">{{ filtered[1].userName.charAt(0) }}</div>
            <div class="podium-name">{{ filtered[1].userName }}</div>
            <div class="podium-score">{{ filtered[1].score }} pts</div>
            <div class="podium-medal">🥈</div>
            <div class="podium-block" style="height: 90px; background: #C0C0C0">2</div>
          </div>
          <div class="podium-place first">
            <div class="podium-crown">👑</div>
            <div class="podium-avatar gold">{{ filtered[0].userName.charAt(0) }}</div>
            <div class="podium-name">{{ filtered[0].userName }}</div>
            <div class="podium-score">{{ filtered[0].score }} pts</div>
            <div class="podium-medal">🥇</div>
            <div class="podium-block" style="height: 120px; background: var(--berry-velvet)">1</div>
          </div>
          <div class="podium-place third">
            <div class="podium-avatar">{{ filtered[2].userName.charAt(0) }}</div>
            <div class="podium-name">{{ filtered[2].userName }}</div>
            <div class="podium-score">{{ filtered[2].score }} pts</div>
            <div class="podium-medal">🥉</div>
            <div class="podium-block" style="height: 70px; background: #CD7F32">3</div>
          </div>
        </div>

        <!-- Table -->
        <div class="lb-table-wrap">
          <table class="lb-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Joueur</th>
                <th>Quiz</th>
                <th>Score</th>
                <th>Réussite</th>
                <th>Temps</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let s of filtered; let i = index"
                [class.current-user]="auth.currentUser && s.userId === auth.currentUser.id"
                [class.top1]="i === 0" [class.top2]="i === 1" [class.top3]="i === 2"
              >
                <td class="rank-cell">
                  <span *ngIf="i === 0">🥇</span>
                  <span *ngIf="i === 1">🥈</span>
                  <span *ngIf="i === 2">🥉</span>
                  <span *ngIf="i >= 3" class="rank-num">#{{ i + 1 }}</span>
                </td>
                <td class="player-cell">
                  <div class="player-avatar">{{ s.userName.charAt(0) }}</div>
                  <span>
                    {{ s.userName }}
                    <small *ngIf="auth.currentUser && s.userId === auth.currentUser.id" class="you-badge">vous</small>
                  </span>
                </td>
                <td class="quiz-cell">{{ s.quizTitle }}</td>
                <td class="score-cell"><strong>{{ s.score }}</strong></td>
                <td class="pct-cell">
                  <div class="mini-bar-wrap">
                    <div class="mini-bar" [style.width]="(s.correctAnswers/s.totalQuestions*100) + '%'"></div>
                  </div>
                  <span>{{ s.correctAnswers }}/{{ s.totalQuestions }}</span>
                </td>
                <td class="time-cell">{{ formatTime(s.timeSpent) }}</td>
                <td class="date-cell">{{ s.date }}</td>
              </tr>
            </tbody>
          </table>

          <div class="empty-lb" *ngIf="filtered.length === 0">
            <p>Aucun score pour ces filtres. Soyez le premier !</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .leaderboard-page { padding-bottom: 80px; }
    .lb-header {
      background: linear-gradient(135deg, var(--berry-velvet) 0%, var(--berry-light, #d4567a) 100%);
      padding: 60px 0 48px; margin-bottom: 48px;
    }
    .lb-hero { text-align: center; color: white; }
    .lb-hero h1 { color: white; margin-bottom: 8px; }
    .lb-hero h1 em { font-style: italic; opacity: 0.85; }
    .lb-hero p { color: rgba(255,255,255,0.8); font-size: 1rem; }
    .container { max-width: 1000px; margin: 0 auto; padding: 0 24px; }

    .lb-filters {
      display: flex; gap: 24px; align-items: flex-end; flex-wrap: wrap;
      background: white; border-radius: var(--r-lg);
      padding: 20px 24px; margin-bottom: 40px;
      border: 1.5px solid rgba(232,167,181,0.2);
      box-shadow: 0 2px 12px var(--shadow);
    }
    .filter-group { display: flex; flex-direction: column; gap: 8px; }
    .filter-group label { font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-light); }
    .form-select {
      padding: 10px 14px; border: 2px solid var(--vanilla-glow);
      border-radius: var(--r-md); font-family: var(--font-body); font-size: 0.9rem;
      color: var(--text-dark); outline: none; min-width: 200px;
    }
    .form-select:focus { border-color: var(--berry-velvet); }
    .period-btns { display: flex; gap: 6px; }
    .period-btn {
      padding: 8px 16px; border: 1.5px solid var(--vanilla-glow);
      border-radius: var(--r-full); background: white;
      font-family: var(--font-body); font-size: 0.85rem; font-weight: 500;
      color: var(--text-mid); cursor: pointer; transition: var(--transition);
    }
    .period-btn.active { background: var(--berry-velvet); color: white; border-color: var(--berry-velvet); }

    /* PODIUM */
    .podium {
      display: flex; align-items: flex-end; justify-content: center;
      gap: 16px; margin-bottom: 48px; padding: 0 20px;
    }
    .podium-place {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
    }
    .podium-crown { font-size: 1.5rem; }
    .podium-avatar {
      width: 52px; height: 52px; border-radius: 50%;
      background: var(--rose-cloud); color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem; font-weight: 700;
    }
    .podium-avatar.gold { background: var(--berry-velvet); width: 64px; height: 64px; font-size: 1.4rem; }
    .podium-name { font-size: 0.85rem; font-weight: 600; color: var(--text-dark); }
    .podium-score { font-size: 0.78rem; color: var(--text-light); }
    .podium-medal { font-size: 1.2rem; }
    .podium-block {
      width: 90px; border-radius: var(--r-sm) var(--r-sm) 0 0;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 1.2rem;
    }
    .podium-place.first .podium-block { width: 110px; }

    /* TABLE */
    .lb-table-wrap {
      background: white; border-radius: var(--r-lg);
      border: 1.5px solid rgba(232,167,181,0.2);
      overflow: hidden; box-shadow: 0 4px 24px var(--shadow);
    }
    .lb-table { width: 100%; border-collapse: collapse; }
    .lb-table thead {
      background: var(--vanilla-glow);
    }
    .lb-table th {
      padding: 14px 16px; text-align: left;
      font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--text-light);
    }
    .lb-table td {
      padding: 14px 16px; border-top: 1px solid rgba(244,230,210,0.5);
      font-size: 0.88rem; color: var(--text-mid);
      vertical-align: middle;
    }
    .lb-table tr:hover td { background: rgba(244,230,210,0.3); }
    .lb-table tr.current-user td {
      background: rgba(178,58,93,0.04);
    }
    .lb-table tr.current-user { border-left: 3px solid var(--berry-velvet); }

    .rank-cell { font-size: 1.1rem; min-width: 40px; }
    .rank-num { font-weight: 600; color: var(--text-light); }
    .player-cell { display: flex; align-items: center; gap: 10px; }
    .player-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--rose-cloud); color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.82rem; font-weight: 700; flex-shrink: 0;
    }
    .you-badge {
      display: inline-flex; margin-left: 6px;
      background: rgba(178,58,93,0.1); color: var(--berry-velvet);
      padding: 2px 8px; border-radius: var(--r-full);
      font-size: 0.7rem; font-weight: 700;
    }
    .quiz-cell { max-width: 200px; font-size: 0.82rem; }
    .score-cell strong { color: var(--berry-velvet); font-size: 1rem; }
    .pct-cell { display: flex; flex-direction: column; gap: 4px; min-width: 80px; }
    .mini-bar-wrap { height: 6px; background: var(--vanilla-glow); border-radius: 3px; width: 60px; }
    .mini-bar { height: 100%; background: var(--olive-mist); border-radius: 3px; }
    .pct-cell span { font-size: 0.78rem; color: var(--text-light); }
    .time-cell { font-family: monospace; }
    .date-cell { font-size: 0.8rem; color: var(--text-light); }

    .empty-lb { padding: 60px; text-align: center; }
    .empty-lb span { font-size: 2.5rem; display: block; margin-bottom: 12px; }
    .empty-lb p { color: var(--text-light); }

    @media (max-width: 768px) {
      .quiz-cell, .date-cell { display: none; }
      .podium { gap: 8px; }
      .podium-block { width: 70px !important; }
    }
  `]
})
export class LeaderboardComponent implements OnInit {
  all: Score[] = [];
  filtered: Score[] = [];
  selectedQuiz = '';
  selectedPeriod = 'all';
  quizTitles: string[] = [];

  periods = [
    { label: 'Tout', value: 'all' },
    { label: 'Ce mois', value: 'month' },
    { label: 'Cette semaine', value: 'week' }
  ];

  constructor(
    private dataService: DataService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.all = this.dataService.getScores().sort((a, b) => b.score - a.score);
    this.quizTitles = [...new Set(this.all.map(s => s.quizTitle))];
    this.filtered = [...this.all];
  }

  setPeriod(p: string) {
    this.selectedPeriod = p;
    this.applyFilter();
  }

  applyFilter() {
    let result = [...this.all];
    if (this.selectedQuiz) result = result.filter(s => s.quizTitle === this.selectedQuiz);
    if (this.selectedPeriod !== 'all') {
      const now = new Date();
      result = result.filter(s => {
        const d = new Date(s.date);
        if (this.selectedPeriod === 'week') {
          const week = new Date(now); week.setDate(now.getDate() - 7);
          return d >= week;
        } else {
          const month = new Date(now); month.setMonth(now.getMonth() - 1);
          return d >= month;
        }
      });
    }
    this.filtered = result;
  }

  formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }
}
