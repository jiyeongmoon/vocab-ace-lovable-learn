
import { VocabularyCard } from "@/types/vocab";

export type QuizResult = "Correct" | "Incorrect" | null;

// Map of card IDs to quiz results
export type QuizResultMap = Record<string, QuizResult>;

export interface VocabContextType {
  cards: VocabularyCard[];
  addCard: (card: Omit<VocabularyCard, "id" | "correctCount" | "completed" | "createdAt">) => void;
  addCards: (cards: Omit<VocabularyCard, "id" | "correctCount" | "completed" | "createdAt">[]) => void;
  updateCard: (id: string, card: Partial<VocabularyCard>) => void;
  deleteCard: (id: string) => void;
  currentCard: VocabularyCard | null;
  nextCard: () => void;
  checkAnswer: (userAnswer: string) => QuizResult;
  quizResultMap: QuizResultMap;
  clearCurrentQuizResult: () => void;
  resetUserAnswer: () => void;
  generateExampleSentence: (word: string) => Promise<string>;
  incompleteCards: VocabularyCard[];
  completedCards: VocabularyCard[];
  quizMode: boolean;
  setQuizMode: (mode: boolean) => void;
  openAIEnabled: boolean;
  toggleOpenAI: (enabled: boolean) => void;
  openAIKey: string;
  updateOpenAIKey: (key: string) => void;
}
