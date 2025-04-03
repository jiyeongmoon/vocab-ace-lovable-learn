
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
  const answerSubmitted = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset states when card changes
  useEffect(() => {
    if (currentCard) {
      setUserAnswer("");
      setAttemptedRetry(false);
      setShowAnswer(false);
      answerSubmitted.current = false;
      
      // Focus the input field when a new card is shown
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [currentCard?.id]);

  // Directly watch quizResult changes to show feedback
  useEffect(() => {
    console.log("quizResult changed:", quizResult, "answerSubmitted:", answerSubmitted.current);
    
    // Always show feedback if we have a result, regardless of answerSubmitted
    // This is critical to ensure feedback always appears
    if (quizResult !== null) {
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
    
    // Set flag to indicate we've submitted an answer
    answerSubmitted.current = true;
    
    // Update the card with the user's answer and show feedback
    updateCard(currentCard.id, { userAnswer });
    
    // Check the answer - this will eventually update quizResult
    console.log("About to check answer, answerSubmitted:", answerSubmitted.current);
    checkAnswer(userAnswer);
  };

  const handleNext = () => {
    // Reset all local states first
    setShowAnswer(false);
    setUserAnswer("");
    setAttemptedRetry(false);
    answerSubmitted.current = false;
    
    // Then move to the next card
    nextCard();
  };

  const handleRetry = () => {
    setUserAnswer("");
    setShowAnswer(false);
    setAttemptedRetry(true);
    answerSubmitted.current = false;
    
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
    answerSubmitted: answerSubmitted.current 
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
        
        {showAnswer && quizResult && (
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
