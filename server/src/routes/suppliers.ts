import { Router } from 'express';
import { genId } from '../utils/data';
import { listSuppliers, createSupplier } from '../repositories/suppliers';

const router = Router();

router.get('/', (req, res) => {
  listSuppliers(req.user)
    .then((items) => res.json({ items }))
    .catch((err) => {
      console.error('Erro ao listar fornecedores', err);
      res.status(500).json({ error: 'Erro ao listar fornecedores' });
    });
});

router.post('/', (req, res) => {
  const { name, cnpj, ie, address } = req.body;
  if (!name) return res.status(400).json({ error: 'name é obrigatório' });
  const supplier = {
    id: genId('sup'),
    name,
    cnpj,
    ie,
    address,
    representativeId: req.user?.id || 'unknown',
  };
  createSupplier(supplier)
    .then((created) => res.status(201).json(created))
    .catch((err) => {
      console.error('Erro ao criar fornecedor', err);
      res.status(500).json({ error: 'Erro ao criar fornecedor' });
    });
});

export default router;