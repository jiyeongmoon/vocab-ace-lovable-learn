
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3 } from "lucide-react";
import QuizCard from "@/components/quiz/QuizCard";
import { VocabProvider, useVocab } from "@/contexts/VocabContext";

// Inner component that uses the VocabContext
const QuizStatistics = () => {
  const { sessionStats } = useVocab();
  
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

// Main Quiz page with its own VocabProvider
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
              {/* We don't need VocabProvider here anymore since QuizCard has its own */}
              <QuizCard />
            </div>
            <div>
              {/* Statistics must be inside the VocabProvider from this file */}
              <QuizStatistics />
            </div>
          </div>
        </div>
      </div>
    </VocabProvider>
  );
};

export default Quiz;
