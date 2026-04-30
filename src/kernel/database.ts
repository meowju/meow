import { Database } from "bun:sqlite";
import { join } from "path";

export class MeowDatabase {
  private db: Database;

  constructor(dbPath: string = "meow.db") {
    this.db = new Database(dbPath);

    // Physical Mandate: WAL mode for concurrent reads
    this.db.exec("PRAGMA journal_mode = WAL");
    this.db.exec("PRAGMA synchronous = NORMAL");

    // Load sqlite-vec extension for vector search
    try {
      const vecPath = require.resolve("sqlite-vec-windows-x64/vec0.dll");
      this.db.loadExtension(vecPath);
      console.log("✓ sqlite-vec extension loaded from:", vecPath);
    } catch (e) {
      console.warn("⚠️ Could not load sqlite-vec extension:", e);
    }

    this.checkIntegrity();
    this.initializeSchema();
  }

  private checkIntegrity() {
    const result = this.db.exec("PRAGMA integrity_check") as any;
    // bun:sqlite exec returns Database with lastResult or similar
  }

  private initializeSchema() {
    // swarm_state: JSON config, TTL, agent status
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS swarm_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // vector_memory: metadata and content
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS vector_memory_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        metadata TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // sqlite-vec virtual table for embeddings
    try {
      this.db.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS vec_memory USING vec0(
          embedding float[1536]
        );
      `);
    } catch (e) {
      console.warn("⚠️ Could not create vec_memory virtual table:", e);
    }

    // missions: track background specialist activity
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS missions (
        pid INTEGER PRIMARY KEY,
        agent_name TEXT,
        goal TEXT,
        status TEXT DEFAULT 'running',
        last_pulse DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  public getRawDb(): Database {
    return this.db;
  }

  public close() {
    this.db.close();
  }
}