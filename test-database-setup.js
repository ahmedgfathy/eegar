require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseSetup() {
  console.log('🔧 Testing database setup...\n');
  
  try {
    // Test 1: Connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');
    
    // Test 2: Count existing records
    console.log('2. Checking existing data...');
    const brokerCount = await prisma.broker.count();
    const propertyCount = await prisma.property.count();
    const messageCount = await prisma.message.count();
    const inquiryCount = await prisma.propertyInquiry.count();
    
    console.log(`📊 Current data count:`);
    console.log(`   - Brokers: ${brokerCount}`);
    console.log(`   - Properties: ${propertyCount}`);
    console.log(`   - Messages: ${messageCount}`);
    console.log(`   - Inquiries: ${inquiryCount}\n`);
    
    // Test 3: Create sample data if empty
    if (brokerCount === 0) {
      console.log('3. Creating sample data...');
      
      // Create a sample broker
      const broker = await prisma.broker.create({
        data: {
          name: 'أحمد محمد',
          phone: '+201234567890',
          email: 'ahmed@example.com',
          city: 'القاهرة',
          area: 'مدينة نصر',
          status: 'ACTIVE'
        }
      });
      console.log('✅ Sample broker created:', broker.name);
      
      // Create a sample property
      const property = await prisma.property.create({
        data: {
          title: 'شقة فاخرة في مدينة نصر',
          description: 'شقة 3 غرف وصالة، مساحة 150 متر مربع',
          propertyType: 'APARTMENT',
          listingType: 'FOR_SALE',
          price: 2500000,
          currency: 'EGP',
          area: 150,
          location: 'مدينة نصر، القاهرة',
          city: 'القاهرة',
          bedrooms: 3,
          bathrooms: 2,
          status: 'AVAILABLE',
          ownerId: broker.id
        }
      });
      console.log('✅ Sample property created:', property.title);
      
      // Create a sample message
      const message = await prisma.message.create({
        data: {
          brokerId: broker.id,
          content: 'مرحبا، لدي شقة فاخرة في مدينة نصر للبيع',
          messageDate: new Date(),
          messageTime: new Date().toLocaleTimeString(),
          messageType: 'TEXT',
          containsPropertyInfo: true
        }
      });
      console.log('✅ Sample message created');
      
      // Create a sample inquiry
      const inquiry = await prisma.propertyInquiry.create({
        data: {
          brokerId: broker.id,
          propertyId: property.id,
          inquiryType: 'PRICE_INQUIRY',
          message: 'هل السعر قابل للتفاوض؟',
          status: 'PENDING',
          urgency: 'MEDIUM'
        }
      });
      console.log('✅ Sample inquiry created\n');
    }
    
    // Test 4: API simulation
    console.log('4. Testing API data queries...');
    
    // Test brokers query
    const brokers = await prisma.broker.findMany({
      take: 5,
      include: {
        _count: {
          select: {
            ownedProperties: true
          }
        }
      }
    });
    console.log(`✅ Brokers API test: Found ${brokers.length} brokers`);
    
    // Test properties query
    const properties = await prisma.property.findMany({
      take: 5,
      include: {
        owner: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    });
    console.log(`✅ Properties API test: Found ${properties.length} properties`);
    
    // Test dashboard stats
    const stats = await Promise.all([
      prisma.broker.count(),
      prisma.property.count(),
      prisma.message.count(),
      prisma.propertyInquiry.count(),
      prisma.property.count({ where: { listingType: 'FOR_SALE' } }),
      prisma.property.count({ where: { listingType: 'FOR_RENT' } }),
      prisma.broker.count({ where: { status: 'ACTIVE' } })
    ]);
    
    console.log(`✅ Dashboard stats test: ${stats[0]} brokers, ${stats[1]} properties, ${stats[2]} messages`);
    
    console.log('\n🎉 All tests passed! Database is ready for use.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseSetup();
