
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3 } from "lucide-react";
import QuizCard from "@/components/quiz/QuizCard";
import QuizStatistics from "@/components/quiz/QuizStatistics";
import { VocabProvider, useVocab } from "@/contexts/VocabContext";

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
              <QuizCard />
            </div>
            <div>
              <QuizStatistics />
              
              <div className="mt-6 bg-white p-6 rounded-lg border shadow-sm">
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
          </div>
        </div>
      </div>
    </VocabProvider>
  );
};

export default Quiz;
