import { fileURLToPath } from 'url'
import sqlite3 from 'sqlite3'
import { Request, Response } from 'express'
import path from 'path'

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

const fightersDb = new sqlite3.Database(path.join(__dirname, 'fighters.db'))
const fightsDb = new sqlite3.Database(path.join(__dirname, 'ufcSQL.db'))

export const getFighterByName = (req: Request, res: Response) => {
  const firstName = req.query.firstName as string
  const lastName = req.query.lastName as string

  if (!firstName) {
    return res.status(400).json({ error: 'First name is required' })
  }

  // Handle single-name fighters
  if (!lastName) {
    fightersDb.get(
      `SELECT * FROM fighters
       WHERE first_name = ? AND (last_name IS NULL OR last_name = '')`,
      [firstName],
      (err, row: FighterRow) => {
        if (err) {
          console.error('Error fetching fighter:', err)
          return res.status(500).json({ error: 'Database error' })
        }
        if (!row) {
          return res.status(404).json({ error: 'Fighter not found' })
        }

        const fighter = {
          first_name: row.first_name,
          last_name: row.last_name || '',
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
    return
  }

  // Handle fighters with last names
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

      const fighter = {
        first_name: row.first_name,
        last_name: row.last_name || '',
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

export const searchFighters = (req: Request, res: Response) => {
  const query = req.query.q as string
  if (!query) {
    return res.json([])
  }

  const searchTerms = query.split(' ').filter((term) => term.length > 0)

  let whereClause = ''
  let params: string[] = []

  if (searchTerms.length === 1) {
    whereClause = `(
      (first_name LIKE ? AND (last_name IS NULL OR last_name = '')) OR
      (first_name LIKE ? OR last_name LIKE ? OR nickname LIKE ?)
    )`
    params = [
      `${searchTerms[0]}%`,
      `%${searchTerms[0]}%`,
      `%${searchTerms[0]}%`,
      `%${searchTerms[0]}%`,
    ]
  } else {
    whereClause = `(
      (first_name LIKE ? AND (last_name IS NULL OR last_name = '')) OR
      (first_name LIKE ? AND last_name LIKE ?) OR
      (nickname LIKE ?)
    )`
    params = [
      `${searchTerms[0]}%`,
      `%${searchTerms[0]}%`,
      `%${searchTerms[searchTerms.length - 1]}%`,
      `%${query}%`,
    ]
  }

  fightersDb.all(
    `SELECT DISTINCT first_name, last_name
     FROM fighters
     WHERE ${whereClause}
     AND weight IN ('115 lbs.', '125 lbs.', '135 lbs.', '145 lbs.', '155 lbs.', '170 lbs.', '185 lbs.', '205 lbs.')
     ORDER BY
       CASE
         WHEN first_name LIKE ? AND (last_name IS NULL OR last_name = '') THEN 1
         WHEN first_name LIKE ? THEN 2
         WHEN last_name LIKE ? THEN 3
         WHEN nickname LIKE ? THEN 4
         ELSE 5
       END,
       first_name, last_name
     LIMIT 10`,
    [...params, ...params],
    (err, rows: FighterRow[]) => {
      if (err) {
        console.error('Error searching fighters:', err)
        return res.status(500).json({ error: 'Database error' })
      }
      res.json(
        rows.map((row) => ({
          firstName: row.first_name,
          lastName: row.last_name || '',
        })),
      )
    },
  )
}

export const getRandomFighter = (req: Request, res: Response) => {
  fightersDb.get(
    `SELECT * FROM fighters
     WHERE weight IN ('115 lbs.', '125 lbs.', '135 lbs.', '145 lbs.', '155 lbs.', '170 lbs.', '185 lbs.', '205 lbs.')
     ORDER BY RANDOM() LIMIT 1`,
    (err, row: FighterRow) => {
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
    },
  )
}

export const getDailyFighter = (req: Request, res: Response) => {
  const today = new Date().toISOString().split('T')[0]
  const seed = parseInt(today.replace(/-/g, ''))

  fightersDb.get(
    `SELECT * FROM fighters
     WHERE weight IN ('115 lbs.', '125 lbs.', '135 lbs.', '145 lbs.', '155 lbs.', '170 lbs.', '185 lbs.', '205 lbs.')
     ORDER BY (first_name || last_name)
     LIMIT 1 OFFSET (${seed} % (SELECT COUNT(*) FROM fighters WHERE weight IN ('115 lbs.', '125 lbs.', '135 lbs.', '145 lbs.', '155 lbs.', '170 lbs.', '185 lbs.', '205 lbs.')))`,
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

export const getRandomFighterPair = (req: Request, res: Response) => {
  fightersDb.all(`SELECT * FROM fighters ORDER BY RANDOM() LIMIT 2`, (err, rows: FighterRow[]) => {
    if (err) {
      console.error('Error fetching random fighter pair:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    if (!rows || rows.length !== 2) {
      return res.status(404).json({ error: 'Failed to get fighter pair' })
    }

    const fighters = rows.map((row) => ({
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
    }))

    res.json(fighters)
  })
}

export const checkFight = (req: Request, res: Response) => {
  const fighter1FirstName = req.query.fighter1FirstName as string
  const fighter1LastName = req.query.fighter1LastName as string
  const fighter2FirstName = req.query.fighter2FirstName as string
  const fighter2LastName = req.query.fighter2LastName as string

  if (!fighter1FirstName || !fighter1LastName || !fighter2FirstName || !fighter2LastName) {
    return res.status(400).json({ error: 'Both fighters are required' })
  }

  fightsDb.get(
    `SELECT * FROM ufc
     WHERE (fighter0_first_name = ? AND fighter0_last_name = ? AND fighter1_first_name = ? AND fighter1_last_name = ?)
     OR (fighter0_first_name = ? AND fighter0_last_name = ? AND fighter1_first_name = ? AND fighter1_last_name = ?)`,
    [
      fighter1FirstName,
      fighter1LastName,
      fighter2FirstName,
      fighter2LastName,
      fighter2FirstName,
      fighter2LastName,
      fighter1FirstName,
      fighter1LastName,
    ],
    (err, row) => {
      if (err) {
        console.error('Error checking fight:', err)
        return res.status(500).json({ error: 'Database error' })
      }
      res.json({ fought: !!row })
    },
  )
}

export const getFighterOpponents = (req: Request, res: Response) => {
  const firstName = req.query.firstName as string
  const lastName = req.query.lastName as string

  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'Fighter name is required' })
  }

  const fullName = `${firstName} ${lastName}`

  fightsDb.all(
    `SELECT DISTINCT
       CASE
         WHEN R_fighter = ? THEN B_fighter
         ELSE R_fighter
       END as opponent
     FROM ufc
     WHERE R_fighter = ? OR B_fighter = ?`,
    [fullName, fullName, fullName],
    (err, rows: { opponent: string }[]) => {
      if (err) {
        console.error('Error fetching opponents:', err)
        return res.status(500).json({ error: 'Database error' })
      }

      const opponents = rows.map((row) => {
        const [opponentFirstName, opponentLastName] = row.opponent.split(' ')
        return {
          firstName: opponentFirstName,
          lastName: opponentLastName,
        }
      })

      res.json(opponents)
    },
  )
}
