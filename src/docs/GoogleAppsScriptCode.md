
# Google Apps Script Code for Vocab Ace

Copy and paste this code into a new Google Apps Script project in your Google Drive.

```javascript
/**
 * Handles POST requests to the web app.
 * Appends vocabulary data to a specified sheet in the spreadsheet.
 * 
 * @param {Object} e - The event object containing the request parameters
 * @return {Object} JSON response with success status and message
 */
function doPost(e) {
  try {
    // Set CORS headers for the preflight request
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };
    
    // Parse the request payload
    const payload = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Get the sheet name from the payload, or use a default
    const sheetName = payload.sheetName || "VocabWords";
    
    // Get or create the sheet
    let sheet = ss.getSheetByName(sheetName);
    let isNewSheet = false;
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      isNewSheet = true;
      // Add headers if this is a new sheet
      sheet.appendRow([
        "Word", 
        "Meaning", 
        "Example Sentence",
        "Date Added"
      ]);
    } else if (!isNewSheet) {
      // Check if the sheet has the required headers
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      // Debug log to see what headers were detected
      console.log("Detected headers in sheet: " + JSON.stringify(headers));
      
      // Normalize headers for comparison (trim whitespace and convert to lowercase)
      const normalizedHeaders = headers.map(header => 
        header ? String(header).trim().toLowerCase() : ""
      );
      
      console.log("Normalized headers: " + JSON.stringify(normalizedHeaders));
      
      // Check if required headers exist (case-insensitive, ignoring whitespace)
      const hasWordColumn = normalizedHeaders.some(h => h === "word");
      const hasMeaningColumn = normalizedHeaders.some(h => h === "meaning");
      
      // If headers are missing, add them
      if (!hasWordColumn || !hasMeaningColumn) {
        console.log("Required headers missing. Word exists: " + hasWordColumn + ", Meaning exists: " + hasMeaningColumn);
        
        // Find the last used row to determine if we need to add headers to an empty sheet
        // or if we need to create a new row for headers
        const lastRow = sheet.getLastRow();
        
        if (lastRow === 0) {
          // Sheet is empty, add headers
          sheet.appendRow([
            "Word", 
            "Meaning", 
            "Example Sentence",
            "Date Added"
          ]);
        } else {
          // Sheet has data but missing headers - prepend headers row
          sheet.insertRowBefore(1);
          sheet.getRange(1, 1, 1, 4).setValues([
            ["Word", "Meaning", "Example Sentence", "Date Added"]
          ]);
        }
      }
    }
    
    // Format date for better readability
    const timestamp = new Date();
    const formattedDate = Utilities.formatDate(
      timestamp, 
      SpreadsheetApp.getActive().getSpreadsheetTimeZone(), 
      "yyyy-MM-dd HH:mm:ss"
    );
    
    // Find column indices based on normalized header names
    const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const normalizedHeaders = headerRow.map(header => 
      header ? String(header).trim().toLowerCase() : ""
    );
    
    // Find column indices (0-based)
    const wordColIndex = normalizedHeaders.findIndex(h => h === "word");
    const meaningColIndex = normalizedHeaders.findIndex(h => h === "meaning");
    const exampleColIndex = normalizedHeaders.findIndex(h => 
      h === "example sentence" || h === "example" || h === "examples" || h === "sentence"
    );
    const dateColIndex = normalizedHeaders.findIndex(h => 
      h === "date added" || h === "date" || h === "added date" || h === "added"
    );
    
    // Prepare the row data (mapping to the correct columns)
    const rowData = [];
    
    // Ensure array has enough elements for the largest index
    const maxIndex = Math.max(wordColIndex, meaningColIndex, exampleColIndex, dateColIndex);
    for (let i = 0; i <= maxIndex; i++) {
      rowData[i] = "";  // Fill with empty strings initially
    }
    
    // Set values in the appropriate columns
    if (wordColIndex >= 0) rowData[wordColIndex] = payload.word;
    if (meaningColIndex >= 0) rowData[meaningColIndex] = payload.meaning;
    if (exampleColIndex >= 0) rowData[exampleColIndex] = payload.example;
    if (dateColIndex >= 0) rowData[dateColIndex] = formattedDate;
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Vocabulary added successfully",
      debug: {
        detectedHeaders: headerRow,
        normalizedHeaders: normalizedHeaders,
        columnIndices: {
          word: wordColIndex,
          meaning: meaningColIndex,
          example: exampleColIndex,
          date: dateColIndex
        }
      }
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
    
  } catch (error) {
    // Handle errors
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    };
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  }
}

/**
 * Handles GET requests to the web app.
 * 
 * @param {Object} e - The event object containing the request parameters
 * @return {string} Simple HTML message
 */
function doGet(e) {
  return HtmlService.createHtmlOutput(
    "The Google Apps Script for Vocab Ace is running. This endpoint accepts POST requests only."
  );
}
```

## Deployment Instructions

1. Create a new Google Apps Script project:
   - Go to [script.google.com](https://script.google.com)
   - Click "New Project"
   - Copy and paste the above code

2. Set up the script:
   - Change the name of the project to "Vocab Ace Integration"
   - Save the project

3. Deploy as web app:
   - Click "Deploy" > "New deployment"
   - Select "Web app" as the deployment type
   - Description: "Vocab Ace Integration"
   - Execute as: "Me"
   - Who has access: "Anyone" (important for CORS)
   - Click "Deploy"

4. Copy the deployment URL:
   - After deployment, you'll see a URL like `https://script.google.com/macros/s/[UNIQUE_ID]/exec`
   - Copy this URL to use in the Vocab Ace app

## Spreadsheet Setup

Make sure your Google Apps Script is attached to the spreadsheet where you want to store the vocabulary:

1. Open your vocabulary spreadsheet
2. Go to Extensions > Apps Script
3. Copy the script there instead of creating a new project

This ensures the script has access to your vocabulary spreadsheet.

## Usage Notes

- The script will create sheets with names provided in requests
- Each sheet has headers: Word, Meaning, Example Sentence, Date Added
- The Date Added column is formatted for easier reading
- Headers are normalized (case-insensitive, whitespace trimmed)
- Debug information is included in the response to help troubleshoot header issues

## Troubleshooting

If you encounter CORS errors:
1. Make sure you deployed with "Anyone" access
2. Try redeploying the script
3. Check your browser console for specific error messages
