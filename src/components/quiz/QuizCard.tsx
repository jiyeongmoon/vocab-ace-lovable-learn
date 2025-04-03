import React, { useState, useRef } from "react";
import { useVocab } from "@/contexts/VocabContext";
import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import QuizFeedback from "./QuizFeedback";
import QuizForm from "./QuizForm";
import QuizCardEmpty from "./QuizCardEmpty";
import QuizCardHeader from "./QuizCardHeader";
import QuizCardFooter from "./QuizCardFooter";

const QuizCard: React.FC = () => {
  const {
    currentCard,
    nextCard,
    updateCard,
    incompleteCards,
    checkAnswer,
    quizResult
  } = useVocab();

  const [userAnswer, setUserAnswer] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  if (!currentCard) return <QuizCardEmpty />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    updateCard(currentCard.id, { userAnswer });
    checkAnswer(userAnswer);
  };

  const handleNext = () => {
    setUserAnswer("");
    nextCard();
    inputRef.current?.focus();
  };

  const formattedSentence = currentCard.exampleSentence?.replace(
    new RegExp(`\\b(${currentCard.word})\\b`, "gi"),
    "**$1**"
  ) || "";

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
          showAnswer={quizResult !== null}
          inputRef={inputRef}
        />

        {quizResult !== null && (
          <QuizFeedback
            currentCard={currentCard}
            quizResult={quizResult}
            userAnswer={userAnswer}
            attemptedRetry={false} // optional
            onRetry={() => setUserAnswer("")}
            formattedSentence={formattedSentence}
          />
        )}
      </CardContent>

      {quizResult !== null && (
        <CardFooter>
          <QuizCardFooter onNext={handleNext} quizResult={quizResult} />
        </CardFooter>
      )}
    </Card>
  );
};

export default QuizCard;
