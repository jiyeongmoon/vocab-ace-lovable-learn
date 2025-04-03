
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVocab } from "@/contexts/VocabContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, BookOpen, ArrowRight, Search, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const QuizCard: React.FC = () => {
  const { 
    currentCard, 
    nextCard, 
    resetUserAnswer, 
    updateCard,
    incompleteCards,
    checkAnswer,
    quizResult
  } = useVocab();
  
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [attemptedRetry, setAttemptedRetry] = useState(false);
  const hasSubmittedAnswer = useRef(false);

  // Reset states when card changes
  useEffect(() => {
    if (currentCard) {
      setUserAnswer("");
      setAttemptedRetry(false);
      setShowAnswer(false);
      hasSubmittedAnswer.current = false;
    }
  }, [currentCard?.id]);

  // Critical fix: Ensure showAnswer updates when quizResult changes
  useEffect(() => {
    console.log("quizResult changed:", quizResult, "hasSubmittedAnswer:", hasSubmittedAnswer.current);
    if (quizResult !== null && hasSubmittedAnswer.current) {
      setShowAnswer(true);
    }
  }, [quizResult]);

  // Handle keydown for Enter key to move to next word
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && showAnswer) {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAnswer]);

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
    
    // Mark that we've submitted an answer this cycle
    hasSubmittedAnswer.current = true;
    
    // Update the card with the user's answer
    updateCard(currentCard.id, { userAnswer });
    
    // Use the context's checkAnswer function
    console.log("About to check answer, hasSubmittedAnswer:", hasSubmittedAnswer.current);
    checkAnswer(userAnswer);
  };

  const handleNext = () => {
    nextCard();
  };

  const handleRetry = () => {
    setUserAnswer("");
    setShowAnswer(false);
    setAttemptedRetry(true);
    hasSubmittedAnswer.current = false;
  };

  const openDictionary = () => {
    window.open(`https://dictionary.cambridge.org/ko/사전/영어-한국어/${encodeURIComponent(currentCard.word)}`, '_blank');
  };

  const progressPercentage = currentCard 
    ? Math.min((currentCard.correctCount / 10) * 100, 100) 
    : 0;

  const formatExampleSentence = (sentence: string, word: string) => {
    if (!sentence) return "";
    
    const regex = new RegExp(`\\b(${word})\\b`, 'gi');
    return sentence.replace(regex, '**$1**');
  };

  const formattedSentence = currentCard.exampleSentence 
    ? formatExampleSentence(currentCard.exampleSentence, currentCard.word)
    : "";

  const getAllMeanings = () => {
    return currentCard.meaning.split(',').map(meaning => meaning.trim());
  };

  console.log("Rendering state:", { showAnswer, quizResult, hasSubmittedAnswer: hasSubmittedAnswer.current });
  
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
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!userAnswer.trim()}
            >
              Check Answer
            </Button>
          )}
        </form>
        
        {showAnswer && quizResult && (
          <div className={`p-4 rounded-md ${quizResult === "Correct" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            <div className="flex items-start gap-3">
              {quizResult === "Correct" ? (
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              
              <div className="flex-1">
                <p className="font-semibold text-lg mb-2">
                  {quizResult === "Correct" ? "Correct! ✅" : "Incorrect ❌"}
                </p>
                <div className="text-base mb-2">
                  <span className="font-medium">Your answer:</span> {userAnswer}
                </div>
                <div className="text-base">
                  <span className="font-medium">Correct meanings:</span>
                  <ul className="list-disc pl-5 mt-1">
                    {getAllMeanings().map((meaning, index) => (
                      <li key={index} className="text-sm">{meaning}</li>
                    ))}
                  </ul>
                </div>
                
                {currentCard.exampleSentence && (
                  <div className="text-sm mt-2 italic opacity-75">
                    <span dangerouslySetInnerHTML={{ 
                      __html: formattedSentence.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                    }} />
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openDictionary}
                className="flex items-center text-xs"
              >
                <Search className="mr-1 h-3.5 w-3.5" />
                🔍 Search in Cambridge Dictionary
              </Button>
              
              {quizResult === "Incorrect" && !attemptedRetry && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="flex items-center text-xs"
                >
                  <RotateCcw className="mr-1 h-3.5 w-3.5" />
                  Retry
                </Button>
              )}
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
