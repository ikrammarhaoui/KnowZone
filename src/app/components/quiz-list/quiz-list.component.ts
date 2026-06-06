import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Quiz } from '../../models/quiz.model';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="quiz-list-page">
      <div class="page-header">
        <div class="container">
          <div class="header-content">
            <h1>Tous les <em>Quiz</em></h1>
            <p>{{ filtered.length }} quiz disponibles · Testez vos connaissances en informatique</p>
          </div>
        </div>
      </div>

      <div class="container">
        <!-- FILTERS -->
        <div class="filters-bar">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher un quiz..."
              [(ngModel)]="searchTerm"
              (ngModelChange)="applyFilters()"
              class="search-input"
            />
          </div>
          <div class="filter-group">
            <button
              class="filter-btn"
              [class.active]="activeCategory === ''"
              (click)="setCategory('')"
            >Tout</button>
            <button
              *ngFor="let cat of categories"
              class="filter-btn"
              [class.active]="activeCategory === cat"
              (click)="setCategory(cat)"
            >{{ cat }}</button>
          </div>
          <div class="filter-group">
            <button
              class="filter-btn"
              [class.active]="activeDifficulty === ''"
              (click)="setDifficulty('')"
            >Tous niveaux</button>
            <button
              class="filter-btn easy"
              [class.active]="activeDifficulty === 'Facile'"
              (click)="setDifficulty('Facile')"
            >🟢 Facile</button>
            <button
              class="filter-btn medium"
              [class.active]="activeDifficulty === 'Moyen'"
              (click)="setDifficulty('Moyen')"
            >🟡 Moyen</button>
            <button
              class="filter-btn hard"
              [class.active]="activeDifficulty === 'Difficile'"
              (click)="setDifficulty('Difficile')"
            >🔴 Difficile</button>
          </div>
        </div>

        <!-- GRID -->
        <div class="quizzes-grid" *ngIf="filtered.length > 0">
          <div class="quiz-card" *ngFor="let quiz of filtered" [routerLink]="['/quiz', quiz.id]">
            <div class="quiz-card-header">
              <div class="quiz-meta">
                <span class="quiz-category" [ngClass]="getCategoryClass(quiz.category)">
                  <span class="quiz-category-dot"></span>
                  {{ quiz.category }}
                </span>
                <span class="badge" [ngClass]="'badge-' + getDifficultyClass(quiz.difficulty)">
                  {{ quiz.difficulty }}
                </span>
              </div>
            </div>
            <h3>{{ quiz.title }}</h3>
            <p class="quiz-desc">{{ quiz.description }}</p>
            <div class="quiz-info">
              <span><strong>{{ quiz.questions.length }}</strong> questions</span>
              <span><strong>{{ quiz.duration }}</strong> min</span>
            </div>
            <div class="quiz-cta">
              <span class="cta-text">Voir le quiz</span>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="filtered.length === 0">
          <h3>Aucun quiz trouvé</h3>
          <p>Essayez avec d'autres filtres ou termes de recherche.</p>
          <button class="btn btn-secondary" (click)="resetFilters()">Réinitialiser</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quiz-list-page { padding-bottom: 80px; }
    .page-header {
      background: linear-gradient(135deg, var(--vanilla-glow) 0%, rgba(248,198,160,0.3) 100%);
      padding: 60px 0 40px;
      margin-bottom: 40px;
      border-bottom: 1px solid rgba(232,167,181,0.2);
    }
    .header-content h1 em { font-style: italic; color: var(--berry-velvet); }
    .header-content p { color: var(--text-mid); margin-top: 8px; font-size: 1rem; }

    .filters-bar {
      display: flex; flex-direction: column; gap: 16px;
      margin-bottom: 40px; padding: 24px;
      background: white; border-radius: var(--r-lg);
      border: 1.5px solid rgba(232,167,181,0.2);
      box-shadow: 0 2px 12px var(--shadow);
    }
    .search-box {
      position: relative; max-width: 400px;
    }
    .search-icon {
      position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
      font-size: 0.9rem;
    }
    .search-input {
      width: 100%; padding: 11px 16px 11px 40px;
      border: 2px solid var(--vanilla-glow); border-radius: var(--r-full);
      font-family: var(--font-body); font-size: 0.9rem;
      outline: none; transition: var(--transition);
    }
    .search-input:focus { border-color: var(--berry-velvet); }
    .filter-group { display: flex; flex-wrap: wrap; gap: 8px; }
    .filter-btn {
      padding: 7px 16px; border: 1.5px solid var(--vanilla-glow);
      border-radius: var(--r-full); background: white;
      font-family: var(--font-body); font-size: 0.85rem; font-weight: 500;
      color: var(--text-mid); cursor: pointer; transition: var(--transition);
    }
    .filter-btn:hover { border-color: var(--rose-cloud); color: var(--berry-velvet); }
    .filter-btn.active { background: var(--berry-velvet); color: white; border-color: var(--berry-velvet); }
    .filter-btn.easy.active { background: var(--olive-mist); border-color: var(--olive-mist); }
    .filter-btn.medium.active { background: #d4840a; border-color: #d4840a; }

    .quizzes-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
    }
    .quiz-card {
      background: white; border-radius: var(--r-lg);
      border: 1.5px solid rgba(232,167,181,0.2);
      padding: 24px; cursor: pointer;
      transition: var(--transition);
      display: flex; flex-direction: column; gap: 12px;
    }
    .quiz-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 40px var(--shadow-deep);
      border-color: var(--rose-cloud);
    }
    .quiz-card-header {
      display: flex; justify-content: space-between; align-items: flex-start;
    }
    .quiz-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
    .quiz-category { display: inline-flex; align-items: center; gap: 8px; font-size: 0.75rem; color: var(--text-light); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
    .quiz-category-dot {
      width: 10px; height: 10px; border-radius: 50%;
      display: inline-block; background: var(--berry-velvet);
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.22);
    }
    .category-web .quiz-category-dot { background: #4f86f7; }
    .category-programmation .quiz-category-dot { background: #2a9d8f; }
    .category-algorithmique .quiz-category-dot { background: #f4a261; }
    .category-base-de-donnees .quiz-category-dot { background: #6a67ce; }
    .category-reseaux .quiz-category-dot { background: #e76f51; }
    .category-securite .quiz-category-dot { background: #264653; }
    .quiz-card h3 { font-size: 1rem; color: var(--text-dark); line-height: 1.3; }
    .quiz-desc { font-size: 0.85rem; color: var(--text-light); line-height: 1.5; flex: 1; }
    .quiz-info {
      display: flex; gap: 16px; padding-top: 12px;
      border-top: 1px solid var(--vanilla-glow);
      font-size: 0.82rem; color: var(--text-light);
    }
    .quiz-info strong { color: var(--text-dark); }
    .quiz-cta { text-align: right; }
    .cta-text { font-size: 0.85rem; font-weight: 600; color: var(--berry-velvet); }

    .empty-state {
      text-align: center; padding: 80px 20px;
      display: flex; flex-direction: column; align-items: center; gap: 16px;
    }
    .empty-state span { font-size: 3rem; }
    .empty-state h3 { color: var(--text-dark); }
    .empty-state p { color: var(--text-light); }

    @media (max-width: 1024px) { .quizzes-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .quizzes-grid { grid-template-columns: 1fr; } }
  `]
})
export class QuizListComponent implements OnInit {
  all: Quiz[] = [];
  filtered: Quiz[] = [];
  searchTerm = '';
  activeCategory = '';
  activeDifficulty = '';
  categories = ['Web', 'Programmation', 'Algorithmique', 'Base de données', 'Réseaux', 'Sécurité'];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.all = this.dataService.getPublishedQuizzes();
    this.filtered = [...this.all];
  }

  setCategory(cat: string) {
    this.activeCategory = cat;
    this.applyFilters();
  }

  setDifficulty(d: string) {
    this.activeDifficulty = d;
    this.applyFilters();
  }

  applyFilters() {
    this.filtered = this.all.filter(q => {
      const matchSearch = !this.searchTerm ||
        q.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        q.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCat = !this.activeCategory || q.category === this.activeCategory;
      const matchDiff = !this.activeDifficulty || q.difficulty === this.activeDifficulty;
      return matchSearch && matchCat && matchDiff;
    });
  }

  resetFilters() {
    this.searchTerm = '';
    this.activeCategory = '';
    this.activeDifficulty = '';
    this.filtered = [...this.all];
  }

  getCategoryClass(category: string): string {
    const map: Record<string, string> = {
      Web: 'category-web',
      Programmation: 'category-programmation',
      Algorithmique: 'category-algorithmique',
      'Base de données': 'category-base-de-donnees',
      Réseaux: 'category-reseaux',
      Sécurité: 'category-securite'
    };
    return map[category] || 'category-default';
  }

  getDifficultyClass(d: string): string {
    return d === 'Facile' ? 'easy' : d === 'Moyen' ? 'medium' : 'hard';
  }
}
