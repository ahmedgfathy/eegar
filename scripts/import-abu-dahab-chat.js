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
      
      currentMessage = {
        date,
        time,
        sender: sender.trim(),
        message: messageText.trim(),
        timestamp: parsedDate,
        fullText: messageText.trim()
      };
    } else if (currentMessage && line.trim()) {
      // Continuation of previous message
      currentMessage.fullText += '\n' + line.trim();
      currentMessage.message += '\n' + line.trim();
    }
  }
  
  // Add the last message
  if (currentMessage) {
    messages.push(currentMessage);
  }
  
  return messages;
}

// Extract broker information from sender
function extractBrokerInfo(sender) {
  // Clean the sender name
  let cleanSender = sender.replace(/^\+20\s*/, '').replace(/^\+/, '').trim();
  
  // Extract phone number from sender if it looks like a phone
  const phoneMatch = cleanSender.match(/^(\d{10,11})$/);
  let phone = null;
  let name = cleanSender;
  
  if (phoneMatch) {
    phone = '20' + phoneMatch[1].replace(/^0/, ''); // Add country code and remove leading 0
    name = `سمسار ${phoneMatch[1].slice(-4)}`; // Create a name using last 4 digits
  } else if (cleanSender.startsWith('20') && cleanSender.length >= 12) {
    phone = cleanSender;
    name = `سمسار ${cleanSender.slice(-4)}`;
  } else {
    // Try to extract phone from the name
    const phoneInName = cleanSender.match(/(\d{10,11})/);
    if (phoneInName) {
      phone = '20' + phoneInName[1].replace(/^0/, '');
    } else {
      phone = '20' + cleanSender; // Fallback
    }
    name = cleanSender;
  }
  
  return { name, phone };
}

// Extract property information from message
function extractPropertyFromMessage(message) {
  const text = message.toLowerCase();
  
  // Property type detection
  let propertyType = 'APARTMENT'; // Default
  if (text.includes('فيلا') || text.includes('villa')) propertyType = 'VILLA';
  else if (text.includes('منزل') || text.includes('بيت') || text.includes('house')) propertyType = 'HOUSE';
  else if (text.includes('أرض') || text.includes('قطعة') || text.includes('land')) propertyType = 'LAND';
  else if (text.includes('مكتب') || text.includes('office')) propertyType = 'OFFICE';
  else if (text.includes('محل') || text.includes('shop')) propertyType = 'SHOP';
  else if (text.includes('مخزن') || text.includes('warehouse')) propertyType = 'WAREHOUSE';
  
  // Listing type detection
  let listingType = 'FOR_SALE'; // Default
  if (text.includes('للإيجار') || text.includes('للايجار') || text.includes('for rent')) listingType = 'FOR_RENT';
  else if (text.includes('مطلوب') || text.includes('wanted')) listingType = 'WANTED';
  else if (text.includes('للبيع') || text.includes('for sale')) listingType = 'FOR_SALE';
  
  // Extract area/size
  const areaMatch = message.match(/(\d+)\s*م(?:تر)?/i) || message.match(/مساحة\s*(\d+)/i);
  const area = areaMatch ? areaMatch[1] : null;
  
  // Extract location
  const locationMatches = [
    message.match(/الحي\s*(\d+)/i),
    message.match(/حي\s*(\d+)/i),
    message.match(/المجاورة\s*(\d+)/i),
    message.match(/مجاورة\s*(\d+)/i)
  ];
  
  let location = null;
  for (const match of locationMatches) {
    if (match) {
      location = match[0];
      break;
    }
  }
  
  // Extract price
  const priceMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:مليون|ألف|الف|k)/i) || 
                    message.match(/مطلوب\s*(\d+)/i) ||
                    message.match(/السعر\s*(\d+)/i);
  const price = priceMatch ? parseFloat(priceMatch[1]) : null;
  
  // Extract floor
  const floorMatch = message.match(/دور\s*(\w+)/i) || message.match(/الدور\s*(\w+)/i);
  const floor = floorMatch && floorMatch[1] ? floorMatch[1] : null;
  
  // Generate title based on listing type and property type
  let title = '';
  if (listingType === 'FOR_SALE') title += 'للبيع - ';
  else if (listingType === 'FOR_RENT') title += 'للإيجار - ';
  else if (listingType === 'WANTED') title += 'مطلوب - ';
  
  if (propertyType === 'APARTMENT') title += 'شقة';
  else if (propertyType === 'VILLA') title += 'فيلا';
  else if (propertyType === 'HOUSE') title += 'منزل';
  else if (propertyType === 'LAND') title += 'قطعة أرض';
  else if (propertyType === 'OFFICE') title += 'مكتب';
  else if (propertyType === 'SHOP') title += 'محل';
  
  if (location) title += ` في ${location}`;
  if (area) title += ` - ${area} متر`;
  
  return {
    title: title.trim() || `عرض عقاري من ${message.slice(0, 30)}...`,
    description: message,
    propertyType,
    listingType,
    area,
    location,
    price,
    floor
  };
}

