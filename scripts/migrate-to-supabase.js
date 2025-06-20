require('dotenv').config();
const mysql = require('mysql2/promise');
const { Client } = require('pg');
const fs = require('fs');

async function exportFromMariaDB() {
  console.log('🔄 Connecting to MariaDB...');
  
  const mariaDbConnection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'zerocall', // Your MariaDB password from .env
    database: 'eegar'
  });

  try {
    // Export Brokers
    console.log('📋 Exporting brokers...');
    const [brokers] = await mariaDbConnection.execute('SELECT * FROM brokers');
    
    // Export Messages (if exists)
    let messages = [];
    try {
      const [messageResults] = await mariaDbConnection.execute('SELECT * FROM messages');
      messages = messageResults;
      console.log('📋 Exporting messages...');
    } catch (error) {
      console.log('ℹ️ No messages table found');
    }

    // Export Properties (if exists)
    let properties = [];
    try {
      const [propertyResults] = await mariaDbConnection.execute('SELECT * FROM properties');
      properties = propertyResults;
      console.log('📋 Exporting properties...');
    } catch (error) {
      console.log('ℹ️ No properties table found');
    }

    // Export Contacts (if exists)
    let contacts = [];
    try {
      const [contactResults] = await mariaDbConnection.execute('SELECT * FROM contacts');
      contacts = contactResults;
      console.log('📋 Exporting contacts...');
    } catch (error) {
      console.log('ℹ️ No contacts table found');
    }

    // Save to JSON files for backup
    fs.writeFileSync('./backup_brokers.json', JSON.stringify(brokers, null, 2));
    if (messages.length > 0) fs.writeFileSync('./backup_messages.json', JSON.stringify(messages, null, 2));
    if (properties.length > 0) fs.writeFileSync('./backup_properties.json', JSON.stringify(properties, null, 2));
    if (contacts.length > 0) fs.writeFileSync('./backup_contacts.json', JSON.stringify(contacts, null, 2));

    console.log(`✅ Exported ${brokers.length} brokers`);
    console.log(`✅ Exported ${messages.length} messages`);
    console.log(`✅ Exported ${properties.length} properties`);
    console.log(`✅ Exported ${contacts.length} contacts`);

    await mariaDbConnection.end();
    
    return { brokers, messages, properties, contacts };
  } catch (error) {
    console.error('❌ Error exporting from MariaDB:', error);
    await mariaDbConnection.end();
    throw error;
  }
}

async function importToSupabase(data) {
  const { brokers, messages, properties, contacts } = data;
  
  console.log('🔄 Connecting to Supabase...');
  
  // Get DATABASE_URL from environment
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  await client.connect();

  try {
    // Import Brokers
    console.log('📥 Importing brokers...');
    for (const broker of brokers) {
      const query = `
        INSERT INTO brokers (
          name, phone, email, address, city, area, company, status,
          "licenseNumber", "yearsOfExperience", specializations, "profileImage",
          "totalProperties", "activeDealCount", "lastActivity", rating, "totalDeals",
          "preferredContactMethod", notes, "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        ON CONFLICT (phone) DO NOTHING
      `;
      
      const values = [
        broker.name,
        broker.phone,
        broker.email,
        broker.address,
        broker.city,
        broker.area,
        broker.company,
        broker.status || 'ACTIVE',
        broker.licenseNumber,
        broker.yearsOfExperience,
        broker.specializations,
        broker.profileImage,
        broker.totalProperties || 0,
        broker.activeDealCount || 0,
        broker.lastActivity,
        broker.rating,
        broker.totalDeals || 0,
        broker.preferredContactMethod || 'WHATSAPP',
        broker.notes,
        broker.createdAt || new Date(),
        broker.updatedAt || new Date()
      ];
      
      await client.query(query, values);
    }

    // Import Messages
    if (messages.length > 0) {
      console.log('📥 Importing messages...');
      for (const message of messages) {
        const query = `
          INSERT INTO messages (
            "brokerId", content, "messageDate", "messageTime", attachments,
            "messageType", "containsPropertyInfo", "extractedPropertyId",
            sentiment, language, "createdAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;
        
        const values = [
          message.brokerId,
          message.content,
          message.messageDate,
          message.messageTime,
          message.attachments,
          message.messageType || 'TEXT',
          message.containsPropertyInfo || false,
          message.extractedPropertyId,
          message.sentiment,
          message.language,
          message.createdAt || new Date()
        ];
        
        try {
          await client.query(query, values);
        } catch (error) {
          console.log(`Skipping message ${message.id}: ${error.message}`);
        }
      }
    }

    // Import Properties
    if (properties.length > 0) {
      console.log('📥 Importing properties...');
      for (const property of properties) {
        const query = `
          INSERT INTO properties (
            title, description, "propertyType", "listingType", price, "pricePerMeter",
            currency, negotiable, area, location, address, city, neighborhood, district,
            bedrooms, bathrooms, floors, floor, parking, furnished, balcony, elevator,
            features, condition, "buildingAge", status, featured, "urgentSale",
            "extractedFromMessage", "sourceMessageId", "ownerId", images,
            "viewCount", "inquiryCount", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36)
        `;
        
        const values = [
          property.title,
          property.description,
          property.propertyType,
          property.listingType,
          property.price,
          property.pricePerMeter,
          property.currency || 'EGP',
          property.negotiable !== undefined ? property.negotiable : true,
          property.area,
          property.location,
          property.address,
          property.city,
          property.neighborhood,
          property.district,
          property.bedrooms,
          property.bathrooms,
          property.floors,
          property.floor,
          property.parking || false,
          property.furnished || false,
          property.balcony || false,
          property.elevator || false,
          property.features,
          property.condition,
          property.buildingAge,
          property.status || 'AVAILABLE',
          property.featured || false,
          property.urgentSale || false,
          property.extractedFromMessage || false,
          property.sourceMessageId,
          property.ownerId,
          property.images,
          property.viewCount || 0,
          property.inquiryCount || 0,
          property.createdAt || new Date(),
          property.updatedAt || new Date()
        ];
        
        try {
          await client.query(query, values);
        } catch (error) {
          console.log(`Skipping property ${property.id}: ${error.message}`);
        }
      }
    }

    // Import Contacts
    if (contacts.length > 0) {
      console.log('📥 Importing contacts...');
      for (const contact of contacts) {
        const query = `
          INSERT INTO contacts (
            name, phone, email, status, notes, "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (phone) DO NOTHING
        `;
        
        const values = [
          contact.name,
          contact.phone,
          contact.email,
          contact.status,
          contact.notes,
          contact.createdAt || new Date(),
          contact.updatedAt || new Date()
        ];
        
        try {
          await client.query(query, values);
        } catch (error) {
          console.log(`Skipping contact ${contact.id}: ${error.message}`);
        }
      }
    }

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error importing to Supabase:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    console.log('🚀 Starting migration from MariaDB to Supabase...');
    
    // Step 1: Export from MariaDB
    const data = await exportFromMariaDB();
    
    // Step 2: Import to Supabase
    await importToSupabase(data);
    
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update your .env file with the Supabase DATABASE_URL');
    console.log('2. Run: npx prisma db push');
    console.log('3. Run: npx prisma generate');
    console.log('4. Deploy to Vercel with the new DATABASE_URL');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
