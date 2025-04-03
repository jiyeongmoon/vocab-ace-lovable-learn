
import React, { useState, useEffect } from "react";
import { VocabProvider, useVocab } from "@/contexts/VocabContext";
import QuizCard from "@/components/QuizCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3 } from "lucide-react";

// Component moved inside the VocabProvider component to fix the context access issue
const Quiz = () => {
  const navigate = useNavigate();

  return (
    <VocabProvider>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="container max-w-5xl">
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Quiz Mode</h1>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <QuizCard />
            </div>
            <QuizStatistics />
          </div>
        </div>
      </div>
    </VocabProvider>
  );
};

// Component to handle quiz statistics - moved here inside the VocabProvider scope
const QuizStatistics = () => {
  const { quizResult } = useVocab();
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);

  // Update stats when quiz result changes
  useEffect(() => {
    console.log("QuizStatistics received quizResult:", quizResult);
    if (quizResult === "Correct") {
      setCorrect(prev => prev + 1);
      setTotal(prev => prev + 1);
    } else if (quizResult === "Incorrect") {
      setTotal(prev => prev + 1);
    }
  }, [quizResult]);

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
              <div className="text-xl font-bold">{correct}</div>
            </div>
            <div className="border rounded-md p-3">
              <div className="text-sm text-muted-foreground">Session Total</div>
              <div className="text-xl font-bold">{total}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Quiz Tips</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• If English - type Korean Meaning</li>
          <li>• Review words regularly to reinforce learning</li>
          <li>• Use the example sentences to understand context</li>
          <li>• Press Enter to quickly move to the next word</li>
          <li>• Click on dictionary links for more detailed meanings</li>
        </ul>
      </div>
    </div>
  );
};

export default Quiz;
