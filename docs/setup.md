# ⚙️ Setup Instructions

## Run Locally
First, navigate to the folder where your React app (or project files) live:
```
cd C:\Users\User\Dropbox\Others\GitHub\knapsack-with-dependencies
```
(Assuming Node.js is installed the following would work. To be sure, run 
```
node -v
```
If you get "not recognized," then Node.js is not installed. Then, go to https://nodejs.org/. Download and install the latest LTS (Long Term Support) version. During installation, make sure the option 'Add to PATH' is checked — this lets you use node and npm directly in CMD. After installation run these:

```
node -v
npm -v
```

Install NPM:

```
npm install    # Install dependencies
```
To build for deployment:

```
npm run build  # Build your app
```

Then copy the `dist` folder to your GitHub Pages target:

```bash
xcopy /E /I /Y "C:\Users\User\Dropbox\Others\GitHub\knapsack-with-dependencies\dist" "C:\Users\User\Dropbox\Others\GitHub\konstantinosStouras.github.io\lab\knapsack-with-dependencies"
```

## Google Apps Script Setup

Paste the below script into a Google Apps Script project and deploy it as a Web App.
```bash
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById("SHEET_ID_HERE").getSheetByName("Sheet1");
    const data = JSON.parse(e.postData.contents);

    const row = [
      data.userId,
      data.sessionId,
      data.timestamp,
      data.browser,
      data.device,
      data.round,
      data.totalValue,
      data.similarity,
      data.targetSimilarity,
      data.success,
      data.strategy,
      data.finalSelection,
      data.optimalSet,
      data.optimalValue,
      data.optimalSimilarity
    ];

    // Append item-level fields (Item 1–6)
    for (let i = 1; i <= 6; i++) {
      row.push(
        data[`Item ${i} Value`] || '',
        data[`Item ${i} Attributes`] || '',
        data[`Item ${i} Selected`] || ''
      );
    }

    sheet.appendRow(row);

    return ContentService
      .createTextOutput("✅ Success")
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Methods", "POST")
      .setHeader("Access-Control-Allow-Headers", "Content-Type");

  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    return ContentService
      .createTextOutput("❌ Error: " + error.message)
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Methods", "POST")
      .setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}
```

