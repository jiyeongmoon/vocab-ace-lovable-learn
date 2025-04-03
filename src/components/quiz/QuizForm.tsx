
import React, { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface QuizFormProps {
  userAnswer: string;
  setUserAnswer: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  showAnswer: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

const QuizForm: React.FC<QuizFormProps> = ({
  userAnswer,
  setUserAnswer,
  onSubmit,
  showAnswer,
  inputRef
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Input
          ref={inputRef}
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type the meaning of this word"
          disabled={showAnswer}
          autoFocus
        />
      </div>
      
      {!showAnswer && (
        <Button 
          type="submit" 
          className="w-full" 
          disabled={!userAnswer.trim()}
        >
          Check Answer
        </Button>
      )}
    </form>
  );
};

export default QuizForm;
