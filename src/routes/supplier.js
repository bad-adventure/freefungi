import { Router } from 'express';
import { parseSupplierXml } from '../lib/supplier-xml.js';

const SAMPLE = `<?xml version="1.0"?>
<stock>
  <item>Rhubarb &amp; Custard x200</item>
  <item>Humbugs x150</item>
</stock>`;

export function supplierRoutes() {
  const r = Router();

  r.get('/supplier', (req, res) => {
    res.render('supplier', { user: req.user, items: null, xml: SAMPLE });
  });

  r.post('/supplier', (req, res) => {
    const xml = String(req.body.xml || '');
    let items = [];
    try { items = parseSupplierXml(xml); } catch { items = []; }
    res.render('supplier', { user: req.user, items, xml });
  });

  return r;
}
