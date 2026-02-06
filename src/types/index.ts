export interface Category {
  id: string;
  name: string; 
  icon?: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[]; 
  correctAnswer: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  categoryId: string; 
}

export interface UserScore {
  id?: string;
  userId: string;
  name: string;
  score: number;
  categoryId: string; 
  createdAt: any;
}