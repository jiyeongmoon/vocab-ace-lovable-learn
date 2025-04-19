
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BookOpen, ArrowLeftRight } from "lucide-react";

interface QuizModeSelectorProps {
  quizDirection: "engToKor" | "korToEng";
  setQuizDirection: (direction: "engToKor" | "korToEng") => void;
  isStudyMode: boolean;
  setIsStudyMode: (isStudyMode: boolean) => void;
}

const QuizModeSelector: React.FC<QuizModeSelectorProps> = ({
  quizDirection,
  setQuizDirection,
  isStudyMode,
  setIsStudyMode,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <Label htmlFor="study-mode" className="font-medium">Study Mode</Label>
          <p className="text-sm text-muted-foreground">
            Review words without answering
          </p>
        </div>
        <Switch
          id="study-mode"
          checked={isStudyMode}
          onCheckedChange={setIsStudyMode}
        />
      </div>
      
      {!isStudyMode && (
        <div className="space-y-2">
          <Label className="font-medium">Quiz Direction</Label>
          <ToggleGroup
            type="single"
            value={quizDirection}
            onValueChange={(value) => {
              if (value) setQuizDirection(value as "engToKor" | "korToEng");
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
      )}
    </div>
  );
};

export default QuizModeSelector;
