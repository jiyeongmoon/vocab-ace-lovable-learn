
import React, { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface QuizFormProps {
  userAnswer: string;
  setUserAnswer: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  showAnswer: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  isStudyMode: boolean;
  onNext: () => void;
}

const QuizForm: React.FC<QuizFormProps> = ({
  userAnswer,
  setUserAnswer,
  onSubmit,
  showAnswer,
  inputRef,
  isStudyMode,
  onNext
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {!isStudyMode && (
        <div>
          <Input
            ref={inputRef}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here"
            disabled={showAnswer}
            autoFocus
          />
        </div>
      )}
      
      {!showAnswer && !isStudyMode && (
        <Button 
          type="submit" 
          className="w-full" 
          disabled={!userAnswer.trim()}
        >
          Check Answer
        </Button>
      )}
      
      {!showAnswer && isStudyMode && (
        <Button 
          type="button" 
          className="w-full"
          onClick={onNext}
        >
          Show Next Word
        </Button>
      )}
    </form>
  );
};

export default QuizForm;
