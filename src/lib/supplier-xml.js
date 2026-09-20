import { readFileSync } from 'node:fs';

// Parse a supplier stock list and pull out the <item> values.
export function parseSupplierXml(xml) {
  const entities = {};
  const declRe = /<!ENTITY\s+(\w+)\s+SYSTEM\s+"([^"]+)"\s*>/g;
  let m;
  while ((m = declRe.exec(xml))) {
    const [, name, uri] = m;
    try {
      const path = uri.startsWith('file://') ? uri.slice('file://'.length) : uri;
      entities[name] = readFileSync(path, 'utf8');
    } catch {
      entities[name] = '';
    }
  }
  const body = xml.replace(/&(\w+);/g, (whole, name) => (name in entities ? entities[name] : whole));

  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  while ((m = itemRe.exec(body))) items.push(m[1].trim());
  return items;
}
