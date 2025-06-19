const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Arabic text analysis patterns for property extraction
const propertyPatterns = {
  // Sale indicators
  sale: /للبيع|للإيجار|مطلوب|متاح|مطروح/gi,
  
  // Property types
  apartment: /شقة|شقه|منزل|وحدة|دور/gi,
  villa: /فيلا|قصر/gi,
  office: /مكتب|محل|معرض/gi,
  land: /قطعة|أرض|قطعه|ارض/gi,
  
  // Areas/neighborhoods
  area: /المجاور[ةه]\s*(\d+)|الحي\s*(\d+)/gi,
  
  // Prices
  price: /(\d+(?:,\d+)*)\s*(?:جنيه|ألف|مليون|الف)/gi,
  
  // Square meters
  meters: /(\d+)\s*متر/gi,
  
  // Contact info
  phone: /01[0-9]{9}|(\+20|0020)?1[0-9]{9}/gi,
  
  // Locations
  location: /خلف|أمام|بجوار|قريب من|في|عند/gi
};

// Extract property information from Arabic message content
function extractPropertyInfo(content, brokerName) {
  if (!content || content === 'null' || content.includes('<Media omitted>') || content.includes('file attached')) {
    return null;
  }

  const propertyInfo = {
    hasPropertyInfo: false,
    propertyType: null,
    listingType: null,
    price: null,
    area: null,
    location: null,
    description: content,
    features: []
  };

  // Check if message contains property information
  if (propertyPatterns.sale.test(content)) {
    propertyInfo.hasPropertyInfo = true;
    
    // Determine listing type
    if (/للبيع/gi.test(content)) {
      propertyInfo.listingType = 'FOR_SALE';
    } else if (/للإيجار/gi.test(content)) {
      propertyInfo.listingType = 'FOR_RENT';
    } else if (/مطلوب/gi.test(content)) {
      propertyInfo.listingType = 'WANTED';
    }
    
    // Extract property type
    if (propertyPatterns.apartment.test(content)) {
      propertyInfo.propertyType = 'APARTMENT';
    } else if (propertyPatterns.villa.test(content)) {
      propertyInfo.propertyType = 'VILLA';
    } else if (propertyPatterns.office.test(content)) {
      propertyInfo.propertyType = 'OFFICE';
    } else if (propertyPatterns.land.test(content)) {
      propertyInfo.propertyType = 'LAND';
    }
    
    // Extract area/neighborhood
    const areaMatch = content.match(propertyPatterns.area);
    if (areaMatch) {
      propertyInfo.location = areaMatch[0];
    }
    
    // Extract price
    const priceMatch = content.match(propertyPatterns.price);
    if (priceMatch) {
      const numericPrice = priceMatch[0].replace(/[^\d]/g, '');
      propertyInfo.price = parseFloat(numericPrice);
    }
    
    // Extract area in square meters
    const metersMatch = content.match(propertyPatterns.meters);
    if (metersMatch) {
      propertyInfo.area = parseFloat(metersMatch[1]);
    }
    
    // Generate title
    propertyInfo.title = generatePropertyTitle(propertyInfo, brokerName);
  }

  return propertyInfo.hasPropertyInfo ? propertyInfo : null;
}

function generatePropertyTitle(propertyInfo, brokerName) {
  let title = '';
  
  if (propertyInfo.listingType === 'FOR_SALE') {
    title += 'للبيع - ';
  } else if (propertyInfo.listingType === 'FOR_RENT') {
    title += 'للإيجار - ';
  } else if (propertyInfo.listingType === 'WANTED') {
    title += 'مطلوب - ';
  }
  
  if (propertyInfo.propertyType) {
    const typeMap = {
      'APARTMENT': 'شقة',
      'VILLA': 'فيلا',
      'OFFICE': 'مكتب',
      'LAND': 'قطعة أرض'
    };
    title += typeMap[propertyInfo.propertyType] || propertyInfo.propertyType;
  }
  
  if (propertyInfo.location) {
    title += ` في ${propertyInfo.location}`;
  }
  
  if (propertyInfo.area) {
    title += ` - ${propertyInfo.area} متر`;
  }
  
  return title || `عرض عقاري من ${brokerName}`;
}

