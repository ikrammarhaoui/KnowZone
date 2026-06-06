import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink,RouterLinkActive],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <strong>Admin Panel</strong>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
            Tableau de bord
          </a>
          <a routerLink="/admin/quizzes" routerLinkActive="active">
            Gestion des Quiz
          </a>
          <a routerLink="/admin/quiz/new" routerLinkActive="active">
            Créer un Quiz
          </a>
          <a routerLink="/admin/users" routerLinkActive="active">
            Utilisateurs
          </a>
          <a routerLink="/leaderboard" routerLinkActive="active">
            Classement
          </a>
          <div class="sidebar-divider"></div>
          <a routerLink="/" class="sidebar-back">Retour au site</a>
        </nav>
        <div class="sidebar-user">
          <div class="su-avatar">{{ initials }}</div>
          <div>
            <strong>{{ auth.currentUser?.firstName }}</strong>
            <span>Administrateur</span>
          </div>
        </div>
      </aside>

      <!-- Main -->
      <main class="admin-main">
        <div class="admin-topbar">
          <h2>Tableau de bord</h2>
          <span class="today">{{ today }}</span>
        </div>

        <!-- Stats cards -->
        <div class="stats-cards">
          <div class="stat-card berry">
            <div class="sc-icon"></div>
            <div class="sc-info">
              <strong>{{ stats.totalUsers }}</strong>
              <span>Utilisateurs</span>
            </div>
          </div>
          <div class="stat-card peach">
            <div class="sc-icon"></div>
            <div class="sc-info">
              <strong>{{ stats.totalQuizzes }}</strong>
              <span>Quiz publiés</span>
            </div>
          </div>
          <div class="stat-card rose">
            <div class="sc-icon"></div>
            <div class="sc-info">
              <strong>{{ stats.totalPlays }}</strong>
              <span>Parties jouées</span>
            </div>
          </div>
          <div class="stat-card olive">
            <div class="sc-icon"></div>
            <div class="sc-info">
              <strong>{{ stats.avgScore }}</strong>
              <span>Score moyen</span>
            </div>
          </div>
          <div class="stat-card berry">
            <div class="sc-icon"></div>
            <div class="sc-info">
              <strong>{{ stats.bestScore }}</strong>
              <span>Meilleur score</span>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="quick-actions">
          <h3>Actions rapides</h3>
          <div class="qa-grid">
            <a routerLink="/admin/quiz/new" class="qa-card">
              <strong>Créer un quiz</strong>
              <p>Ajouter un nouveau quiz à la plateforme</p>
            </a>
            <a routerLink="/admin/quizzes" class="qa-card">
              <strong>Gérer les quiz</strong>
              <p>Modifier, supprimer ou publier les quiz</p>
            </a>
            <a routerLink="/admin/users" class="qa-card">
              <strong>Gérer les utilisateurs</strong>
              <p>Bloquer, débloquer ou supprimer des comptes</p>
            </a>
            <a routerLink="/leaderboard" class="qa-card">
              <strong>Voir le classement</strong>
              <p>Consulter les meilleurs scores</p>
            </a>
          </div>
        </div>

        <!-- Recent scores -->
        <div class="recent-section">
          <h3>Dernières parties jouées</h3>
          <table class="admin-table">
            <thead>
              <tr>
                <th>Joueur</th>
                <th>Quiz</th>
                <th>Score</th>
                <th>Résultat</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of recentScores">
                <td>{{ s.userName }}</td>
                <td>{{ s.quizTitle }}</td>
                <td><strong style="color: var(--berry-velvet)">{{ s.score }}</strong></td>
                <td>{{ s.correctAnswers }}/{{ s.totalQuestions }}</td>
                <td style="color: var(--text-light); font-size: 0.82rem">{{ s.date }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; background: var(--bg-cream); }

    /* Sidebar */
    .sidebar {
      width: 240px; flex-shrink: 0;
      background: white; border-right: 1px solid rgba(232,167,181,0.2);
      display: flex; flex-direction: column;
      position: sticky; top: 72px; height: calc(100vh - 72px);
      overflow-y: auto;
    }
    .sidebar-logo {
      padding: 24px 20px; display: flex; align-items: center; gap: 10px;
      border-bottom: 1px solid var(--vanilla-glow);
      font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: var(--berry-velvet);
    }
    .sidebar-logo span { font-size: 1.4rem; }
    .sidebar-nav {
      flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px;
    }
    .sidebar-nav a {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; border-radius: var(--r-md);
      font-size: 0.88rem; font-weight: 500; color: var(--text-mid);
      transition: var(--transition); text-decoration: none;
    }
    .sidebar-nav a:hover { background: var(--vanilla-glow); color: var(--berry-velvet); }
    .sidebar-nav a.active { background: rgba(178,58,93,0.1); color: var(--berry-velvet); font-weight: 600; }
    .sidebar-divider { height: 1px; background: var(--vanilla-glow); margin: 8px 0; }
    .sidebar-back { color: var(--text-light) !important; font-size: 0.82rem !important; }
    .sidebar-user {
      padding: 16px 20px; border-top: 1px solid var(--vanilla-glow);
      display: flex; align-items: center; gap: 10px;
    }
    .su-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: var(--berry-velvet); color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.85rem; flex-shrink: 0;
    }
    .sidebar-user div { display: flex; flex-direction: column; }
    .sidebar-user strong { font-size: 0.88rem; }
    .sidebar-user span { font-size: 0.75rem; color: var(--text-light); }

    /* Main */
    .admin-main { flex: 1; padding: 32px; overflow-x: hidden; }
    .admin-topbar {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 32px;
    }
    .admin-topbar h2 { font-size: 1.6rem; color: var(--text-dark); }
    .today { font-size: 0.85rem; color: var(--text-light); }

    /* Stats */
    .stats-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 32px; }
    .stat-card {
      border-radius: var(--r-lg); padding: 20px;
      display: flex; align-items: center; gap: 14px;
    }
    .stat-card.berry { background: rgba(178,58,93,0.08); }
    .stat-card.peach { background: rgba(248,198,160,0.3); }
    .stat-card.rose { background: rgba(232,167,181,0.2); }
    .stat-card.olive { background: rgba(157,170,119,0.15); }
    .sc-icon { font-size: 1.6rem; }
    .sc-info { display: flex; flex-direction: column; }
    .sc-info strong { font-size: 1.5rem; color: var(--text-dark); line-height: 1; }
    .sc-info span { font-size: 0.78rem; color: var(--text-light); margin-top: 4px; }

    /* Quick actions */
    .quick-actions { margin-bottom: 32px; }
    .quick-actions h3, .recent-section h3 { margin-bottom: 16px; font-size: 1rem; color: var(--text-dark); }
    .qa-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .qa-card {
      background: white; border-radius: var(--r-lg);
      padding: 22px; border: 1.5px solid rgba(232,167,181,0.2);
      cursor: pointer; transition: var(--transition); text-decoration: none;
      display: flex; flex-direction: column; gap: 8px;
    }
    .qa-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px var(--shadow); border-color: var(--rose-cloud); }
    .qa-card span { font-size: 1.6rem; }
    .qa-card strong { font-size: 0.9rem; color: var(--text-dark); }
    .qa-card p { font-size: 0.78rem; color: var(--text-light); line-height: 1.4; }

    /* Table */
    .recent-section {
      background: white; border-radius: var(--r-lg);
      border: 1.5px solid rgba(232,167,181,0.2);
      overflow: hidden;
      box-shadow: 0 2px 12px var(--shadow);
    }
    .recent-section h3 { padding: 20px 20px 0; }
    .admin-table { width: 100%; border-collapse: collapse; }
    .admin-table th {
      padding: 12px 16px; text-align: left;
      background: var(--vanilla-glow);
      font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--text-light);
    }
    .admin-table td {
      padding: 13px 16px; border-top: 1px solid rgba(244,230,210,0.5);
      font-size: 0.87rem; color: var(--text-mid);
    }
    .admin-table tr:hover td { background: rgba(244,230,210,0.3); }

    @media (max-width: 1200px) { .stats-cards { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 900px) {
      .sidebar { display: none; }
      .qa-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .admin-main { padding: 20px 16px; }
      .stats-cards { grid-template-columns: repeat(2, 1fr); }
      .qa-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats = { totalUsers: 0, totalQuizzes: 0, totalPlays: 0, avgScore: 0, bestScore: 0 };
  recentScores: any[] = [];
  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  constructor(public auth: AuthService, private dataService: DataService) {}

  get initials(): string {
    const u = this.auth.currentUser;
    return u ? (u.firstName[0] + u.lastName[0]).toUpperCase() : 'A';
  }

  ngOnInit() {
    this.stats = this.dataService.getStats();
    this.recentScores = this.dataService.getScores()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }
}
