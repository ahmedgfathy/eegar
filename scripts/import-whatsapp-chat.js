const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// WhatsApp chat parsing function
function parseWhatsAppChat(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const messages = [];
  let currentMessage = null;
  
  for (const line of lines) {
    // WhatsApp message format: MM/DD/YY, HH:MM AM/PM - +PHONE: MESSAGE
    const messageMatch = line.match(/^(\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2}\s(?:AM|PM))\s-\s([^:]+):\s(.*)$/);
    
    if (messageMatch) {
      // Save previous message if exists
      if (currentMessage) {
        messages.push(currentMessage);
      }
      
      const [, date, time, sender, messageText] = messageMatch;
      
      // Parse date (MM/DD/YY format)
      const [month, day, year] = date.split('/');
      const fullYear = parseInt(year) + 2000; // Convert YY to YYYY
      const parsedDate = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      
      // Extract phone number from sender (remove country code formatting)
      const phoneMatch = sender.match(/\+?(\d+)/);
      const phone = phoneMatch ? phoneMatch[1] : sender;
      
      currentMessage = {
        date: parsedDate,
        time,
        phone: phone.startsWith('20') ? phone : `20${phone}`, // Ensure Egyptian country code
        sender: sender.trim(),
        message: messageText.trim(),
        fullMessage: messageText.trim()
      };
    } else if (currentMessage && line.trim()) {
      // Multi-line message continuation
      currentMessage.message += '\n' + line.trim();
      currentMessage.fullMessage += '\n' + line.trim();
    }
  }
  
  // Don't forget the last message
  if (currentMessage) {
    messages.push(currentMessage);
  }
  
  return messages;
}

