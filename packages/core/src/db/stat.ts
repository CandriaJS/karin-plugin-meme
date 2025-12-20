import { StatType } from '@/types'
import { getClient } from './base'


export const Add = async (
  stat: Omit<StatType, 'created_at' | 'updated_at'>,
): Promise<void> => {
  const client = getClient()

  const existingStat = await Get(stat.meme_key, stat.userId, stat.groupId)

  if (existingStat) {
    return new Promise((resolve, reject) => {
      let insertSql = 'INSERT INTO stat (meme_key'
      const params = [stat.meme_key]

      if (stat.userId) {
        insertSql += ', user_id'
        params.push(stat.userId)
      }

      if (stat.groupId) {
        insertSql += ', group_id'
        params.push(stat.groupId)
      }

      insertSql += ', count) VALUES (?, '

      if (stat.userId) {
        insertSql += '?, '
      }

      if (stat.groupId) {
        insertSql += '?, '
      }

      insertSql = insertSql.replace(/, $/, '') + '?)'
      params.push(String(stat.count || 1))

      client.run(insertSql, params, (err) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }
}


export const Get = async (
  memeKey: string,
  userId?: string,
  groupId?: string,
): Promise<StatType | null> => {
  const client = getClient()

  return new Promise((resolve, reject) => {
    let sql =
      'SELECT meme_key, user_id, group_id, count, created_at, updated_at FROM stat WHERE meme_key = ?'
    const params = [memeKey]

    if (userId !== undefined) {
      sql += ' AND user_id = ?'
      params.push(userId)
    } else {
      sql += ' AND user_id IS NULL'
    }

    if (groupId !== undefined) {
      sql += ' AND group_id = ?'
      params.push(groupId)
    } else {
      sql += ' AND group_id IS NULL'
    }

    client.get(sql, params, (err, row: StatType | undefined) => {
      if (err) {
        return reject(err)
      }

      if (!row) {
        return resolve(null)
      }
      resolve(row)
    })
  })
}
