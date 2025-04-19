
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BookOpen, ArrowLeftRight } from "lucide-react";

interface QuizModeSelectorProps {
  quizDirection?: "engToKor" | "korToEng";
  setQuizDirection?: (value: "engToKor" | "korToEng") => void;
  isStudyMode?: boolean;
  setIsStudyMode?: (value: boolean) => void;
}

const QuizModeSelector: React.FC<QuizModeSelectorProps> = ({ 
  quizDirection, 
  setQuizDirection 
}) => {
  // Since we're using this component in both standalone mode and via useQuizCard hook,
  // we need to handle both cases
  const handleDirectionChange = (value: string) => {
    if (value && setQuizDirection) {
      setQuizDirection(value as "engToKor" | "korToEng");
    }
  };

  return (
    <div className="space-y-2">
      <ToggleGroup
        type="single"
        value={quizDirection}
        onValueChange={handleDirectionChange}
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
  );
};

export default QuizModeSelector;
