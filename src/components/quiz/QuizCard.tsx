
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
import QuizModeSelector from "./QuizModeSelector";
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
    quizDirection,
    setQuizDirection,
    isStudyMode,
    setIsStudyMode
  } = useQuizCard();
  
  const [isHovering, setIsHovering] = useState(false);

  if (!currentCard) {
    return <QuizCardEmpty />;
  }

  const formattedSentence = currentCard.exampleSentence 
    ? formatExampleSentence(currentCard.exampleSentence, currentCard.word)
    : "";
  
  // Ensure meaning is always treated as an array
  const meaningArray = Array.isArray(currentCard.meaning)
    ? currentCard.meaning
    : typeof currentCard.meaning === 'string'
      ? (currentCard.meaning as unknown as string).split(/[,;/]+/).map(m => m.trim())
      : [];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <QuizCardHeader 
          currentCard={currentCard}
          formattedSentence={formattedSentence}
          incompleteCards={incompleteCards}
          quizDirection={quizDirection}
          isStudyMode={isStudyMode}
        />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {formattedSentence && !isStudyMode && (
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
                <p className="font-medium mb-1 text-slate-700">
                  {quizDirection === "engToKor" ? "Correct Meaning:" : "Correct Word:"}
                </p>
                {quizDirection === "engToKor" ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {meaningArray.map((meaning, index) => (
                      <li key={index} className="text-slate-900">{meaning}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-900">{currentCard.word}</p>
                )}
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
          isStudyMode={isStudyMode}
          onNext={handleNext}
        />
        
        <QuizModeSelector 
          quizDirection={quizDirection} 
          setQuizDirection={setQuizDirection}
        />
        
        <QuizDebugPanel
          cardId={currentCard.id}
          hasSubmitted={hasSubmittedAnswer}
          quizResult={quizResult}
          showAnswer={showAnswer}
        />
        
        {showAnswer && quizResult && hasSubmittedAnswer && !isStudyMode && (
          <QuizFeedback
            currentCard={currentCard}
            quizResult={quizResult}
            userAnswer={userAnswer}
            attemptedRetry={attemptedRetry}
            onRetry={handleRetry}
            formattedSentence={formattedSentence}
            quizDirection={quizDirection}
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
