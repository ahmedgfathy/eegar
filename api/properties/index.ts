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
      const { search, limit = '1000' } = req.query;
      
      const where: any = {};
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { location: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const properties = await prisma.property.findMany({
        where,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          }
        }
      });

      res.json(properties);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  } finally {
    await prisma.$disconnect();
  }
}
