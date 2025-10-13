import { query } from '../db/connection';
import type { User } from '../types/auth';

export async function listSuppliers(user: User | undefined) {
  if (user?.role === 'admin') {
    const { rows } = await query(
      'select id, name, cnpj, ie, address, representative_id as "representativeId", created_at as "createdAt" from suppliers order by created_at desc'
    );
    return rows;
  }
  const { rows } = await query(
      'select id, name, cnpj, ie, address, representative_id as "representativeId", created_at as "createdAt" from suppliers where representative_id = $1 order by created_at desc',
    [user?.id]
  );
  return rows;
}

export async function createSupplier(data: {
  id: string;
  name: string;
  cnpj?: string;
  ie?: string;
  address?: any;
  representativeId?: string;
}) {
  const { id, name, cnpj, ie, address, representativeId } = data;
  const sql =
    'insert into suppliers (id, name, cnpj, ie, address, representative_id) values ($1,$2,$3,$4,$5,$6) returning id, name, cnpj, ie, address, representative_id as "representativeId", created_at as "createdAt"';
  const { rows } = await query(sql, [id, name, cnpj ?? null, ie ?? null, address ?? null, representativeId ?? null]);
  return rows[0];
}