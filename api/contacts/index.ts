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
      // Return property inquiries as "contacts" since they represent contact/inquiry data
      const inquiries = await prisma.propertyInquiry.findMany({
        include: {
          broker: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true
            }
          },
          property: {
            select: {
              id: true,
              title: true,
              propertyType: true,
              location: true
            }
          }
        },
        orderBy: { inquiryDate: 'desc' }
      });
      
      // Transform inquiries to match expected contact structure
      const contacts = inquiries.map(inquiry => ({
        id: inquiry.id,
        name: inquiry.broker.name,
        email: inquiry.broker.email,
        phone: inquiry.broker.phone,
        company: `Inquiry for ${inquiry.property.title}`,
        status: inquiry.status,
        created_at: inquiry.inquiryDate,
        notes: inquiry.message,
        propertyId: inquiry.property.id,
        propertyTitle: inquiry.property.title,
        inquiryType: inquiry.inquiryType
      }));
      
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
