
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVocab } from "@/contexts/VocabContext";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ArrowRight, Eye } from "lucide-react";

const StudyCard: React.FC<{ studyDirection: "engToKor" | "korToEng" }> = ({ studyDirection }) => {
  const { currentCard, nextCard, incompleteCards } = useVocab();
  const [revealed, setRevealed] = useState(false);

  if (!currentCard) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No words to study.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Add some words to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = Math.min((currentCard.correctCount / 10) * 100, 100);

  // Format example sentence with word blanking for Kor→Eng mode
  const formatExampleSentence = (sentence: string, word: string) => {
    if (!sentence) return "";
    if (studyDirection === "engToKor") {
      const regex = new RegExp(`\\b(${word})\\b`, 'gi');
      return sentence.replace(regex, '**$1**');
    } else {
      // For Kor→Eng, blank out the word and its variations
      const baseWord = word.toLowerCase();
      const regex = new RegExp(`\\b(${baseWord}(?:ed|es|s|ing)?)\\b`, 'gi');
      return sentence.replace(regex, '______');
    }
  };

  const formattedSentence = currentCard.exampleSentence 
    ? formatExampleSentence(currentCard.exampleSentence, currentCard.word)
    : "";

  const handleNext = () => {
    nextCard();
    setRevealed(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Study Mode
          </div>
          <div className="text-sm font-normal text-muted-foreground">
            {incompleteCards.length} {incompleteCards.length === 1 ? 'word' : 'words'} remaining
          </div>
        </CardTitle>

        <div 
          className="text-center cursor-pointer p-4 rounded-lg hover:bg-slate-50 transition-colors"
          onClick={() => setRevealed(true)}
        >
          {studyDirection === "engToKor" ? (
            <>
              <div className="text-3xl font-bold mb-2">{currentCard.word}</div>
              {currentCard.exampleSentence && (
                <div className="text-xl leading-relaxed text-gray-700 mb-4">
                  <span dangerouslySetInnerHTML={{ 
                    __html: formattedSentence.replace(/\*\*(.*?)\*\*/g, '<strong class="text-black">$1</strong>') 
                  }} />
                </div>
              )}
              {revealed && (
                <div className="text-2xl mb-3 text-gray-700 mt-4">
                  {Array.isArray(currentCard.meaning) 
                    ? currentCard.meaning.join(", ") 
                    : currentCard.meaning}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-3xl font-bold mb-2">
                {Array.isArray(currentCard.meaning) 
                  ? currentCard.meaning.join(", ") 
                  : currentCard.meaning}
              </div>
              {currentCard.exampleSentence && (
                <div className="text-xl leading-relaxed text-gray-700 mb-4">
                  {formattedSentence}
                </div>
              )}
              {revealed && (
                <div className="text-2xl mb-3 text-gray-700 mt-4">
                  {currentCard.word}
                </div>
              )}
            </>
          )}
          
          {!revealed && (
            <div className="flex items-center justify-center text-blue-600 mt-4">
              <Eye className="w-4 h-4 mr-2" />
              <span>Click to reveal {studyDirection === "engToKor" ? "meaning" : "word"}</span>
            </div>
          )}
          
          <div className="text-sm text-gray-500 flex items-center justify-center gap-2 mt-4">
            <Progress value={progressPercentage} className="w-24 h-2" />
            <span>{currentCard.correctCount}/10</span>
          </div>
        </div>
      </CardHeader>

      <CardFooter>
        <Button onClick={handleNext} className="w-full">
          Next Word <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StudyCard;
