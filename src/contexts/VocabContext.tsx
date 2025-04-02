
import React, { createContext, useContext, useState, useEffect } from "react";
import { VocabularyCard, QuizResult } from "@/types/vocab";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

interface VocabContextType {
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

const VocabContext = createContext<VocabContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "vocab-ace-cards";

export const VocabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cards, setCards] = useState<VocabularyCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [quizResult, setQuizResult] = useState<QuizResult>(null);
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [incompleteCards, setIncompleteCards] = useState<VocabularyCard[]>([]);
  
  // Load cards from localStorage on initial render
  useEffect(() => {
    const storedCards = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedCards) {
      try {
        const parsedCards = JSON.parse(storedCards);
        // Convert string dates back to Date objects
        const cardsWithDateObjects = parsedCards.map((card: any) => ({
          ...card,
          createdAt: new Date(card.createdAt)
        }));
        setCards(cardsWithDateObjects);
      } catch (e) {
        console.error("Failed to parse stored cards:", e);
      }
    }
  }, []);

  // Save cards to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  // Update incomplete cards whenever cards change
  useEffect(() => {
    const filtered = cards.filter(card => !card.completed);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setIncompleteCards(shuffled);
  }, [cards]);

  const addCard = (card: Omit<VocabularyCard, "id" | "correctCount" | "completed" | "createdAt">) => {
    const newCard: VocabularyCard = {
      ...card,
      id: uuidv4(),
      correctCount: 0,
      completed: false,
      createdAt: new Date()
    };
    setCards(prev => [...prev, newCard]);
    toast({
      title: "Card Added",
      description: `Added "${card.word}" to your vocabulary list.`,
    });
  };

  const addCards = (cardsToAdd: Omit<VocabularyCard, "id" | "correctCount" | "completed" | "createdAt">[]) => {
    const newCards = cardsToAdd.map(card => ({
      ...card,
      id: uuidv4(),
      correctCount: 0,
      completed: false,
      createdAt: new Date()
    }));
    setCards(prev => [...prev, ...newCards]);
    toast({
      title: "Cards Added",
      description: `Added ${cardsToAdd.length} words to your vocabulary list.`,
    });
  };

  const updateCard = (id: string, updatedFields: Partial<VocabularyCard>) => {
    setCards(prev => 
      prev.map(card => card.id === id ? { ...card, ...updatedFields } : card)
    );
  };

  const deleteCard = (id: string) => {
    setCards(prev => prev.filter(card => card.id !== id));
    toast({
      title: "Card Deleted",
      description: "The vocabulary card has been removed.",
    });
  };

  const resetUserAnswer = () => {
    if (currentCard) {
      updateCard(currentCard.id, { userAnswer: "" });
    }
    setQuizResult(null);
  };

  const nextCard = () => {
    resetUserAnswer();
    
    // If we have incomplete cards, set the index to the next one
    if (incompleteCards.length > 0) {
      setCurrentCardIndex(prev => (prev + 1) % incompleteCards.length);
    } else {
      // If no incomplete cards, reset the current card index
      setCurrentCardIndex(0);
    }
  };

  const checkAnswer = (userAnswer: string): QuizResult => {
    if (!currentCard) return null;
    
    // Normalize the user answer and correct meanings
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const correctMeanings = currentCard.meaning
      .split(',')
      .map(meaning => meaning.trim().toLowerCase());
    
    // Check if user answer matches any of the correct meanings
    const isCorrect = correctMeanings.includes(normalizedUserAnswer);
    const result: QuizResult = isCorrect ? "Correct" : "Incorrect";
    
    setQuizResult(result);
    
    // If correct, update the card's correct count and possibly mark as completed
    if (isCorrect) {
      const newCorrectCount = currentCard.correctCount + 1;
      const completed = newCorrectCount >= 10;
      
      updateCard(currentCard.id, { 
        correctCount: newCorrectCount,
        completed
      });
      
      if (completed) {
        toast({
          title: "Word Mastered! 🎉",
          description: `You've successfully mastered "${currentCard.word}".`,
        });
      }
    }
    
    return result;
  };

  // Function to generate example sentences using AI (simplified simulation)
  const generateExampleSentence = async (word: string): Promise<string> => {
    try {
      // This is a simplified mock - in a real app you would call an AI API
      // For now, we'll return a generic sentence
      return `The word "${word}" is useful in many contexts.`;
    } catch (error) {
      console.error("Failed to generate example sentence:", error);
      return "";
    }
  };

  // Computed properties
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
    generateExampleSentence,
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
