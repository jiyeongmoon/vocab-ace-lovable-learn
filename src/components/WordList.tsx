
import React, { useState } from "react";
import { useVocab } from "@/contexts/VocabContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trash2, Edit, CheckCircle, XCircle, ArrowUpDown, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { parseMeaningToArray } from "@/contexts/vocabUtils";

const WordList: React.FC = () => {
  const { cards, deleteCard, resetAllCards } = useVocab();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"correctCount">("correctCount");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  // Filter cards based on search term
  const filteredCards = cards.filter((card) => {
    const term = searchTerm.toLowerCase();
    
    // Convert meaning to array if it's not already
    const meanings = Array.isArray(card.meaning)
      ? card.meaning
      : typeof card.meaning === 'string'
        ? parseMeaningToArray(card.meaning as unknown as string)
        : [];
    
    return (
      card.word.toLowerCase().includes(term) ||
      meanings.some(meaning => typeof meaning === 'string' && meaning.toLowerCase().includes(term)) ||
      (card.exampleSentence && card.exampleSentence.toLowerCase().includes(term))
    );
  });
  
  // Sort cards based on sort criteria
  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortBy === "correctCount") {
      return sortOrder === "desc" 
        ? b.correctCount - a.correctCount 
        : a.correctCount - b.correctCount;
    }
    return 0;
  });
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSortOrder("desc");
  };

  // Handle reset confirmation
  const handleResetConfirm = () => {
    resetAllCards();
    setIsResetDialogOpen(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={resetFilters}
            title="Reset filters"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by Progress" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Highest Progress First</SelectItem>
              <SelectItem value="asc">Lowest Progress First</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="destructive" 
            onClick={() => setIsResetDialogOpen(true)}
            title="Clear all words"
          >
            Clear All Words
          </Button>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Word</TableHead>
            <TableHead>Meaning</TableHead>
            <TableHead>Example Sentence</TableHead>
            <TableHead>
              <div className="flex items-center cursor-pointer" onClick={toggleSortOrder}>
                Progress
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCards.map((card) => (
            <TableRow key={card.id}>
              <TableCell className="font-medium">{card.word}</TableCell>
              <TableCell>
                {Array.isArray(card.meaning) ? (
                  <ul className="list-disc pl-5">
                    {card.meaning.map((meaning, index) => (
                      <li key={index}>{meaning}</li>
                    ))}
                  </ul>
                ) : (
                  card.meaning
                )}
              </TableCell>
              <TableCell>
                {card.exampleSentence ? (
                  <HoverCard>
                    <HoverCardTrigger>
                      {card.exampleSentence.substring(0, 50)}
                      {card.exampleSentence.length > 50 ? "..." : ""}
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      {card.exampleSentence}
                    </HoverCardContent>
                  </HoverCard>
                ) : (
                  "No example sentence"
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={Math.min((card.correctCount / 10) * 100, 100)} 
                    className="h-2 flex-grow" 
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {card.correctCount}/10
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteCard(card.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {sortedCards.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No vocabulary cards found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Words</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all vocabulary words? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetConfirm}>
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WordList;
