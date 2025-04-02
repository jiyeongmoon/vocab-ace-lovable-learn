import React, { createContext, useContext, useState, useEffect } from "react";
import { VocabularyCard, QuizResult } from "@/types/vocab";
import { VocabContextType } from "./types";
import { 
  LOCAL_STORAGE_KEY, 
  createNewCard, 
  loadCardsFromStorage, 
  saveCardsToStorage,
  showToast,
  generateExampleSentence as generateSentence
} from "./vocabUtils";

const VocabContext = createContext<VocabContextType | undefined>(undefined);

export const VocabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cards, setCards] = useState<VocabularyCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [quizResult, setQuizResult] = useState<QuizResult>(null);
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [incompleteCards, setIncompleteCards] = useState<VocabularyCard[]>([]);
  
  useEffect(() => {
    const loadedCards = loadCardsFromStorage();
    setCards(loadedCards);
  }, []);

  useEffect(() => {
    saveCardsToStorage(cards);
  }, [cards]);

  useEffect(() => {
    const filtered = cards.filter(card => !card.completed);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setIncompleteCards(shuffled);
  }, [cards]);

  const addCard = (card: Omit<VocabularyCard, "id" | "correctCount" | "completed" | "createdAt">) => {
    const newCard = createNewCard(card);
    setCards(prev => [...prev, newCard]);
    showToast("Card Added", `Added "${card.word}" to your vocabulary list.`);
  };

  const addCards = (cardsToAdd: Omit<VocabularyCard, "id" | "correctCount" | "completed" | "createdAt">[]) => {
    const newCards = cardsToAdd.map(card => createNewCard(card));
    setCards(prev => [...prev, ...newCards]);
    showToast("Cards Added", `Added ${cardsToAdd.length} words to your vocabulary list.`);
  };

  const updateCard = (id: string, updatedFields: Partial<VocabularyCard>) => {
    setCards(prev => 
      prev.map(card => card.id === id ? { ...card, ...updatedFields } : card)
    );
  };

  const deleteCard = (id: string) => {
    setCards(prev => prev.filter(card => card.id !== id));
    showToast("Card Deleted", "The vocabulary card has been removed.");
  };

  const resetUserAnswer = () => {
    if (currentCard) {
      updateCard(currentCard.id, { userAnswer: "" });
    }
    setQuizResult(null);
  };

  const nextCard = () => {
    resetUserAnswer();
    
    if (incompleteCards.length > 0) {
      setCurrentCardIndex(prev => (prev + 1) % incompleteCards.length);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const checkAnswer = (userAnswer: string): QuizResult => {
    if (!currentCard) return null;
    
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const correctMeanings = currentCard.meaning
      .split(',')
      .map(meaning => meaning.trim().toLowerCase());
    
    const isCorrect = correctMeanings.includes(normalizedUserAnswer);
    const result: QuizResult = isCorrect ? "Correct" : "Incorrect";
    
    setQuizResult(result);
    
    if (isCorrect) {
      const newCorrectCount = currentCard.correctCount + 1;
      const completed = newCorrectCount >= 10;
      
      updateCard(currentCard.id, { 
        correctCount: newCorrectCount,
        completed
      });
      
      if (completed) {
        showToast("Word Mastered! 🎉", `You've successfully mastered "${currentCard.word}".`);
      }
    }
    
    return result;
  };

  const currentCard = incompleteCards.length > 0 ? incompleteCards[currentCardIndex] : null;
  const completedCards = cards.filter(card => card.completed);

  const value = {
    cards,
    addCard,
    addCards,
    updateCard,
    deleteCard,
    currentCard,
    nextCard,
    checkAnswer,
    quizResult,
    resetUserAnswer,
    generateExampleSentence: generateSentence,
    incompleteCards,
    completedCards,
    quizMode,
    setQuizMode
  };

  return <VocabContext.Provider value={value}>{children}</VocabContext.Provider>;
};

export const useVocab = () => {
  const context = useContext(VocabContext);
  if (context === undefined) {
    throw new Error("useVocab must be used within a VocabProvider");
  }
  return context;
};