async function importBrokersAndProperties() {
  try {
    console.log('Starting broker and property import...');
    
    const csvFilePath = path.join(__dirname, '..', 'real_estate_whatsapp_chat.csv');
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Parse CSV
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    const brokers = new Map();
    const messages = [];
    
    console.log(`Processing ${lines.length - 1} records...`);
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(',');
      if (columns.length < 4) continue;
      
      const [date, time, name, description, phone] = columns;
      
      if (!name || name === 'Name') continue;
      
      // Create broker entry
      if (!brokers.has(name)) {
        brokers.set(name, {
          name: name,
          phone: phone || null,
          totalProperties: 0,
          activeDealCount: 0,
          lastActivity: new Date(`${date} ${time}`)
        });
      } else {
        // Update last activity
        const existingBroker = brokers.get(name);
        const messageDate = new Date(`${date} ${time}`);
        if (messageDate > existingBroker.lastActivity) {
          existingBroker.lastActivity = messageDate;
        }
      }
      
      // Extract property information
      const propertyInfo = extractPropertyInfo(description, name);
      
      messages.push({
        brokerName: name,
        content: description || '',
        messageDate: new Date(date),
        messageTime: time,
        containsPropertyInfo: !!propertyInfo,
        propertyInfo: propertyInfo,
        attachments: description && (description.includes('file attached') || description.includes('<Media omitted>')) 
          ? JSON.stringify([{ type: 'media', description }]) : null
      });
    }
    
    console.log(`Found ${brokers.size} unique brokers and ${messages.length} messages`);
    
    // Insert brokers
    console.log('Inserting brokers...');
    const brokerRecords = [];
    for (const [name, brokerData] of brokers) {
      try {
        const broker = await prisma.broker.create({
          data: {
            name: brokerData.name,
            phone: brokerData.phone,
            status: 'ACTIVE',
            totalProperties: brokerData.totalProperties,
            activeDealCount: brokerData.activeDealCount,
            lastActivity: brokerData.lastActivity,
            preferredContactMethod: 'WHATSAPP'
          }
        });
        brokerRecords.push(broker);
        console.log(`✓ Created broker: ${broker.name}`);
      } catch (error) {
        if (error.code === 'P2002') {
          // Handle unique constraint violation (duplicate phone)
          const existingBroker = await prisma.broker.findUnique({
            where: { phone: brokerData.phone }
          });
          if (existingBroker) {
            brokerRecords.push(existingBroker);
            console.log(`✓ Found existing broker: ${existingBroker.name}`);
          }
        } else {
          console.error(`Error creating broker ${brokerData.name}:`, error.message);
        }
      }
    }
    
    // Create broker name to ID mapping
    const brokerMap = new Map();
    for (const broker of brokerRecords) {
      brokerMap.set(broker.name, broker.id);
    }
    
    // Insert messages and extract properties
    console.log('Inserting messages and extracting properties...');
    let propertiesCreated = 0;
    
    for (const messageData of messages) {
      const brokerId = brokerMap.get(messageData.brokerName);
      if (!brokerId) continue;
      
      try {
        // Create message
        const message = await prisma.message.create({
          data: {
            brokerId: brokerId,
            content: messageData.content,
            messageDate: messageData.messageDate,
            messageTime: messageData.messageTime,
            containsPropertyInfo: messageData.containsPropertyInfo,
            attachments: messageData.attachments,
            messageType: messageData.attachments ? 'IMAGE' : 'TEXT',
            language: /[ا-ي]/.test(messageData.content) ? 'ar' : 'en'
          }
        });
        
        // Create property if extracted
        if (messageData.propertyInfo) {
          try {
            const property = await prisma.property.create({
              data: {
                title: messageData.propertyInfo.title,
                description: messageData.propertyInfo.description,
                propertyType: messageData.propertyInfo.propertyType || 'APARTMENT',
                listingType: messageData.propertyInfo.listingType || 'FOR_SALE',
                price: messageData.propertyInfo.price,
                area: messageData.propertyInfo.area,
                location: messageData.propertyInfo.location,
                ownerId: brokerId,
                extractedFromMessage: true,
                status: 'AVAILABLE',
                currency: 'EGP'
              }
            });
            
            // Link message to property
            await prisma.message.update({
              where: { id: message.id },
              data: { extractedPropertyId: property.id }
            });
            
            // Update broker's property count
            await prisma.broker.update({
              where: { id: brokerId },
              data: { totalProperties: { increment: 1 } }
            });
            
            propertiesCreated++;
            console.log(`✓ Created property: ${property.title}`);
          } catch (propertyError) {
            console.error(`Error creating property:`, propertyError.message);
          }
        }
        
      } catch (error) {
        console.error(`Error creating message:`, error.message);
      }
    }
    
    console.log('\n📊 Import Summary:');
    console.log(`✅ Brokers imported: ${brokerRecords.length}`);
    console.log(`✅ Messages imported: ${messages.length}`);
    console.log(`✅ Properties extracted: ${propertiesCreated}`);
    
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importBrokersAndProperties();
