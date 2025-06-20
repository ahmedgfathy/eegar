require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if we already have data
    const brokerCount = await prisma.broker.count();
    if (brokerCount > 0) {
      console.log('📊 Database already has data, skipping seed...');
      console.log(`Current counts - Brokers: ${brokerCount}`);
      return;
    }

    // Create sample brokers
    console.log('👥 Creating sample brokers...');
    const brokerData = [
      {
        name: 'أحمد محمد',
        phone: '+201234567890',
        email: 'ahmed.mohamed@realestate.com',
        city: 'القاهرة',
        area: 'مدينة نصر',
        company: 'شركة الملك للاستثمار العقاري',
        status: 'ACTIVE',
        licenseNumber: 'REL001',
        yearsOfExperience: 5,
        specializations: JSON.stringify(['APARTMENT', 'VILLA']),
        totalProperties: 15,
        totalDeals: 8,
        preferredContactMethod: 'WHATSAPP'
      },
      {
        name: 'محمد علي',
        phone: '+201987654321',
        email: 'mohamed.ali@broker.com',
        city: 'الجيزة',
        area: 'الدقي',
        company: 'مكتب أبو الدهب للعقارات',
        status: 'ACTIVE',
        licenseNumber: 'REL002',
        yearsOfExperience: 8,
        specializations: JSON.stringify(['HOUSE', 'OFFICE']),
        totalProperties: 22,
        totalDeals: 12,
        preferredContactMethod: 'PHONE'
      },
      {
        name: 'سارة أحمد',
        phone: '+201555123456',
        email: 'sara.ahmed@properties.com',
        city: 'الإسكندرية',
        area: 'سموحة',
        company: 'مجموعة العقارات المتميزة',
        status: 'ACTIVE',
        licenseNumber: 'REL003',
        yearsOfExperience: 3,
        specializations: JSON.stringify(['APARTMENT', 'STUDIO']),
        totalProperties: 8,
        totalDeals: 4,
        preferredContactMethod: 'WHATSAPP'
      }
    ];

    const createdBrokers = [];
    for (const data of brokerData) {
      const broker = await prisma.broker.create({ data });
      createdBrokers.push(broker);
    }

    console.log(`✅ Created ${createdBrokers.length} brokers`);

    // Create sample properties
    console.log('🏠 Creating sample properties...');
    const propertyData = [
      {
        title: 'شقة فاخرة في مدينة نصر',
        description: 'شقة 3 غرف وصالة، مساحة 150 متر مربع، الطابق الثالث',
        propertyType: 'APARTMENT',
        listingType: 'FOR_SALE',
        price: 2500000,
        currency: 'EGP',
        area: 150,
        location: 'مدينة نصر، القاهرة',
        address: 'شارع عباس العقاد، مدينة نصر',
        city: 'القاهرة',
        neighborhood: 'مدينة نصر',
        bedrooms: 3,
        bathrooms: 2,
        floors: 1,
        floor: 3,
        parking: true,
        furnished: false,
        balcony: true,
        elevator: true,
        condition: 'EXCELLENT',
        status: 'AVAILABLE',
        ownerId: createdBrokers[0].id,
        extractedFromMessage: false
      },
      {
        title: 'فيلا للبيع في الدقي',
        description: 'فيلا مستقلة 4 غرف نوم، حديقة خاصة، مساحة 300 متر',
        propertyType: 'VILLA',
        listingType: 'FOR_SALE',
        price: 8500000,
        currency: 'EGP',
        area: 300,
        location: 'الدقي، الجيزة',
        address: 'شارع التحرير، الدقي',
        city: 'الجيزة',
        neighborhood: 'الدقي',
        bedrooms: 4,
        bathrooms: 3,
        floors: 2,
        parking: true,
        furnished: true,
        balcony: true,
        condition: 'GOOD',
        status: 'AVAILABLE',
        ownerId: createdBrokers[1].id,
        extractedFromMessage: false
      },
      {
        title: 'شقة للإيجار في سموحة',
        description: 'شقة حديثة للإيجار، مفروشة بالكامل، قريبة من الجامعة',
        propertyType: 'APARTMENT',
        listingType: 'FOR_RENT',
        price: 8000,
        currency: 'EGP',
        area: 120,
        location: 'سموحة، الإسكندرية',
        address: 'شارع فوزي معاذ، سموحة',
        city: 'الإسكندرية',
        neighborhood: 'سموحة',
        bedrooms: 2,
        bathrooms: 1,
        floors: 1,
        floor: 2,
        parking: false,
        furnished: true,
        balcony: true,
        elevator: false,
        condition: 'EXCELLENT',
        status: 'AVAILABLE',
        ownerId: createdBrokers[2].id,
        extractedFromMessage: false
      },
      {
        title: 'مكتب تجاري للإيجار',
        description: 'مكتب تجاري في موقع مميز، مساحة 80 متر، مناسب للشركات',
        propertyType: 'OFFICE',
        listingType: 'FOR_RENT',
        price: 15000,
        currency: 'EGP',
        area: 80,
        location: 'وسط البلد، القاهرة',
        city: 'القاهرة',
        neighborhood: 'وسط البلد',
        floors: 1,
        floor: 1,
        parking: false,
        furnished: false,
        elevator: true,
        condition: 'GOOD',
        status: 'AVAILABLE',
        ownerId: createdBrokers[0].id,
        extractedFromMessage: false
      }
    ];

    const createdProperties = [];
    for (const data of propertyData) {
      const property = await prisma.property.create({ data });
      createdProperties.push(property);
    }

    console.log(`✅ Created ${createdProperties.length} properties`);

    // Create sample messages
    console.log('💬 Creating sample messages...');
    const messageData = [
      {
        brokerId: createdBrokers[0].id,
        content: 'مرحبا، لدي شقة فاخرة في مدينة نصر للبيع',
        messageDate: new Date('2024-12-15T10:30:00'),
        messageTime: '10:30',
        messageType: 'TEXT',
        containsPropertyInfo: true,
        extractedPropertyId: createdProperties[0].id,
        sentiment: 'POSITIVE',
        language: 'ar'
      },
      {
        brokerId: createdBrokers[1].id,
        content: 'فيلا رائعة في الدقي متاحة للبيع، السعر قابل للتفاوض',
        messageDate: new Date('2024-12-15T14:15:00'),
        messageTime: '14:15',
        messageType: 'TEXT',
        containsPropertyInfo: true,
        extractedPropertyId: createdProperties[1].id,
        sentiment: 'POSITIVE',
        language: 'ar'
      },
      {
        brokerId: createdBrokers[2].id,
        content: 'شقة مفروشة للإيجار في سموحة، مناسبة للطلاب',
        messageDate: new Date('2024-12-15T16:45:00'),
        messageTime: '16:45',
        messageType: 'TEXT',
        containsPropertyInfo: true,
        extractedPropertyId: createdProperties[2].id,
        sentiment: 'NEUTRAL',
        language: 'ar'
      }
    ];

    for (const data of messageData) {
      await prisma.message.create({ data });
    }

    console.log(`✅ Created ${messageData.length} messages`);

    // Create sample property inquiries
    console.log('📋 Creating sample property inquiries...');
    const inquiryData = [
      {
        brokerId: createdBrokers[1].id,
        propertyId: createdProperties[0].id,
        inquiryType: 'PRICE_INQUIRY',
        message: 'هل السعر قابل للتفاوض؟',
        status: 'PENDING',
        budget: 2200000,
        urgency: 'MEDIUM'
      },
      {
        brokerId: createdBrokers[2].id,
        propertyId: createdProperties[1].id,
        inquiryType: 'VIEWING_REQUEST',
        message: 'أرغب في معاينة الفيلا الأسبوع القادم',
        status: 'PENDING',
        urgency: 'HIGH'
      },
      {
        brokerId: createdBrokers[0].id,
        propertyId: createdProperties[2].id,
        inquiryType: 'AVAILABILITY_CHECK',
        message: 'هل الشقة ما زالت متاحة للإيجار؟',
        status: 'RESPONDED',
        urgency: 'MEDIUM'
      }
    ];

    for (const data of inquiryData) {
      await prisma.propertyInquiry.create({ data });
    }

    console.log(`✅ Created ${inquiryData.length} property inquiries`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📊 Summary:
- Brokers: ${createdBrokers.length}
- Properties: ${createdProperties.length}
- Messages: ${messageData.length}
- Inquiries: ${inquiryData.length}
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
