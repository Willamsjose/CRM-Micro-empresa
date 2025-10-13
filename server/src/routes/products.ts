import { Router } from 'express';
import { genId } from '../utils/data';
import { listProducts, createProduct } from '../repositories/products';

const router = Router();

router.get('/', (req, res) => {
  listProducts(req.user)
    .then((items) => res.json({ items }))
    .catch((err) => {
      console.error('Erro ao listar produtos', err);
      res.status(500).json({ error: 'Erro ao listar produtos' });
    });
});

router.post('/', (req, res) => {
  const { name, sku, price, barcode, media } = req.body;
  if (!name) return res.status(400).json({ error: 'name é obrigatório' });
  const product = {
    id: genId('prod'),
    name,
    sku,
    price: price ?? 0,
    barcode,
    media: {
      photos: (media?.photos ?? []) as string[],
      videos: (media?.videos ?? []) as string[],
    },
    representativeId: req.user?.id || 'unknown',
  };
  createProduct(product)
    .then((created) => res.status(201).json(created))
    .catch((err) => {
      console.error('Erro ao criar produto', err);
      res.status(500).json({ error: 'Erro ao criar produto' });
    });
});

export default router;