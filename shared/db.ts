import { fileURLToPath } from 'url'
import sqlite3 from 'sqlite3'
import { Request, Response } from 'express'
import path from 'path'

// Get the directory path of the current file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface FighterRow {
  first_name: string
  last_name: string
  nickname: string | null
  wins: number
  losses: number
  draws: number
  height: string | null
  weight: string | null
  reach: string | null
  stance: string | null
  birth_date: string | null
}

// Connect to the fighters database
const fightersDb = new sqlite3.Database(path.join(__dirname, 'fighters.db'))

export const getFighterByName = (req: Request, res: Response) => {
  const firstName = req.query.firstName as string
  const lastName = req.query.lastName as string

  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'First name and last name are required' })
  }

  fightersDb.get(
    `SELECT * FROM fighters
     WHERE first_name = ? AND last_name = ?`,
    [firstName, lastName],
    (err, row: FighterRow) => {
      if (err) {
        console.error('Error fetching fighter:', err)
        return res.status(500).json({ error: 'Database error' })
      }
      if (!row) {
        return res.status(404).json({ error: 'Fighter not found' })
      }

      // Convert the database row to the Fighter type format
      const fighter = {
        first_name: row.first_name,
        last_name: row.last_name,
        nickname: row.nickname || '',
        female: false, // You might want to add this to your database
        record: {
          wins: row.wins,
          losses: row.losses,
          draws: row.draws,
        },
        weight: row.weight || 'Unknown',
        stance: row.stance || 'Unknown',
        birth_day: new Date(row.birth_date || Date.now()),
        reach: parseInt(row.reach || '0'),
        height: row.height || 'Unknown',
      }

      res.json(fighter)
    },
  )
}

export const searchFighters = (req: Request, res: Response) => {
  const query = req.query.q as string
  if (!query) {
    return res.json([])
  }

  // Split the query into parts and remove empty strings
  const searchTerms = query.split(' ').filter((term) => term.length > 0)

  // Build the WHERE clause dynamically based on number of search terms
  let whereClause = ''
  let params: string[] = []

  if (searchTerms.length === 1) {
    // Single term search - look in first name, last name, and nickname
    whereClause = `(first_name LIKE ? OR last_name LIKE ? OR nickname LIKE ?)`
    params = [
      `%${searchTerms[0]}%`,
      `%${searchTerms[0]}%`,
      `%${searchTerms[0]}%`,
      `${searchTerms[0]}%`,
      `${searchTerms[0]}%`,
      `${searchTerms[0]}%`,
    ]
  } else {
    // Multiple terms - match first term with first name and last term with last name
    // Also check if the entire query matches a nickname
    whereClause = `(
      (first_name LIKE ? AND last_name LIKE ?) OR
      (nickname LIKE ?)
    )`
    params = [
      `%${searchTerms[0]}%`,
      `%${searchTerms[searchTerms.length - 1]}%`,
      `%${query}%`,
      `${searchTerms[0]}%`,
      `${searchTerms[searchTerms.length - 1]}%`,
      `${query}%`,
    ]
  }

  fightersDb.all(
    `SELECT first_name, last_name
     FROM fighters
     WHERE ${whereClause}
     ORDER BY
       CASE
         WHEN first_name LIKE ? THEN 1
         WHEN last_name LIKE ? THEN 2
         WHEN nickname LIKE ? THEN 3
         ELSE 4
       END,
       first_name, last_name
     LIMIT 10`,
    params,
    (err, rows: FighterRow[]) => {
      if (err) {
        console.error('Error searching fighters:', err)
        return res.status(500).json({ error: 'Database error' })
      }
      res.json(
        rows.map((row) => ({
          firstName: row.first_name,
          lastName: row.last_name,
        })),
      )
    },
  )
}

export const getRandomFighter = (req: Request, res: Response) => {
  fightersDb.get(`SELECT * FROM fighters ORDER BY RANDOM() LIMIT 1`, (err, row: FighterRow) => {
    if (err) {
      console.error('Error fetching random fighter:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    if (!row) {
      return res.status(404).json({ error: 'No fighters found' })
    }

    const fighter = {
      first_name: row.first_name,
      last_name: row.last_name,
      nickname: row.nickname || '',
      female: false,
      record: {
        wins: row.wins,
        losses: row.losses,
        draws: row.draws,
      },
      weight: row.weight || 'Unknown',
      stance: row.stance || 'Unknown',
      birth_day: new Date(row.birth_date || Date.now()),
      reach: parseInt(row.reach || '0'),
      height: row.height || 'Unknown',
    }

    res.json(fighter)
  })
}

export const getDailyFighter = (req: Request, res: Response) => {
  const today = new Date().toISOString().split('T')[0]

  const seed = parseInt(today.replace(/-/g, ''))

  fightersDb.get(
    `SELECT * FROM fighters
     ORDER BY (first_name || last_name)
     LIMIT 1 OFFSET (${seed} % (SELECT COUNT(*) FROM fighters))`,
    (err, row: FighterRow) => {
      if (err) {
        console.error('Error fetching daily fighter:', err)
        return res.status(500).json({ error: 'Database error' })
      }
      if (!row) {
        return res.status(404).json({ error: 'No fighters found' })
      }

      const fighter = {
        first_name: row.first_name,
        last_name: row.last_name,
        nickname: row.nickname || '',
        female: false,
        record: {
          wins: row.wins,
          losses: row.losses,
          draws: row.draws,
        },
        weight: row.weight || 'Unknown',
        stance: row.stance || 'Unknown',
        birth_day: new Date(row.birth_date || Date.now()),
        reach: parseInt(row.reach || '0'),
        height: row.height || 'Unknown',
      }

      res.json(fighter)
    },
  )
}