// Property extraction function (enhanced for Arabic)
function extractPropertyFromMessage(message) {
  const text = message.message;
  
  // Skip promotional/spam messages
  if (text.includes('بيتكوين') || text.includes('استثمار') || text.includes('ترويجي') || 
      text.includes('<Media omitted>') || text.includes('created group') || 
      text.includes('added you') || text.includes('end-to-end encrypted')) {
    return null;
  }
  
  // Only process real estate related messages
  if (!text.includes('للبيع') && !text.includes('للإيجار') && !text.includes('مطلوب') && 
      !text.includes('دور') && !text.includes('شقة') && !text.includes('قطعة') && 
      !text.includes('ارض') && !text.includes('عقار')) {
    return null;
  }
  
  const property = {
    title: '',
    description: text,
    listingType: 'FOR_SALE', // Default
    propertyType: 'APARTMENT', // Default
    price: null,
    currency: 'EGP',
    area: null,
    location: '',
    bedrooms: null,
    bathrooms: null,
    floor: null,
    features: [],
    negotiable: false,
    status: 'AVAILABLE'
  };
  
  // Extract listing type
  if (text.includes('للبيع')) {
    property.listingType = 'FOR_SALE';
    property.title = 'عقار للبيع';
  } else if (text.includes('للإيجار')) {
    property.listingType = 'FOR_RENT';
    property.title = 'عقار للإيجار';
  } else if (text.includes('مطلوب')) {
    property.listingType = 'WANTED';
    property.title = 'عقار مطلوب';
  }
  
  // Extract property type
  if (text.includes('شقة') || text.includes('شقه')) {
    property.propertyType = 'APARTMENT';
    property.title = property.title.replace('عقار', 'شقة');
  } else if (text.includes('دور')) {
    property.propertyType = 'APARTMENT';
    property.title = property.title.replace('عقار', 'دور');
  } else if (text.includes('فيلا')) {
    property.propertyType = 'VILLA';
    property.title = property.title.replace('عقار', 'فيلا');
  } else if (text.includes('منزل') || text.includes('بيت')) {
    property.propertyType = 'HOUSE';
    property.title = property.title.replace('عقار', 'منزل');
  } else if (text.includes('محل')) {
    property.propertyType = 'SHOP';
    property.title = property.title.replace('عقار', 'محل');
  } else if (text.includes('مكتب')) {
    property.propertyType = 'OFFICE';
    property.title = property.title.replace('عقار', 'مكتب');
  } else if (text.includes('ارض') || text.includes('قطعة')) {
    property.propertyType = 'LAND';
    property.title = property.title.replace('عقار', 'قطعة أرض');
  }
  
  // Extract area (متر patterns)
  const areaPatterns = [
    /(\d+)\s*متر/g,
    /(\d+)\s*م/g,
    /مساحة\s*(\d+)/g,
    /مساحه\s*(\d+)/g
  ];
  
  for (const pattern of areaPatterns) {
    const areaMatch = text.match(pattern);
    if (areaMatch) {
      const areaValue = parseInt(areaMatch[0].match(/\d+/)[0]);
      if (areaValue > 30 && areaValue < 10000) { // Reasonable area range
        property.area = areaValue;
        break;
      }
    }
  }
  
  // Extract price (مليون، الف patterns)
  const pricePatterns = [
    /(\d+)\s*مليون/g,
    /(\d+\.?\d*)\s*مليون/g,
    /(\d+)\s*الف/g,
    /(\d+)\s*ألف/g,
    /مطلوب\s*(\d+)/g,
    /سعر\s*(\d+)/g
  ];
  
  for (const pattern of pricePatterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      let priceValue = parseFloat(match[1]);
      
      if (match[0].includes('مليون')) {
        priceValue = priceValue * 1000000;
      } else if (match[0].includes('الف') || match[0].includes('ألف')) {
        priceValue = priceValue * 1000;
      }
      
      if (priceValue >= 10000 && priceValue <= 100000000) { // Reasonable price range
        property.price = priceValue;
        break;
      }
    }
    if (property.price) break;
  }
  
  // Extract location (الحي patterns)
  const locationPatterns = [
    /الحي\s*(\d+)/g,
    /حي\s*(\d+)/g,
    /الحى\s*(\d+)/g,
    /مجاوره\s*(\d+)/g,
    /مجاورة\s*(\d+)/g,
    /(الاندلس|اليوناني|الايطالي|المطور)/g
  ];
  
  const locationParts = [];
  for (const pattern of locationPatterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      if (match[0].includes('الحي') || match[0].includes('حي') || match[0].includes('الحى')) {
        locationParts.push(`الحي ${match[1]}`);
      } else if (match[0].includes('مجاور')) {
        locationParts.push(`مجاورة ${match[1]}`);
      } else {
        locationParts.push(match[1]);
      }
    }
  }
  property.location = locationParts.join(', ');
  
  // Extract bedrooms and bathrooms
  const bedroomMatch = text.match(/(\d+)\s*غرف?/);
  if (bedroomMatch) {
    property.bedrooms = parseInt(bedroomMatch[1]);
  }
  
  const bathroomMatch = text.match(/(\d+)\s*حمام/);
  if (bathroomMatch) {
    property.bathrooms = parseInt(bathroomMatch[1]);
  }
  
  // Extract floor
  const floorPatterns = [
    /دور\s*(ارضي|أرضي)/g,
    /دور\s*(اول|أول|١)/g,
    /دور\s*(تاني|ثاني|٢)/g,
    /دور\s*(\d+)/g,
    /الطابق\s*(\d+)/g
  ];
  
  for (const pattern of floorPatterns) {
    const floorMatch = text.match(pattern);
    if (floorMatch && floorMatch[1]) {
      const floorText = floorMatch[1];
      if (floorText.includes('ارضي') || floorText.includes('أرضي')) {
        property.floor = 0;
      } else if (floorText.includes('اول') || floorText.includes('أول') || floorText === '١') {
        property.floor = 1;
      } else if (floorText.includes('تاني') || floorText.includes('ثاني') || floorText === '٢') {
        property.floor = 2;
      } else {
        const floorNum = parseInt(floorText);
        if (!isNaN(floorNum)) {
          property.floor = floorNum;
        }
      }
      break;
    }
  }
  
  // Check if negotiable
  if (text.includes('قابل للتفاوض') || text.includes('للتفاوض')) {
    property.negotiable = true;
  }
  
  // Extract features
  const features = [];
  if (text.includes('خالصه') || text.includes('خالصة')) features.push('خالص الثمن');
  if (text.includes('رخصه') || text.includes('رخصة')) features.push('مرخص');
  if (text.includes('توكيل')) features.push('توكيل');
  if (text.includes('عدادات')) features.push('عدادات منفصلة');
  if (text.includes('مفتاح')) features.push('مفتاح متاح');
  if (text.includes('تشطيب')) features.push('مشطب');
  if (text.includes('ناصية')) features.push('ناصية');
  if (text.includes('واجهة')) features.push('واجهة مميزة');
  
  property.features = features;
  
  // Create a better title if we have details
  if (property.location) {
    property.title += ` في ${property.location}`;
  }
  if (property.area) {
    property.title += ` - ${property.area} متر`;
  }
  if (property.price) {
    const priceText = property.price >= 1000000 ? 
      `${(property.price / 1000000).toFixed(1)} مليون` : 
      `${(property.price / 1000)} ألف`;
    property.title += ` - ${priceText} جنيه`;
  }
  
  return property;
}

