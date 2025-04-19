
import React from "react";
import { Button } from "@/components/ui/button";
import { VocabularyCard, QuizResult } from "@/types/vocab";
import { parseMeaningToArray } from "@/contexts/vocabUtils";

interface QuizFeedbackProps {
  currentCard: VocabularyCard;
  quizResult: QuizResult;
  userAnswer: string;
  attemptedRetry: boolean;
  onRetry: () => void;
  formattedSentence: string;
  quizDirection: "engToKor" | "korToEng";
}

const QuizFeedback: React.FC<QuizFeedbackProps> = ({
  currentCard,
  quizResult,
  userAnswer,
  attemptedRetry,
  onRetry,
  formattedSentence,
  quizDirection,
}) => {
  // Ensure meaning is always an array for rendering using our parsing function
  const meaningArray = Array.isArray(currentCard.meaning)
    ? currentCard.meaning
    : typeof currentCard.meaning === 'string'
      ? parseMeaningToArray(currentCard.meaning as unknown as string)
      : [];

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
            Great job! Your answer matches the correct {quizDirection === "engToKor" ? "meaning" : "word"}.
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
          
          {quizDirection === "engToKor" ? (
            <>
              <p className="text-red-700 mb-1">Correct meaning:</p>
              <ul className="list-disc pl-5 mb-4 text-red-700 text-left inline-block">
                {meaningArray.map((meaning, index) => (
                  <li key={index}>{meaning}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-red-700 mb-4">
              Correct word: <span className="font-semibold">{currentCard.word}</span>
            </p>
          )}
          
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
    </div>
  );
};

export default QuizFeedback;
