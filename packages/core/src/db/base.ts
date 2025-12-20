import sqlite from 'node-karin/sqlite3'
import { join } from 'node:path'

let dbClient: sqlite.Database | null = null

export const createClient = (dbPath: string) => {
  if (!dbClient) {
    dbClient = new sqlite.Database(join(dbPath, 'data.db'))
  }
  return dbClient
}

export const getClient = () => {
  if (!dbClient) throw new Error('Client is not initialized')
  return dbClient
}
export const createDb = async () => {
  let client = getClient()
  client.exec(`
    CREATE TABLE IF NOT EXISTS info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL,
      keywords JSON NOT NULL,
      min_texts INTEGER NOT NULL,
      max_texts INTEGER NOT NULL,
      min_images INTEGER NOT NULL,
      max_images INTEGER NOT NULL,
      default_texts JSON NOT NULL,
      tags JSON,
      shortcuts JSON,
      date_created DATETIME NOT NULL,
      date_modified DATETIME NOT NULL,
      createdAt DATETIME DEFAULT (datetime('now', 'localtime')),
      updatedAt DATETIME DEFAULT (datetime('now', 'localtime')),
      UNIQUE(key, keywords, min_texts, max_texts, min_images, max_images, default_texts, tags, shortcuts),
    )
  `)

  client.exec(`
    CREATE TABLE IF NOT EXISTS stat (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meme_key TEXT NOT NULL,                
      user_id TEXT,                           
      group_id TEXT,                          
      count INTEGER DEFAULT 1,               
      created_at DATETIME DEFAULT (datetime('now', 'localtime')),
      updated_at DATETIME DEFAULT (datetime('now', 'localtime')),
      UNIQUE(meme_key, user_id, group_id),
    )
  `)
}
