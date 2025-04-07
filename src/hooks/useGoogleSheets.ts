
import { useState } from "react";
import { 
  submitQuizResultToGoogleSheets,
  createQuizResultSubmission,
  saveGoogleSheetsConfig,
  getGoogleSheetsConfig,
  isGoogleSheetsConfigured,
  QuizResultSubmission
} from "@/contexts/googleSheetsUtils";
import { showToast } from "@/contexts/vocabUtils";

export interface UseGoogleSheetsReturn {
  isConfigured: boolean;
  configureGoogleSheets: (deploymentUrl: string, sheetName: string) => void;
  submitQuizResult: (word: string, meaning: string | string[], isCorrect: boolean, userAnswer: string) => Promise<boolean>;
  getConfig: () => { deploymentUrl: string; sheetName: string } | null;
  submitting: boolean;
}

export const useGoogleSheets = (): UseGoogleSheetsReturn => {
  const [submitting, setSubmitting] = useState(false);
  
  const configureGoogleSheets = (deploymentUrl: string, sheetName: string) => {
    if (!deploymentUrl) {
      showToast("Error", "Deployment URL is required");
      return;
    }

    if (!sheetName) {
      showToast("Error", "Sheet name is required");
      return;
    }

    saveGoogleSheetsConfig({ deploymentUrl, sheetName });
    showToast("Success", "Google Sheets integration configured");
  };
  
  const submitQuizResult = async (
    word: string, 
    meaning: string | string[], 
    isCorrect: boolean, 
    userAnswer: string
  ): Promise<boolean> => {
    if (!isGoogleSheetsConfigured()) {
      return false;
    }
    
    setSubmitting(true);
    
    try {
      // Convert meaning to string if it's an array to match the expected type
      const meaningAsString = Array.isArray(meaning) ? meaning.join(", ") : meaning;
      const submission = createQuizResultSubmission(word, meaningAsString, isCorrect, userAnswer);
      const result = await submitQuizResultToGoogleSheets(submission);
      return result;
    } catch (error) {
      console.error("Error submitting quiz result:", error);
      return false;
    } finally {
      setSubmitting(false);
    }
  };
  
  const getConfig = () => {
    return getGoogleSheetsConfig();
  };
  
  return {
    isConfigured: isGoogleSheetsConfigured(),
    configureGoogleSheets,
    submitQuizResult,
    getConfig,
    submitting
  };
};
