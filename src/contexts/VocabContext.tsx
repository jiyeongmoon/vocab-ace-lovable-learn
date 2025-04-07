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

export type QuizResultMap = Record<string, QuizResult>;

const VocabContext = createContext<VocabContextType | undefined>(undefined);

export const VocabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cards, setCards] = useState<VocabularyCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [quizResultMap, setQuizResultMap] = useState<QuizResultMap>({});
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [incompleteCards, setIncompleteCards] = useState<VocabularyCard[]>([]);
  const [openAIEnabled, setOpenAIEnabledState] = useState<boolean>(isOpenAIEnabled());
  const [openAIKey, setOpenAIKey] = useState<string>(localStorage.getItem("openai-api-key") || "");

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
  };

  const nextCard = () => {
    console.log("VocabContext - nextCard - Current card ID:", currentCard?.id);
    
    // Don't reset quizResultMap here - we want to preserve it for the next render
    // We'll clear the specific result when needed
    
    resetUserAnswer();

    if (incompleteCards.length > 0) {
      setCurrentCardIndex(prev => (prev + 1) % incompleteCards.length);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const clearCurrentQuizResult = () => {
    if (currentCard) {
      console.log("VocabContext - clearCurrentQuizResult - Clearing result for card:", currentCard.id);
      setQuizResultMap(prev => {
        const updated = { ...prev };
        delete updated[currentCard.id];
        return updated;
      });
    }
  };

  const checkAnswer = (userAnswer: string): QuizResult | null => {
    if (!currentCard) return null;

    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const correctMeanings = currentCard.meaning
      .split(',')
      .map(meaning => meaning.trim().toLowerCase());

    const isCorrect = correctMeanings.includes(normalizedUserAnswer);
    const result: QuizResult = isCorrect ? "Correct" : "Incorrect";

    console.log("VocabContext - Setting quiz result to:", result, "for card:", currentCard.id);

    // Update the quiz result map with the current card's result
    setQuizResultMap(prev => ({
      ...prev,
      [currentCard.id]: result,
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
    quizResultMap,
    clearCurrentQuizResult,
    resetUserAnswer,
    generateExampleSentence: generateSentence,
    incompleteCards,
    completedCards,
    quizMode,
    setQuizMode,
    openAIEnabled,
    toggleOpenAI,
    openAIKey,
    updateOpenAIKey
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
