
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useVocab } from "@/contexts/VocabContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Upload, FileText, AlertTriangle, X, Download, Layers } from "lucide-react";
import * as XLSX from "xlsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { parseMeaningToArray } from "@/contexts/vocabUtils";

const ExcelUpload: React.FC = () => {
  const { addCards } = useVocab();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [importAllSheets, setImportAllSheets] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      handleFilePreview(selectedFile);
    }
  };

  const handleFilePreview = async (selectedFile: File) => {
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheets = workbook.SheetNames;
      
      setAvailableSheets(sheets);
      setSelectedSheet(sheets[0]); // Default to first sheet
      setImportAllSheets(false);
      
      // Preview the first sheet
      if (sheets.length > 0) {
        const firstSheet = workbook.Sheets[sheets[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        setPreviewData(jsonData.slice(0, 3)); // First 3 rows for preview
      }
    } catch (error) {
      console.error("Failed to preview file:", error);
      toast({
        title: "Preview Failed",
        description: "Failed to preview the file. Please check the format and try again.",
        variant: "destructive"
      });
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
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      handleFilePreview(droppedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setAvailableSheets([]);
    setSelectedSheet("");
    setPreviewData(null);
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

  const processSheet = (worksheet: XLSX.WorkSheet, sheetName: string): number => {
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // Debug log
    console.log(`Processing sheet: ${sheetName}`, jsonData);
    
    // Validate and transform the data
    const validCards = jsonData
      .filter((row: any) => row.Word && row.Meaning)
      .map((row: any) => ({
        word: String(row.Word).trim(),
        // Convert meaning to array using multiple delimiters
        meaning: parseMeaningToArray(String(row.Meaning).trim()),
        exampleSentence: row.Example || row["Example Sentence"] || "",
        userAnswer: ""
      }));
    
    if (validCards.length === 0) {
      toast({
        title: `No valid data in sheet: ${sheetName}`,
        description: "Please make sure your sheet has 'Word' and 'Meaning' columns.",
        variant: "destructive"
      });
      return 0;
    }
    
    // Add the cards
    addCards(validCards);
    return validCards.length;
  };

  const processFile = async () => {
    if (!file) return;
    
    setIsLoading(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      let totalImported = 0;
      
      if (importAllSheets) {
        // Process all sheets
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const imported = processSheet(worksheet, sheetName);
          totalImported += imported;
        });
      } else if (selectedSheet) {
        // Process only the selected sheet
        const worksheet = workbook.Sheets[selectedSheet];
        totalImported = processSheet(worksheet, selectedSheet);
      }
      
      if (totalImported > 0) {
        // Clear file after successful import
        clearFile();
        
        toast({
          title: "Import Successful",
          description: `Imported ${totalImported} vocabulary items.`,
        });
      }
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="mr-2 h-5 w-5" />
          Import Vocabulary
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            <div className="space-y-4">
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
              
              {availableSheets.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="importAll" 
                      checked={importAllSheets}
                      onCheckedChange={(checked) => {
                        setImportAllSheets(checked as boolean);
                      }}
                    />
                    <Label htmlFor="importAll" className="flex items-center">
                      <Layers className="h-4 w-4 mr-1" />
                      Import all sheets
                    </Label>
                  </div>
                  
                  {!importAllSheets && (
                    <div className="space-y-2">
                      <Label htmlFor="sheetSelect">Select sheet to import:</Label>
                      <Select
                        value={selectedSheet}
                        onValueChange={setSelectedSheet}
                      >
                        <SelectTrigger id="sheetSelect" className="w-full">
                          <SelectValue placeholder="Select a sheet" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSheets.map((sheet) => (
                            <SelectItem key={sheet} value={sheet}>
                              {sheet}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {previewData && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Preview (first 3 rows):</p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs border-collapse">
                          <tbody>
                            {previewData.map((row: any, rowIndex: number) => (
                              <tr key={rowIndex} className={rowIndex === 0 ? "bg-gray-100 font-medium" : ""}>
                                {row.map((cell: any, cellIndex: number) => (
                                  <td key={cellIndex} className="border border-gray-200 p-1 truncate max-w-[150px]">
                                    {cell?.toString() || ""}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center bg-amber-50 text-amber-800 p-3 rounded text-sm mt-4">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
          <p>
            Your Excel/CSV must include columns named "Word" and "Meaning". An optional "Example Sentence" column can also be included.
          </p>
        </div>

        <Button
          className="w-full mt-4"
          onClick={processFile}
          disabled={!file || isLoading || (availableSheets.length > 0 && !importAllSheets && !selectedSheet)}
        >
          {isLoading ? "Processing..." : "Import Vocabulary"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExcelUpload;
