import { Injectable } from "@angular/core";
import Database from "@tauri-apps/plugin-sql";

const DB_PATH = "sqlite:app.db";

@Injectable({ providedIn: "root" })
export class DatabaseService {
  private db: Database | null = null;

  async getDb(): Promise<Database> {
    if (!this.db) {
      this.db = await Database.load(DB_PATH);
    }
    return this.db;
  }
}
