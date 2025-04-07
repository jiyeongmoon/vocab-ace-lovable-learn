import { VocabularyCard } from "@/types/vocab";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";

export const LOCAL_STORAGE_KEY = "vocab-ace-cards";
export const OPENAI_ENABLED_KEY = "vocab-ace-openai-enabled";

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

export const isOpenAIEnabled = (): boolean => {
  const enabled = localStorage.getItem(OPENAI_ENABLED_KEY);
  return enabled === "true";
};

export const setOpenAIEnabled = (enabled: boolean): void => {
  localStorage.setItem(OPENAI_ENABLED_KEY, String(enabled));
};

export const generateExampleSentence = async (word: string): Promise<string> => {
  if (!isOpenAIEnabled()) {
    return `The word "${word}" is useful in many contexts.`;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("openai-api-key") || ""}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that creates natural example sentences for vocabulary words."
          },
          {
            role: "user",
            content: `Create a simple, clear example sentence using the word "${word}". Only return the sentence, nothing else.`
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const sentence = data.choices[0]?.message?.content?.trim() || "";
    return sentence;
  } catch (error) {
    console.error("Failed to generate example sentence:", error);
    showToast("Generation Failed", "Could not generate an example sentence. Please try again.");
    return "";
  }
};

export const parseGoogleSheetUrl = (url: string): { sheetId: string; sheetName: string | null } => {
  let sheetId = "";
  let sheetName = null;

  const idRegex = /\/d\/([a-zA-Z0-9-_]+)/;
  const idMatch = url.match(idRegex);
  
  if (idMatch && idMatch[1]) {
    sheetId = idMatch[1];
  }

  const sheetNameRegex = /[#&]gid=([0-9]+)/;
  const sheetNameMatch = url.match(sheetNameRegex);
  
  if (sheetNameMatch && sheetNameMatch[1]) {
    sheetName = sheetNameMatch[1];
  }

  return { sheetId, sheetName };
};

export const fetchGoogleSheetData = async (
  url: string
): Promise<Array<{ Word: string; Meaning: string; Example?: string }>> => {
  try {
    const { sheetId, sheetName } = parseGoogleSheetUrl(url);
    
    if (!sheetId) {
      throw new Error("Invalid Google Sheet URL");
    }

    let apiUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
    
    if (sheetName) {
      apiUrl += `&gid=${sheetName}`;
    }

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheet: ${response.statusText}`);
    }

    const text = await response.text();
    const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const data = JSON.parse(jsonString);

    if (!data.table || !data.table.rows) {
      throw new Error("Invalid Google Sheets data format");
    }

    const columns = data.table.cols.map((col: { label: string }) => col.label);
    const wordIndex = columns.findIndex((label: string) => 
      label.toLowerCase() === "word" || label.toLowerCase() === "vocabulary" || label.toLowerCase() === "term");
    const meaningIndex = columns.findIndex((label: string) => 
      label.toLowerCase() === "meaning" || label.toLowerCase() === "definition" || label.toLowerCase() === "translation");
    const exampleIndex = columns.findIndex((label: string) => 
      label.toLowerCase() === "example" || label.toLowerCase() === "example sentence" || label.toLowerCase() === "sentence");

    if (wordIndex === -1 || meaningIndex === -1) {
      throw new Error("Sheet must contain columns for Word and Meaning");
    }

    return data.table.rows.map((row: { c: Array<{ v: any }> }) => {
      const result: { Word: string; Meaning: string; Example?: string } = {
        Word: String(row.c[wordIndex]?.v || ""),
        Meaning: String(row.c[meaningIndex]?.v || "")
      };

      if (exampleIndex !== -1 && row.c[exampleIndex]?.v) {
        result.Example = String(row.c[exampleIndex].v);
      }

      return result;
    }).filter(item => item.Word && item.Meaning);
  } catch (error) {
    console.error("Failed to fetch Google Sheet:", error);
    throw error;
  }
};
