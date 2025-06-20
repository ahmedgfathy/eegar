require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = 3002;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [
      totalBrokers,
      totalMessages,
      totalProperties,
      totalInquiries,
      propertiesForSale,
      propertiesForRent,
      propertiesWanted,
      activeBrokers,
      recentMessages,
      topBrokers
    ] = await Promise.all([
      prisma.broker.count(),
      prisma.message.count(),
      prisma.property.count(),
      prisma.propertyInquiry.count(),
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
      totalContacts: 0, // We don't have a contacts table
      totalMessages,
      totalProperties,
      totalInquiries,
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
  }
});

// Brokers endpoint
app.get('/api/brokers', async (req, res) => {
  try {
    const { search, status, limit = '1000' } = req.query;
    
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (status) {
      where.status = status;
    }

    const brokers = await prisma.broker.findMany({
      where,
      take: parseInt(limit),
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
  } catch (error) {
    console.error('Error fetching brokers:', error);
    res.status(500).json({ error: 'Failed to fetch brokers' });
  }
});

// Properties endpoint
app.get('/api/properties', async (req, res) => {
  try {
    const { search, limit = '1000' } = req.query;
    
    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    const properties = await prisma.property.findMany({
      where,
      take: parseInt(limit),
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
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Contacts endpoint (returning property inquiries)
app.get('/api/contacts', async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard stats: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`👥 Brokers: http://localhost:${PORT}/api/brokers`);
  console.log(`🏠 Properties: http://localhost:${PORT}/api/properties`);
  console.log(`📞 Contacts: http://localhost:${PORT}/api/contacts`);
});

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down API server...');
  await prisma.$disconnect();
  process.exit(0);
});
