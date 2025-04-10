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
        // Convert string to array of meanings
        return {
          ...card,
          meaning: (card.meaning as unknown as string).split(',').map(m => m.trim())
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

  // Initialize or refresh the card queue when incompleteCards changes
  useEffect(() => {
    if (incompleteCards.length > 0 && cardQueue.length === 0) {
      initializeCardQueue();
    }
  }, [incompleteCards]);

  // Helper function to shuffle an array using Fisher-Yates algorithm
  const shuffleArray = <T extends unknown>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initialize the card queue with a smart prioritization system
  const initializeCardQueue = () => {
    console.log("Initializing card queue with", incompleteCards.length, "incomplete cards");
    
    // Group cards by correctCount tiers
    const beginnerCards: VocabularyCard[] = [];    // correctCount 0-2
    const intermediateCards: VocabularyCard[] = []; // correctCount 3-6
    const advancedCards: VocabularyCard[] = [];     // correctCount 7-9
    
    incompleteCards.forEach(card => {
      // Skip cards that were recently shown (to avoid immediate repetition)
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
    
    // Shuffle each tier separately
    const shuffledBeginner = shuffleArray(beginnerCards);
    const shuffledIntermediate = shuffleArray(intermediateCards);
    const shuffledAdvanced = shuffleArray(advancedCards);
    
    // Build queue with weighted distribution:
    // - Beginner cards get the highest priority (frequent appearance)
    // - Intermediate cards get medium priority
    // - Advanced cards get lowest priority (rare appearance)
    let newQueue: VocabularyCard[] = [];
    
    // If there are enough cards, create a balanced queue
    if (incompleteCards.length > 10) {
      // Add more beginner cards, fewer advanced cards
      newQueue = [
        ...shuffledBeginner,
        ...shuffledIntermediate,
        ...shuffledAdvanced,
      ];
    } else {
      // For small sets, just shuffle all available cards
      newQueue = shuffleArray([...incompleteCards]);
    }
    
    // Filter out any cards that are in the recently shown list
    newQueue = newQueue.filter(card => !recentlyShownCardIds.includes(card.id));
    
    // If queue is empty after filtering (all cards were recently shown), 
    // clear the recently shown list and try again
    if (newQueue.length === 0 && incompleteCards.length > 0) {
      setRecentlyShownCardIds([]);
      newQueue = shuffleArray([...incompleteCards]);
    }
    
    console.log("New queue created with", newQueue.length, "cards");
    setCardQueue(newQueue);
  };

  // Add a card to the "recently shown" list to prevent immediate repetition
  const addToRecentlyShown = (cardId: string) => {
    setRecentlyShownCardIds(prev => {
      const updated = [cardId, ...prev];
      // Keep only the last 5-6 cards to prevent a card from appearing again too soon
      const maxRecentCards = Math.min(5, Math.max(Math.floor(incompleteCards.length / 2), 1));
      return updated.slice(0, maxRecentCards);
    });
  };

  const addCard = (card: Omit<VocabularyCard, "id" | "correctCount" | "completed" | "createdAt">) => {
    // Ensure meaning is always an array
    const meaningArray = Array.isArray(card.meaning) 
      ? card.meaning 
      : typeof card.meaning === 'string'
        ? (card.meaning as unknown as string).split(',').map(m => m.trim())
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
          ? (card.meaning as unknown as string).split(',').map(m => m.trim())
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
          ? (updatedFields.meaning as unknown as string).split(',').map(m => m.trim())
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
    
    // If current card exists, add it to the recently shown list to prevent immediate repetition
    if (currentCard) {
      addToRecentlyShown(currentCard.id);
    }
    
    // Check if we need to refill the queue
    if (cardQueue.length === 0) {
      initializeCardQueue();
    }
    
    // If we still have no cards in the queue (could happen if all cards are completed),
    // reset the current card index
    if (cardQueue.length === 0) {
      setCurrentCardIndex(0);
      return;
    }
    
    // Remove the first card from the queue
    const newQueue = [...cardQueue];
    newQueue.shift();
    setCardQueue(newQueue);
    
    // Reset quiz result after changing the card
    setQuizResult(null);
  };

  const checkAnswer = (userAnswer: string): QuizResult => {
    if (!currentCard) return null;

    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    
    // Handle meaning whether it's a string or array
    const correctMeanings = Array.isArray(currentCard.meaning) 
      ? currentCard.meaning.map(m => m.toLowerCase().trim()) 
      : typeof currentCard.meaning === 'string'
        ? (currentCard.meaning as unknown as string).split(',').map(m => m.toLowerCase().trim()) 
        : [];

    const isCorrect = correctMeanings.includes(normalizedUserAnswer);
    const result: QuizResult = isCorrect ? "Correct" : "Incorrect";

    console.log("VocabContext - Setting quiz result to:", result, "for card:", currentCard.id);

    // Update the quiz result
    setQuizResult(result);

    // Always save the user's answer in the card
    updateCard(currentCard.id, { userAnswer });

    // Update session statistics
    setSessionStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    // If the answer is correct, update the card's correctCount and check if completed
    if (isCorrect) {
      const newCorrectCount = currentCard.correctCount + 1;
      const completed = newCorrectCount >= 10;

      // Update the card with new correctCount and completed status
      updateCard(currentCard.id, {
        correctCount: newCorrectCount,
        completed
      });

      if (completed) {
        showToast("Word Mastered! 🎉", `You've successfully mastered "${currentCard.word}".`);
        
        // Remove the completed card from the queue
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

  // Get the current card from the beginning of the queue, or null if queue is empty
  const currentCard = cardQueue.length > 0 ? cardQueue[0] : null;
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
