import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" [class.scrolled]="scrolled">
      <div class="nav-container">
        <a routerLink="/" class="logo">
          <span class="logo-icon"><img src="assets/images/loggo.png" alt="KnowZone Logo"></span>
        </a>

        <div class="nav-links" [class.open]="menuOpen">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" (click)="menuOpen=false">Accueil</a>
          <a routerLink="/quizzes" routerLinkActive="active" (click)="menuOpen=false">Quiz</a>
          <a routerLink="/leaderboard" routerLinkActive="active" (click)="menuOpen=false">Classement</a>
          <a *ngIf="auth.isAdmin" routerLink="/admin" routerLinkActive="active" (click)="menuOpen=false">Administration</a>
        </div>

        <div class="nav-actions">
          <ng-container *ngIf="!auth.isLoggedIn">
            <a routerLink="/login" class="btn btn-ghost btn-sm">Connexion</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">S'inscrire</a>
          </ng-container>
          <ng-container *ngIf="auth.isLoggedIn">
            <div class="user-menu" (click)="userMenuOpen = !userMenuOpen">
              <div class="avatar">{{ initials }}</div>
              <span class="user-name">{{ auth.currentUser?.firstName }}</span>
              <span class="chevron" [class.rotated]="userMenuOpen">▾</span>
              <div class="dropdown" *ngIf="userMenuOpen">
                <div class="dropdown-header">
                  <strong>{{ auth.currentUser?.firstName }} {{ auth.currentUser?.lastName }}</strong>
                  <small>{{ auth.currentUser?.email }}</small>
                </div>
                <a *ngIf="auth.isAdmin" routerLink="/admin" (click)="userMenuOpen=false">
                  ⚙️ Administration
                </a>
                <button (click)="logout()">🚪 Déconnexion</button>
              </div>
            </div>
          </ng-container>

          <button class="hamburger" (click)="menuOpen = !menuOpen" [class.open]="menuOpen">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(253, 248, 245, 0.9);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(232, 167, 181, 0.2);
      transition: all 0.3s ease;
    }
    .navbar.scrolled {
      box-shadow: 0 4px 24px rgba(178, 58, 93, 0.12);
    }
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;         /* empêche le logo de se comprimer */
}

.logo-icon {
  display: flex;
  align-items: center;
}

.logo-icon img {
  height: 64px;           /* plus grand : logo complexe */
  width: auto;
  max-width: none;        /* annule tout max-width global */
  object-fit: contain;
  display: block;
}
   
    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
      justify-content: center;
    }
    .nav-links a {
      padding: 8px 16px;
      border-radius: var(--r-full);
      font-size: 0.92rem;
      font-weight: 500;
      color: var(--text-mid);
      transition: var(--transition);
      text-decoration: none;
    }
    .nav-links a:hover { background:#d8e0be; color: var(--berry-velvet); }
    .nav-links a.active { background: #9daa77; color: var(--berry-velvet); font-weight: 600; }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    .user-menu {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 6px 12px 6px 6px;
      border-radius: var(--r-full);
      border: 1.5px solid var(--rose-cloud);
      transition: var(--transition);
    }
    .user-menu:hover { border-color: var(--berry-velvet); background: var(--vanilla-glow); }
    .avatar {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: var(--berry-velvet);
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.78rem; font-weight: 700;
    }
    .user-name { font-size: 0.88rem; font-weight: 600; color: var(--text-dark); }
    .chevron { font-size: 0.7rem; color: var(--text-light); transition: transform 0.2s; }
    .chevron.rotated { transform: rotate(180deg); }
    .dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: white;
      border-radius: var(--r-md);
      border: 1px solid rgba(232,167,181,0.3);
      box-shadow: 0 8px 32px rgba(178,58,93,0.15);
      min-width: 200px;
      overflow: hidden;
      animation: fadeInUp 0.2s ease;
    }
    .dropdown-header {
      padding: 14px 16px;
      background: var(--vanilla-glow);
      border-bottom: 1px solid rgba(232,167,181,0.2);
      display: flex; flex-direction: column; gap: 2px;
    }
    .dropdown-header strong { font-size: 0.9rem; color: var(--text-dark); }
    .dropdown-header small { font-size: 0.78rem; color: var(--text-light); }
    .dropdown a, .dropdown button {
      display: block; width: 100%;
      padding: 11px 16px;
      font-size: 0.88rem; color: var(--text-mid);
      background: none; border: none; cursor: pointer;
      text-align: left; text-decoration: none;
      transition: background 0.2s;
      font-family: var(--font-body);
    }
    .dropdown a:hover, .dropdown button:hover { background: var(--vanilla-glow); color: var(--berry-velvet); }
    .hamburger {
      display: none;
      flex-direction: column; gap: 5px;
      background: none; border: none; cursor: pointer; padding: 8px;
    }
    .hamburger span {
      display: block; width: 22px; height: 2px;
      background: var(--berry-velvet); border-radius: 2px;
      transition: all 0.3s;
    }
    .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

    @media (max-width: 768px) {
      .hamburger { display: flex; }
      .nav-links {
        display: none;
        position: fixed; top: 72px; left: 0; right: 0;
        background: white; flex-direction: column; padding: 20px;
        border-bottom: 1px solid var(--vanilla-glow);
        box-shadow: 0 8px 24px rgba(178,58,93,0.1);
      }
      .nav-links.open { display: flex; }
      .nav-links a { width: 100%; text-align: center; padding: 12px; }
    }
  `]
})
export class NavbarComponent {
  scrolled = false;
  menuOpen = false;
  userMenuOpen = false;

  constructor(public auth: AuthService, private router: Router) {}

  get initials(): string {
    const u = this.auth.currentUser;
    if (!u) return '';
    return (u.firstName[0] + u.lastName[0]).toUpperCase();
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 20; }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    const target = e.target as HTMLElement;
    if (!target.closest('.user-menu')) this.userMenuOpen = false;
  }

  logout() {
    this.auth.logout();
    this.userMenuOpen = false;
    this.router.navigate(['/']);
  }
}
