const { PrismaClient } = require('@prisma/client');
const mysql = require('mysql2/promise');

async function migrateData() {
  console.log('🚀 Starting data migration...');
  
  // Connect to your old MariaDB database
  const oldDb = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password', // Update this
    database: 'eegar'
  });

  // Connect to new cloud database via Prisma
  const newDb = new PrismaClient();

  try {
    // Migrate Brokers
    console.log('📋 Migrating brokers...');
    const [brokers] = await oldDb.execute('SELECT * FROM brokers');
    
    for (const broker of brokers) {
      await newDb.broker.upsert({
        where: { phone: broker.phone || `temp_${broker.id}` },
        update: {},
        create: {
          name: broker.name,
          phone: broker.phone,
          email: broker.email,
          address: broker.address,
          city: broker.city,
          area: broker.area,
          company: broker.company,
          status: broker.status || 'ACTIVE',
          licenseNumber: broker.licenseNumber,
          yearsOfExperience: broker.yearsOfExperience,
          specializations: broker.specializations,
          profileImage: broker.profileImage,
          totalProperties: broker.totalProperties || 0,
          activeDealCount: broker.activeDealCount || 0,
          lastActivity: broker.lastActivity,
          rating: broker.rating,
          totalDeals: broker.totalDeals || 0,
          preferredContactMethod: broker.preferredContactMethod || 'WHATSAPP',
          notes: broker.notes,
          createdAt: broker.createdAt,
          updatedAt: broker.updatedAt
        }
      });
    }
    console.log(`✅ Migrated ${brokers.length} brokers`);

    // Migrate Contacts (if they exist)
    try {
      console.log('📋 Migrating contacts...');
      const [contacts] = await oldDb.execute('SELECT * FROM contacts');
      
      for (const contact of contacts) {
        await newDb.contact.create({
          data: {
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
            status: contact.status,
            notes: contact.notes,
            createdAt: contact.createdAt,
            updatedAt: contact.updatedAt
          }
        });
      }
      console.log(`✅ Migrated ${contacts.length} contacts`);
    } catch (error) {
      console.log('ℹ️ No contacts table found, skipping...');
    }

    // Migrate Messages (if they exist)
    try {
      console.log('📋 Migrating messages...');
      const [messages] = await oldDb.execute('SELECT * FROM messages');
      
      for (const message of messages) {
        await newDb.message.create({
          data: {
            brokerId: message.brokerId,
            content: message.content,
            messageDate: message.messageDate,
            messageTime: message.messageTime,
            attachments: message.attachments,
            messageType: message.messageType || 'TEXT',
            containsPropertyInfo: message.containsPropertyInfo || false,
            extractedPropertyId: message.extractedPropertyId,
            sentiment: message.sentiment,
            language: message.language,
            createdAt: message.createdAt
          }
        });
      }
      console.log(`✅ Migrated ${messages.length} messages`);
    } catch (error) {
      console.log('ℹ️ No messages table found, skipping...');
    }

    // Migrate Properties (if they exist)
    try {
      console.log('📋 Migrating properties...');
      const [properties] = await oldDb.execute('SELECT * FROM properties');
      
      for (const property of properties) {
        await newDb.property.create({
          data: {
            title: property.title,
            description: property.description,
            propertyType: property.propertyType,
            listingType: property.listingType,
            price: property.price,
            pricePerMeter: property.pricePerMeter,
            currency: property.currency || 'EGP',
            negotiable: property.negotiable || true,
            area: property.area,
            location: property.location,
            address: property.address,
            city: property.city,
            neighborhood: property.neighborhood,
            district: property.district,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            floors: property.floors,
            floor: property.floor,
            parking: property.parking || false,
            furnished: property.furnished || false,
            balcony: property.balcony || false,
            elevator: property.elevator || false,
            features: property.features,
            condition: property.condition,
            buildingAge: property.buildingAge,
            status: property.status || 'AVAILABLE',
            featured: property.featured || false,
            urgentSale: property.urgentSale || false,
            extractedFromMessage: property.extractedFromMessage || false,
            sourceMessageId: property.sourceMessageId,
            ownerId: property.ownerId,
            images: property.images,
            viewCount: property.viewCount || 0,
            inquiryCount: property.inquiryCount || 0,
            createdAt: property.createdAt,
            updatedAt: property.updatedAt
          }
        });
      }
      console.log(`✅ Migrated ${properties.length} properties`);
    } catch (error) {
      console.log('ℹ️ No properties table found, skipping...');
    }

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await oldDb.end();
    await newDb.$disconnect();
  }
}

// Run migration
migrateData().catch(console.error);
