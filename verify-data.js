require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyData() {
  try {
    console.log('🔍 Verifying migrated data in Supabase...');
    
    const brokerCount = await prisma.broker.count();
    console.log(`✅ Total brokers: ${brokerCount}`);
    
    if (brokerCount > 0) {
      const sampleBrokers = await prisma.broker.findMany({
        take: 3,
        select: {
          id: true,
          name: true,
          phone: true,
          company: true,
          city: true
        }
      });
      
      console.log('\n📋 Sample brokers:');
      sampleBrokers.forEach(broker => {
        console.log(`  - ${broker.name} (${broker.phone}) - ${broker.company || 'No company'} - ${broker.city || 'No city'}`);
      });
    }
    
    const messageCount = await prisma.message.count();
    console.log(`\n✅ Total messages: ${messageCount}`);
    
    const propertyCount = await prisma.property.count();
    console.log(`✅ Total properties: ${propertyCount}`);
    
    const inquiryCount = await prisma.propertyInquiry.count();
    console.log(`✅ Total inquiries: ${inquiryCount}`);
    
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();
