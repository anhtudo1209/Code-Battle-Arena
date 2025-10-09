import  { DatabaseSync} from 'node:sqlite'
const db = new DatabaseSync(':memory:')

db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL
  )
`)


export default db;