// Main import function
async function importWhatsAppChatData() {
  try {
    console.log('🚀 Starting Abu Al-Dahab WhatsApp chat import...');
    
    // Path to the new WhatsApp chat file
    const chatFilePath = path.join(__dirname, '..', 'WhatsApp Chat with مكتب ابو الدهب للعقارات الحي العاشر.txt');
    
    if (!fs.existsSync(chatFilePath)) {
      throw new Error(`Chat file not found: ${chatFilePath}`);
    }
    
    console.log('📄 Parsing WhatsApp chat file...');
    const messages = parseWhatsAppChat(chatFilePath);
    console.log(`📊 Found ${messages.length} messages to process`);
    
    const brokerMap = new Map();
    const propertiesToCreate = [];
    const messagesToCreate = [];
    
    console.log('🔍 Processing messages and extracting data...');
    
    for (const msg of messages) {
      // Skip system messages
      if (msg.sender.includes('Messages and calls are end-to-end encrypted') ||
          msg.sender.includes('created group') ||
          msg.sender.includes('added you') ||
          msg.message.includes('<Media omitted>') ||
          msg.message.includes('Messages and calls are end-to-end encrypted')) {
        continue;
      }
      
      // Extract broker info
      const brokerInfo = extractBrokerInfo(msg.sender);
      
      if (!brokerMap.has(brokerInfo.phone)) {
        brokerMap.set(brokerInfo.phone, {
          name: brokerInfo.name,
          phone: brokerInfo.phone,
          status: 'ACTIVE',
          lastActivity: msg.timestamp,
          preferredContactMethod: 'WHATSAPP',
          notes: `مستورد من مجموعة واتساب Abu Al-Dahab - ${msg.timestamp.toISOString()}`
        });
      } else {
        // Update last activity
        const existing = brokerMap.get(brokerInfo.phone);
        if (msg.timestamp > existing.lastActivity) {
          existing.lastActivity = msg.timestamp;
        }
      }
      
      // Extract property info if message contains property-related content
      const propertyKeywords = ['للبيع', 'للإيجار', 'مطلوب', 'شقة', 'فيلا', 'منزل', 'أرض', 'مكتب', 'محل', 'مساحة', 'الحي', 'مجاورة'];
      const hasPropertyContent = propertyKeywords.some(keyword => msg.message.includes(keyword));
      
      if (hasPropertyContent && msg.message.length > 20) {
        const propertyInfo = extractPropertyFromMessage(msg.message);
        propertiesToCreate.push({
          ...propertyInfo,
          ownerPhone: brokerInfo.phone,
          sourceMessage: msg.message,
          extractedFromMessage: true,
          createdAt: msg.timestamp
        });
      }
      
      // Store message for potential future reference
      messagesToCreate.push({
        content: msg.message,
        messageDate: msg.timestamp,
        messageTime: msg.time,
        senderPhone: brokerInfo.phone,
        createdAt: msg.timestamp
      });
    }
    
    console.log(`👥 Found ${brokerMap.size} unique brokers`);
    console.log(`🏠 Found ${propertiesToCreate.length} potential properties`);
    console.log(`💬 Found ${messagesToCreate.length} messages`);
    
    // Import brokers
    console.log('💾 Importing brokers...');
    const createdBrokers = [];
    
    for (const [phone, brokerData] of brokerMap) {
      try {
        // Check if broker already exists
        const existingBroker = await prisma.broker.findFirst({
          where: { phone: phone }
        });
        
        if (!existingBroker) {
          const broker = await prisma.broker.create({
            data: brokerData
          });
          createdBrokers.push(broker);
        } else {
          // Update existing broker's last activity
          await prisma.broker.update({
            where: { id: existingBroker.id },
            data: {
              lastActivity: brokerData.lastActivity,
              notes: existingBroker.notes + ` | Abu Al-Dahab Update: ${brokerData.lastActivity.toISOString()}`
            }
          });
          createdBrokers.push(existingBroker);
        }
      } catch (error) {
        console.error(`Error creating/updating broker ${phone}:`, error.message);
      }
    }
    
    console.log(`✅ Successfully processed ${createdBrokers.length} brokers`);
    
    // Create a map of phone to broker ID for property assignment
    const brokerPhoneToId = new Map();
    for (const broker of createdBrokers) {
      brokerPhoneToId.set(broker.phone, broker.id);
    }
    
    // Import properties
    console.log('🏠 Importing properties...');
    let propertiesCreated = 0;
    
    for (const propertyData of propertiesToCreate) {
      try {
        const ownerId = brokerPhoneToId.get(propertyData.ownerPhone);
        if (ownerId) {
          await prisma.property.create({
            data: {
              title: propertyData.title,
              description: propertyData.description,
              propertyType: propertyData.propertyType,
              listingType: propertyData.listingType,
              price: propertyData.price,
              area: propertyData.area,
              location: propertyData.location,
              floor: propertyData.floor,
              status: 'AVAILABLE',
              extractedFromMessage: true,
              ownerId: ownerId,
              currency: 'EGP',
              negotiable: true,
              createdAt: propertyData.createdAt
            }
          });
          propertiesCreated++;
        }
      } catch (error) {
        console.error('Error creating property:', error.message);
      }
    }
    
    console.log(`✅ Successfully created ${propertiesCreated} properties`);
    
    // Import messages
    console.log('💬 Importing messages...');
    let messagesCreated = 0;
    
    for (const messageData of messagesToCreate) {
      try {
        const brokerId = brokerPhoneToId.get(messageData.senderPhone);
        if (brokerId) {
          await prisma.message.create({
            data: {
              content: messageData.content,
              messageDate: messageData.messageDate,
              messageTime: messageData.messageTime,
              brokerId: brokerId,
              createdAt: messageData.createdAt
            }
          });
          messagesCreated++;
        }
      } catch (error) {
        console.error('Error creating message:', error.message);
      }
    }
    
    console.log(`✅ Successfully created ${messagesCreated} messages`);
    
    // Final summary
    console.log('\n🎉 Import completed successfully!');
    console.log('📊 Summary:');
    console.log(`   👥 Brokers processed: ${createdBrokers.length}`);
    console.log(`   🏠 Properties created: ${propertiesCreated}`);
    console.log(`   💬 Messages created: ${messagesCreated}`);
    
    // Get updated totals
    const totalBrokers = await prisma.broker.count();
    const totalProperties = await prisma.property.count();
    const totalMessages = await prisma.message.count();
    
    console.log('\n📈 Current database totals:');
    console.log(`   👥 Total Brokers: ${totalBrokers}`);
    console.log(`   🏠 Total Properties: ${totalProperties}`);
    console.log(`   💬 Total Messages: ${totalMessages}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
async function main() {
  try {
    await importWhatsAppChatData();
    console.log('✅ Import process completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Import process failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { importWhatsAppChatData, parseWhatsAppChat, extractBrokerInfo, extractPropertyFromMessage };
