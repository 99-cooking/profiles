/**
 * Database connection and client
 */

import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the correct path to the database (in project root)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = resolve(__dirname, '../../../profiles.db');

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

export type Database = Database;