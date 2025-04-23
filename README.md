# 🧩 Knapsack Proxy

A minimal Vercel proxy to bypass CORS and forward data from a React frontend (e.g. stouras.com) to a Google Apps Script Web App.

## 🛠 Deploy with Vercel

```bash
vercel deploy --prod
```

## 🧪 Test it

POST to `/api/submit` with JSON body:

```json
{
  "round": 1,
  "selectedItems": [{"id": 1, "value": 2, "weight": 3}],
  "totalValue": 2,
  "totalWeight": 3,
  "risk": 0.2,
  "visibility": "Daylight"
}
```
