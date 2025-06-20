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
      const contacts = await prisma.contact.findMany({
        include: {
          messages: {
            take: 1,
            orderBy: { messageDate: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(contacts);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  } finally {
    await prisma.$disconnect();
  }
}
