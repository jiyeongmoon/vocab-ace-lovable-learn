
import React, { useState } from "react";
import { useVocab } from "@/contexts/VocabContext";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Circle, 
  Search, 
  Trash2,
  List,
  SortAsc,
  SortDesc,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type SortField = 'word' | 'correctCount' | 'createdAt';
type SortDirection = 'asc' | 'desc';
type FilterOption = 'all' | 'completed' | 'inProgress';

const WordList: React.FC = () => {
  const { cards, deleteCard } = useVocab();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter cards based on search term and completion status
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          card.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterOption === 'all') return matchesSearch;
    if (filterOption === 'completed') return matchesSearch && card.completed;
    if (filterOption === 'inProgress') return matchesSearch && !card.completed;
    
    return matchesSearch;
  });

  // Sort cards
  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortField === 'word') {
      return sortDirection === 'asc' 
        ? a.word.localeCompare(b.word)
        : b.word.localeCompare(a.word);
    } else if (sortField === 'correctCount') {
      return sortDirection === 'asc'
        ? a.correctCount - b.correctCount
        : b.correctCount - a.correctCount;
    } else {
      return sortDirection === 'asc'
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  // Paginate cards
  const totalPages = Math.ceil(sortedCards.length / itemsPerPage);
  const paginatedCards = sortedCards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sort toggle
  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending for new field
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <List className="mr-2 h-5 w-5" />
          Word List
        </CardTitle>
        <CardDescription>
          Manage and track your vocabulary progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search words or meanings..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="pl-8"
            />
            {searchTerm && (
              <button 
                className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select 
            value={filterOption} 
            onValueChange={(value) => {
              setFilterOption(value as FilterOption);
              setCurrentPage(1); // Reset to first page on filter change
            }}
          >
            <SelectTrigger className="w-36 md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Words</SelectItem>
              <SelectItem value="completed">Mastered</SelectItem>
              <SelectItem value="inProgress">In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {paginatedCards.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">
                    <button 
                      className="flex items-center hover:text-primary"
                      onClick={() => toggleSort('word')}
                    >
                      Word
                      {sortField === 'word' && (
                        sortDirection === 'asc' 
                          ? <SortAsc className="ml-1 h-4 w-4" /> 
                          : <SortDesc className="ml-1 h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="w-[40%]">Meaning</TableHead>
                  <TableHead className="w-[10%] text-center">
                    <button 
                      className="flex items-center justify-center hover:text-primary"
                      onClick={() => toggleSort('correctCount')}
                    >
                      Progress
                      {sortField === 'correctCount' && (
                        sortDirection === 'asc' 
                          ? <SortAsc className="ml-1 h-4 w-4" /> 
                          : <SortDesc className="ml-1 h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="w-[10%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell className="font-medium">{card.word}</TableCell>
                    <TableCell>{card.meaning}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {card.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <span className="text-sm">{card.correctCount}/10</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Vocabulary Card</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{card.word}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteCard(card.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm || filterOption !== 'all' 
              ? "No matching vocabulary cards found." 
              : "No vocabulary cards added yet."}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  isActive={currentPage > 1}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {[...Array(totalPages).keys()].map((page) => (
                <PaginationItem key={page + 1}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page + 1)}
                    isActive={currentPage === page + 1}
                  >
                    {page + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  isActive={currentPage < totalPages}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
};

export default WordList;
