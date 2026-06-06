import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/quiz.model';

@Component({
  selector: 'app-user-manage',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-layout">
      <aside class="sidebar">
        <div class="sidebar-logo"><strong>Admin Panel</strong></div>
        <nav class="sidebar-nav">
          <a routerLink="/admin">Tableau de bord</a>
          <a routerLink="/admin/quizzes">Gestion des Quiz</a>
          <a routerLink="/admin/quiz/new">Créer un Quiz</a>
          <a routerLink="/admin/users" class="active">Utilisateurs</a>
          <div class="sidebar-divider"></div>
          <a routerLink="/" class="sidebar-back">Retour au site</a>
        </nav>
      </aside>

      <main class="admin-main">
        <div class="admin-topbar">
          <h2>Gestion des Utilisateurs</h2>
          <div class="users-count">{{ users.length }} utilisateur(s)</div>
        </div>

        <div class="users-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Inscription</th>
                <th>Parties</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users" [class.blocked-row]="user.blocked">
                <td>
                  <div class="user-cell">
                    <div class="u-avatar">{{ user.firstName[0] }}{{ user.lastName[0] }}</div>
                    <div>
                      <strong>{{ user.firstName }} {{ user.lastName }}</strong>
                      <small *ngIf="user.id === auth.currentUser?.id" class="you-tag">vous</small>
                    </div>
                  </div>
                </td>
                <td style="font-size:0.82rem;color:var(--text-light)">{{ user.email }}</td>
                <td>
                  <span class="role-badge" [class.admin]="user.role === 'admin'">
                    {{ user.role === 'admin' ? 'Admin' : 'User' }}
                  </span>
                </td>
                <td style="font-size:0.82rem;color:var(--text-light)">{{ user.createdAt }}</td>
                <td>{{ getUserPlayCount(user.id) }}</td>
                <td>
                  <span class="status-badge" [class.blocked]="user.blocked">
                    {{ user.blocked ? 'Bloqué' : 'Actif' }}
                  </span>
                </td>
                <td>
                  <div class="action-btns" *ngIf="user.id !== auth.currentUser?.id && user.role !== 'admin'">
                    <button
                      class="action-btn"
                      [class.blocked]="user.blocked"
                      (click)="toggleBlock(user)"
                      [title]="user.blocked ? 'Débloquer' : 'Bloquer'"
                    >{{ user.blocked ? 'Débloquer' : 'Bloquer' }}</button>
                    <button class="action-btn delete" (click)="deleteUser(user)" title="Supprimer">Supprimer</button>
                  </div>
                  <span *ngIf="user.id === auth.currentUser?.id || user.role === 'admin'" style="font-size:0.78rem;color:var(--text-light)">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; background: var(--bg-cream); }
    .sidebar {
      width: 240px; flex-shrink: 0; background: white;
      border-right: 1px solid rgba(232,167,181,0.2);
      position: sticky; top: 72px; height: calc(100vh - 72px);
    }
    .sidebar-logo {
      padding: 24px 20px; display: flex; align-items: center; gap: 10px;
      border-bottom: 1px solid var(--vanilla-glow);
      font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: var(--berry-velvet);
    }
    .sidebar-logo span { font-size: 1.4rem; }
    .sidebar-nav { padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
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
    .users-count { font-size: 0.85rem; color: var(--text-light); }

    .users-table-wrap {
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
    .blocked-row td { opacity: 0.65; }

    .user-cell { display: flex; align-items: center; gap: 10px; }
    .u-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: var(--rose-cloud); color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 700; flex-shrink: 0;
    }
    .user-cell strong { font-size: 0.9rem; color: var(--text-dark); display: block; }
    .you-tag {
      display: inline-block; background: rgba(178,58,93,0.1);
      color: var(--berry-velvet); padding: 1px 7px;
      border-radius: var(--r-full); font-size: 0.7rem; font-weight: 700;
    }
    .role-badge {
      padding: 4px 10px; border-radius: var(--r-full);
      font-size: 0.78rem; font-weight: 600;
      background: rgba(244,230,210,0.6); color: var(--text-mid);
    }
    .role-badge.admin { background: rgba(178,58,93,0.1); color: var(--berry-velvet); }

    .status-badge {
      padding: 4px 10px; border-radius: var(--r-full);
      font-size: 0.78rem; font-weight: 600;
      background: rgba(157,170,119,0.2); color: #3a5a1a;
    }
    .status-badge.blocked { background: rgba(178,58,93,0.1); color: var(--berry-velvet); }

    .action-btns { display: flex; gap: 8px; flex-wrap: wrap; }
    .action-btn {
      min-width: 88px; height: 36px; padding: 0 14px;
      border-radius: var(--r-sm);
      border: 1.5px solid rgba(232,167,181,0.6);
      background: white;
      color: var(--text-dark);
      cursor: pointer; font-size: 0.85rem; font-weight: 600;
      transition: var(--transition);
      display: inline-flex; align-items: center; justify-content: center;
      text-align: center; white-space: nowrap;
    }
    .action-btn:hover {
      transform: translateY(-1px);
      border-color: rgba(178,58,93,0.8);
      background: rgba(178,58,93,0.06);
    }
    .action-btn.delete {
      border-color: rgba(178,58,93,0.25);
      color: var(--berry-velvet);
      background: rgba(178,58,93,0.08);
    }
    .action-btn.delete:hover {
      border-color: var(--berry-velvet);
      background: rgba(178,58,93,0.14);
    }
    .action-btn.blocked {
      border-color: rgba(157,170,119,0.25);
      color: #3a5a1a;
      background: rgba(157,170,119,0.1);
    }
    .action-btn.blocked:hover {
      border-color: #3a5a1a;
      background: rgba(157,170,119,0.16);
    }

    @media (max-width: 900px) { .sidebar { display: none; } }
  `]
})
export class UserManageComponent implements OnInit {
  users: User[] = [];

  constructor(
    private dataService: DataService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.users = this.dataService.getUsers();
  }

  getUserPlayCount(userId: number): number {
    return this.dataService.getUserScores(userId).length;
  }

  toggleBlock(user: User) {
    user.blocked = !user.blocked;
    this.dataService.updateUser(user);
  }

  deleteUser(user: User) {
    if (confirm(`Supprimer le compte de ${user.firstName} ${user.lastName} ?`)) {
      this.dataService.deleteUser(user.id);
      this.users = this.dataService.getUsers();
    }
  }
}
