import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="blob b1"></div>
        <div class="blob b2"></div>
      </div>
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">Quiz</div>
          <h1>Connexion</h1>
          <p>Bienvenue ! Entrez vos identifiants pour continuer.</p>
        </div>

        <form (ngSubmit)="submit()" class="auth-form">
          <div class="form-group">
            <label class="form-label">Adresse e-mail</label>
            <input
              type="email" [(ngModel)]="email" name="email"
              class="form-input" placeholder="votre@email.com"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">Mot de passe</label>
            <div class="input-wrap">
              <input
                [type]="showPwd ? 'text' : 'password'"
                [(ngModel)]="password" name="password"
                class="form-input" placeholder="••••••••"
                required
              />
              <button type="button" class="toggle-pwd" (click)="showPwd = !showPwd">
                {{ showPwd ? 'Masquer' : 'Afficher' }}
              </button>
            </div>
          </div>

          <div class="error-msg" *ngIf="error">{{ error }}</div>

          <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;" [disabled]="loading">
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Pas encore de compte ? <a routerLink="/register">S'inscrire</a></p>
        </div>

        <!-- Demo credentials -->
        <div class="demo-creds">
          <p class="demo-title">Comptes démo :</p>
          <button class="demo-btn" (click)="fillDemo('user')">Utilisateur</button>
          <button class="demo-btn" (click)="fillDemo('admin')">Admin</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 40px 24px; position: relative; overflow: hidden;
      background: linear-gradient(160deg, var(--vanilla-glow) 0%, white 60%);
    }
    .auth-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
    .blob {
      position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4;
    }
    .b1 { width: 500px; height: 500px; background: var(--rose-cloud); top: -150px; right: -100px; }
    .b2 { width: 400px; height: 400px; background: var(--peach-whip); bottom: -100px; left: -100px; }

    .auth-card {
      position: relative; z-index: 1;
      background: white; border-radius: var(--r-xl);
      padding: 48px; width: 100%; max-width: 440px;
      box-shadow: 0 20px 60px rgba(178,58,93,0.15);
      border: 1.5px solid rgba(232,167,181,0.3);
      animation: fadeInUp 0.5s ease;
    }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-logo { font-size: 3rem; margin-bottom: 12px; }
    .auth-header h1 { font-size: 1.8rem; color: var(--text-dark); margin-bottom: 8px; }
    .auth-header p { color: var(--text-light); font-size: 0.9rem; }

    .auth-form { display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px; }
    .input-wrap { position: relative; }
    .input-wrap .form-input { padding-right: 44px; width: 100%; }
    .toggle-pwd {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; font-size: 1rem;
    }

    .error-msg {
      background: rgba(178,58,93,0.08); border: 1.5px solid rgba(178,58,93,0.2);
      color: var(--berry-velvet); padding: 10px 14px;
      border-radius: var(--r-md); font-size: 0.87rem; font-weight: 500;
    }

    .auth-footer { text-align: center; font-size: 0.88rem; color: var(--text-light); }
    .auth-footer a { color: var(--berry-velvet); font-weight: 600; }

    .demo-creds {
      margin-top: 20px; padding: 16px;
      background: var(--vanilla-glow); border-radius: var(--r-md);
      display: flex; align-items: center; flex-wrap: wrap; gap: 10px;
    }
    .demo-title { font-size: 0.82rem; color: var(--text-light); font-weight: 600; flex-basis: 100%; }
    .demo-btn {
      padding: 7px 16px; border: 1.5px solid var(--rose-cloud);
      border-radius: var(--r-full); background: white;
      font-size: 0.82rem; font-family: var(--font-body); cursor: pointer;
      color: var(--text-mid); transition: var(--transition);
    }
    .demo-btn:hover { background: var(--berry-velvet); color: white; border-color: var(--berry-velvet); }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;
  showPwd = false;

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn) this.router.navigate(['/']);
  }

  submit() {
    if (!this.email || !this.password) { this.error = 'Veuillez remplir tous les champs.'; return; }
    this.loading = true;
    this.error = '';
    setTimeout(() => {
      const result = this.auth.login(this.email, this.password);
      if (result.success) {
        this.router.navigate([this.auth.isAdmin ? '/admin' : '/quizzes']);
      } else {
        this.error = result.message;
      }
      this.loading = false;
    }, 600);
  }

  fillDemo(role: 'user' | 'admin') {
    if (role === 'admin') { this.email = 'admin@quiz.ma'; this.password = 'Admin123'; }
    else { this.email = 'ikram@example.com'; this.password = 'User1234'; }
  }
}
