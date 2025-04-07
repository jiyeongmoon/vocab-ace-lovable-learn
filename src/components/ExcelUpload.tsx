
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useVocab } from "@/contexts/VocabContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Upload, FileText, AlertTriangle, X, Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { fetchGoogleSheetData } from "@/contexts/vocabUtils";

const ExcelUpload: React.FC = () => {
  const { addCards } = useVocab();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");
  const [isLoadingGoogleSheet, setIsLoadingGoogleSheet] = useState(false);
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

  const downloadTemplate = () => {
    // Create a template workbook with example data
    const worksheet = XLSX.utils.json_to_sheet([
      { Word: "example", Meaning: "an instance serving to illustrate", "Example Sentence": "This is an example sentence." },
      { Word: "vocabulary", Meaning: "a list of words and their meanings", "Example Sentence": "Expanding your vocabulary helps with language learning." }
    ]);
    
    // Set column widths for better appearance
    const wscols = [
      { wch: 15 }, // Word
      { wch: 30 }, // Meaning
      { wch: 40 }  // Example Sentence
    ];
    worksheet['!cols'] = wscols;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "VocabularyTemplate");
    
    // Generate and download the file
    XLSX.writeFile(workbook, "vocabulary_import_template.xlsx");
    
    toast({
      title: "Template Downloaded",
      description: "Fill in the template with your vocabulary and import it back.",
    });
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
          // Convert meaning to array
          meaning: String(row.Meaning).trim().split(',').map((m: string) => m.trim()),
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
      
      toast({
        title: "Import Successful",
        description: `Imported ${validCards.length} vocabulary items.`,
      });
    } catch (error) {
      console.error("Failed to process file:", error);
      toast({
        title: "Import Failed",
        description: "Failed to process the file. Please check the format and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSheetImport = async () => {
    if (!googleSheetUrl.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a Google Sheet URL",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingGoogleSheet(true);
    try {
      const sheetData = await fetchGoogleSheetData(googleSheetUrl);
      
      if (sheetData.length === 0) {
        toast({
          title: "Import Failed",
          description: "No valid data found in the Google Sheet. Make sure the sheet has Word and Meaning columns.",
          variant: "destructive"
        });
        return;
      }

      // Transform the data for our app
      const validCards = sheetData.map(row => ({
        word: row.Word.trim(),
        meaning: row.Meaning.trim().split(',').map(m => m.trim()),
        exampleSentence: row.Example || "",
        userAnswer: ""
      }));

      // Add the cards
      addCards(validCards);
      
      // Reset form
      setGoogleSheetUrl("");
      
      toast({
        title: "Import Successful",
        description: `Imported ${validCards.length} vocabulary items from Google Sheet.`,
      });
    } catch (error: any) {
      console.error("Google Sheet import error:", error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import from Google Sheet. Make sure the sheet is publicly accessible.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingGoogleSheet(false);
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
      <CardContent>
        <Tabs defaultValue="file" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">Excel/CSV File</TabsTrigger>
            <TabsTrigger value="google">Google Sheet</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-4">
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
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={downloadTemplate}
                      className="flex items-center"
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Download Template
                    </Button>
                  </div>
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
          </TabsContent>
          
          <TabsContent value="google" className="space-y-4">
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-center">
                  Import vocabulary from Google Sheets
                </p>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  The Google Sheet must be publicly accessible (shared with "Anyone with the link")
                </p>
              </div>
              
              <div className="space-y-2">
                <Input
                  placeholder="Paste Google Sheet URL here"
                  value={googleSheetUrl}
                  onChange={(e) => setGoogleSheetUrl(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={handleGoogleSheetImport}
                  disabled={!googleSheetUrl || isLoadingGoogleSheet}
                >
                  {isLoadingGoogleSheet ? "Importing..." : "Import from Google Sheet"}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center bg-amber-50 text-amber-800 p-3 rounded text-sm">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>
                Your Google Sheet must be set to "Anyone with the link can view" and should have columns named "Word" and "Meaning". An optional "Example" column can also be included.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExcelUpload;
