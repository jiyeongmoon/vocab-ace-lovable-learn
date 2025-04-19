
import React from "react";
import { CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { VocabularyCard } from "@/types/vocab";

interface QuizCardHeaderProps {
  currentCard: VocabularyCard;
  formattedSentence: string;
  incompleteCards: VocabularyCard[];
  quizDirection: "engToKor" | "korToEng";
  isStudyMode: boolean;
}

const QuizCardHeader: React.FC<QuizCardHeaderProps> = ({
  currentCard,
  formattedSentence,
  incompleteCards,
  quizDirection,
  isStudyMode
}) => {
  const progressPercentage = currentCard 
    ? Math.min((currentCard.correctCount / 10) * 100, 100) 
    : 0;

  // Generate blanked out sentence
  const getBlankedSentence = () => {
    if (!currentCard.exampleSentence) return "";
    
    const baseWord = currentCard.word.toLowerCase();
    // Match the word with optional endings (-ed, -es, -s)
    const regex = new RegExp(`\\b(${baseWord}(?:ed|es|s|ing)?)\\b`, 'gi');
    return currentCard.exampleSentence.replace(regex, '______');
  };

  return (
    <>
      <CardTitle className="flex justify-between items-center">
        <div className="flex items-center">
          <BookOpen className="mr-2 h-5 w-5" />
          {isStudyMode ? "Study Mode" : "Quiz Mode"}
        </div>
        <div className="text-sm font-normal text-muted-foreground">
          {incompleteCards.length} {incompleteCards.length === 1 ? 'word' : 'words'} remaining
        </div>
      </CardTitle>
    
      <div className="text-center">
        {quizDirection === "engToKor" && !isStudyMode ? (
          <>
            <div className="text-3xl font-bold mb-3">{currentCard.word}</div>
            
            {currentCard.exampleSentence && formattedSentence && (
              <div className="text-2xl leading-relaxed text-gray-700 mb-4">
                <span dangerouslySetInnerHTML={{ 
                  __html: formattedSentence.replace(/\*\*(.*?)\*\*/g, '<strong class="text-black">$1</strong>') 
                }} />
              </div>
            )}
          </>
        ) : quizDirection === "korToEng" && !isStudyMode ? (
          <>
            <div className="text-3xl font-bold mb-3">
              {Array.isArray(currentCard.meaning) 
                ? currentCard.meaning.join(", ") 
                : currentCard.meaning}
            </div>
            
            {currentCard.exampleSentence && (
              <div className="text-2xl leading-relaxed text-gray-700 mb-4">
                {getBlankedSentence()}
              </div>
            )}
          </>
        ) : (
          // Study mode - show both word and meaning
          <>
            <div className="text-3xl font-bold mb-2">{currentCard.word}</div>
            <div className="text-2xl mb-3 text-gray-700">
              {Array.isArray(currentCard.meaning) 
                ? currentCard.meaning.join(", ") 
                : currentCard.meaning}
            </div>
            
            {currentCard.exampleSentence && (
              <div className="text-xl leading-relaxed text-gray-700 mb-4">
                <span dangerouslySetInnerHTML={{ 
                  __html: formattedSentence.replace(/\*\*(.*?)\*\*/g, '<strong class="text-black">$1</strong>') 
                }} />
              </div>
            )}
          </>
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
