import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/quiz.model';
import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private dataService: DataService) {
    const saved = localStorage.getItem('currentUser');
    if (saved) this.currentUserSubject.next(JSON.parse(saved));
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  login(email: string, password: string): { success: boolean; message: string } {
    const user = this.dataService.getUserByEmail(email);
    if (!user) return { success: false, message: 'Email introuvable.' };
    if (user.password !== password) return { success: false, message: 'Mot de passe incorrect.' };
    if (user.blocked) return { success: false, message: 'Ce compte est bloqué.' };
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true, message: 'Connexion réussie !' };
  }

  register(firstName: string, lastName: string, email: string, password: string): { success: boolean; message: string } {
    if (this.dataService.getUserByEmail(email)) {
      return { success: false, message: 'Cette adresse e-mail est déjà associée à un compte.' };
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { success: false, message: 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre.' };
    }
    const newUser: User = {
      id: 0,
      firstName,
      lastName,
      email,
      password,
      role: 'user',
      blocked: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const created = this.dataService.addUser(newUser);
    this.currentUserSubject.next(created);
    localStorage.setItem('currentUser', JSON.stringify(created));
    return { success: true, message: 'Compte créé avec succès !' };
  }

  logout() {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }
}
