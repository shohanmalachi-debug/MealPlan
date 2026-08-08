import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const DB_DIR = join(process.cwd(), "data", "db");
mkdirSync(DB_DIR, { recursive: true });

const db = new Database(join(DB_DIR, "mealplan.sqlite"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    startDate TEXT NOT NULL,
    breakfastCount INTEGER NOT NULL,
    lunchCount INTEGER NOT NULL,
    dinnerCount INTEGER NOT NULL,
    batchCookNote TEXT
  );

  CREATE TABLE IF NOT EXISTS plan_slots (
    planId TEXT NOT NULL,
    day TEXT NOT NULL,
    mealType TEXT NOT NULL,
    recipeId TEXT NOT NULL,
    rating INTEGER,
    swappedFrom TEXT,
    PRIMARY KEY (planId, day, mealType),
    FOREIGN KEY (planId) REFERENCES plans(id)
  );
`);

export default db;
