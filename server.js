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
    const [totalContacts, totalMessages, qualifiedLeads, newLeads] = await Promise.all([
      prisma.contact.count(),
      prisma.message.count(),
      prisma.contact.count({ where: { status: 'QUALIFIED' } }),
      prisma.contact.count({ where: { status: 'NEW_LEAD' } })
    ]);

    res.json({
      totalContacts,
      totalMessages,
      qualifiedLeads,
      newLeads
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
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
