# ExamBuddy – AI Student Examination Assistant

A simple website with four tools: Ask a Doubt, Practice Quiz, Study Plan, Check My Answer.

## Folder structure
```
exambuddy/
├── server.js        # Node/Express backend (keeps your API key secret)
├── package.json
├── .env.example     # copy to .env and add your key
├── .gitignore
└── public/
    ├── index.html
    ├── style.css
    └── script.js
```

## Run locally
1. Install Node.js 18 or newer.
2. Open a terminal in this folder and run: `npm install`
3. Copy `.env.example` to `.env` and put your Anthropic API key in it
   (get one at https://console.anthropic.com).
4. Run: `npm start`
5. Open http://localhost:3000

## Deploy
Any Node host works (Render, Railway, Fly.io, a VPS). Set the
`ANTHROPIC_API_KEY` environment variable on the host and use `npm start`.

## Notes
- The API key lives only on the server, never in the browser.
- `server.js` has a basic rate limit (30 requests per 10 minutes per IP). Adjust it as needed.
- Change the model with the `MODEL` variable in `.env`.
