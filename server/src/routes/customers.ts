import { Router } from 'express';
import { genId } from '../utils/data';
import { createCustomer, listCustomers } from '../repositories/customers';

const router = Router();

router.get('/', (req, res) => {
  listCustomers(req.user)
    .then((items) => res.json({ items }))
    .catch((err) => {
      console.error('Erro ao listar clientes', err);
      res.status(500).json({ error: 'Erro ao listar clientes' });
    });
});

router.post('/', (req, res) => {
  const { name, document, address } = req.body;
  if (!name) return res.status(400).json({ error: 'name é obrigatório' });
  const item = {
    id: genId('cust'),
    name,
    document,
    address,
    representativeId: req.user?.id || 'unknown',
  };
  createCustomer(item)
    .then((created) => res.status(201).json(created))
    .catch((err) => {
      console.error('Erro ao criar cliente', err);
      res.status(500).json({ error: 'Erro ao criar cliente' });
    });
});

export default router;