
import React, { useState, useEffect, useRef } from "react";
import { useVocab } from "@/contexts/VocabContext";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import QuizFeedback from "./QuizFeedback";
import QuizForm from "./QuizForm";
import QuizCardEmpty from "./QuizCardEmpty";
import QuizCardHeader from "./QuizCardHeader";
import QuizCardFooter from "./QuizCardFooter";

const QuizCard: React.FC = () => {
  const { 
    currentCard, 
    nextCard, 
    resetUserAnswer, 
    updateCard,
    incompleteCards,
    checkAnswer,
    quizResult
  } = useVocab();
  
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [attemptedRetry, setAttemptedRetry] = useState(false);
  const hasSubmittedAnswer = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset states when card changes
  useEffect(() => {
    if (currentCard) {
      // Important: Reset all states when a new card is shown
      setUserAnswer("");
      setShowAnswer(false);
      setAttemptedRetry(false);
      hasSubmittedAnswer.current = false;
      
      // Focus the input field when a new card is shown
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [currentCard?.id]);

  // Show feedback only after the user has submitted an answer and we have a result
  useEffect(() => {
    if (quizResult !== null && hasSubmittedAnswer.current) {
      setShowAnswer(true);
    }
  }, [quizResult]);

  // Handle keydown for Enter key to move to next word
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && showAnswer) {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAnswer]);

  if (!currentCard) {
    return <QuizCardEmpty />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userAnswer.trim()) return;
    
    // Set flag to indicate we've submitted an answer - this must happen BEFORE checking answer
    hasSubmittedAnswer.current = true;
    
    // Update the card with the user's answer
    updateCard(currentCard.id, { userAnswer });
    
    // Check the answer - this will update quizResult
    console.log("Submitting answer:", userAnswer);
    checkAnswer(userAnswer);
  };

  const handleNext = () => {
    // Reset all local states first
    setShowAnswer(false);
    setUserAnswer("");
    setAttemptedRetry(false);
    hasSubmittedAnswer.current = false;
    
    // Then move to the next card (which will also reset the quizResult in the context)
    nextCard();
  };

  const handleRetry = () => {
    setUserAnswer("");
    setShowAnswer(false);
    setAttemptedRetry(true);
    hasSubmittedAnswer.current = false;
    
    // Focus the input field when retrying
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const formatExampleSentence = (sentence: string, word: string) => {
    if (!sentence) return "";
    
    const regex = new RegExp(`\\b(${word})\\b`, 'gi');
    return sentence.replace(regex, '**$1**');
  };

  const formattedSentence = currentCard.exampleSentence 
    ? formatExampleSentence(currentCard.exampleSentence, currentCard.word)
    : "";

  console.log("Rendering state:", { 
    showAnswer, 
    quizResult, 
    hasSubmittedAnswer: hasSubmittedAnswer.current 
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
        <QuizForm
          userAnswer={userAnswer}
          setUserAnswer={setUserAnswer}
          onSubmit={handleSubmit}
          showAnswer={showAnswer}
          inputRef={inputRef}
        />
        
        {showAnswer && quizResult && hasSubmittedAnswer.current && (
         <>
          <p className="text-xs text-gray-400">
            [debug] hasSubmittedAnswer: {String(hasSubmittedAnswer.current)} / quizResult: {quizResult}
         </p>

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
