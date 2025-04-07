import React, { createContext, useContext, useState, useEffect } from "react";
import { VocabularyCard } from "@/types/vocab";
import { VocabContextType, QuizResult } from "./types";
import {
  LOCAL_STORAGE_KEY,
  createNewCard,
  loadCardsFromStorage,
  saveCardsToStorage,
  showToast,
  generateExampleSentence as generateSentence,
  isOpenAIEnabled,
  setOpenAIEnabled
} from "./vocabUtils";

const VocabContext = createContext<VocabContextType | undefined>(undefined);

export const VocabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cards, setCards] = useState<VocabularyCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [quizResult, setQuizResult] = useState<QuizResult>(null);
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [incompleteCards, setIncompleteCards] = useState<VocabularyCard[]>([]);
  const [openAIEnabled, setOpenAIEnabledState] = useState<boolean>(isOpenAIEnabled());
  const [openAIKey, setOpenAIKey] = useState<string>(localStorage.getItem("openai-api-key") || "");
  const [sessionStats, setSessionStats] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  useEffect(() => {
    const loadedCards = loadCardsFromStorage();
    
    // Convert any string meanings to arrays for compatibility
    const normalizedCards = loadedCards.map(card => {
      if (typeof card.meaning === 'string') {
        // Convert string to array of meanings
        return {
          ...card,
          meaning: card.meaning.split(',').map(m => m.trim())
        };
      }
      return card;
    });
    
    setCards(normalizedCards);
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
    // Ensure meaning is always an array
    const meaningArray = Array.isArray(card.meaning) 
      ? card.meaning 
      : typeof card.meaning === 'string'
        ? card.meaning.split(',').map(m => m.trim())
        : [];
    
    const newCard = createNewCard({
      ...card,
      meaning: meaningArray
    });
    
    setCards(prev => [...prev, newCard]);
    showToast("Card Added", `Added "${card.word}" to your vocabulary list.`);
  };

  const addCards = (cardsToAdd: Omit<VocabularyCard, "id" | "correctCount" | "completed" | "createdAt">[]) => {
    // Ensure all meanings are arrays
    const processedCards = cardsToAdd.map(card => ({
      ...card,
      meaning: Array.isArray(card.meaning) 
        ? card.meaning 
        : typeof card.meaning === 'string'
          ? card.meaning.split(',').map(m => m.trim())
          : []
    }));
    
    const newCards = processedCards.map(card => createNewCard(card));
    setCards(prev => [...prev, ...newCards]);
    showToast("Cards Added", `Added ${cardsToAdd.length} words to your vocabulary list.`);
  };

  const updateCard = (id: string, updatedFields: Partial<VocabularyCard>) => {
    // If meaning is being updated and it's a string, convert to array
    if (updatedFields.meaning !== undefined) {
      updatedFields.meaning = Array.isArray(updatedFields.meaning)
        ? updatedFields.meaning
        : typeof updatedFields.meaning === 'string'
          ? updatedFields.meaning.split(',').map(m => m.trim())
          : [];
    }
    
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
  };

  const nextCard = () => {
    console.log("VocabContext - nextCard - Current card ID:", currentCard?.id);
    
    // Reset user answer
    resetUserAnswer();
    
    // Move to next card
    if (incompleteCards.length > 0) {
      setCurrentCardIndex(prev => (prev + 1) % incompleteCards.length);
      
      // Reset quiz result after changing the card
      setQuizResult(null);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const checkAnswer = (userAnswer: string): QuizResult => {
    if (!currentCard) return null;

    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    
    // Handle meaning whether it's a string or array
    const correctMeanings = Array.isArray(currentCard.meaning) 
      ? currentCard.meaning.map(m => m.toLowerCase().trim()) 
      : typeof currentCard.meaning === 'string'
        ? currentCard.meaning.split(',').map(m => m.toLowerCase().trim()) 
        : [];

    const isCorrect = correctMeanings.includes(normalizedUserAnswer);
    const result: QuizResult = isCorrect ? "Correct" : "Incorrect";

    console.log("VocabContext - Setting quiz result to:", result, "for card:", currentCard.id);

    // Update the quiz result
    setQuizResult(result);

    // Update session statistics
    setSessionStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

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

  const toggleOpenAI = (enabled: boolean) => {
    setOpenAIEnabledState(enabled);
    setOpenAIEnabled(enabled);
    showToast(
      enabled ? "OpenAI Enabled" : "OpenAI Disabled",
      enabled ? "Now using AI for generating example sentences." : "Using simple placeholder sentences."
    );
  };

  const updateOpenAIKey = (key: string) => {
    setOpenAIKey(key);
    localStorage.setItem("openai-api-key", key);
    showToast("API Key Updated", "Your OpenAI API key has been saved.");
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
    setQuizMode,
    openAIEnabled,
    toggleOpenAI,
    openAIKey,
    updateOpenAIKey,
    sessionStats
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
