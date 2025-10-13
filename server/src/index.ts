import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { requireAuth } from './middleware/auth';
import customersRouter from './routes/customers';
import ordersRouter from './routes/orders';
import productsRouter from './routes/products';
import fiscalRouter from './routes/fiscal';
import inventoryRouter from './routes/inventory';
import suppliersRouter from './routes/suppliers';
import carriersRouter from './routes/carriers';
import labelsRouter from './routes/labels';
import { pingDb } from './db/connection';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'crm-micro-empresa', version: '0.1.0' });
});

// Rotas autenticadas
app.use(requireAuth);
app.get('/auth/whoami', (req, res) => {
  res.json({ user: req.user });
});

app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);
app.use('/api/fiscal', fiscalRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/carriers', carriersRouter);
app.use('/api/labels', labelsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
  // Tenta pingar o banco para indicar status de conexão
  pingDb()
    .then((ok) => console.log(`PostgreSQL: ${ok ? 'conectado' : 'falha no ping'}`))
    .catch((e) => console.error('PostgreSQL: erro ao conectar', e?.message));
});