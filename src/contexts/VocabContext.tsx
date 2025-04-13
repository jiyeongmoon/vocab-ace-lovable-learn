
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
  setOpenAIEnabled,
  parseMeaningToArray
} from "./vocabUtils";

const VocabContext = createContext<VocabContextType | undefined>(undefined);

export const VocabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cards, setCards] = useState<VocabularyCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [quizResult, setQuizResult] = useState<QuizResult>(null);
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [incompleteCards, setIncompleteCards] = useState<VocabularyCard[]>([]);
  const [cardQueue, setCardQueue] = useState<VocabularyCard[]>([]);
  const [recentlyShownCardIds, setRecentlyShownCardIds] = useState<string[]>([]);
  const [openAIEnabled, setOpenAIEnabledState] = useState<boolean>(isOpenAIEnabled());
  const [openAIKey, setOpenAIKey] = useState<string>(localStorage.getItem("openai-api-key") || "");
  const [sessionStats, setSessionStats] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  useEffect(() => {
    const loadedCards = loadCardsFromStorage();
    
    // Convert any string meanings to arrays for compatibility
    const normalizedCards = loadedCards.map(card => {
      if (typeof card.meaning === 'string') {
        // Convert string to array of meanings using parseMeaningToArray
        return {
          ...card,
          meaning: parseMeaningToArray(card.meaning as unknown as string)
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
    // Update incomplete cards without shuffling (shuffling will be handled by the queue system)
    setIncompleteCards(filtered);
  }, [cards]);

  useEffect(() => {
    if (incompleteCards.length > 0 && cardQueue.length === 0) {
      initializeCardQueue();
    }
  }, [incompleteCards]);

  const shuffleArray = <T extends unknown>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeCardQueue = () => {
    console.log("Initializing card queue with", incompleteCards.length, "incomplete cards");
    
    const beginnerCards: VocabularyCard[] = [];
    const intermediateCards: VocabularyCard[] = [];
    const advancedCards: VocabularyCard[] = [];

    incompleteCards.forEach(card => {
      if (recentlyShownCardIds.includes(card.id)) {
        return;
      }
      
      if (card.correctCount >= 7) {
        advancedCards.push(card);
      } else if (card.correctCount >= 3) {
        intermediateCards.push(card);
      } else {
        beginnerCards.push(card);
      }
    });

    const shuffledBeginner = shuffleArray(beginnerCards);
    const shuffledIntermediate = shuffleArray(intermediateCards);
    const shuffledAdvanced = shuffleArray(advancedCards);

    let newQueue: VocabularyCard[] = [];

    if (incompleteCards.length > 10) {
      newQueue = [
        ...shuffledBeginner,
        ...shuffledIntermediate,
        ...shuffledAdvanced,
      ];
    } else {
      newQueue = shuffleArray([...incompleteCards]);
    }

    newQueue = newQueue.filter(card => !recentlyShownCardIds.includes(card.id));

    if (newQueue.length === 0 && incompleteCards.length > 0) {
      setRecentlyShownCardIds([]);
      newQueue = shuffleArray([...incompleteCards]);
    }

    console.log("New queue created with", newQueue.length, "cards");
    setCardQueue(newQueue);
  };

  const addToRecentlyShown = (cardId: string) => {
    setRecentlyShownCardIds(prev => {
      const updated = [cardId, ...prev];
      const maxRecentCards = Math.min(5, Math.max(Math.floor(incompleteCards.length / 2), 1));
      return updated.slice(0, maxRecentCards);
    });
  };

  const addCard = (card: Omit<VocabularyCard, "id" | "correctCount" | "completed" | "createdAt">) => {
    const meaningArray = Array.isArray(card.meaning) 
      ? card.meaning 
      : typeof card.meaning === 'string'
        ? parseMeaningToArray(card.meaning as unknown as string)
        : [];
    
    const newCard = createNewCard({
      ...card,
      meaning: meaningArray
    });
    
    setCards(prev => [...prev, newCard]);
    showToast("Card Added", `Added "${card.word}" to your vocabulary list.`);
  };

  const addCards = (cardsToAdd: Omit<VocabularyCard, "id" | "correctCount" | "completed" | "createdAt">[]) => {
    const processedCards = cardsToAdd.map(card => ({
      ...card,
      meaning: Array.isArray(card.meaning) 
        ? card.meaning 
        : typeof card.meaning === 'string'
          ? parseMeaningToArray(card.meaning as unknown as string)
          : []
    }));
    
    const newCards = processedCards.map(card => createNewCard(card));
    setCards(prev => [...prev, ...newCards]);
    showToast("Cards Added", `Added ${cardsToAdd.length} words to your vocabulary list.`);
  };

  const updateCard = (id: string, updatedFields: Partial<VocabularyCard>) => {
    if (updatedFields.meaning !== undefined) {
      updatedFields.meaning = Array.isArray(updatedFields.meaning)
        ? updatedFields.meaning
        : typeof updatedFields.meaning === 'string'
          ? parseMeaningToArray(updatedFields.meaning as unknown as string)
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

  const resetAllCards = () => {
    setCards([]);
    setCardQueue([]);
    setRecentlyShownCardIds([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    showToast("Words Cleared", "All vocabulary cards have been cleared.");
  };

  const resetUserAnswer = () => {
    if (currentCard) {
      updateCard(currentCard.id, { userAnswer: "" });
    }
  };

  const nextCard = () => {
    console.log("VocabContext - nextCard - Current card ID:", currentCard?.id);
    
    resetUserAnswer();
    
    if (currentCard) {
      addToRecentlyShown(currentCard.id);
    }
    
    if (cardQueue.length === 0) {
      initializeCardQueue();
    }
    
    if (cardQueue.length === 0) {
      setCurrentCardIndex(0);
      return;
    }
    
    const newQueue = [...cardQueue];
    newQueue.shift();
    setCardQueue(newQueue);
    
    setQuizResult(null);
  };

  const checkAnswer = (userAnswer: string): QuizResult => {
    if (!currentCard) return null;

    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    
    const correctMeanings = Array.isArray(currentCard.meaning) 
      ? currentCard.meaning.map(m => m.toLowerCase().trim()) 
      : typeof currentCard.meaning === 'string'
        ? parseMeaningToArray(currentCard.meaning as unknown as string).map(m => m.toLowerCase().trim())
        : [];

    const isCorrect = correctMeanings.includes(normalizedUserAnswer);
    const result: QuizResult = isCorrect ? "Correct" : "Incorrect";

    console.log("VocabContext - Setting quiz result to:", result, "for card:", currentCard.id);

    setQuizResult(result);

    updateCard(currentCard.id, { userAnswer });

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
        
        const newQueue = cardQueue.filter(card => card.id !== currentCard.id);
        setCardQueue(newQueue);
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

  const currentCard = cardQueue.length > 0 ? cardQueue[0] : null;
  const completedCards = cards.filter(card => card.completed);

  const value = {
    cards,
    addCard,
    addCards,
    updateCard,
    deleteCard,
    resetAllCards,
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
