
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useVocab } from "@/contexts/VocabContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookPlus, Lightbulb, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const CardForm: React.FC = () => {
  const { addCard, generateExampleSentence, openAIEnabled, toggleOpenAI, openAIKey, updateOpenAIKey } = useVocab();
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [newAPIKey, setNewAPIKey] = useState(openAIKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!word.trim() || !meaning.trim()) return;
    
    // Convert delimited meaning string to array using multiple delimiters
    const meaningArray = meaning.split(/[,;/]+/).map(m => m.trim()).filter(Boolean);
    
    addCard({
      word: word.trim(),
      meaning: meaningArray,
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

  const handleSaveAPIKey = () => {
    updateOpenAIKey(newAPIKey);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <BookPlus className="mr-2 h-5 w-5" />
            Add New Vocabulary
          </CardTitle>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>AI Settings</SheetTitle>
                <SheetDescription>
                  Configure OpenAI integration for example sentences
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="openai-toggle" className="font-medium">Enable OpenAI</Label>
                  <Switch 
                    id="openai-toggle"
                    checked={openAIEnabled}
                    onCheckedChange={toggleOpenAI}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="api-key">OpenAI API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={newAPIKey}
                    onChange={(e) => setNewAPIKey(e.target.value)}
                    placeholder="sk-..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Your API key is stored locally and never sent to our servers.
                  </p>
                </div>
              </div>
              
              <SheetFooter>
                <Button onClick={handleSaveAPIKey}>Save API Key</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
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
              Meaning (separate with commas, semicolons, or slashes)
            </Label>
            <Input
              id="meaning"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="e.g. awe, fear; reverence/respect"
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
                disabled={!word.trim() || isGenerating || (openAIEnabled && !openAIKey)}
                className="flex items-center gap-1 text-xs"
              >
                <Lightbulb className="h-3 w-3" />
                {openAIEnabled ? 'Generate with AI' : 'Generate'}
              </Button>
            </div>
            <Textarea
              id="example"
              value={exampleSentence}
              onChange={(e) => setExampleSentence(e.target.value)}
              placeholder="Example sentence using the word"
              rows={2}
            />
            {openAIEnabled && !openAIKey && (
              <p className="text-xs text-amber-500">
                Please set your OpenAI API key in settings to use AI generation.
              </p>
            )}
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
