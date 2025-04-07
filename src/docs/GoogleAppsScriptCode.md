
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
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Add headers if this is a new sheet
      sheet.appendRow([
        "Word", 
        "Meaning", 
        "Example Sentence",
        "Date Added"
      ]);
    }
    
    // Format date for better readability
    const timestamp = new Date();
    const formattedDate = Utilities.formatDate(
      timestamp, 
      SpreadsheetApp.getActive().getSpreadsheetTimeZone(), 
      "yyyy-MM-dd HH:mm:ss"
    );
    
    // Append the data to the sheet
    sheet.appendRow([
      payload.word,
      payload.meaning,
      payload.example,
      formattedDate
    ]);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Vocabulary added successfully"
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
      error: error.message
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

## Troubleshooting

If you encounter CORS errors:
1. Make sure you deployed with "Anyone" access
2. Try redeploying the script
3. Check your browser console for specific error messages
