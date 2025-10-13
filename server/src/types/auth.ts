export type Role = 'admin' | 'representante';

export interface User {
  id: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}