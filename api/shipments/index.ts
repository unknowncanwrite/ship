import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../lib/db.js';
import { shipments, auditLogs } from '../../shared/schema.js';
import { desc } from 'drizzle-orm';
// Build timestamp: 2026-01-09T15:00:00Z

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const result = await db.select().from(shipments).orderBy(desc(shipments.createdAt));
      return res.json(result);
    }

    if (req.method === 'POST') {
      const data = req.body;
      const now = Date.now();

      // Default values for required JSON fields
      const defaultDetails = {
        customer: '', consignee: '', location: '', shippingLine: '',
        brand: '', inspectionDate: '', eta: '', loadingDate: '',
        idf: '', seal: '', ucr: '', proforma: '', commercialInv: '',
        container: '', booking: ''
      };

      const defaultCommercial = { invoice: '', qty: '', netWeight: '', grossWeight: '' };
      const defaultActual = { invoice: '', qty: '', netWeight: '', grossWeight: '', invoiceSent: false };

      const newShipment = {
        ...data,
        createdAt: data.createdAt ?? now,
        lastUpdated: data.lastUpdated ?? now,
        // Ensure all required JSON fields have default values
        details: data.details ?? defaultDetails,
        commercial: data.commercial ?? defaultCommercial,
        actual: data.actual ?? defaultActual,
        customTasks: data.customTasks ?? [],
        documents: data.documents ?? [],
        checklist: data.checklist ?? {},
        shipmentChecklist: data.shipmentChecklist ?? [],
      };

      const [inserted] = await db.insert(shipments).values(newShipment).returning();

      await db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        shipmentId: data.id,
        action: 'create',
        summary: `Created shipment ${data.id}`,
        timestamp: now,
      });

      return res.status(201).json(inserted);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
