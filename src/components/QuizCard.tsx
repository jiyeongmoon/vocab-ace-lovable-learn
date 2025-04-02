
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVocab } from "@/contexts/VocabContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, BookOpen, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const QuizCard: React.FC = () => {
  const { 
    currentCard, 
    checkAnswer, 
    quizResult, 
    nextCard, 
    resetUserAnswer, 
    updateCard,
    incompleteCards
  } = useVocab();
  
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  // Reset local state when current card changes
  useEffect(() => {
    setUserAnswer("");
    setShowAnswer(false);
  }, [currentCard?.id]);

  if (!currentCard) {
    return (
      <Card className="w-full h-64 flex items-center justify-center">
        <CardContent className="text-center p-6">
          <h3 className="text-xl font-semibold mb-4">All Done! 🎉</h3>
          <p className="text-gray-600 mb-6">
            You've completed all your vocabulary cards.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userAnswer.trim()) return;
    
    // Update the card's userAnswer
    updateCard(currentCard.id, { userAnswer });
    
    // Check the answer
    checkAnswer(userAnswer);
    
    // Show the answer area
    setShowAnswer(true);
  };

  const handleNext = () => {
    resetUserAnswer();
    setUserAnswer("");
    setShowAnswer(false);
    nextCard();
  };

  const progressPercentage = currentCard 
    ? Math.min((currentCard.correctCount / 10) * 100, 100) 
    : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Quiz Mode
          </div>
          <div className="text-sm font-normal text-muted-foreground">
            {incompleteCards.length} {incompleteCards.length === 1 ? 'word' : 'words'} remaining
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">{currentCard.word}</div>
          
          <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Progress value={progressPercentage} className="w-24 h-2" />
            <span>{currentCard.correctCount}/10</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type the meaning of this word"
              disabled={showAnswer}
              autoFocus
            />
          </div>
          
          {!showAnswer && (
            <Button type="submit" className="w-full" disabled={!userAnswer.trim()}>
              Check Answer
            </Button>
          )}
        </form>
        
        {showAnswer && (
          <div className={`p-4 rounded-md ${quizResult === "Correct" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            <div className="flex items-start gap-3">
              {quizResult === "Correct" ? (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              
              <div className="flex-1">
                <p className="font-medium mb-1">
                  {quizResult === "Correct" ? "Correct!" : "Incorrect"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Correct meaning:</span> {currentCard.meaning}
                </p>
                {currentCard.exampleSentence && (
                  <p className="text-sm mt-2 italic">
                    "{currentCard.exampleSentence}"
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      {showAnswer && (
        <CardFooter>
          <Button 
            onClick={handleNext} 
            className="w-full"
            variant={quizResult === "Correct" ? "default" : "outline"}
          >
            Next Word <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default QuizCard;
