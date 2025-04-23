# 📊 Data Schema (Logging Format)

Data is logged to Google Sheets using a Vercel Proxy. Probably we collect too many data for the free version of Vercel to correctly save to Google Sheets. Suggesting to use the PRO Vercel account instead which correctly logs the collected data.

## Sample Payload

```json
{
  "userId": "abc-123",
  "sessionId": "xyz-789",
  "timestamp": "2025-04-23T10:00:00Z",
  "browser": "Chrome 135.0",
  "device": "Desktop",
  "round": 1,
  "totalValue": 82,
  "similarity": "0.8234",
  "targetSimilarity": 0.75,
  "success": true,
  "strategy": "Project 1 selected | Project 3 selected",
  "finalSelection": "Project 1, Project 3",
  "optimalSet": "Project 2, Project 3, Project 4",
  "optimalValue": "95",
  "optimalSimilarity": "0.8850",
  "Item 1 Value": 32,
  "Item 1 Attributes": "[4.22, 7.12, 1.04, 6.00, 2.93]",
  "Item 1 Selected": "Yes"
  // ... up to Item 6
}
```

Each row in the Google Sheet will include:
- Session metadata
- Strategy log
- Success outcome
- Item-level values, attributes, and selections
