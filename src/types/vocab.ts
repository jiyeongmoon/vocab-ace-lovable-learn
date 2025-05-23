
export interface VocabularyCard {
  id: string;
  word: string;
  meaning: string[];
  exampleSentence: string;
  correctCount: number;
  completed: boolean;
  userAnswer?: string;
  createdAt: Date;
}

export type QuizResult = "Correct" | "Incorrect" | null;
