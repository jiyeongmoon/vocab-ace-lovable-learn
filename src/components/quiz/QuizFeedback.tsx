
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { VocabularyCard, QuizResult } from "@/types/vocab";
import { useGoogleSheets } from "@/hooks/useGoogleSheets";

interface QuizFeedbackProps {
  currentCard: VocabularyCard;
  quizResult: QuizResult;
  userAnswer: string;
  attemptedRetry: boolean;
  onRetry: () => void;
  formattedSentence: string;
}

const QuizFeedback: React.FC<QuizFeedbackProps> = ({
  currentCard,
  quizResult,
  userAnswer,
  attemptedRetry,
  onRetry,
  formattedSentence,
}) => {
  const { isConfigured, submitQuizResult, submitting } = useGoogleSheets();
  const [submitted, setSubmitted] = useState(false);

  // Ensure meaning is always an array for rendering
  const meaningArray = Array.isArray(currentCard.meaning)
    ? currentCard.meaning
    : typeof currentCard.meaning === 'string'
      ? (currentCard.meaning as unknown as string).split(',').map(m => m.trim())
      : [];
  
  // Submit quiz result to Google Sheets when result is available
  useEffect(() => {
    if (isConfigured && !submitted && quizResult && !submitting) {
      const isCorrect = quizResult === "Correct";
      submitQuizResult(
        currentCard.word,
        currentCard.meaning,
        isCorrect,
        userAnswer
      ).then(() => {
        setSubmitted(true);
      });
    }
  }, [isConfigured, quizResult, submitted, submitting, currentCard, userAnswer, submitQuizResult]);

  return (
    <div
      className={`p-4 rounded-md ${
        quizResult === "Correct"
          ? "bg-green-50 border border-green-200"
          : "bg-red-50 border border-red-200"
      }`}
    >
      {quizResult === "Correct" ? (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            Correct! 🎉
          </h3>
          <p className="text-green-700">
            Great job! Your answer matches the correct meaning.
          </p>
        </div>
      ) : (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Not quite right
          </h3>
          <p className="text-red-700 mb-2">
            Your answer: <span className="font-semibold">{userAnswer}</span>
          </p>
          <p className="text-red-700 mb-1">Correct meaning:</p>
          <ul className="list-disc pl-5 mb-4 text-red-700 text-left inline-block">
            {meaningArray.map((meaning, index) => (
              <li key={index}>{meaning}</li>
            ))}
          </ul>
          {!attemptedRetry && (
            <div className="mt-3">
              <Button
                onClick={onRetry}
                variant="outline"
                className="bg-white text-red-600 border-red-300 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      )}
      
      {isConfigured && submitted && (
        <div className="mt-3 text-xs text-center text-slate-500">
          Result saved to Google Sheets
        </div>
      )}
    </div>
  );
};

export default QuizFeedback;
