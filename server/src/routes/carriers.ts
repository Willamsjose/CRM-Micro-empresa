import { Router } from 'express';
import { genId } from '../utils/data';
import { listCarriers, createCarrier } from '../repositories/carriers';

const router = Router();

router.get('/', (req, res) => {
  listCarriers(req.user)
    .then((items) => res.json({ items }))
    .catch((err) => {
      console.error('Erro ao listar transportadoras', err);
      res.status(500).json({ error: 'Erro ao listar transportadoras' });
    });
});

router.post('/', (req, res) => {
  const { name, cnpj, ie, rntrc, address, vehicle, driver } = req.body;
  if (!name) return res.status(400).json({ error: 'name é obrigatório' });
  const carrier = {
    id: genId('car'),
    name,
    cnpj,
    ie,
    rntrc,
    address,
    vehicle,
    driver,
    representativeId: req.user?.id || 'unknown',
  };
  createCarrier(carrier)
    .then((created) => res.status(201).json(created))
    .catch((err) => {
      console.error('Erro ao criar transportadora', err);
      res.status(500).json({ error: 'Erro ao criar transportadora' });
    });
});

export default router;