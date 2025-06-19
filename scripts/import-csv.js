const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function importCSV() {
  try {
    const csvPath = path.join(__dirname, '../../real_estate_whatsapp_chat.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const lines = csvData.split('\n');
    
    // Skip header line
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    const contacts = new Map();
    const messages = [];
    
    for (const line of dataLines) {
      const [date, time, name, description, phone] = line.split(',');
      
      if (!name || name === 'null') continue;
      
      // Create or get contact
      if (!contacts.has(name)) {
        contacts.set(name, {
          name: name.trim(),
          phone: phone?.trim() || null,
          status: 'NEW_LEAD',
          priority: 'MEDIUM',
          source: 'WhatsApp',
        });
      }
      
      // Add message if description exists and is not null
      if (description && description !== 'null' && description !== '<Media omitted>') {
        messages.push({
          contactName: name.trim(),
          content: description.trim(),
          messageDate: new Date(date),
          messageTime: time,
          messageType: description.includes('file attached') ? 'IMAGE' : 'TEXT',
        });
      }
    }
    
    console.log(`Found ${contacts.size} unique contacts and ${messages.length} messages`);
    
    // Insert contacts
    for (const [name, contactData] of contacts) {
      // Check if contact already exists
      const existingContact = await prisma.contact.findFirst({
        where: { 
          name: contactData.name,
          phone: contactData.phone 
        }
      });
      
      if (!existingContact) {
        await prisma.contact.create({
          data: contactData,
        });
      }
    }
    
    // Insert messages
    for (const messageData of messages) {
      const contact = await prisma.contact.findFirst({
        where: { name: messageData.contactName }
      });
      
      if (contact) {
        await prisma.message.create({
          data: {
            contactId: contact.id,
            content: messageData.content,
            messageDate: messageData.messageDate,
            messageTime: messageData.messageTime,
            messageType: messageData.messageType,
          }
        });
      }
    }
    
    console.log('CSV import completed successfully!');
    
  } catch (error) {
    console.error('Error importing CSV:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importCSV();
