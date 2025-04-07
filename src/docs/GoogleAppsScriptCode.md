
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
      
      // Format headers to be bold
      sheet.getRange(1, 1, 1, 4).setFontWeight("bold");
    }
    
    // Debug: Check all sheets in the spreadsheet
    const sheets = ss.getSheets();
    const sheetNames = sheets.map(s => s.getName());
    console.log("Available sheets: " + JSON.stringify(sheetNames));
    
    // Always check headers whether the sheet is new or not
    const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 4).getValues()[0];
    console.log("Raw headers detected: " + JSON.stringify(headerRow));
    
    // Normalize headers to lowercase and trim whitespace for consistent comparison
    const normalizedHeaders = headerRow.map(header => 
      header ? String(header).trim().toLowerCase() : ""
    );
    console.log("Normalized headers: " + JSON.stringify(normalizedHeaders));
    
    // Check if required headers exist (case-insensitive, ignoring whitespace)
    const hasWordColumn = normalizedHeaders.some(h => h === "word");
    const hasMeaningColumn = normalizedHeaders.some(h => h === "meaning");
    
    // If missing required headers and not a new sheet (which we already set up correctly)
    if (!isNewSheet && (!hasWordColumn || !hasMeaningColumn)) {
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
        
        // Format headers to be bold
        sheet.getRange(1, 1, 1, 4).setFontWeight("bold");
      } else {
        // Sheet has data but missing headers - prepend headers row
        sheet.insertRowBefore(1);
        sheet.getRange(1, 1, 1, 4).setValues([
          ["Word", "Meaning", "Example Sentence", "Date Added"]
        ]);
        sheet.getRange(1, 1, 1, 4).setFontWeight("bold");
      }
      
      // Re-fetch headers after adding them
      const updatedHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 4).getValues()[0];
      console.log("Updated headers: " + JSON.stringify(updatedHeaders));
    }
    
    // Format date for better readability
    const timestamp = new Date();
    const formattedDate = Utilities.formatDate(
      timestamp, 
      SpreadsheetApp.getActive().getSpreadsheetTimeZone(), 
      "yyyy-MM-dd HH:mm:ss"
    );
    
    // Find column indices based on normalized header names (re-fetch headers in case they were updated)
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 4).getValues()[0];
    const currentNormalizedHeaders = currentHeaders.map(header => 
      header ? String(header).trim().toLowerCase() : ""
    );
    
    // Find column indices (0-based)
    const wordColIndex = findColumnIndex(currentNormalizedHeaders, ["word"]);
    const meaningColIndex = findColumnIndex(currentNormalizedHeaders, ["meaning"]);
    const exampleColIndex = findColumnIndex(currentNormalizedHeaders, ["example sentence", "example", "examples", "sentence"]);
    const dateColIndex = findColumnIndex(currentNormalizedHeaders, ["date added", "date", "added date", "added"]);
    
    console.log("Column indices - Word: " + wordColIndex + ", Meaning: " + meaningColIndex + 
               ", Example: " + exampleColIndex + ", Date: " + dateColIndex);
    
    // If we still can't find the required columns, return an error
    if (wordColIndex === -1 || meaningColIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Could not find Word and Meaning columns in the sheet",
        debug: {
          rawHeaders: currentHeaders,
          normalizedHeaders: currentNormalizedHeaders,
          wordColumnFound: wordColIndex !== -1,
          meaningColumnFound: meaningColIndex !== -1
        }
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    }
    
    // Prepare the row data based on the action type
    let rowData = [];
    const maxColumns = sheet.getLastColumn() || 4;
    
    // Initialize rowData array with empty strings
    for (let i = 0; i < maxColumns; i++) {
      rowData[i] = "";
    }
    
    // Set values in the appropriate columns
    if (wordColIndex !== -1) rowData[wordColIndex] = payload.word || "";
    if (meaningColIndex !== -1) rowData[meaningColIndex] = payload.meaning || "";
    if (exampleColIndex !== -1) rowData[exampleColIndex] = payload.example || "";
    if (dateColIndex !== -1) rowData[dateColIndex] = formattedDate;
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Vocabulary added successfully",
      debug: {
        detectedHeaders: currentHeaders,
        normalizedHeaders: currentNormalizedHeaders,
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
    
    console.error("Error in doPost: " + error.message + "\n" + error.stack);
    
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
 * Helper function to find a column index based on possible header names
 * Returns -1 if not found
 */
function findColumnIndex(normalizedHeaders, possibleNames) {
  for (let i = 0; i < normalizedHeaders.length; i++) {
    if (possibleNames.some(name => normalizedHeaders[i] === name.toLowerCase())) {
      return i;
    }
  }
  return -1;
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

## Troubleshooting Header Detection

If you're getting the "Sheet must contain columns for Word and Meaning" error:

1. Make sure your sheet has headers in the first row
2. The script looks for "Word" and "Meaning" (case-insensitive, ignoring spaces)
3. Check for invisible characters or formatting issues in your headers
4. Look at the debug logs in your browser console for more information
5. Try re-deploying the script after making changes

## Usage Notes

- The script will create sheets with names provided in requests
- Each sheet has headers: Word, Meaning, Example Sentence, Date Added
- The Date Added column is formatted for easier reading
- Headers are normalized (case-insensitive, whitespace trimmed)
- Debug information is included in the response to help troubleshoot header issues
