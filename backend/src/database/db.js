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

// thêm bảng cho oauth user
db.exec(`
  CREATE TABLE IF NOT EXISTS oauth_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    UNIQUE (provider, provider_user_id), 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

export default db;