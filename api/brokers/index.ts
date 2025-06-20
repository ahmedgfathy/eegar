import { PrismaClient } from '@prisma/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { search, status, limit = '1000' } = req.query;
      
      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } }
        ];
      }
      if (status) {
        where.status = status;
      }

      const brokers = await prisma.broker.findMany({
        where,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              ownedProperties: true
            }
          }
        }
      });

      res.json(brokers);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error fetching brokers:', error);
    res.status(500).json({ error: 'Failed to fetch brokers' });
  } finally {
    await prisma.$disconnect();
  }
}
