import express, { RequestHandler } from 'express'
import * as db from './db'

const app = express()
const PORT = 3000

app.use(express.json())

app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:8080', 'http://localhost:5174', 'http://localhost:5173']
  const origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  next()
})

app.get('/api/search', db.searchFighters as RequestHandler)

app.get('/api/fighter', db.getFighterByName as RequestHandler)

app.get('/api/random-fighter', db.getRandomFighter as RequestHandler)

app.get('/api/daily-fighter', db.getDailyFighter as RequestHandler)

// New endpoints for Connect the Dots game
app.get('/api/connect/random-pair', db.getRandomFighterPair as RequestHandler)
app.get('/api/connect/check-fight', db.checkFight as RequestHandler)
app.get('/api/connect/get-opponents', db.getFighterOpponents as RequestHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
