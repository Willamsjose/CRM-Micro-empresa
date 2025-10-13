import { Request, Response, NextFunction } from 'express';
import { User, Role } from '../types/auth';

function parseRepKeys(): Record<string, string> {
  try {
    const raw = process.env.REP_KEYS_JSON || '{}';
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, string>;
    }
    return {};
  } catch {
    return {};
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = (req.headers['x-api-key'] || req.headers['authorization']) as string | undefined;
  const adminKey = process.env.ADMIN_API_KEY;
  const reps = parseRepKeys();

  if (!apiKey) {
    return res.status(401).json({ error: 'API key ausente (use header x-api-key)' });
  }

  if (adminKey && apiKey === adminKey) {
    req.user = { id: 'admin', role: 'admin' } as User;
    return next();
  }

  // Encontrar representante pelo valor da chave
  const repId = Object.keys(reps).find((id) => reps[id] === apiKey);
  if (repId) {
    req.user = { id: repId, role: 'representante' } as User;
    return next();
  }

  return res.status(403).json({ error: 'API key inválida' });
}

export function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
    if (req.user.role !== role) return res.status(403).json({ error: 'Sem permissão' });
    next();
  };
}