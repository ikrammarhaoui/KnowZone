import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
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
          <div class="auth-logo">Inscription</div>
          <h1>Créer un compte</h1>
          <p>Rejoignez la communauté et commencez à apprendre.</p>
        </div>

        <form (ngSubmit)="submit()" class="auth-form">
          <div class="name-row">
            <div class="form-group">
              <label class="form-label">Prénom</label>
              <input type="text" [(ngModel)]="firstName" name="firstName" class="form-input" placeholder="Ikram" required />
            </div>
            <div class="form-group">
              <label class="form-label">Nom</label>
              <input type="text" [(ngModel)]="lastName" name="lastName" class="form-input" placeholder="Marhaoui" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Adresse e-mail</label>
            <input type="email" [(ngModel)]="email" name="email" class="form-input" placeholder="votre@email.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">Mot de passe</label>
            <div class="input-wrap">
              <input
                [type]="showPwd ? 'text' : 'password'"
                [(ngModel)]="password" name="password"
                class="form-input" placeholder="••••••••" required
              />
              <button type="button" class="toggle-pwd" (click)="showPwd = !showPwd">
                {{ showPwd ? 'Masquer' : 'Afficher' }}
              </button>
            </div>
            <div class="pwd-requirements">
              <span [class.met]="password.length >= 8">✓ 8 caractères min.</span>
              <span [class.met]="hasUpper">✓ 1 majuscule</span>
              <span [class.met]="hasDigit">✓ 1 chiffre</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Confirmer le mot de passe</label>
            <input
              [type]="showPwd ? 'text' : 'password'"
              [(ngModel)]="confirm" name="confirm"
              class="form-input" [class.error]="confirm && confirm !== password"
              placeholder="••••••••" required
            />
            <span class="form-error" *ngIf="confirm && confirm !== password">
              Les mots de passe ne correspondent pas
            </span>
          </div>

          <div class="error-msg" *ngIf="error">{{ error }}</div>
          <div class="success-msg" *ngIf="success">{{ success }}</div>

          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center" [disabled]="loading || !formValid">
            {{ loading ? 'Création...' : 'Créer mon compte' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Déjà un compte ? <a routerLink="/login">Se connecter</a></p>
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
    .blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; }
    .b1 { width: 500px; height: 500px; background: var(--peach-whip); top: -150px; left: -100px; }
    .b2 { width: 400px; height: 400px; background: var(--rose-cloud); bottom: -100px; right: -100px; }

    .auth-card {
      position: relative; z-index: 1;
      background: white; border-radius: var(--r-xl);
      padding: 48px; width: 100%; max-width: 480px;
      box-shadow: 0 20px 60px rgba(178,58,93,0.15);
      border: 1.5px solid rgba(232,167,181,0.3);
      animation: fadeInUp 0.5s ease;
    }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-logo { font-size: 3rem; margin-bottom: 12px; }
    .auth-header h1 { font-size: 1.8rem; margin-bottom: 8px; }
    .auth-header p { color: var(--text-light); font-size: 0.9rem; }

    .auth-form { display: flex; flex-direction: column; gap: 18px; margin-bottom: 24px; }
    .name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .auth-form .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid rgba(178,58,93,0.2);
      border-radius: var(--r-md);
      background: white;
      color: var(--text-dark);
      transition: var(--transition);
    }
    .auth-form .form-input::placeholder {
      color: rgba(45,26,34,0.45);
    }
    .auth-form .form-input:focus {
      outline: none;
      border-color: var(--berry-velvet);
      box-shadow: 0 0 0 4px rgba(178,58,93,0.1);
    }
    .input-wrap { position: relative; }
    .input-wrap .form-input { padding-right: 44px; width: 100%; }
    .toggle-pwd {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; font-size: 1rem;
    }
    .pwd-requirements {
      display: flex; gap: 12px; flex-wrap: wrap; margin-top: 6px;
    }
    .pwd-requirements span {
      font-size: 0.77rem; color: var(--text-light); font-weight: 500;
      transition: color 0.2s;
    }
    .pwd-requirements span.met { color: var(--olive-mist); }

    .error-msg {
      background: rgba(178,58,93,0.08); border: 1.5px solid rgba(178,58,93,0.2);
      color: var(--berry-velvet); padding: 10px 14px;
      border-radius: var(--r-md); font-size: 0.87rem;
    }
    .success-msg {
      background: rgba(157,170,119,0.15); border: 1.5px solid var(--olive-mist);
      color: #3a5a1a; padding: 10px 14px;
      border-radius: var(--r-md); font-size: 0.87rem;
    }
    .auth-footer { text-align: center; font-size: 0.88rem; color: var(--text-light); }
    .auth-footer a { color: var(--berry-velvet); font-weight: 600; }
  `]
})
export class RegisterComponent {
  firstName = ''; lastName = ''; email = ''; password = ''; confirm = '';
  error = ''; success = ''; loading = false; showPwd = false;

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn) this.router.navigate(['/']);
  }

  get hasUpper() { return /[A-Z]/.test(this.password); }
  get hasDigit() { return /[0-9]/.test(this.password); }
  get formValid() {
    return this.firstName && this.lastName && this.email &&
      this.password.length >= 8 && this.hasUpper && this.hasDigit &&
      this.password === this.confirm;
  }

  submit() {
    if (!this.formValid) { this.error = 'Veuillez corriger les erreurs.'; return; }
    this.loading = true; this.error = '';
    setTimeout(() => {
      const result = this.auth.register(this.firstName, this.lastName, this.email, this.password);
      if (result.success) {
        this.success = result.message;
        setTimeout(() => this.router.navigate(['/quizzes']), 1200);
      } else {
        this.error = result.message;
      }
      this.loading = false;
    }, 600);
  }
}
