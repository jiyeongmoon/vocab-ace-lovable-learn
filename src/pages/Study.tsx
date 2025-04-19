
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { VocabProvider } from "@/contexts/VocabContext";
import StudyCard from "@/components/study/StudyCard";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BookOpen, ArrowLeftRight } from "lucide-react";

const StudyContent = () => {
  const navigate = useNavigate();
  const [studyDirection, setStudyDirection] = useState<"engToKor" | "korToEng">("engToKor");

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
            <div className="mb-6">
              <ToggleGroup
                type="single"
                value={studyDirection}
                onValueChange={(value) => {
                  if (value) setStudyDirection(value as "engToKor" | "korToEng");
                }}
                className="justify-start border rounded-md p-1 w-full"
              >
                <ToggleGroupItem value="engToKor" className="flex-1">
                  <BookOpen className="mr-1 h-4 w-4" />
                  Eng → Kor
                </ToggleGroupItem>
                <ToggleGroupItem value="korToEng" className="flex-1">
                  <ArrowLeftRight className="mr-1 h-4 w-4" />
                  Kor → Eng
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <StudyCard studyDirection={studyDirection} />
          </div>
          <div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Study Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Review words at your own pace</li>
                <li>• Click to reveal the hidden {studyDirection === "engToKor" ? "meaning" : "word"}</li>
                <li>• Pay attention to example sentences</li>
                <li>• Press Next when ready to continue</li>
                <li>• Regular review helps with retention</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Study = () => {
  return (
    <VocabProvider>
      <StudyContent />
    </VocabProvider>
  );
};

export default Study;
