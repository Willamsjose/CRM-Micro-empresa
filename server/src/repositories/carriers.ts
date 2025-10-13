import { query } from '../db/connection';
import type { User } from '../types/auth';

export async function listCarriers(user: User | undefined) {
  if (user?.role === 'admin') {
    const { rows } = await query(
      'select id, name, cnpj, ie, rntrc, address, vehicle, driver, representative_id as "representativeId", created_at as "createdAt" from carriers order by created_at desc'
    );
    return rows;
  }
  const { rows } = await query(
      'select id, name, cnpj, ie, rntrc, address, vehicle, driver, representative_id as "representativeId", created_at as "createdAt" from carriers where representative_id = $1 order by created_at desc',
    [user?.id]
  );
  return rows;
}

export async function createCarrier(data: {
  id: string;
  name: string;
  cnpj?: string;
  ie?: string;
  rntrc?: string;
  address?: any;
  vehicle?: any;
  driver?: any;
  representativeId?: string;
}) {
  const { id, name, cnpj, ie, rntrc, address, vehicle, driver, representativeId } = data;
  const sql =
    'insert into carriers (id, name, cnpj, ie, rntrc, address, vehicle, driver, representative_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id, name, cnpj, ie, rntrc, address, vehicle, driver, representative_id as "representativeId", created_at as "createdAt"';
  const { rows } = await query(sql, [
    id,
    name,
    cnpj ?? null,
    ie ?? null,
    rntrc ?? null,
    address ?? null,
    vehicle ?? null,
    driver ?? null,
    representativeId ?? null,
  ]);
  return rows[0];
}