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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const [
      totalBrokers, 
      totalContacts, 
      totalMessages, 
      totalProperties, 
      qualifiedLeads, 
      newLeads,
      propertiesForSale,
      propertiesForRent,
      propertiesWanted,
      activeBrokers,
      recentMessages,
      topBrokers
    ] = await Promise.all([
      prisma.broker.count(),
      prisma.contact.count(),
      prisma.message.count(),
      prisma.property.count(),
      prisma.contact.count({ where: { status: 'QUALIFIED' } }),
      prisma.contact.count({ where: { status: 'NEW_LEAD' } }),
      prisma.property.count({ where: { listingType: 'FOR_SALE' } }),
      prisma.property.count({ where: { listingType: 'FOR_RENT' } }),
      prisma.property.count({ where: { listingType: 'WANTED' } }),
      prisma.broker.count({ where: { status: 'ACTIVE' } }),
      // Get recent messages for activity
      prisma.message.findMany({
        take: 5,
        orderBy: { messageDate: 'desc' },
        include: {
          broker: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          }
        }
      }),
      // Get top brokers by total properties
      prisma.broker.findMany({
        take: 5,
        orderBy: { totalProperties: 'desc' },
        where: { totalProperties: { gt: 0 } }
      })
    ]);

    res.json({
      totalBrokers,
      totalContacts,
      totalMessages,
      totalProperties,
      totalInquiries: qualifiedLeads + newLeads,
      propertiesForSale: propertiesForSale || 0,
      propertiesForRent: propertiesForRent || 0,
      propertiesWanted: propertiesWanted || 0,
      activeBrokers,
      recentActivity: recentMessages,
      topBrokers,
      propertyTypeDistribution: [
        { type: 'APARTMENT', count: 0 },
        { type: 'HOUSE', count: 0 },
        { type: 'VILLA', count: 0 }
      ],
      listingTypeDistribution: [
        { type: 'FOR_SALE', count: propertiesForSale || 0 },
        { type: 'FOR_RENT', count: propertiesForRent || 0 },
        { type: 'WANTED', count: propertiesWanted || 0 }
      ]
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  } finally {
    await prisma.$disconnect();
  }
}
