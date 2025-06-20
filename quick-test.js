require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickTest() {
  try {
    console.log('Testing connection...');
    
    // Test basic connection
    const brokerCount = await prisma.broker.count();
    console.log('Current broker count:', brokerCount);
    
    // Create a simple broker
    const broker = await prisma.broker.create({
      data: {
        name: 'Test Broker',
        phone: '+201111111111',
        status: 'ACTIVE'
      }
    });
    
    console.log('Created broker:', broker);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickTest();
