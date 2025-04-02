
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useVocab } from "@/contexts/VocabContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookPlus, Lightbulb } from "lucide-react";

const CardForm: React.FC = () => {
  const { addCard, generateExampleSentence } = useVocab();
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!word.trim() || !meaning.trim()) return;
    
    addCard({
      word: word.trim(),
      meaning: meaning.trim(),
      exampleSentence: exampleSentence.trim(),
      userAnswer: ""
    });
    
    // Reset form
    setWord("");
    setMeaning("");
    setExampleSentence("");
  };

  const handleGenerateExample = async () => {
    if (!word.trim()) return;
    
    setIsGenerating(true);
    try {
      const sentence = await generateExampleSentence(word);
      setExampleSentence(sentence);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookPlus className="mr-2 h-5 w-5" />
          Add New Vocabulary
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="word">Word</Label>
            <Input
              id="word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Enter a vocabulary word"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="meaning">
              Meaning (separate multiple meanings with commas)
            </Label>
            <Input
              id="meaning"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="e.g. awe, fear, reverence"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="example">Example Sentence</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleGenerateExample}
                disabled={!word.trim() || isGenerating}
                className="flex items-center gap-1 text-xs"
              >
                <Lightbulb className="h-3 w-3" />
                Generate
              </Button>
            </div>
            <Textarea
              id="example"
              value={exampleSentence}
              onChange={(e) => setExampleSentence(e.target.value)}
              placeholder="Example sentence using the word"
              rows={2}
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full">Add Card</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CardForm;
