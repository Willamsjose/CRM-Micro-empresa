import { Router } from 'express';
import { genId } from '../utils/data';
import { listOrders, createOrder } from '../repositories/orders';

const router = Router();

router.get('/', (req, res) => {
  listOrders(req.user)
    .then((items) => res.json({ items }))
    .catch((err) => {
      console.error('Erro ao listar pedidos', err);
      res.status(500).json({ error: 'Erro ao listar pedidos' });
    });
});

router.post('/', (req, res) => {
  const { customerId, items, total } = req.body;
  if (!customerId) return res.status(400).json({ error: 'customerId é obrigatório' });
  const order = {
    id: genId('ord'),
    customerId,
    items: items || [],
    total: total || 0,
    representativeId: req.user?.id || 'unknown',
    status: 'aberto',
  };
  createOrder(order)
    .then((created) => res.status(201).json(created))
    .catch((err) => {
      console.error('Erro ao criar pedido', err);
      res.status(500).json({ error: 'Erro ao criar pedido' });
    });
});

export default router;