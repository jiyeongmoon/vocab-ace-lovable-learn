
import { useRef, useState, useEffect } from "react";
import { useVocab } from "@/contexts/VocabContext";
import { VocabularyCard } from "@/types/vocab";
import { parseMeaningToArray } from "@/contexts/vocabUtils";

export function useQuizCard() {
  const {
    currentCard,
    nextCard,
    resetUserAnswer,
    updateCard,
    incompleteCards,
    checkAnswer,
    quizResult,
    setQuizResult: contextSetQuizResult
  } = useVocab();

  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [attemptedRetry, setAttemptedRetry] = useState(false);
  const [quizDirection, setQuizDirection] = useState<"engToKor" | "korToEng">("engToKor");
  const [isStudyMode, setIsStudyMode] = useState(false);
  const hasSubmittedAnswer = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentCard) {
      console.log("useQuizCard - Card changed to:", currentCard.id);
      
      setUserAnswer("");
      setShowAnswer(false);
      setAttemptedRetry(false);
      hasSubmittedAnswer.current = false;
      
      if (!isStudyMode) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }
  }, [currentCard?.id, isStudyMode]);

  useEffect(() => {
    console.log("useQuizCard - Result effect:", { 
      quizResult, 
      hasSubmitted: hasSubmittedAnswer.current, 
      cardId: currentCard?.id 
    });
    
    if (quizResult && hasSubmittedAnswer.current) {
      setShowAnswer(true);
    }
  }, [quizResult, currentCard?.id]);

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

  useEffect(() => {
    if (isStudyMode && currentCard) {
      setShowAnswer(true);
    }
  }, [isStudyMode, currentCard?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userAnswer.trim() || !currentCard) return;
    
    hasSubmittedAnswer.current = true;
    
    updateCard(currentCard.id, { userAnswer });
    
    console.log("useQuizCard - Submitting answer:", userAnswer, "for card:", currentCard.id);
    
    if (quizDirection === "engToKor") {
      const correctMeanings = Array.isArray(currentCard.meaning)
        ? currentCard.meaning.map(m => m.toLowerCase().trim())
        : parseMeaningToArray(currentCard.meaning as string).map(m => m.toLowerCase().trim());
      
      const normalizedUserAnswer = userAnswer.trim().toLowerCase();
      const isCorrect = correctMeanings.includes(normalizedUserAnswer);
      
      console.log("Answer check (engToKor):", {
        userAnswer: normalizedUserAnswer,
        correctMeanings,
        isCorrect
      });
      
      checkAnswer(userAnswer);
    } else {
      const normalizedUserAnswer = userAnswer.trim().toLowerCase();
      const correctWord = currentCard.word.toLowerCase();
      
      console.log("Answer check (korToEng):", {
        userAnswer: normalizedUserAnswer,
        correctWord,
        card: currentCard
      });
      
      let isCorrect = false;
      
      if (normalizedUserAnswer === correctWord) {
        isCorrect = true;
      } 
      else if (
        normalizedUserAnswer === correctWord + "s" ||
        normalizedUserAnswer === correctWord + "es" ||
        normalizedUserAnswer === correctWord + "ed" ||
        normalizedUserAnswer === correctWord + "ing" ||
        normalizedUserAnswer.replace(/(?:ed|es|s|ing)$/, "") === correctWord ||
        normalizedUserAnswer.replace(/(?:ing|ed)$/, "").replace(/([^aeiou])$/, "") === correctWord.replace(/([^aeiou])$/, "")
      ) {
        isCorrect = true;
      }
      
      console.log("Final comparison result:", { 
        isCorrect,
        normalizedUserAnswer, 
        correctWord 
      });
      
      // Call the context's checkAnswer function instead of trying to set quizResult directly
      checkAnswer(userAnswer);
    }
  };

  const handleNext = () => {
    setShowAnswer(false);
    setUserAnswer("");
    setAttemptedRetry(false);
    hasSubmittedAnswer.current = false;
    
    nextCard();
  };

  const handleRetry = () => {
    setUserAnswer("");
    setShowAnswer(false);
    setAttemptedRetry(true);
    hasSubmittedAnswer.current = false;
    
    if (!isStudyMode) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
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
  };
}

