
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useVocab } from "@/contexts/VocabContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Upload, FileText, AlertTriangle, X } from "lucide-react";
import * as XLSX from "xlsx";

const ExcelUpload: React.FC = () => {
  const { addCards } = useVocab();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processFile = async () => {
    if (!file) return;
    
    setIsLoading(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Validate and transform the data
      const validCards = jsonData
        .filter((row: any) => row.Word && row.Meaning)
        .map((row: any) => ({
          word: String(row.Word).trim(),
          meaning: String(row.Meaning).trim(),
          exampleSentence: row.Example || row["Example Sentence"] || "",
          userAnswer: ""
        }));
      
      if (validCards.length === 0) {
        toast({
          title: "Import Failed",
          description: "No valid vocabulary found. Please make sure your file has 'Word' and 'Meaning' columns.",
          variant: "destructive"
        });
        return;
      }
      
      // Add the cards
      addCards(validCards);
      
      // Clear file after successful import
      clearFile();
      
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Import Failed",
        description: "Failed to process the file. Please check the format and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="mr-2 h-5 w-5" />
          Import Vocabulary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            file ? "border-primary" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {!file ? (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Drag and drop your Excel/CSV file here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your file should contain columns: Word, Meaning, and optionally Example Sentence
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between bg-primary/5 p-3 rounded">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-primary mr-2" />
                <div className="text-sm font-medium truncate max-w-[200px]">
                  {file.name}
                </div>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center bg-amber-50 text-amber-800 p-3 rounded text-sm">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
          <p>
            Your Excel/CSV must include columns named "Word" and "Meaning". An optional "Example Sentence" column can also be included.
          </p>
        </div>

        <Button
          className="w-full"
          onClick={processFile}
          disabled={!file || isLoading}
        >
          {isLoading ? "Processing..." : "Import Vocabulary"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExcelUpload;
