import { query } from '../db/connection';
import type { User } from '../types/auth';

export async function addMovement(data: {
  id: string;
  productId: string;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  reason?: string;
  representativeId?: string;
}) {
  const { id, productId, type, quantity, reason, representativeId } = data;
  const sql =
    'insert into inventory_movements (id, product_id, type, quantity, reason, representative_id) values ($1,$2,$3,$4,$5,$6) returning id, product_id as "productId", type, quantity, reason, representative_id as "representativeId", created_at as "createdAt"';
  const { rows } = await query(sql, [id, productId, type, quantity, reason ?? null, representativeId ?? null]);
  return rows[0];
}

export async function listMovements(user: User | undefined, productId?: string) {
  if (user?.role === 'admin') {
    if (productId) {
      const { rows } = await query(
        'select id, product_id as "productId", type, quantity, reason, representative_id as "representativeId", created_at as "createdAt" from inventory_movements where product_id = $1 order by created_at desc',
        [productId]
      );
      return rows;
    }
    const { rows } = await query(
      'select id, product_id as "productId", type, quantity, reason, representative_id as "representativeId", created_at as "createdAt" from inventory_movements order by created_at desc'
    );
    return rows;
  }
  if (productId) {
    const { rows } = await query(
      'select id, product_id as "productId", type, quantity, reason, representative_id as "representativeId", created_at as "createdAt" from inventory_movements where representative_id = $1 and product_id = $2 order by created_at desc',
      [user?.id, productId]
    );
    return rows;
  }
  const { rows } = await query(
    'select id, product_id as "productId", type, quantity, reason, representative_id as "representativeId", created_at as "createdAt" from inventory_movements where representative_id = $1 order by created_at desc',
    [user?.id]
  );
  return rows;
}

export async function getStock(productId: string) {
  const { rows } = await query<{ stock: string }>(
    "select coalesce(sum(case when type = 'saida' then -quantity else quantity end),0) as stock from inventory_movements where product_id = $1",
    [productId]
  );
  const val = Number(rows[0]?.stock ?? 0);
  return val;
}