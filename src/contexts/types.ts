
import { VocabularyCard, QuizResult } from "@/types/vocab";

export interface VocabContextType {
  cards: VocabularyCard[];
  addCard: (card: Omit<VocabularyCard, "id" | "correctCount" | "completed" | "createdAt">) => void;
  addCards: (cards: Omit<VocabularyCard, "id" | "correctCount" | "completed" | "createdAt">[]) => void;
  updateCard: (id: string, card: Partial<VocabularyCard>) => void;
  deleteCard: (id: string) => void;
  currentCard: VocabularyCard | null;
  nextCard: () => void;
  checkAnswer: (userAnswer: string) => QuizResult;
  quizResult: QuizResult;
  resetUserAnswer: () => void;
  generateExampleSentence: (word: string) => Promise<string>;
  incompleteCards: VocabularyCard[];
  completedCards: VocabularyCard[];
  quizMode: boolean;
  setQuizMode: (mode: boolean) => void;
}
