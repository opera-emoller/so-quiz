# Så styrs Sverige — övningsquiz

Två flervalsquiz till SO-kapitlet "Så styrs Sverige" (s. 157–173), åk 8.

| Sida | Innehåll |
|---|---|
| `/` | Startsida |
| `/quiz-1` | 25 frågor — grunderna |
| `/quiz-2` | 30 frågor — begrepp och detaljer |

Statisk sajt, inga beroenden. Frågorna ligger i `assets/quiz1-data.js` och
`assets/quiz2-data.js`; motorn som renderar dem är gemensam (`assets/quiz.js`).

## Lägga till ett quiz

1. Kopiera `quiz-2.html` till `quiz-3.html` och peka om datafilen.
2. Skapa `assets/quiz3-data.js` med samma form:
   `window.QUIZ = { questions: [{ page, q, opts: [4 st], a: <index>, why }] }`
3. Lägg till en ruta på startsidan.

## Kör lokalt

    python3 -m http.server 8000

## Deploy

    vercel --prod
