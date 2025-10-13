import { query } from '../db/connection';
import type { User } from '../types/auth';

export async function listOrders(user: User | undefined) {
  if (user?.role === 'admin') {
    const { rows } = await query(
      'select id, customer_id as "customerId", items, total, representative_id as "representativeId", status, created_at as "createdAt" from orders order by created_at desc'
    );
    return rows;
  }
  const { rows } = await query(
      'select id, customer_id as "customerId", items, total, representative_id as "representativeId", status, created_at as "createdAt" from orders where representative_id = $1 order by created_at desc',
    [user?.id]
  );
  return rows;
}

export async function createOrder(data: {
  id: string;
  customerId: string;
  items: any[];
  total: number;
  representativeId?: string;
  status?: string;
}) {
  const { id, customerId, items, total, representativeId, status } = data;
  const sql =
    'insert into orders (id, customer_id, items, total, representative_id, status) values ($1,$2,$3,$4,$5,$6) returning id, customer_id as "customerId", items, total, representative_id as "representativeId", status, created_at as "createdAt"';
  const { rows } = await query(sql, [id, customerId, JSON.stringify(items || []), total || 0, representativeId ?? null, status ?? 'aberto']);
  return rows[0];
}