// Updated QuizCard.tsx
import React, { useState, useEffect, useRef } from "react";
import { useVocab } from "@/contexts/VocabContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../components/ui/card";
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
    quizResult,
  } = useVocab();

  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [attemptedRetry, setAttemptedRetry] = useState(false);
  const hasSubmittedAnswer = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentCard) {
      setUserAnswer("");
      setShowAnswer(false);
      setAttemptedRetry(false);
      hasSubmittedAnswer.current = false;

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [currentCard?.id]);

  useEffect(() => {
    if (quizResult && hasSubmittedAnswer.current) {
      setShowAnswer(true);
    }
  }, [quizResult]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && showAnswer) {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAnswer]);

  if (!currentCard) return <QuizCardEmpty />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    hasSubmittedAnswer.current = true;
    updateCard(currentCard.id, { userAnswer });
    checkAnswer(userAnswer);
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
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const formatExampleSentence = (sentence: string, word: string) => {
    if (!sentence) return "";
    const regex = new RegExp(`\\b(${word})\\b`, "gi");
    return sentence.replace(regex, "**$1**");
  };

  const formattedSentence = currentCard.exampleSentence
    ? formatExampleSentence(currentCard.exampleSentence, currentCard.word)
    : "";

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