// Extract broker info from message
function extractBrokerFromMessage(message) {
  const text = message.message;
  
  // Skip system messages and spam
  if (text.includes('بيتكوين') || text.includes('<Media omitted>') || 
      text.includes('created group') || text.includes('added you') || 
      text.includes('end-to-end encrypted')) {
    return null;
  }
  
  // Extract phone numbers from message content
  const phoneRegex = /01[0-9]{9}/g;
  const phones = [...text.matchAll(phoneRegex)];
  
  // Use phone from message content if available, otherwise use sender phone
  const brokerPhone = phones.length > 0 ? phones[0][0] : message.phone;
  
  // Extract name patterns
  let brokerName = null;
  const namePatterns = [
    /لتواصل.+?(\w+\s+\w+)/,
    /تواصل.+?(\w+\s+\w+)/,
    /ام\s+(\w+)/,
    /أبو\s+(\w+)/,
    /استاذ\s+(\w+)/
  ];
  
  for (const pattern of namePatterns) {
    const nameMatch = text.match(pattern);
    if (nameMatch && nameMatch[1]) {
      brokerName = nameMatch[1].trim();
      break;
    }
  }
  
  // If no name found, try to extract from sender or create a default
  if (!brokerName) {
    if (message.sender && !message.sender.startsWith('+')) {
      brokerName = message.sender;
    } else {
      brokerName = `سمسار ${brokerPhone.slice(-4)}`;
    }
  }
  
  return {
    name: brokerName,
    phone: brokerPhone.startsWith('20') ? brokerPhone : `20${brokerPhone}`,
    whatsappPhone: message.phone,
    lastActivity: message.date
  };
}

