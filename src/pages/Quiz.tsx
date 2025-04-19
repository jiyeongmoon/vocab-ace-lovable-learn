
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import QuizCard from "@/components/quiz/QuizCard";
import { VocabProvider, useVocab } from "@/contexts/VocabContext";
import QuizModeSelector from "@/components/quiz/QuizModeSelector";

// Inner component that uses the VocabContext
const QuizContent = () => {
  const navigate = useNavigate();
  const { setQuizMode } = useVocab();
  
  useEffect(() => {
    setQuizMode(true);
    return () => {
      setQuizMode(false);
    };
  }, [setQuizMode]);

  return (
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
            <div className="mb-6">
              <QuizModeSelector />
            </div>
            <QuizCard />
          </div>
          <div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Quiz Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• If English - type Korean Meaning</li>
                <li>• If Korean - type English Word</li>
                <li>• Review words regularly to reinforce learning</li>
                <li>• Press Enter to quickly submit your answer</li>
                <li>• Pay attention to word variations (-ed, -s, etc.)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Quiz = () => (
  <VocabProvider>
    <QuizContent />
  </VocabProvider>
);

export default Quiz;
