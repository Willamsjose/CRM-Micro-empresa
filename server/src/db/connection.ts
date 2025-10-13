import { Pool, QueryResult } from 'pg';

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
});

export async function query<T = unknown>(text: string): Promise<QueryResult<T>>;
export async function query<T = unknown>(text: string, params: any[]): Promise<QueryResult<T>>;
export async function query<T = unknown>(text: string, params?: any[]): Promise<QueryResult<T>> {
  return params !== undefined ? pool.query<T>(text, params) : pool.query<T>(text);
}

export async function pingDb() {
  const res = await query('SELECT 1 as ok');
  return res.rows[0]?.ok === 1;
}