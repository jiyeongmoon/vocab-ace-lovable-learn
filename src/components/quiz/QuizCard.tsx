
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import QuizFeedback from "./QuizFeedback";
import QuizForm from "./QuizForm";
import QuizCardEmpty from "./QuizCardEmpty";
import QuizCardHeader from "./QuizCardHeader";
import QuizCardFooter from "./QuizCardFooter";
import QuizDebugPanel from "./QuizDebugPanel";
import { useQuizCard } from "@/hooks/useQuizCard";
import { Eye } from "lucide-react";

const QuizCard: React.FC = () => {
  const {
    currentCard,
    userAnswer,
    setUserAnswer,
    showAnswer,
    attemptedRetry,
    hasSubmittedAnswer,
    inputRef,
    quizResult,
    incompleteCards,
    handleSubmit,
    handleNext,
    handleRetry,
    formatExampleSentence,
  } = useQuizCard();
  
  const [isHovering, setIsHovering] = useState(false);

  if (!currentCard) {
    return <QuizCardEmpty />;
  }

  const formattedSentence = currentCard.exampleSentence 
    ? formatExampleSentence(currentCard.exampleSentence, currentCard.word)
    : "";
  
  console.log("QuizCard - Rendering:", { 
    showAnswer, 
    quizResult, 
    hasSubmittedAnswer,
    cardId: currentCard.id 
  });
  
  return (
    <Card className="w-full">
      <CardHeader>
        <QuizCardHeader 
          currentCard={currentCard}
          formattedSentence={formattedSentence}
          incompleteCards={incompleteCards}
        />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {formattedSentence && (
          <div className="mt-2">
            <div 
              className="text-sm text-center cursor-pointer text-blue-600 hover:text-blue-800 inline-flex items-center"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Eye className="w-4 h-4 mr-1" /> Show Answer
            </div>
            
            {isHovering && (
              <div className="mt-2 p-3 bg-slate-50 border rounded-md border-slate-200 text-sm">
                <p className="font-medium mb-1 text-slate-700">Correct Answer:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {currentCard.meanings.map((meaning, index) => (
                    <li key={index} className="text-slate-900">{meaning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <QuizForm
          userAnswer={userAnswer}
          setUserAnswer={setUserAnswer}
          onSubmit={handleSubmit}
          showAnswer={showAnswer}
          inputRef={inputRef}
        />
        
        <QuizDebugPanel
          cardId={currentCard.id}
          hasSubmitted={hasSubmittedAnswer}
          quizResult={quizResult}
          showAnswer={showAnswer}
        />
        
        {showAnswer && quizResult && hasSubmittedAnswer && (
          <QuizFeedback
            currentCard={currentCard}
            quizResult={quizResult}
            userAnswer={userAnswer}
            attemptedRetry={attemptedRetry}
            onRetry={handleRetry}
            formattedSentence={formattedSentence}
          />
        )}
      </CardContent>
      
      {showAnswer && (
        <CardFooter>
          <QuizCardFooter onNext={handleNext} quizResult={quizResult} />
        </CardFooter>
      )}
    </Card>
  );
};

export default QuizCard;
