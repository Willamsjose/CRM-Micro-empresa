import { Router } from 'express';

const router = Router();

// Geração de dados para etiqueta de código de barras (stub)
router.post('/barcode', (req, res) => {
  const { product } = req.body || {};
  if (!product?.name || !product?.barcode) {
    return res.status(400).json({ error: 'Campos obrigatórios: product.name e product.barcode' });
  }
  const payload = {
    layout: 'default-50x30',
    textTop: product.name,
    textBottom: `SKU: ${product.sku ?? ''} | Preço: ${product.price ?? ''}`,
    barcode: product.barcode,
    shelf: product.shelf ?? '',
  };
  res.json({ ok: true, label: payload });
});

export default router;