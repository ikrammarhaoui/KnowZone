export interface Question {
  id: number;
  type: 'qcm' | 'multiple' | 'vf';
  question: string;
  options: string[];
  correct: number[];
  explanation: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  duration: number; // minutes
  image: string;
  published: boolean;
  createdAt: string;
  questions: Question[];
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  blocked: boolean;
  createdAt: string;
}

export interface Score {
  id: number;
  userId: number;
  userName: string;
  quizId: number;
  quizTitle: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number; // seconds
  date: string;
}

export interface QuizResult {
  quiz: Quiz;
  answers: { questionId: number; selected: number[] }[];
  score: number;
  correctAnswers: number;
  timeSpent: number;
}
