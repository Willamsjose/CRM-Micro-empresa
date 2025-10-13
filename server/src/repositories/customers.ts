import { query } from '../db/connection';
import type { User } from '../types/auth';

export async function listCustomers(user: User | undefined) {
  if (user?.role === 'admin') {
    const { rows } = await query(
      'select id, name, document, address, representative_id as "representativeId", created_at as "createdAt" from customers order by created_at desc'
    );
    return rows;
  }
  const { rows } = await query(
      'select id, name, document, address, representative_id as "representativeId", created_at as "createdAt" from customers where representative_id = $1 order by created_at desc',
    [user?.id]
  );
  return rows;
}

export async function createCustomer(data: { id: string; name: string; document?: string; address?: any; representativeId?: string }) {
  const { id, name, document, address, representativeId } = data;
  const sql =
    'insert into customers (id, name, document, address, representative_id) values ($1,$2,$3,$4,$5) returning id, name, document, address, representative_id as "representativeId", created_at as "createdAt"';
  const { rows } = await query(sql, [id, name, document ?? null, address ?? null, representativeId ?? null]);
  return rows[0];
}