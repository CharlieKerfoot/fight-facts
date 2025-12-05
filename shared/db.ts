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

import fs from 'fs'

const DB_PATH = path.join(process.cwd(), 'fighters.db')
const UFC_DB_PATH = path.join(process.cwd(), 'ufcSQL.db')

console.log('DB_PATH:', DB_PATH)
console.log('UFC_DB_PATH:', UFC_DB_PATH)
try {
  console.log('Files in CWD:', fs.readdirSync(process.cwd()))
} catch (e) {
  console.error('Error listing CWD:', e)
}
console.log('DB Exists:', fs.existsSync(DB_PATH))
console.log('UFC DB Exists:', fs.existsSync(UFC_DB_PATH))

const fightersDb = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening fighters database:', err.message)
  } else {
    console.log('Connected to the fighters database.')
  }
})

const fightsDb = new sqlite3.Database(UFC_DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening fights database:', err.message)
  } else {
    console.log('Connected to the fights database.')
  }
})

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
  const MAX_RETRIES = 10

  const attemptGetPair = (retriesLeft: number) => {
    if (retriesLeft === 0) {
      return res.status(500).json({ error: 'Failed to generate valid pair after multiple attempts' })
    }

    fightsDb.get(
      `SELECT fighter0_first_name, fighter0_last_name, fighter1_first_name, fighter1_last_name FROM ufc ORDER BY RANDOM() LIMIT 1`,
      (err, row: { fighter0_first_name: string; fighter0_last_name: string; fighter1_first_name: string; fighter1_last_name: string }) => {
        if (err) {
          console.error('Error fetching random fight:', err)
          return res.status(500).json({ error: 'Database error' })
        }
        if (!row) {
          return res.status(404).json({ error: 'No fights found' })
        }

        const isFighter0 = Math.random() < 0.5
        const firstName = isFighter0 ? row.fighter0_first_name : row.fighter1_first_name
        const lastName = isFighter0 ? row.fighter0_last_name : row.fighter1_last_name
        const startFighterName = `${firstName} ${lastName}`.trim()

        const query = lastName
            ? `SELECT * FROM fighters WHERE first_name = ? AND last_name = ? AND weight IN ('115 lbs.', '125 lbs.', '135 lbs.', '145 lbs.', '155 lbs.', '170 lbs.', '185 lbs.', '205 lbs.')`
            : `SELECT * FROM fighters WHERE first_name = ? AND (last_name IS NULL OR last_name = '') AND weight IN ('115 lbs.', '125 lbs.', '135 lbs.', '145 lbs.', '155 lbs.', '170 lbs.', '185 lbs.', '205 lbs.')`

        const params = lastName ? [firstName, lastName] : [firstName]

        fightersDb.get(query, params, (err, startRow: FighterRow) => {
          if (err || !startRow) {
             return attemptGetPair(retriesLeft - 1)
          }

          const walkLength = Math.floor(Math.random() * 4) + 3 // 3 to 6 steps

          const performWalk = (currentName: string, stepsLeft: number) => {
            if (stepsLeft === 0) {
              const [endFirst, ...endLastParts] = currentName.split(' ')
              const endLast = endLastParts.join(' ')

              const endQuery = endLast
                ? `SELECT * FROM fighters WHERE first_name = ? AND last_name = ?`
                : `SELECT * FROM fighters WHERE first_name = ? AND (last_name IS NULL OR last_name = '')`

              const endParams = endLast ? [endFirst, endLast] : [endFirst]

              fightersDb.get(endQuery, endParams, (err, endRow: FighterRow) => {
                if (err || !endRow) {
                   return attemptGetPair(retriesLeft - 1)
                }

                if (startRow.first_name === endRow.first_name && startRow.last_name === endRow.last_name) {
                   return attemptGetPair(retriesLeft - 1)
                }

                const formatFighter = (row: FighterRow) => ({
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
                })

                res.json([formatFighter(startRow), formatFighter(endRow)])
              })
              return
            }

            fightsDb.all(
              `SELECT DISTINCT
                 CASE
                   WHEN (fighter0_first_name || ' ' || fighter0_last_name) = ? THEN (fighter1_first_name || ' ' || fighter1_last_name)
                   ELSE (fighter0_first_name || ' ' || fighter0_last_name)
                 END as opponent
               FROM ufc
               WHERE (fighter0_first_name || ' ' || fighter0_last_name) = ? OR (fighter1_first_name || ' ' || fighter1_last_name) = ?
               ORDER BY RANDOM() LIMIT 1`,
              [currentName, currentName, currentName],
              (err, rows: { opponent: string }[]) => {
                if (err || !rows || rows.length === 0) {
                  return attemptGetPair(retriesLeft - 1)
                }
                performWalk(rows[0].opponent, stepsLeft - 1)
              }
            )
          }

          performWalk(startFighterName, walkLength)
        })
      }
    )
  }

  attemptGetPair(MAX_RETRIES)
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
         WHEN (fighter0_first_name || ' ' || fighter0_last_name) = ? THEN (fighter1_first_name || ' ' || fighter1_last_name)
         ELSE (fighter0_first_name || ' ' || fighter0_last_name)
       END as opponent
     FROM ufc
     WHERE (fighter0_first_name || ' ' || fighter0_last_name) = ? OR (fighter1_first_name || ' ' || fighter1_last_name) = ?`,
    [fullName, fullName, fullName],
    (err, rows: { opponent: string }[]) => {
      if (err) {
        console.error('Error fetching opponents:', err)
        return res.status(500).json({ error: 'Database error' })
      }

      const opponents = rows.map((row) => {
        const [opponentFirstName, ...opponentLastNameParts] = row.opponent.split(' ')
        const opponentLastName = opponentLastNameParts.join(' ')
        return {
          firstName: opponentFirstName,
          lastName: opponentLastName,
        }
      })

      res.json(opponents)
    },
  )
}

export const getShortestPath = (req: Request, res: Response) => {
  const startName = req.query.start as string
  const endName = req.query.end as string

  if (!startName || !endName) {
    return res.status(400).json({ error: 'Start and end fighters are required' })
  }

  // BFS Queue: [currentFighter, path][]
  const queue: { name: string; path: string[] }[] = [{ name: startName, path: [startName] }]
  const visited = new Set<string>([startName])

  // We'll load the graph in chunks or on demand.
  // To avoid N+1 query performance issues, we can try to load all fights into memory?
  // The UFC dataset isn't THAT huge (7k fights?).
  // Let's try loading the whole graph into memory for the BFS. It's faster than thousands of SQL queries.

  fightsDb.all(
    `SELECT fighter0_first_name, fighter0_last_name, fighter1_first_name, fighter1_last_name FROM ufc`,
    (err, rows: { fighter0_first_name: string; fighter0_last_name: string; fighter1_first_name: string; fighter1_last_name: string }[]) => {
      if (err) {
        console.error('Error loading fights for BFS:', err)
        return res.status(500).json({ error: 'Database error' })
      }

      const graph = new Map<string, string[]>()

      const addEdge = (u: string, v: string) => {
        if (!graph.has(u)) graph.set(u, [])
        if (!graph.has(v)) graph.set(v, [])
        graph.get(u)?.push(v)
        graph.get(v)?.push(u)
      }

      rows.forEach(row => {
        const fighter0 = `${row.fighter0_first_name} ${row.fighter0_last_name}`.trim()
        const fighter1 = `${row.fighter1_first_name} ${row.fighter1_last_name}`.trim()
        addEdge(fighter0, fighter1)
      })

      while (queue.length > 0) {
        const { name, path } = queue.shift()!

        if (name === endName) {
          const placeholders = path.map(() => '(first_name = ? AND (last_name = ? OR last_name IS NULL))').join(' OR ')
          const params: string[] = []
          path.forEach(p => {
            const [first, ...lastParts] = p.split(' ')
            params.push(first, lastParts.join(' '))
          })

          const fetchFighter = (fullName: string): Promise<any> => {
            return new Promise((resolve) => {
               const [first, ...lastParts] = fullName.split(' ')
               const last = lastParts.join(' ')
               const query = last
                 ? `SELECT * FROM fighters WHERE first_name = ? AND last_name = ?`
                 : `SELECT * FROM fighters WHERE first_name = ? AND (last_name IS NULL OR last_name = '')`
               const p = last ? [first, last] : [first]

               fightersDb.get(query, p, (err, row: FighterRow) => {
                 if (err || !row) resolve({ first_name: first, last_name: last, weight: 'Unknown', record: { wins: 0, losses: 0, draws: 0 } }) // Fallback
                 else resolve({
                    first_name: row.first_name,
                    last_name: row.last_name,
                    nickname: row.nickname || '',
                    female: false,
                    record: { wins: row.wins, losses: row.losses, draws: row.draws },
                    weight: row.weight || 'Unknown',
                    stance: row.stance || 'Unknown',
                    birth_day: new Date(row.birth_date || Date.now()),
                    reach: parseInt(row.reach || '0'),
                    height: row.height || 'Unknown',
                 })
               })
            })
          }

          Promise.all(path.map(fetchFighter)).then(fullPath => {
            res.json(fullPath)
          })
          return
        }

        const neighbors = graph.get(name) || []
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor)
            queue.push({ name: neighbor, path: [...path, neighbor] })
          }
        }
      }

      res.status(404).json({ error: 'No path found' })
    }
  )
}
