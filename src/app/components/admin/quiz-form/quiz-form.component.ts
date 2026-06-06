import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { Quiz, Question } from '../../../models/quiz.model';

@Component({
  selector: 'app-quiz-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="admin-layout">
      <aside class="sidebar">
        <div class="sidebar-logo"><strong>Admin Panel</strong></div>
        <nav class="sidebar-nav">
          <a routerLink="/admin">Tableau de bord</a>
          <a routerLink="/admin/quizzes">Gestion des Quiz</a>
          <a routerLink="/admin/quiz/new" class="active">Créer un Quiz</a>
          <a routerLink="/admin/users">Utilisateurs</a>
          <div class="sidebar-divider"></div>
          <a routerLink="/" class="sidebar-back">Retour au site</a>
        </nav>
      </aside>

      <main class="admin-main">
        <div class="admin-topbar">
          <h2>{{ isEdit ? 'Modifier le quiz' : 'Créer un quiz' }}</h2>
          <div class="topbar-actions">
            <button class="btn btn-secondary btn-sm" (click)="saveDraft()">Brouillon</button>
            <button class="btn btn-primary btn-sm" (click)="publish()">Publier</button>
          </div>
        </div>

        <!-- Global error -->
        <div class="form-error-banner" *ngIf="globalError">{{ globalError }}</div>
        <div class="form-success-banner" *ngIf="successMsg">{{ successMsg }}</div>

        <!-- Quiz Info -->
        <div class="form-section">
          <h3>Informations générales</h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Titre du quiz *</label>
              <input type="text" [(ngModel)]="quiz.title" class="form-input" placeholder="Ex: JavaScript Avancé" />
            </div>
            <div class="form-group">
              <label class="form-label">Emoji / Image *</label>
              <input type="text" [(ngModel)]="quiz.image" class="form-input" placeholder="Ex: ⚡" maxlength="4" />
            </div>
            <div class="form-group">
              <label class="form-label">Catégorie *</label>
              <select [(ngModel)]="quiz.category" class="form-select">
                <option value="">— Choisir —</option>
                <option *ngFor="let c of categories">{{ c }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Niveau de difficulté *</label>
              <select [(ngModel)]="quiz.difficulty" class="form-select">
                <option value="">— Choisir —</option>
                <option>Facile</option>
                <option>Moyen</option>
                <option>Difficile</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Durée (minutes) *</label>
              <input type="number" [(ngModel)]="quiz.duration" class="form-input" min="1" max="60" placeholder="10" />
            </div>
            <div class="form-group full">
              <label class="form-label">Description *</label>
              <textarea [(ngModel)]="quiz.description" class="form-textarea" rows="3" placeholder="Décrivez le contenu du quiz..."></textarea>
            </div>
          </div>
        </div>

        <!-- Questions -->
        <div class="form-section">
          <div class="section-header">
            <h3>Questions <span class="q-count">{{ quiz.questions.length }} / min. 5</span></h3>
            <button class="btn btn-secondary btn-sm" (click)="addQuestion()">+ Ajouter une question</button>
          </div>

          <div class="questions-list">
            <div class="question-form" *ngFor="let q of quiz.questions; let i = index">
              <div class="qf-header">
                <span class="qf-num">Q{{ i + 1 }}</span>
                <select [(ngModel)]="q.type" class="form-select type-select" (ngModelChange)="onTypeChange(q)">
                  <option value="qcm">QCM (1 bonne réponse)</option>
                  <option value="multiple">Choix multiple</option>
                  <option value="vf">Vrai / Faux</option>
                </select>
                <button class="delete-q-btn" (click)="removeQuestion(i)" title="Supprimer">✕</button>
              </div>

              <div class="form-group">
                <label class="form-label">Énoncé de la question *</label>
                <textarea [(ngModel)]="q.question" class="form-textarea" rows="2" placeholder="Formulez votre question ici..."></textarea>
              </div>

              <!-- Options -->
              <div class="options-section">
                <label class="form-label">Réponses * <small>(cochez la/les bonne(s))</small></label>
                <div class="option-row" *ngFor="let opt of q.options; let oi = index">
                  <input
                    type="checkbox"
                    [checked]="q.correct.includes(oi)"
                    (change)="toggleCorrect(q, oi)"
                    class="opt-check"
                    [disabled]="q.type === 'qcm' || q.type === 'vf'"
                    [class.single]="q.type === 'qcm' || q.type === 'vf'"
                  />
                  <ng-container *ngIf="q.type === 'qcm' || q.type === 'multiple'">
                    <input
                      type="radio" *ngIf="q.type === 'qcm'"
                      [name]="'correct_' + i"
                      [checked]="q.correct.includes(oi)"
                      (change)="setCorrect(q, oi)"
                      class="opt-radio"
                    />
                    <input
                      type="checkbox" *ngIf="q.type === 'multiple'"
                      [checked]="q.correct.includes(oi)"
                      (change)="toggleCorrect(q, oi)"
                      class="opt-radio"
                    />
                  </ng-container>
                  <input
                    type="text" [(ngModel)]="q.options[oi]" class="form-input opt-input"
                    [placeholder]="'Option ' + (oi + 1)"
                    [disabled]="q.type === 'vf'"
                  />
                  <button
                    class="remove-opt-btn"
                    (click)="removeOption(q, oi)"
                    *ngIf="q.type !== 'vf' && q.options.length > 2"
                  >✕</button>
                </div>
                <button
                  class="btn btn-ghost btn-sm add-opt-btn"
                  (click)="addOption(q)"
                  *ngIf="q.type !== 'vf' && q.options.length < 5"
                >+ Ajouter une option</button>
              </div>

              <div class="form-group">
                <label class="form-label">Explication pédagogique * <small>(obligatoire)</small></label>
                <textarea [(ngModel)]="q.explanation" class="form-textarea" rows="2"
                  placeholder="Expliquez pourquoi cette réponse est correcte..."></textarea>
              </div>
            </div>

            <div class="empty-questions" *ngIf="quiz.questions.length === 0">
              <span></span>
              <p>Aucune question. Cliquez sur "Ajouter une question" pour commencer.</p>
            </div>
          </div>
        </div>

        <!-- Bottom actions -->
        <div class="bottom-actions">
          <a routerLink="/admin/quizzes" class="btn btn-ghost">Annuler</a>
          <button class="btn btn-secondary" (click)="saveDraft()">Enregistrer en brouillon</button>
          <button class="btn btn-primary" (click)="publish()">Publier le quiz</button>
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

    .admin-main { flex: 1; padding: 32px; display: flex; flex-direction: column; gap: 24px; }
    .admin-topbar { display: flex; justify-content: space-between; align-items: center; }
    .admin-topbar h2 { font-size: 1.6rem; color: var(--text-dark); }
    .topbar-actions { display: flex; gap: 10px; }

    .form-error-banner {
      background: rgba(178,58,93,0.1); border: 1.5px solid rgba(178,58,93,0.3);
      color: var(--berry-velvet); padding: 12px 16px; border-radius: var(--r-md);
      font-weight: 500;
    }
    .form-success-banner {
      background: rgba(157,170,119,0.15); border: 1.5px solid var(--olive-mist);
      color: #3a5a1a; padding: 12px 16px; border-radius: var(--r-md); font-weight: 500;
    }

    .form-section {
      background: white; border-radius: var(--r-lg);
      padding: 28px; border: 1.5px solid rgba(232,167,181,0.2);
      box-shadow: 0 2px 12px var(--shadow);
    }
    .form-section h3 { margin-bottom: 20px; font-size: 1rem; color: var(--text-dark); }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .q-count { font-size: 0.82rem; color: var(--text-light); font-family: var(--font-body); font-weight: 400; margin-left: 8px; }

    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .form-grid .full { grid-column: 1 / -1; }
    .form-textarea { width: 100%; resize: vertical; }

    /* Questions */
    .questions-list { display: flex; flex-direction: column; gap: 20px; }
    .question-form {
      border: 1.5px solid rgba(232,167,181,0.3); border-radius: var(--r-lg);
      padding: 24px; background: var(--bg-cream);
      display: flex; flex-direction: column; gap: 16px;
    }
    .qf-header { display: flex; align-items: center; gap: 12px; }
    .qf-num {
      min-width: 36px; height: 36px; border-radius: 50%;
      background: var(--berry-velvet); color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 700; flex-shrink: 0;
    }
    .type-select { flex: 1; }
    .delete-q-btn {
      width: 32px; height: 32px; border-radius: 50%;
      border: 1.5px solid rgba(178,58,93,0.3);
      background: white; cursor: pointer;
      color: var(--berry-velvet); font-size: 0.8rem; transition: var(--transition);
    }
    .delete-q-btn:hover { background: var(--berry-velvet); color: white; }

    .options-section { display: flex; flex-direction: column; gap: 8px; }
    .options-section label small { color: var(--text-light); font-weight: 400; }
    .option-row { display: flex; align-items: center; gap: 10px; }
    .opt-radio { flex-shrink: 0; accent-color: var(--berry-velvet); width: 16px; height: 16px; }
    .opt-input { flex: 1; }
    .remove-opt-btn {
      width: 28px; height: 28px; border-radius: 50%;
      border: 1px solid var(--vanilla-glow); background: white;
      cursor: pointer; font-size: 0.72rem; color: var(--text-light);
      flex-shrink: 0; transition: var(--transition);
    }
    .remove-opt-btn:hover { border-color: var(--berry-velvet); color: var(--berry-velvet); }
    .add-opt-btn { align-self: flex-start; margin-top: 4px; }

    .empty-questions { text-align: center; padding: 40px; color: var(--text-light); }
    .empty-questions span { font-size: 2rem; display: block; margin-bottom: 8px; }

    .bottom-actions {
      display: flex; justify-content: flex-end; gap: 12px;
      padding: 20px 0;
    }

    @media (max-width: 900px) { .sidebar { display: none; } }
    @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class QuizFormComponent implements OnInit {
  isEdit = false;
  globalError = '';
  successMsg = '';

  quiz: Quiz = {
    id: 0,
    title: '',
    description: '',
    category: '',
    difficulty: 'Facile',
    duration: 10,
    image: '',
    published: false,
    createdAt: new Date().toISOString().split('T')[0],
    questions: []
  };

  categories = ['Web', 'Programmation', 'Algorithmique', 'Base de données', 'Réseaux', 'Sécurité'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      const existing = this.dataService.getQuizById(Number(id));
      if (existing) this.quiz = { ...existing, questions: existing.questions.map(q => ({ ...q, options: [...q.options], correct: [...q.correct] })) };
    }
  }

  addQuestion() {
    const newQ: Question = {
      id: this.quiz.questions.length + 1,
      type: 'qcm',
      question: '',
      options: ['', '', '', ''],
      correct: [],
      explanation: ''
    };
    this.quiz.questions.push(newQ);
  }

  removeQuestion(i: number) {
    this.quiz.questions.splice(i, 1);
  }

  onTypeChange(q: Question) {
    if (q.type === 'vf') {
      q.options = ['Vrai', 'Faux'];
      q.correct = [];
    } else if (q.options.length < 2) {
      q.options = ['', '', '', ''];
    }
    q.correct = [];
  }

  setCorrect(q: Question, i: number) {
    q.correct = [i];
  }

  toggleCorrect(q: Question, i: number) {
    const idx = q.correct.indexOf(i);
    if (idx >= 0) q.correct.splice(idx, 1);
    else q.correct.push(i);
  }

  addOption(q: Question) {
    if (q.options.length < 5) q.options.push('');
  }

  removeOption(q: Question, i: number) {
    q.options.splice(i, 1);
    q.correct = q.correct.filter(c => c !== i).map(c => c > i ? c - 1 : c);
  }

  validate(): boolean {
    this.globalError = '';
    if (!this.quiz.title || !this.quiz.category || !this.quiz.description) {
      this.globalError = 'Veuillez remplir tous les champs généraux.'; return false;
    }
    if (this.quiz.questions.length < 5) {
      this.globalError = 'Un quiz doit contenir au minimum 5 questions.'; return false;
    }
    for (let i = 0; i < this.quiz.questions.length; i++) {
      const q = this.quiz.questions[i];
      if (!q.question) { this.globalError = `Question ${i + 1} : l'énoncé est obligatoire.`; return false; }
      if (q.correct.length === 0) { this.globalError = `Question ${i + 1} : indiquez au moins une bonne réponse.`; return false; }
      if (!q.explanation) { this.globalError = `Question ${i + 1} : l'explication est obligatoire.`; return false; }
      if (q.options.some(o => !o)) { this.globalError = `Question ${i + 1} : toutes les options doivent être remplies.`; return false; }
    }
    return true;
  }

  saveDraft() {
    this.quiz.published = false;
    this.save();
  }

  publish() {
    if (!this.validate()) return;
    this.quiz.published = true;
    this.save();
  }

  save() {
    if (this.isEdit) {
      this.dataService.updateQuiz(this.quiz);
    } else {
      this.dataService.addQuiz(this.quiz);
    }
    this.successMsg = this.quiz.published ? 'Quiz publié avec succès !' : 'Brouillon enregistré.';
    setTimeout(() => this.router.navigate(['/admin/quizzes']), 1200);
  }
}
