import { MongoClient, type Db } from 'mongodb'

const uri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017'
const dbName = process.env.MONGODB_DB ?? 'dynamicForms'

let client: MongoClient | undefined
let db: Db | undefined

export async function connectDb(): Promise<Db> {
  if (db) return db

  client = new MongoClient(uri)
  await client.connect()
  db = client.db(dbName)
  return db
}

export function getDb(): Db {
  if (!db) throw new Error('Database not connected. Call connectDb() first.')
  return db
}

export async function closeDb(): Promise<void> {
  await client?.close()
  client = undefined
  db = undefined
}
