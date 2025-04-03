
import React from "react";
import { CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { VocabularyCard } from "@/types/vocab";

interface QuizCardHeaderProps {
  currentCard: VocabularyCard;
  formattedSentence: string;
  incompleteCards: VocabularyCard[];
}

const QuizCardHeader: React.FC<QuizCardHeaderProps> = ({
  currentCard,
  formattedSentence,
  incompleteCards
}) => {
  const progressPercentage = currentCard 
    ? Math.min((currentCard.correctCount / 10) * 100, 100) 
    : 0;

  return (
    <>
      <CardTitle className="flex justify-between items-center">
        <div className="flex items-center">
          <BookOpen className="mr-2 h-5 w-5" />
          Quiz Mode
        </div>
        <div className="text-sm font-normal text-muted-foreground">
          {incompleteCards.length} {incompleteCards.length === 1 ? 'word' : 'words'} remaining
        </div>
      </CardTitle>
    
      <div className="text-center">
        <div className="text-3xl font-bold mb-3">{currentCard.word}</div>
        
        {currentCard.exampleSentence && (
          <div className="text-2xl leading-relaxed text-gray-700 mb-4">
            <span dangerouslySetInnerHTML={{ 
              __html: formattedSentence.replace(/\*\*(.*?)\*\*/g, '<strong class="text-black">$1</strong>') 
            }} />
          </div>
        )}
        
        <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
          <Progress value={progressPercentage} className="w-24 h-2" />
          <span>{currentCard.correctCount}/10</span>
        </div>
      </div>
    </>
  );
};

export default QuizCardHeader;
