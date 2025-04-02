import React from "react";
import { useVocab } from "@/contexts/VocabContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BookOpen,
  List,
  Upload,
  Plus,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import CardForm from "./CardForm";
import QuizCard from "./QuizCard";
import WordList from "./WordList";
import ExcelUpload from "./ExcelUpload";

const Dashboard: React.FC = () => {
  const { cards, incompleteCards, completedCards, quizMode, setQuizMode } = useVocab();
  const navigate = useNavigate();
  
  // Calculate stats
  const totalWords = cards.length;
  const masteredWords = completedCards.length;
  const masteredPercentage = totalWords > 0 
    ? Math.round((masteredWords / totalWords) * 100) 
    : 0;

  // Handle navigation to Quiz page
  const handleQuizClick = () => {
    navigate("/quiz");
  };

  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vocab Ace</h1>
          <p className="text-muted-foreground">Master new vocabulary through spaced repetition</p>
        </div>
        
        <Button
          onClick={handleQuizClick}
          className="flex items-center"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Start Quiz Mode
        </Button>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Words</p>
              <p className="text-2xl font-bold">{totalWords}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mastered</p>
              <p className="text-2xl font-bold">{masteredWords}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">{incompleteCards.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Management Mode */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Tabs defaultValue="list">
            <TabsList className="mb-4">
              <TabsTrigger value="list" className="flex items-center">
                <List className="mr-2 h-4 w-4" />
                Word List
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="m-0">
              <WordList />
            </TabsContent>
            
            <TabsContent value="import" className="m-0">
              <ExcelUpload />
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <CardForm />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
