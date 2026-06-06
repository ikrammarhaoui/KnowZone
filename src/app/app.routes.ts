import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'quizzes',
    loadComponent: () => import('./components/quiz-list/quiz-list.component').then(m => m.QuizListComponent)
  },
  {
    path: 'quiz/:id',
    loadComponent: () => import('./components/quiz-detail/quiz-detail.component').then(m => m.QuizDetailComponent)
  },
  {
    path: 'quiz/:id/play',
    loadComponent: () => import('./components/quiz-play/quiz-play.component').then(m => m.QuizPlayComponent),
    canActivate: [authGuard]
  },
  {
    path: 'results',
    loadComponent: () => import('./components/results/results.component').then(m => m.ResultsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./components/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/quiz/new',
    loadComponent: () => import('./components/admin/quiz-form/quiz-form.component').then(m => m.QuizFormComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/quiz/:id/edit',
    loadComponent: () => import('./components/admin/quiz-form/quiz-form.component').then(m => m.QuizFormComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/quizzes',
    loadComponent: () => import('./components/admin/quiz-manage/quiz-manage.component').then(m => m.QuizManageComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./components/admin/user-manage/user-manage.component').then(m => m.UserManageComponent),
    canActivate: [adminGuard]
  },
  { path: '**', redirectTo: '' }
];
