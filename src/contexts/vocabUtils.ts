
import { VocabularyCard } from "@/types/vocab";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";

export const LOCAL_STORAGE_KEY = "vocab-ace-cards";

export const createNewCard = (
  cardData: Omit<VocabularyCard, "id" | "correctCount" | "completed" | "createdAt">
): VocabularyCard => {
  return {
    ...cardData,
    id: uuidv4(),
    correctCount: 0,
    completed: false,
    createdAt: new Date()
  };
};

export const loadCardsFromStorage = (): VocabularyCard[] => {
  const storedCards = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedCards) {
    try {
      const parsedCards = JSON.parse(storedCards);
      // Convert string dates back to Date objects
      return parsedCards.map((card: any) => ({
        ...card,
        createdAt: new Date(card.createdAt)
      }));
    } catch (e) {
      console.error("Failed to parse stored cards:", e);
      return [];
    }
  }
  return [];
};

export const saveCardsToStorage = (cards: VocabularyCard[]): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cards));
};

export const showToast = (title: string, description: string): void => {
  toast({
    title,
    description,
  });
};

// Function to generate example sentences using AI (simplified simulation)
export const generateExampleSentence = async (word: string): Promise<string> => {
  try {
    // This is a simplified mock - in a real app you would call an AI API
    // For now, we'll return a generic sentence
    return `The word "${word}" is useful in many contexts.`;
  } catch (error) {
    console.error("Failed to generate example sentence:", error);
    return "";
  }
};