async function importWhatsAppChat() {
  console.log('🚀 Starting WhatsApp Chat import...');
  
  const filePath = path.join(__dirname, '..', 'WhatsApp Chat with شركه الملك لاستثمار العقاري .txt');
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ WhatsApp chat file not found at:', filePath);
    console.log('Please make sure the file exists in the project root directory');
    return;
  }
  
  try {
    // Parse WhatsApp chat
    console.log('📱 Parsing WhatsApp chat messages...');
    const messages = parseWhatsAppChat(filePath);
    console.log(`Found ${messages.length} messages`);
    
    // Filter real estate related messages
    const realEstateMessages = messages.filter(msg => {
      const text = msg.message.toLowerCase();
      return (text.includes('للبيع') || text.includes('للإيجار') || text.includes('مطلوب') ||
              text.includes('دور') || text.includes('شقة') || text.includes('قطعة') ||
              text.includes('ارض') || text.includes('عقار')) &&
             !text.includes('بيتكوين') && !text.includes('<media omitted>');
    });
    
    console.log(`Found ${realEstateMessages.length} real estate related messages`);
    
    // Extract brokers and properties
    const brokersMap = new Map();
    const propertiesData = [];
    
    for (const message of realEstateMessages) {
      // Extract broker
      const brokerInfo = extractBrokerFromMessage(message);
      if (brokerInfo) {
        const existingBroker = brokersMap.get(brokerInfo.phone);
        if (!existingBroker || new Date(brokerInfo.lastActivity) > new Date(existingBroker.lastActivity)) {
          brokersMap.set(brokerInfo.phone, brokerInfo);
        }
      }
      
      // Extract property
      const property = extractPropertyFromMessage(message);
      if (property && brokerInfo) {
        propertiesData.push({
          ...property,
          brokerPhone: brokerInfo.phone,
          extractedFromMessage: message.message,
          messageDate: message.date
        });
      }
    }
    
    console.log(`Extracted ${brokersMap.size} brokers and ${propertiesData.length} properties`);
    
    // Import brokers to database
    console.log('👥 Importing brokers...');
    let importedBrokers = 0;
    
    for (const [phone, brokerInfo] of brokersMap) {
      try {
        // Check if broker already exists
        const existingBroker = await prisma.broker.findUnique({
          where: { phone: brokerInfo.phone }
        });
        
        if (!existingBroker) {
          await prisma.broker.create({
            data: {
              name: brokerInfo.name,
              phone: brokerInfo.phone,
              status: 'ACTIVE',
              lastActivity: brokerInfo.lastActivity,
              notes: `مستورد من مجموعة واتساب - ${new Date().toISOString()}`
            }
          });
          importedBrokers++;
          console.log(`✅ Created broker: ${brokerInfo.name} (${brokerInfo.phone})`);
        } else {
          // Update last activity if newer
          if (new Date(brokerInfo.lastActivity) > new Date(existingBroker.lastActivity || 0)) {
            await prisma.broker.update({
              where: { phone: brokerInfo.phone },
              data: { lastActivity: brokerInfo.lastActivity }
            });
          }
          console.log(`ℹ️  Broker already exists: ${brokerInfo.name} (${brokerInfo.phone})`);
        }
      } catch (error) {
        console.error(`❌ Error importing broker ${brokerInfo.name}:`, error.message);
      }
    }
    
    // Import properties to database
    console.log('🏠 Importing properties...');
    let importedProperties = 0;
    
    for (const propertyData of propertiesData) {
      try {
        // Find the broker
        const broker = await prisma.broker.findUnique({
          where: { phone: propertyData.brokerPhone }
        });
        
        if (broker) {
          await prisma.property.create({
            data: {
              title: propertyData.title,
              description: propertyData.description,
              propertyType: propertyData.propertyType,
              listingType: propertyData.listingType,
              price: propertyData.price,
              currency: propertyData.currency,
              area: propertyData.area,
              location: propertyData.location,
              bedrooms: propertyData.bedrooms,
              bathrooms: propertyData.bathrooms,
              floor: propertyData.floor,
              features: propertyData.features,
              negotiable: propertyData.negotiable,
              status: propertyData.status,
              brokerId: broker.id,
              datePosted: propertyData.messageDate
            }
          });
          importedProperties++;
          console.log(`✅ Created property: ${propertyData.title}`);
        } else {
          console.log(`⚠️  Broker not found for property: ${propertyData.title}`);
        }
      } catch (error) {
        console.error(`❌ Error importing property ${propertyData.title}:`, error.message);
      }
    }
    
    // Import messages to database
    console.log('💬 Importing messages...');
    let importedMessages = 0;
    
    for (const message of realEstateMessages) {
      try {
        const broker = await prisma.broker.findFirst({
          where: {
            OR: [
              { phone: message.phone },
              { phone: `20${message.phone}` },
              { phone: message.phone.replace(/^20/, '') }
            ]
          }
        });
        
        if (broker) {
          await prisma.message.create({
            data: {
              content: message.message,
              timestamp: message.date,
              senderId: broker.id,
              platform: 'WHATSAPP',
              platformMessageId: `whatsapp_${message.date.getTime()}_${broker.id}`
            }
          });
          importedMessages++;
        }
      } catch (error) {
        console.error(`❌ Error importing message:`, error.message);
      }
    }
    
    console.log('\n🎉 Import completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   • ${importedBrokers} brokers imported`);
    console.log(`   • ${importedProperties} properties imported`);
    console.log(`   • ${importedMessages} messages imported`);
    console.log(`   • Total messages processed: ${messages.length}`);
    
  } catch (error) {
    console.error('❌ Error during import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
if (require.main === module) {
  importWhatsAppChat();
}

module.exports = { importWhatsAppChat };
