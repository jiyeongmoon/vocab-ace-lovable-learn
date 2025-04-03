
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { QuizResult } from "@/types/vocab";

interface QuizCardFooterProps {
  onNext: () => void;
  quizResult: QuizResult;
}

const QuizCardFooter: React.FC<QuizCardFooterProps> = ({ onNext, quizResult }) => {
  return (
    <Button 
      onClick={onNext} 
      className="w-full"
      variant={quizResult === "Correct" ? "default" : "outline"}
    >
      Next Word <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
};

export default QuizCardFooter;
