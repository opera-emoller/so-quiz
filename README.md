# Övningsquiz åk 8

Flervalsquiz till SO- och kemikapitlen.

| Sida | Ämne | Innehåll |
|---|---|---|
| `/` | | Startsida |
| `/quiz-1` | SO | Så styrs Sverige — 25 frågor (s. 157–173) |
| `/quiz-2` | SO | Begrepp och detaljer — 30 frågor (s. 157–173) |
| `/kemi-1` | Kemi | Organisk kemi — 41 frågor (s. 1–19) |
| `/kemi-2` | Kemi | Kol och förbränning — 29 frågor (s. 36–45) |

Statisk sajt, inga beroenden. Frågorna ligger i `assets/quiz1-data.js` och
`assets/quiz2-data.js`; motorn som renderar dem är gemensam (`assets/quiz.js`).

## Lägga till ett quiz

1. Kopiera en befintlig sida, t.ex. `kemi-1.html`, och peka om datafilen.
2. Skapa `assets/<namn>-data.js` med samma form:
   `window.QUIZ = { questions: [{ page, q, opts: [4 st], a: <index>, why }] }`
3. Lägg till en ruta på startsidan.
4. Valfritt: sätt en temaklass på `<html>` — `theme-blue`, `theme-green`
   eller `theme-ember` — för att ge quizet en egen färg.

## Kör lokalt

    python3 -m http.server 8000

## Deploy

    vercel --prod
