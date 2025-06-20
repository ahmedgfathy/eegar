const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkImportedData() {
  try {
    console.log('📊 Checking imported data...');
    
    // Count brokers
    const brokerCount = await prisma.broker.count();
    console.log(`👥 Total Brokers: ${brokerCount}`);
    
    // Count properties
    const propertyCount = await prisma.property.count();
    console.log(`🏠 Total Properties: ${propertyCount}`);
    
    // Count messages
    const messageCount = await prisma.message.count();
    console.log(`💬 Total Messages: ${messageCount}`);
    
    // Show recent brokers
    console.log('\n📋 Recent Brokers:');
    const recentBrokers = await prisma.broker.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            ownedProperties: true,
            messages: true
          }
        }
      }
    });
    
    recentBrokers.forEach(broker => {
      console.log(`   • ${broker.name} (${broker.phone}) - ${broker._count.ownedProperties} properties, ${broker._count.messages} messages`);
    });
    
    // Show recent properties
    console.log('\n🏘️  Recent Properties:');
    const recentProperties = await prisma.property.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        broker: {
          select: { name: true, phone: true }
        }
      }
    });
    
    recentProperties.forEach(property => {
      console.log(`   • ${property.title} - ${property.broker?.name} (${property.listingType})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImportedData();
