import React, { useState } from "react";
import { useVocab } from "@/contexts/VocabContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trash2, Edit, CheckCircle, XCircle } from "lucide-react";
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

const WordList: React.FC = () => {
  const { cards, deleteCard } = useVocab();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter cards based on search term
  const filteredCards = cards.filter((card) => {
    const term = searchTerm.toLowerCase();
    
    // Convert meaning to array if it's not already
    const meanings = Array.isArray(card.meaning)
      ? card.meaning
      : typeof card.meaning === 'string'
        ? (card.meaning as unknown as string).split(',')
        : [];
    
    return (
      card.word.toLowerCase().includes(term) ||
      meanings.some(meaning => meaning.toLowerCase().includes(term)) ||
      (card.exampleSentence && card.exampleSentence.toLowerCase().includes(term))
    );
  });
  
  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search words..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Word</TableHead>
            <TableHead>Meaning</TableHead>
            <TableHead>Example Sentence</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCards.map((card) => (
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
          {filteredCards.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No vocabulary cards found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default WordList;
