const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Dashboard Stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [
      totalBrokers,
      totalProperties,
      totalMessages,
      totalInquiries,
      propertiesForSale,
      propertiesForRent,
      propertiesWanted,
      activeBrokers,
      recentMessages,
      topBrokers,
      propertyTypeStats,
      listingTypeStats
    ] = await Promise.all([
      prisma.broker.count(),
      prisma.property.count(),
      prisma.message.count(),
      prisma.propertyInquiry.count(),
      prisma.property.count({ where: { listingType: 'FOR_SALE' } }),
      prisma.property.count({ where: { listingType: 'FOR_RENT' } }),
      prisma.property.count({ where: { listingType: 'WANTED' } }),
      prisma.broker.count({ where: { status: 'ACTIVE' } }),
      prisma.message.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          broker: true,
          extractedProperty: true
        }
      }),
      prisma.broker.findMany({
        take: 5,
        orderBy: { totalProperties: 'desc' },
        where: { totalProperties: { gt: 0 } }
      }),
      prisma.property.groupBy({
        by: ['propertyType'],
        _count: { propertyType: true }
      }),
      prisma.property.groupBy({
        by: ['listingType'],
        _count: { listingType: true }
      })
    ]);

    const stats = {
      totalBrokers,
      totalProperties,
      totalMessages,
      totalInquiries,
      propertiesForSale,
      propertiesForRent,
      propertiesWanted,
      activeBrokers,
      recentActivity: recentMessages,
      topBrokers,
      propertyTypeDistribution: propertyTypeStats.map(stat => ({
        type: stat.propertyType,
        count: stat._count.propertyType
      })),
      listingTypeDistribution: listingTypeStats.map(stat => ({
        type: stat.listingType,
        count: stat._count.listingType
      }))
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Brokers
app.get('/api/brokers', async (req, res) => {
  try {
    const { search, status, limit = 50 } = req.query;
    
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } }
      ];
    }
    if (status) {
      where.status = status;
    }

    const brokers = await prisma.broker.findMany({
      where,
      take: parseInt(limit),
      orderBy: { lastActivity: 'desc' },
      include: {
        _count: {
          select: {
            ownedProperties: true,
            messages: true,
            propertyInquiries: true
          }
        }
      }
    });

    res.json(brokers);
  } catch (error) {
    console.error('Brokers fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch brokers' });
  }
});

app.get('/api/brokers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const broker = await prisma.broker.findUnique({
      where: { id: parseInt(id) },
      include: {
        ownedProperties: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        messages: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { extractedProperty: true }
        },
        propertyInquiries: {
          take: 10,
          orderBy: { inquiryDate: 'desc' },
          include: { property: true }
        }
      }
    });

    if (!broker) {
      return res.status(404).json({ error: 'Broker not found' });
    }

    res.json(broker);
  } catch (error) {
    console.error('Broker fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch broker' });
  }
});

app.put('/api/brokers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.lastActivity) {
      updateData.lastActivity = new Date(updateData.lastActivity);
    }
    
    const broker = await prisma.broker.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        _count: {
          select: {
            ownedProperties: true,
            messages: true,
            propertyInquiries: true
          }
        }
      }
    });
    res.json(broker);
  } catch (error) {
    console.error('Broker update error:', error);
    res.status(500).json({ error: 'Failed to update broker' });
  }
});

app.post('/api/brokers', async (req, res) => {
  try {
    const brokerData = {
      ...req.body,
      status: req.body.status || 'ACTIVE',
      lastActivity: new Date()
    };
    
    const broker = await prisma.broker.create({
      data: brokerData,
      include: {
        _count: {
          select: {
            ownedProperties: true,
            messages: true,
            propertyInquiries: true
          }
        }
      }
    });
    res.status(201).json(broker);
  } catch (error) {
    console.error('Broker create error:', error);
    res.status(500).json({ error: 'Failed to create broker' });
  }
});

app.delete('/api/brokers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if broker exists
    const broker = await prisma.broker.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            ownedProperties: true,
            messages: true,
            propertyInquiries: true
          }
        }
      }
    });
    
    if (!broker) {
      return res.status(404).json({ error: 'Broker not found' });
    }
    
    // Check if broker has dependencies
    const hasProperties = broker._count.ownedProperties > 0;
    const hasMessages = broker._count.messages > 0;
    const hasInquiries = broker._count.propertyInquiries > 0;
    
    if (hasProperties || hasMessages || hasInquiries) {
      // Soft delete - just deactivate the broker
      const updatedBroker = await prisma.broker.update({
        where: { id: parseInt(id) },
        data: { 
          status: 'INACTIVE',
          lastActivity: new Date()
        }
      });
      res.json({ 
        message: 'Broker deactivated due to existing data', 
        broker: updatedBroker,
        soft_delete: true
      });
    } else {
      // Hard delete if no dependencies
      await prisma.broker.delete({
        where: { id: parseInt(id) }
      });
      res.json({ 
        message: 'Broker deleted successfully',
        soft_delete: false
      });
    }
  } catch (error) {
    console.error('Broker delete error:', error);
    res.status(500).json({ error: 'Failed to delete broker' });
  }
});

