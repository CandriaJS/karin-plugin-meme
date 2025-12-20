import { MemeInfoType } from '@/types'
import { getClient } from './base'

export const Add = async (
  info: MemeInfoType | MemeInfoType[],
): Promise<void> => {
  const client = getClient()

  if (Array.isArray(info)) {
    client.exec('BEGIN TRANSACTION')
    try {
      const stmt = client.prepare(
        `INSERT INTO info (key, keywords, min_texts, max_texts, min_images, max_images, default_texts, options, tags, date_created, date_modified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )

      for (const item of info) {
        stmt.run(
          item.key,
          item.keywords.join(','),
          item.params.min_texts,
          item.params.max_texts,
          item.params.min_images,
          item.params.max_images,
          JSON.stringify(item.params.default_texts),
          JSON.stringify(item.params.options),
          JSON.stringify(item.tags),
          item.date_created,
          item.date_modified,
        )
      }

      return new Promise((resolve, reject) => {
        client.exec('COMMIT', (err) => {
          if (err) reject(err)
          else resolve()
        })
      })
    } catch (error) {
      client.exec('ROLLBACK')
      throw error
    }
  } else {
    return new Promise((resolve, reject) => {
      client.run(
        `INSERT INTO info (key, keywords, min_texts, max_texts, min_images, max_images, default_texts, options, tags, date_created, date_modified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          info.key,
          info.keywords.join(','),
          info.params.min_texts,
          info.params.max_texts,
          info.params.min_images,
          info.params.max_images,
          JSON.stringify(info.params.default_texts),
          JSON.stringify(info.params.options),
          JSON.stringify(info.tags),
          info.date_created,
          info.date_modified,
        ],
        (err) => {
          if (err) reject(err)
          else resolve()
        },
      )
    })
  }
}

export type Get = {
  (key: string): Promise<MemeInfoType | null>
  (keyword: string[]): Promise<MemeInfoType | null>
}
export const Get: Get = async (
  param: string | string[],
): Promise<MemeInfoType | null> => {
  const client = getClient()

  if (Array.isArray(param)) {
    const keywords = param.join(',')
    return new Promise((resolve, reject) => {
      client.get(
        `SELECT * FROM info WHERE keywords LIKE ?`,
        [`%${keywords}%`],
        (err, row) => {
          if (err) reject(err)
          else resolve(row as MemeInfoType | null)
        },
      )
    })
  } else {
    return new Promise((resolve, reject) => {
      client.get(`SELECT * FROM info WHERE key = ?`, [param], (err, row) => {
        if (err) reject(err)
        else resolve(row as MemeInfoType | null)
      })
    })
  }
}

export const GetAll = (): Promise<MemeInfoType[]> => {
  const client = getClient()
  return new Promise((resolve, reject) => {
    client.all(`SELECT * FROM info`, (err, rows) => {
      if (err) reject(err)
      else resolve(rows as MemeInfoType[])
    })
  })
}

export const Update = async (
  key: string,
  info: Partial<Omit<MemeInfoType, 'id'>>,
): Promise<void> => {
  const client = getClient()

  const fields: string[] = []
  const values: any[] = []

  if (info.key !== undefined) {
    fields.push('key = ?')
    values.push(info.key)
  }
  if (info.keywords !== undefined) {
    fields.push('keywords = ?')
    values.push(info.keywords.join(','))
  }
  if (info.params?.min_texts !== undefined) {
    fields.push('min_texts = ?')
    values.push(info.params.min_texts)
  }
  if (info.params?.max_texts !== undefined) {
    fields.push('max_texts = ?')
    values.push(info.params.max_texts)
  }
  if (info.params?.min_images !== undefined) {
    fields.push('min_images = ?')
    values.push(info.params.min_images)
  }
  if (info.params?.max_images !== undefined) {
    fields.push('max_images = ?')
    values.push(info.params.max_images)
  }
  if (info.params?.default_texts !== undefined) {
    fields.push('default_texts = ?')
    values.push(JSON.stringify(info.params.default_texts))
  }
  if (info.params?.options !== undefined) {
    fields.push('options = ?')
    values.push(JSON.stringify(info.params.options))
  }
  if (info.tags !== undefined) {
    fields.push('tags = ?')
    values.push(JSON.stringify(info.tags))
  }
  if (info.date_created !== undefined) {
    fields.push('date_created = ?')
    values.push(info.date_created)
  }
  if (info.date_modified !== undefined) {
    fields.push('date_modified = ?')
    values.push(info.date_modified)
  }

  if (fields.length > 0) {
    values.push(key)
    const sql = `UPDATE info SET ${fields.join(', ')} WHERE key = ?`
    client.run(sql, values)
  }
}
export const Clear = async (): Promise<void> => {
  const client = getClient()
  client.exec('DELETE FROM info')
  client.exec(`DELETE FROM sqlite_sequence WHERE name='info'`)
}
