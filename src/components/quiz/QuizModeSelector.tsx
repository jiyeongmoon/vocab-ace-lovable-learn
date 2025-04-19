
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BookOpen, ArrowLeftRight } from "lucide-react";
import { useQuizCard } from "@/hooks/useQuizCard";

const QuizModeSelector = () => {
  const { quizDirection, setQuizDirection } = useQuizCard();

  return (
    <div className="space-y-2">
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
  );
};

export default QuizModeSelector;
