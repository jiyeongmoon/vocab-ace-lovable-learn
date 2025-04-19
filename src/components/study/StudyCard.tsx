
import React from "react";
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
import { BookOpen, ArrowRight } from "lucide-react";

const StudyCard: React.FC = () => {
  const { currentCard, nextCard, incompleteCards } = useVocab();

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

  // Format example sentence with word highlighting
  const formatExampleSentence = (sentence: string, word: string) => {
    if (!sentence) return "";
    const regex = new RegExp(`\\b(${word})\\b`, 'gi');
    return sentence.replace(regex, '**$1**');
  };

  const formattedSentence = currentCard.exampleSentence 
    ? formatExampleSentence(currentCard.exampleSentence, currentCard.word)
    : "";

  return (
    <Card>
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

        <div className="text-center">
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
          
          <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Progress value={progressPercentage} className="w-24 h-2" />
            <span>{currentCard.correctCount}/10</span>
          </div>
        </div>
      </CardHeader>

      <CardFooter>
        <Button onClick={nextCard} className="w-full">
          Next Word <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StudyCard;
