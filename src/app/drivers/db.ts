import { Db, MongoClient } from "mongodb";
const connectionString = process.env.MONGO_URI || "";
const client = new MongoClient(connectionString);

let conn: MongoClient | null = null;
let db: Db | null = null;

try {
  conn = await client.connect();
  db = conn.db("sfmgr");
} catch (e) {
  console.error(e);
}

export default db;
