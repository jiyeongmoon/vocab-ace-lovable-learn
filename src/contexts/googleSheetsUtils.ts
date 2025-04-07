
import { QuizResult } from "@/types/vocab";
import { showToast } from "./vocabUtils";

/**
 * Configuration interface for Google Sheets integration
 */
interface GoogleSheetsConfig {
  deploymentUrl: string;
  sheetName: string;
}

/**
 * Data structure for quiz result submission
 */
export interface QuizResultSubmission {
  word: string;
  meaning: string;
  isCorrect: boolean;
  userAnswer: string;
  timestamp: string;
}

/**
 * Data structure for vocabulary word submission
 */
export interface VocabWordSubmission {
  word: string;
  meaning: string;
  example: string;
}

/**
 * Save the Google Sheets deployment URL to localStorage
 */
export const saveGoogleSheetsConfig = (config: GoogleSheetsConfig): void => {
  localStorage.setItem("vocab-ace-google-sheets-config", JSON.stringify(config));
};

/**
 * Get the Google Sheets configuration from localStorage
 */
export const getGoogleSheetsConfig = (): GoogleSheetsConfig | null => {
  const config = localStorage.getItem("vocab-ace-google-sheets-config");
  return config ? JSON.parse(config) : null;
};

/**
 * Submits a quiz result to Google Sheets via Google Apps Script
 * 
 * @param result The quiz result to submit
 * @returns Promise that resolves when the submission is complete
 */
export const submitQuizResultToGoogleSheets = async (
  result: QuizResultSubmission
): Promise<boolean> => {
  const config = getGoogleSheetsConfig();
  
  if (!config || !config.deploymentUrl) {
    console.error("Google Sheets is not configured");
    return false;
  }
  
  try {
    const response = await fetch(config.deploymentUrl, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain" // Using text/plain to avoid CORS preflight requests
      },
      body: JSON.stringify({
        sheetName: config.sheetName,
        data: result
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const responseData = await response.json();
    
    if (responseData.success) {
      showToast("Success", `Result for "${result.word}" saved to Google Sheets`);
      return true;
    } else {
      showToast("Error", responseData.error || "Failed to save to Google Sheets");
      return false;
    }
  } catch (error) {
    console.error("Error submitting quiz result to Google Sheets:", error);
    showToast("Error", "Failed to connect to Google Sheets");
    return false;
  }
};

/**
 * Submits a vocabulary word to Google Sheets via Google Apps Script
 * 
 * @param vocabWord The vocabulary word data to submit
 * @param customSheetName Optional custom sheet name (overrides default)
 * @returns Promise that resolves to a boolean indicating success
 */
export const submitVocabWordToGoogleSheets = async (
  vocabWord: VocabWordSubmission,
  customSheetName?: string
): Promise<boolean> => {
  const config = getGoogleSheetsConfig();
  
  if (!config || !config.deploymentUrl) {
    console.error("Google Sheets is not configured");
    return false;
  }
  
  try {
    const response = await fetch(config.deploymentUrl, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain" // Using text/plain to avoid CORS preflight requests
      },
      body: JSON.stringify({
        sheetName: customSheetName || config.sheetName,
        word: vocabWord.word,
        meaning: vocabWord.meaning,
        example: vocabWord.example
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const responseData = await response.json();
    
    // Log debug information if available
    if (responseData.debug) {
      console.log("Google Sheets response debug info:", responseData.debug);
    }
    
    if (responseData.success) {
      showToast("Success", `Vocabulary word "${vocabWord.word}" saved to Google Sheets`);
      return true;
    } else {
      showToast("Error", responseData.error || "Failed to save to Google Sheets");
      return false;
    }
  } catch (error) {
    console.error("Error submitting vocabulary to Google Sheets:", error);
    showToast("Error", "Failed to connect to Google Sheets");
    return false;
  }
};

/**
 * Creates a formatted quiz result submission object from quiz data
 */
export const createQuizResultSubmission = (
  word: string,
  meaning: string,
  isCorrect: boolean,
  userAnswer: string
): QuizResultSubmission => {
  return {
    word,
    meaning: Array.isArray(meaning) ? meaning.join(", ") : meaning,
    isCorrect,
    userAnswer,
    timestamp: new Date().toISOString()
  };
};

/**
 * Checks if the Google Sheets integration is configured
 */
export const isGoogleSheetsConfigured = (): boolean => {
  const config = getGoogleSheetsConfig();
  return !!(config && config.deploymentUrl);
};
