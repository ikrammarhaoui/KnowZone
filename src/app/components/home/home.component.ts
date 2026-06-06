import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Quiz } from '../../models/quiz.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home">
      <!-- HERO -->
      <section class="hero">
        <div class="hero-bg">
          <div class="blob blob-1"></div>
          <div class="blob blob-2"></div>
          <div class="dots-grid"></div>
        </div>
        <div class="container">
          <div class="hero-content animate-fade-up">
            <div class="hero-badge">Plateforme éducative · Informatique</div>
            <h1>Testez & Renforcez<br><em>vos connaissances</em></h1>
            <p class="hero-desc">
              Des quiz interactifs et chronométrés sur les fondamentaux de l'informatique.
              Progressez, compétitionnez et suivez vos performances en temps réel.
            </p>
            <div class="hero-cta">
              <a routerLink="/quizzes" class="btn btn-primary btn-lg">
                Découvrir les Quiz
              </a>
              <a routerLink="/leaderboard" class="btn btn-secondary btn-lg">
                Classement
              </a>
            </div>
            <div class="hero-stats">
              <div class="stat">
                <strong>{{ stats.totalQuizzes }}</strong>
                <span>Quiz disponibles</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat">
                <strong>{{ stats.totalUsers }}</strong>
                <span>Apprenants</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat">
                <strong>{{ stats.totalPlays }}</strong>
                <span>Parties jouées</span>
              </div>
            </div>
          </div>
          <div class="hero-visual">
            <div class="motivation-card">
              <div class="motivation-tag">Pourquoi faire des quiz ?</div>
              <h3>Chaque quiz te rapproche d'une meilleure maîtrise</h3>
              <p>Renforce ta confiance, valide tes connaissances et transforme chaque erreur en progrès concret.</p>
              <ul class="motivation-list">
                <li><strong>Apprendre plus vite :</strong> des formats courts pour rester motivé.</li>
                <li><strong>Voir son évolution :</strong> des résultats clairs à chaque session.</li>
                <li><strong>Préparer ton avenir :</strong> mieux retenir l'informatique et réussir tes projets.</li>
              </ul>
              <div class="motivation-footer">Un peu de pratique aujourd’hui, beaucoup de confiance demain.</div>
            </div>
          </div>
        </div>
      </section>

      <!-- CATEGORIES -->
      <section class="categories-section">
        <div class="container">
          <h2 class="section-title">Explorez par <em>catégorie</em></h2>
          <div class="categories-grid">
            <div class="cat-card" *ngFor="let cat of categories" [routerLink]="['/quizzes']">
              <strong>{{ cat.name }}</strong>
              <span class="cat-count">{{ cat.count }} quiz</span>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURED QUIZZES -->
      <section class="featured-section">
        <div class="container">
          <div class="section-header">
            <h2>Quiz <em>populaires</em></h2>
            <a routerLink="/quizzes" class="btn btn-ghost">Voir tout</a>
          </div>
          <div class="quizzes-grid">
            <div class="quiz-card" *ngFor="let quiz of featuredQuizzes" [routerLink]="['/quiz', quiz.id]">
              <div class="quiz-card-top">
                <span class="quiz-emoji">{{ quiz.image }}</span>
                <span class="badge" [ngClass]="'badge-' + getDifficultyClass(quiz.difficulty)">
                  {{ quiz.difficulty }}
                </span>
              </div>
              <div class="quiz-card-body">
                <h3>{{ quiz.title }}</h3>
                <p>{{ quiz.description }}</p>
              </div>
              <div class="quiz-card-footer">
                <span>{{ quiz.questions.length }} questions</span>
                <span>{{ quiz.duration }} min</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS -->
      <section class="how-section">
        <div class="container">
          <h2 class="section-title">Comment ça <em>fonctionne</em> ?</h2>
          <div class="steps-grid">
            <div class="step" *ngFor="let step of steps; let i = index">
              <div class="step-num">{{ i + 1 }}</div>
              <strong>{{ step.title }}</strong>
              <p>{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA BANNER -->
      <section class="cta-banner" *ngIf="!auth.isLoggedIn">
        <div class="container">
          <div class="cta-content">
            <h2>Prêt à tester vos connaissances ?</h2>
            <p>Créez votre compte gratuitement et rejoignez la communauté.</p>
            <a routerLink="/register" class="btn btn-primary btn-lg">Commencer maintenant</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home { overflow: hidden; }

    /* HERO */
    .hero {
      position: relative;
      padding: 80px 0 100px;
      overflow: hidden;
    }
    .hero-bg {
      position: absolute; inset: 0; z-index: 0;
      background: linear-gradient(135deg, var(--vanilla-glow) 0%, white 60%, rgba(248,198,160,0.3) 100%);
    }
    .blob {
      position: absolute; border-radius: 50%;
      filter: blur(60px); opacity: 0.4;
    }
    .blob-1 {
      width: 400px; height: 400px;
      background: var(--rose-cloud);
      top: -100px; right: -100px;
    }
    .blob-2 {
      width: 300px; height: 300px;
      background: var(--peach-whip);
      bottom: -50px; left: 10%;
    }
    .dots-grid {
      position: absolute; inset: 0;
      background: #B23A5D;
    }
    .hero .container {
      position: relative; z-index: 1;
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 60px; align-items: center;
      max-width: 1200px; margin: 0 auto; padding: 0 24px;
    }
    .hero-badge {
      display: inline-flex; align-items: center;
      background: rgba(255,255,255,0.15);
      color: white;
      padding: 6px 16px; border-radius: var(--r-full);
      font-size: 0.85rem; font-weight: 600; margin-bottom: 20px;
    }
    .hero-content h1 {
      color: white;
      margin-bottom: 20px;
      line-height: 1.15;
    }
    .hero-content h1 em {
      font-style: italic; color: rgba(255,255,255,0.95);
    }
    .hero-desc {
      font-size: 1.05rem; color: rgba(255,255,255,0.86);
      line-height: 1.7; margin-bottom: 32px;
      max-width: 460px;
    }
    .hero-cta { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 40px; }
    .hero-stats {
      display: flex; align-items: center; gap: 24px;
    }
    .stat { display: flex; flex-direction: column; }
    .stat strong { font-size: 1.8rem; font-weight: 700; color: white; line-height: 1; }
    .stat span { font-size: 0.82rem; color: rgba(255,255,255,0.72); margin-top: 4px; }
    .stat-divider { width: 1px; height: 40px; background: var(--rose-cloud); }

    /* Motivation card */
    .motivation-card {
      background: white;
      border-radius: var(--r-xl);
      padding: 28px;
      box-shadow: 0 20px 60px rgba(178,58,93,0.18);
      border: 1px solid rgba(232,167,181,0.3);
      max-width: 380px;
      margin: 0 auto;
      animation: float 4s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .motivation-tag {
      display: inline-flex;
      color: var(--berry-velvet);
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      font-weight: 700;
      margin-bottom: 14px;
    }
    .motivation-card h3 {
      margin: 0 0 14px;
      color: var(--text-dark);
      font-size: 1.25rem;
      line-height: 1.25;
    }
    .motivation-card p {
      margin: 0 0 18px;
      color: var(--text-mid);
      line-height: 1.7;
      font-size: 0.95rem;
    }
    .motivation-list {
      list-style: none;
      padding: 0;
      margin: 0 0 18px;
      display: grid;
      gap: 12px;
    }
    .motivation-list li {
      padding: 12px 14px;
      border-radius: var(--r-lg);
      background: rgba(248,198,160,0.15);
      color: var(--text-dark);
      font-size: 0.95rem;
      line-height: 1.5;
    }
    .motivation-list li strong { color: var(--berry-velvet); }
    .motivation-footer {
      font-size: 0.9rem;
      color: var(--text-light);
      border-top: 1px solid rgba(232,167,181,0.25);
      padding-top: 14px;
    }

    /* CATEGORIES */
    .categories-section { padding: 80px 0; }
    .section-title {
      text-align: center; margin-bottom: 48px;
    }
    .section-title em { font-style: italic; color: var(--berry-velvet); }
    .categories-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .cat-card {
      background: white; border-radius: var(--r-lg);
      padding: 28px 20px; text-align: center;
      border: 2px solid rgba(232,167,181,0.2);
      cursor: pointer; transition: var(--transition);
      display: flex; flex-direction: column; align-items: center; gap: 10px;
    }
    .cat-card:hover { border-color: var(--berry-velvet); transform: translateY(-4px); box-shadow: 0 8px 32px var(--shadow); }
    .cat-icon { font-size: 2rem; }
    .cat-card strong { font-size: 0.95rem; color: var(--text-dark); }
    .cat-count { font-size: 0.8rem; color: var(--text-light); }

    /* FEATURED */
    .featured-section {
      padding: 80px 0;
      background: linear-gradient(180deg, white 0%, var(--vanilla-glow) 100%);
    }
    .section-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 40px;
    }
    .section-header h2 em { font-style: italic; color: var(--berry-velvet); }
    .quizzes-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
    }
    .quiz-card {
      background: white; border-radius: var(--r-lg);
      border: 1.5px solid rgba(232,167,181,0.2);
      cursor: pointer; transition: var(--transition); overflow: hidden;
      display: flex; flex-direction: column;
    }
    .quiz-card:hover { transform: translateY(-6px); box-shadow: 0 12px 40px var(--shadow-deep); border-color: var(--rose-cloud); }
    .quiz-card-top {
      padding: 24px 24px 16px;
      display: flex; justify-content: space-between; align-items: flex-start;
    }
    .quiz-emoji { font-size: 2.2rem; }
    .quiz-card-body { padding: 0 24px 16px; flex: 1; }
    .quiz-card-body h3 { font-size: 1rem; margin-bottom: 8px; color: var(--text-dark); }
    .quiz-card-body p { font-size: 0.85rem; color: var(--text-light); line-height: 1.5; }
    .quiz-card-footer {
      padding: 14px 24px;
      border-top: 1px solid var(--vanilla-glow);
      display: flex; gap: 16px;
      font-size: 0.82rem; color: var(--text-light);
    }

    /* HOW IT WORKS */
    .how-section { padding: 80px 0; }
    .steps-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
    }
    .step {
      text-align: center; padding: 32px 20px;
      background: white; border-radius: var(--r-lg);
      border: 1.5px solid rgba(232,167,181,0.2);
      display: flex; flex-direction: column; align-items: center; gap: 12px;
    }
    .step-num {
      width: 36px; height: 36px; border-radius: 50%;
      background: var(--berry-velvet); color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.9rem;
    }
    .step-icon { font-size: 2rem; }
    .step strong { color: var(--text-dark); font-size: 0.95rem; }
    .step p { font-size: 0.83rem; color: var(--text-light); line-height: 1.5; }

    /* CTA BANNER */
    .cta-banner {
      padding: 80px 0;
      background: linear-gradient(135deg, var(--berry-velvet), var(--berry-light));
    }
    .cta-content {
      text-align: center; color: white;
    }
    .cta-content h2 { color: white; margin-bottom: 12px; }
    .cta-content p { color: rgba(255,255,255,0.8); margin-bottom: 32px; font-size: 1.05rem; }
    .cta-content .btn-primary {
      background: white; color: var(--berry-velvet);
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
    .cta-content .btn-primary:hover { background: var(--vanilla-glow); }

    @media (max-width: 1024px) {
      .hero .container { grid-template-columns: 1fr; text-align: center; }
      .hero-desc { margin: 0 auto 32px; }
      .hero-cta { justify-content: center; }
      .hero-stats { justify-content: center; }
      .hero-visual { display: none; }
      .categories-grid { grid-template-columns: repeat(2, 1fr); }
      .quizzes-grid { grid-template-columns: repeat(2, 1fr); }
      .steps-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .categories-grid, .quizzes-grid, .steps-grid { grid-template-columns: 1fr; }
      .hero { padding: 48px 0 64px; }
    }
  `]
})
export class HomeComponent implements OnInit {
  featuredQuizzes: Quiz[] = [];
  stats = { totalQuizzes: 0, totalUsers: 0, totalPlays: 0 };

  categories = [
    { icon: '', name: 'Web', count: 0 },
    { icon: '', name: 'Programmation', count: 0 },
    { icon: '', name: 'Algorithmique', count: 0 },
    { icon: '', name: 'Base de données', count: 0 },
    { icon: '', name: 'Réseaux', count: 0 },
    { icon: '', name: 'Sécurité', count: 0 }
  ];

  steps = [
    { icon: '', title: 'Créez un compte', desc: 'Inscrivez-vous en quelques secondes pour accéder à tous les quiz.' },
    { icon: '', title: 'Choisissez un quiz', desc: 'Parcourez les catégories et niveaux selon vos besoins.' },
    { icon: '', title: 'Jouez chrono', desc: 'Répondez aux questions avec un timer. Chaque seconde compte !' },
    { icon: '', title: 'Compétitionnez', desc: 'Comparez votre score avec les autres sur le leaderboard global.' }
  ];

  constructor(
    private dataService: DataService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    const quizzes = this.dataService.getPublishedQuizzes();
    this.featuredQuizzes = quizzes.slice(0, 3);
    this.stats = this.dataService.getStats();

    // Count by category
    this.categories.forEach(cat => {
      cat.count = quizzes.filter(q => q.category === cat.name).length;
    });
  }

  getDifficultyClass(d: string): string {
    return d === 'Facile' ? 'easy' : d === 'Moyen' ? 'medium' : 'hard';
  }
}