// Properties
app.get('/api/properties', async (req, res) => {
  try {
    const { 
      listingType, 
      propertyType, 
      minPrice, 
      maxPrice, 
      location, 
      brokerId,
      limit = 50,
      offset = 0
    } = req.query;
    
    const where = {};
    if (listingType) where.listingType = listingType;
    if (propertyType) where.propertyType = propertyType;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (location) {
      where.OR = [
        { location: { contains: location } },
        { address: { contains: location } },
        { city: { contains: location } },
        { neighborhood: { contains: location } }
      ];
    }
    if (brokerId) where.ownerId = parseInt(brokerId);

    const properties = await prisma.property.findMany({
      where,
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { createdAt: 'desc' },
      include: {
        owner: true,
        _count: {
          select: { inquiries: true }
        }
      }
    });

    res.json(properties);
  } catch (error) {
    console.error('Properties fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id: parseInt(id) },
      include: {
        owner: true,
        inquiries: {
          include: { broker: true },
          orderBy: { inquiryDate: 'desc' }
        },
        messages: {
          include: { broker: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Increment view count
    await prisma.property.update({
      where: { id: parseInt(id) },
      data: { viewCount: { increment: 1 } }
    });

    res.json(property);
  } catch (error) {
    console.error('Property fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

app.post('/api/properties', async (req, res) => {
  try {
    const property = await prisma.property.create({
      data: req.body,
      include: { owner: true }
    });

    // Update broker's property count
    if (property.ownerId) {
      await prisma.broker.update({
        where: { id: property.ownerId },
        data: { totalProperties: { increment: 1 } }
      });
    }

    res.status(201).json(property);
  } catch (error) {
    console.error('Property creation error:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

app.put('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.update({
      where: { id: parseInt(id) },
      data: req.body,
      include: { owner: true }
    });
    res.json(property);
  } catch (error) {
    console.error('Property update error:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

app.delete('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id: parseInt(id) }
    });

    await prisma.property.delete({
      where: { id: parseInt(id) }
    });

    // Update broker's property count
    if (property?.ownerId) {
      await prisma.broker.update({
        where: { id: property.ownerId },
        data: { totalProperties: { decrement: 1 } }
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Property deletion error:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// Messages
app.get('/api/messages', async (req, res) => {
  try {
    const { brokerId, limit = 100 } = req.query;
    
    const where = {};
    if (brokerId) where.brokerId = parseInt(brokerId);

    const messages = await prisma.message.findMany({
      where,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        broker: true,
        extractedProperty: true
      }
    });

    res.json(messages);
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.get('/api/messages/property/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const messages = await prisma.message.findMany({
      where: { extractedPropertyId: parseInt(propertyId) },
      include: { broker: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(messages);
  } catch (error) {
    console.error('Property messages fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch property messages' });
  }
});

// Property Inquiries
app.get('/api/inquiries', async (req, res) => {
  try {
    const { propertyId, brokerId, status, limit = 50 } = req.query;
    
    const where = {};
    if (propertyId) where.propertyId = parseInt(propertyId);
    if (brokerId) where.brokerId = parseInt(brokerId);
    if (status) where.status = status;

    const inquiries = await prisma.propertyInquiry.findMany({
      where,
      take: parseInt(limit),
      orderBy: { inquiryDate: 'desc' },
      include: {
        broker: true,
        property: true,
        sender: true
      }
    });

    res.json(inquiries);
  } catch (error) {
    console.error('Inquiries fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

app.post('/api/inquiries', async (req, res) => {
  try {
    const inquiry = await prisma.propertyInquiry.create({
      data: req.body,
      include: {
        broker: true,
        property: true,
        sender: true
      }
    });

    // Update property inquiry count
    await prisma.property.update({
      where: { id: inquiry.propertyId },
      data: { inquiryCount: { increment: 1 } }
    });

    res.status(201).json(inquiry);
  } catch (error) {
    console.error('Inquiry creation error:', error);
    res.status(500).json({ error: 'Failed to create inquiry' });
  }
});

app.put('/api/inquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await prisma.propertyInquiry.update({
      where: { id: parseInt(id) },
      data: req.body,
      include: {
        broker: true,
        property: true,
        sender: true
      }
    });
    res.json(inquiry);
  } catch (error) {
    console.error('Inquiry update error:', error);
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

app.post('/api/inquiries/:id/respond', async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    
    const inquiry = await prisma.propertyInquiry.update({
      where: { id: parseInt(id) },
      data: {
        response,
        responseDate: new Date(),
        status: 'RESPONDED'
      },
      include: {
        broker: true,
        property: true,
        sender: true
      }
    });
    
    res.json(inquiry);
  } catch (error) {
    console.error('Inquiry response error:', error);
    res.status(500).json({ error: 'Failed to respond to inquiry' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Broker CRM API Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`👥 Brokers: http://localhost:${PORT}/api/brokers`);
  console.log(`🏠 Properties: http://localhost:${PORT}/api/properties`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
