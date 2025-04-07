
import { useRef, useState, useEffect } from "react";
import { useVocab } from "@/contexts/VocabContext";
import { VocabularyCard } from "@/types/vocab";

export function useQuizCard() {
  const {
    currentCard,
    nextCard,
    clearCurrentQuizResult,
    resetUserAnswer,
    updateCard,
    incompleteCards,
    checkAnswer,
    quizResultMap,
  } = useVocab();

  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [attemptedRetry, setAttemptedRetry] = useState(false);
  const hasSubmittedAnswer = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentCardRef = useRef<string | null>(null);

  // Reset states when card changes
  useEffect(() => {
    if (currentCard) {
      console.log("useQuizCard - Card changed to:", currentCard.id);
      
      // Only reset states if we've moved to a different card
      if (currentCardRef.current !== currentCard.id) {
        console.log("useQuizCard - Resetting states for new card");
        setUserAnswer("");
        setShowAnswer(false);
        setAttemptedRetry(false);
        hasSubmittedAnswer.current = false;
        currentCardRef.current = currentCard.id;
      }
      
      // Focus the input field when a new card is shown
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [currentCard?.id]);

  // Get the quiz result for the current card
  const currentQuizResult = currentCard ? quizResultMap[currentCard.id] : null;

  // Show feedback only after the user has submitted an answer and we have a result
  useEffect(() => {
    console.log("useQuizCard - Result effect:", { 
      currentQuizResult, 
      hasSubmitted: hasSubmittedAnswer.current, 
      cardId: currentCard?.id 
    });
    
    if (currentQuizResult && hasSubmittedAnswer.current) {
      setShowAnswer(true);
    }
  }, [currentQuizResult, currentCard?.id]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userAnswer.trim() || !currentCard) return;
    
    // Set flag to indicate we've submitted an answer - this must happen BEFORE checking answer
    hasSubmittedAnswer.current = true;
    
    // Update the card with the user's answer
    updateCard(currentCard.id, { userAnswer });
    
    // Check the answer - this will update quizResultMap
    console.log("useQuizCard - Submitting answer:", userAnswer, "for card:", currentCard.id);
    checkAnswer(userAnswer);
  };

  const handleNext = () => {
    // Reset all local states first
    setShowAnswer(false);
    setUserAnswer("");
    setAttemptedRetry(false);
    hasSubmittedAnswer.current = false;
    
    // Clear the result for the current card before moving to the next
    clearCurrentQuizResult();
    
    // Then move to the next card
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

  return {
    currentCard,
    userAnswer,
    setUserAnswer,
    showAnswer,
    attemptedRetry,
    hasSubmittedAnswer: hasSubmittedAnswer.current,
    inputRef,
    currentQuizResult,
    incompleteCards,
    handleSubmit,
    handleNext,
    handleRetry,
    formatExampleSentence,
  };
}
