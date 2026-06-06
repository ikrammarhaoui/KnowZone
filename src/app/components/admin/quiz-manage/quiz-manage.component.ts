import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { Quiz } from '../../../models/quiz.model';

@Component({
  selector: 'app-quiz-manage',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-layout">
      <aside class="sidebar">
        <div class="sidebar-logo"><strong>Admin Panel</strong></div>
        <nav class="sidebar-nav">
          <a routerLink="/admin">Tableau de bord</a>
          <a routerLink="/admin/quizzes" class="active">Gestion des Quiz</a>
          <a routerLink="/admin/quiz/new">Créer un Quiz</a>
          <a routerLink="/admin/users">Utilisateurs</a>
          <div class="sidebar-divider"></div>
          <a routerLink="/" class="sidebar-back">Retour au site</a>
        </nav>
      </aside>

      <main class="admin-main">
        <div class="admin-topbar">
          <h2>Gestion des Quiz</h2>
          <a routerLink="/admin/quiz/new" class="btn btn-primary btn-sm">Nouveau quiz</a>
        </div>

        <div class="quiz-manage-table">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Quiz</th>
                <th>Catégorie</th>
                <th>Difficulté</th>
                <th>Questions</th>
                <th>Durée</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let quiz of quizzes">
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <span style="font-weight:600;color:var(--text-dark)">{{ quiz.title }}</span>
                  </div>
                </td>
                <td>{{ quiz.category }}</td>
                <td>
                  <span class="badge" [ngClass]="'badge-' + getDiffClass(quiz.difficulty)">{{ quiz.difficulty }}</span>
                </td>
                <td>{{ quiz.questions.length }}</td>
                <td>{{ quiz.duration }} min</td>
                <td>
                  <span class="status-badge" [class.published]="quiz.published">
                    {{ quiz.published ? 'Publié' : 'Brouillon' }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <a [routerLink]="['/quiz', quiz.id]" class="action-btn view" title="Voir">Voir</a>
                    <a [routerLink]="['/admin/quiz', quiz.id, 'edit']" class="action-btn edit" title="Modifier">Modifier</a>
                    <button class="action-btn toggle" (click)="togglePublish(quiz)" title="Publier/Dépublier">
                      {{ quiz.published ? 'Désactiver' : 'Activer' }}
                    </button>
                    <button class="action-btn delete" (click)="deleteQuiz(quiz)" title="Supprimer">Supprimer</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" *ngIf="quizzes.length === 0">
            <p>Aucun quiz créé.</p>
            <a routerLink="/admin/quiz/new" class="btn btn-primary btn-sm">Créer le premier quiz</a>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; background: var(--bg-cream); }
    .sidebar {
      width: 240px; flex-shrink: 0; background: white;
      border-right: 1px solid rgba(232,167,181,0.2);
      display: flex; flex-direction: column;
      position: sticky; top: 72px; height: calc(100vh - 72px);
    }
    .sidebar-logo {
      padding: 24px 20px; display: flex; align-items: center; gap: 10px;
      border-bottom: 1px solid var(--vanilla-glow);
      font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: var(--berry-velvet);
    }
    .sidebar-logo span { font-size: 1.4rem; }
    .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
    .sidebar-nav a {
      display: flex; align-items: center; gap: 10px; padding: 10px 14px;
      border-radius: var(--r-md); font-size: 0.88rem; font-weight: 500;
      color: var(--text-mid); transition: var(--transition); text-decoration: none;
    }
    .sidebar-nav a:hover, .sidebar-nav a.active { background: rgba(178,58,93,0.1); color: var(--berry-velvet); font-weight: 600; }
    .sidebar-divider { height: 1px; background: var(--vanilla-glow); margin: 8px 0; }
    .sidebar-back { color: var(--text-light) !important; font-size: 0.82rem !important; }

    .admin-main { flex: 1; padding: 32px; }
    .admin-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .admin-topbar h2 { font-size: 1.6rem; color: var(--text-dark); }

    .quiz-manage-table {
      background: white; border-radius: var(--r-lg);
      border: 1.5px solid rgba(232,167,181,0.2); overflow: hidden;
      box-shadow: 0 2px 12px var(--shadow);
    }
    .admin-table { width: 100%; border-collapse: collapse; }
    .admin-table th {
      padding: 13px 16px; text-align: left; background: var(--vanilla-glow);
      font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--text-light);
    }
    .admin-table td {
      padding: 14px 16px; border-top: 1px solid rgba(244,230,210,0.5);
      font-size: 0.87rem; color: var(--text-mid); vertical-align: middle;
    }
    .admin-table tr:hover td { background: rgba(244,230,210,0.2); }

    .status-badge {
      padding: 4px 10px; border-radius: var(--r-full);
      font-size: 0.78rem; font-weight: 600;
      background: rgba(232,167,181,0.2); color: var(--text-mid);
    }
    .status-badge.published { background: rgba(157,170,119,0.2); color: #3a5a1a; }

    .action-btns { display: flex; gap: 6px; }
    .action-btn {
      width: 32px; height: 32px; border-radius: var(--r-sm);
      border: 1.5px solid var(--vanilla-glow); background: white;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; transition: var(--transition); text-decoration: none;
    }
    .action-btn:hover { transform: scale(1.1); }
    .action-btn.delete:hover { border-color: var(--berry-velvet); background: rgba(178,58,93,0.08); }

    .empty-state { padding: 60px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .empty-state span { font-size: 2.5rem; }

    @media (max-width: 900px) { .sidebar { display: none; } }
  `]
})
export class QuizManageComponent implements OnInit {
  quizzes: Quiz[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit() { this.quizzes = this.dataService.getQuizzes(); }

  getDiffClass(d: string): string {
    return d === 'Facile' ? 'easy' : d === 'Moyen' ? 'medium' : 'hard';
  }

  togglePublish(quiz: Quiz) {
    quiz.published = !quiz.published;
    this.dataService.updateQuiz(quiz);
  }

  deleteQuiz(quiz: Quiz) {
    if (confirm(`Supprimer "${quiz.title}" ?`)) {
      this.dataService.deleteQuiz(quiz.id);
      this.quizzes = this.dataService.getQuizzes();
    }
  }
}
