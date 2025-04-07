
import React from "react";
import { QuizResult } from "@/contexts/types";

interface QuizDebugPanelProps {
  cardId: string;
  hasSubmitted: boolean;
  quizResult: QuizResult;
  showAnswer: boolean;
}

const QuizDebugPanel: React.FC<QuizDebugPanelProps> = ({
  cardId,
  hasSubmitted,
  quizResult,
  showAnswer,
}) => {
  return (
    <div className="text-xs text-gray-400">
      Card ID: {cardId} | 
      Has submitted: {String(hasSubmitted)} | 
      Quiz result: {quizResult || "none"} |
      Show answer: {String(showAnswer)}
    </div>
  );
};

export default QuizDebugPanel;
