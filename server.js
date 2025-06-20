const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

console.log('Starting CRM API Server...');
const app = express();
const port = 3001;
const prisma = new PrismaClient();

console.log('Setting up middleware...');
app.use(cors());
app.use(express.json());

// Get all contacts
app.get('/api/contacts', async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Get contact by ID
app.get('/api/contacts/:id', async (req, res) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        messages: {
          orderBy: { messageDate: 'desc' }
        }
      }
    });
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// Get dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    console.log('Fetching dashboard stats...');
    
    // Use individual try-catch blocks for each query to handle missing tables
    let totalBrokers = 0;
    let totalContacts = 0;
    let totalMessages = 0;
    let totalProperties = 0;
    let qualifiedLeads = 0;
    let newLeads = 0;
    let propertiesForSale = 0;
    let propertiesForRent = 0;
    let propertiesWanted = 0;
    let activeBrokers = 0;
    let recentMessages = [];
    let topBrokers = [];

    try {
      totalBrokers = await prisma.broker.count();
      console.log('Total brokers:', totalBrokers);
    } catch (err) {
      console.error('Error counting brokers:', err.message);
    }

    try {
      totalContacts = await prisma.contact.count();
      console.log('Total contacts:', totalContacts);
    } catch (err) {
      console.error('Error counting contacts:', err.message);
    }

    try {
      totalMessages = await prisma.message.count();
      console.log('Total messages:', totalMessages);
    } catch (err) {
      console.error('Error counting messages:', err.message);
    }

    try {
      totalProperties = await prisma.property.count();
      console.log('Total properties:', totalProperties);
    } catch (err) {
      console.error('Error counting properties:', err.message);
    }

    try {
      activeBrokers = await prisma.broker.count({ where: { status: 'ACTIVE' } });
      console.log('Active brokers:', activeBrokers);
    } catch (err) {
      console.error('Error counting active brokers:', err.message);
    }

    try {
      propertiesForSale = await prisma.property.count({ where: { listingType: 'FOR_SALE' } });
    } catch (err) {
      console.error('Error counting properties for sale:', err.message);
    }

    try {
      propertiesForRent = await prisma.property.count({ where: { listingType: 'FOR_RENT' } });
    } catch (err) {
      console.error('Error counting properties for rent:', err.message);
    }

    try {
      propertiesWanted = await prisma.property.count({ where: { listingType: 'WANTED' } });
    } catch (err) {
      console.error('Error counting properties wanted:', err.message);
    }

    try {
      recentMessages = await prisma.message.findMany({
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
      });
    } catch (err) {
      console.error('Error fetching recent messages:', err.message);
    }

    try {
      topBrokers = await prisma.broker.findMany({
        take: 5,
        orderBy: { totalProperties: 'desc' },
        where: { totalProperties: { gt: 0 } }
      });
    } catch (err) {
      console.error('Error fetching top brokers:', err.message);
    }

    const response = {
      totalBrokers,
      totalContacts,
      totalMessages,
      totalProperties,
      totalInquiries: qualifiedLeads + newLeads,
      propertiesForSale,
      propertiesForRent,
      propertiesWanted,
      activeBrokers,
      recentActivity: recentMessages,
      topBrokers,
      propertyTypeDistribution: [
        { type: 'APARTMENT', count: 0 },
        { type: 'HOUSE', count: 0 },
        { type: 'VILLA', count: 0 }
      ],
      listingTypeDistribution: [
        { type: 'FOR_SALE', count: propertiesForSale },
        { type: 'FOR_RENT', count: propertiesForRent },
        { type: 'WANTED', count: propertiesWanted }
      ]
    };

    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get all brokers
app.get('/api/brokers', async (req, res) => {
  try {
    const { search, status, limit = 1000 } = req.query;
    
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
            properties: true
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

// Get broker by ID
app.get('/api/brokers/:id', async (req, res) => {
  try {
    const broker = await prisma.broker.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        properties: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!broker) {
      return res.status(404).json({ error: 'Broker not found' });
    }
    
    res.json(broker);
  } catch (error) {
    console.error('Error fetching broker:', error);
    res.status(500).json({ error: 'Failed to fetch broker' });
  }
});

// Update broker
app.put('/api/brokers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const broker = await prisma.broker.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    res.json(broker);
  } catch (error) {
    console.error('Error updating broker:', error);
    res.status(500).json({ error: 'Failed to update broker' });
  }
});

// Get all properties
app.get('/api/properties', async (req, res) => {
  try {
    const { search, limit = 1000 } = req.query;
    
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
        broker: {
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

// Get recent messages
app.get('/api/messages/recent', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      include: {
        contact: true
      },
      orderBy: { messageDate: 'desc' },
      take: 10
    });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    res.status(500).json({ error: 'Failed to fetch recent messages' });
  }
});

// Update contact
app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const contact = await prisma.contact.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    res.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

app.listen(port, () => {
  console.log(`🚀 CRM API Server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
