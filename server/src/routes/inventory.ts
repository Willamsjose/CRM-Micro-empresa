import { Router } from 'express';
import { genId } from '../utils/data';
import { addMovement, listMovements, getStock } from '../repositories/inventory';

const router = Router();

// Criar movimentação de estoque
router.post('/movements', (req, res) => {
  const { productId, type, quantity, reason } = req.body;
  if (!productId || !type || !quantity) {
    return res.status(400).json({ error: 'Campos obrigatórios: productId, type, quantity' });
  }
  if (!['entrada', 'saida', 'ajuste'].includes(type)) {
    return res.status(400).json({ error: 'type inválido. Use entrada|saida|ajuste' });
  }
  const mov = {
    id: genId('mov'),
    productId,
    type,
    quantity: Number(quantity),
    reason,
    representativeId: req.user?.id || 'unknown',
  } as const;
  addMovement(mov)
    .then((created) => res.status(201).json(created))
    .catch((err) => {
      console.error('Erro ao criar movimentação', err);
      res.status(500).json({ error: 'Erro ao criar movimentação' });
    });
});

// Listar movimentações (opcionalmente por produto)
router.get('/movements', (req, res) => {
  const { productId } = req.query as { productId?: string };
  listMovements(req.user, productId)
    .then((items) => res.json({ items }))
    .catch((err) => {
      console.error('Erro ao listar movimentações', err);
      res.status(500).json({ error: 'Erro ao listar movimentações' });
    });
});

// Consultar saldo de estoque de um produto
router.get('/stock/:productId', (req, res) => {
  const { productId } = req.params;
  getStock(productId)
    .then((stock) => res.json({ productId, stock }))
    .catch((err) => {
      console.error('Erro ao consultar saldo', err);
      res.status(500).json({ error: 'Erro ao consultar saldo' });
    });
});

export default router;