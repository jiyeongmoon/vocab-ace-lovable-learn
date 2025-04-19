
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { VocabProvider } from "@/contexts/VocabContext";
import StudyCard from "@/components/study/StudyCard";

// Inner component that uses the VocabContext
const StudyContent = () => {
  const navigate = useNavigate();

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
          <h1 className="text-2xl font-bold tracking-tight">Study Mode</h1>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <StudyCard />
          </div>
          <div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Study Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Review words at your own pace</li>
                <li>• Focus on understanding each word thoroughly</li>
                <li>• Pay attention to example sentences</li>
                <li>• Press Enter to quickly move to the next word</li>
                <li>• Regular review helps with retention</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper component that provides VocabContext
const Study = () => {
  return (
    <VocabProvider>
      <StudyContent />
    </VocabProvider>
  );
};

export default Study;
