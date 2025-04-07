
import React from "react";
import { useVocab } from "@/contexts/VocabContext";
import { BarChart3 } from "lucide-react";

const QuizStatistics: React.FC = () => {
  const { sessionStats } = useVocab();
  
  const accuracy = sessionStats.total > 0 
    ? Math.round((sessionStats.correct / sessionStats.total) * 100) 
    : 0;
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex items-center mb-4">
          <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Quiz Statistics</h2>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Complete quizzes to track your progress and master vocabulary words.
            Each word requires 10 correct answers to be considered mastered.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-md p-3">
              <div className="text-sm text-muted-foreground">Session Correct</div>
              <div className="text-xl font-bold">{sessionStats.correct}</div>
            </div>
            <div className="border rounded-md p-3">
              <div className="text-sm text-muted-foreground">Session Total</div>
              <div className="text-xl font-bold">{sessionStats.total}</div>
            </div>
          </div>
          {sessionStats.total > 0 && (
            <div className="border rounded-md p-3">
              <div className="text-sm text-muted-foreground">Accuracy</div>
              <div className="text-xl font-bold">{accuracy}%</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizStatistics;
