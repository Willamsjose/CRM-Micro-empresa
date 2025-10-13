import { query } from '../db/connection';
import type { User } from '../types/auth';

export async function listProducts(user: User | undefined) {
  if (user?.role === 'admin') {
    const { rows } = await query(
      'select id, name, sku, price, barcode, media, representative_id as "representativeId", created_at as "createdAt" from products order by created_at desc'
    );
    return rows;
  }
  const { rows } = await query(
      'select id, name, sku, price, barcode, media, representative_id as "representativeId", created_at as "createdAt" from products where representative_id = $1 order by created_at desc',
    [user?.id]
  );
  return rows;
}

export async function createProduct(data: {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  barcode?: string;
  media?: any;
  representativeId?: string;
}) {
  const { id, name, sku, price, barcode, media, representativeId } = data;
  const sql =
    'insert into products (id, name, sku, price, barcode, media, representative_id) values ($1,$2,$3,$4,$5,$6,$7) returning id, name, sku, price, barcode, media, representative_id as "representativeId", created_at as "createdAt"';
  const { rows } = await query(sql, [
    id,
    name,
    sku ?? null,
    price ?? 0,
    barcode ?? null,
    JSON.stringify(media ?? {}),
    representativeId ?? null,
  ]);
  return rows[0];
}