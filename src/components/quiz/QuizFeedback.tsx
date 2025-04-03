
import React, { useEffect } from "react";
import { VocabularyCard, QuizResult } from "@/types/vocab";
import { XCircle, CheckCircle, Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  formattedSentence
}) => {
  // Debug log to see what props we're receiving
  useEffect(() => {
    console.log("QuizFeedback props:", { 
      quizResult, 
      userAnswer, 
      currentCardWord: currentCard?.word,
      attemptedRetry 
    });
  }, [quizResult, userAnswer, currentCard, attemptedRetry]);

  // Safety check - early return with debug message if no quiz result
  if (!quizResult) {
    console.log("QuizFeedback - No quiz result, not rendering");
    return <div className="p-4 bg-yellow-100 rounded-md">Waiting for quiz result...</div>;
  }

  const openDictionary = () => {
    window.open(`https://dictionary.cambridge.org/ko/사전/영어-한국어/${encodeURIComponent(currentCard.word)}`, '_blank');
  };

  const getAllMeanings = () => {
    return currentCard.meaning.split(',').map(meaning => meaning.trim());
  };

  return (
    <div className={`p-4 rounded-md ${quizResult === "Correct" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
      <div className="flex items-start gap-3">
        {quizResult === "Correct" ? (
          <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
        ) : (
          <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
        )}
        
        <div className="flex-1">
          <p className="font-semibold text-lg mb-2">
            {quizResult === "Correct" ? "Correct! ✅" : "Incorrect ❌"}
          </p>
          <div className="text-base mb-2">
            <span className="font-medium">Your answer:</span> {userAnswer}
          </div>
          <div className="text-base">
            <span className="font-medium">Correct meanings:</span>
            <ul className="list-disc pl-5 mt-1">
              {getAllMeanings().map((meaning, index) => (
                <li key={index} className="text-sm">{meaning}</li>
              ))}
            </ul>
          </div>
          
          {currentCard.exampleSentence && (
            <div className="text-sm mt-2 italic opacity-75">
              <span dangerouslySetInnerHTML={{ 
                __html: formattedSentence.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
              }} />
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openDictionary}
          className="flex items-center text-xs"
        >
          <Search className="mr-1 h-3.5 w-3.5" />
          🔍 Search in Cambridge Dictionary
        </Button>
        
        {quizResult === "Incorrect" && !attemptedRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="flex items-center text-xs"
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizFeedback;
