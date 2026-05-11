import { Injectable } from "@angular/core";
import Database from "@tauri-apps/plugin-sql";

const DB_PATH = "sqlite:app.db";

@Injectable({ providedIn: "root" })
export class DatabaseService {
  // Store the Promise itself — concurrent callers share one load(), not one per caller.
  private readonly dbPromise: Promise<Database> = Database.load(DB_PATH);

  getDb(): Promise<Database> {
    return this.dbPromise;
  }
}
