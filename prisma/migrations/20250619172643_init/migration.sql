-- CreateTable
CREATE TABLE `brokers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `email` VARCHAR(255) NULL,
    `address` TEXT NULL,
    `city` VARCHAR(100) NULL,
    `area` VARCHAR(100) NULL,
    `company` VARCHAR(255) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION') NOT NULL DEFAULT 'ACTIVE',
    `licenseNumber` VARCHAR(100) NULL,
    `yearsOfExperience` INTEGER NULL,
    `specializations` TEXT NULL,
    `profileImage` VARCHAR(255) NULL,
    `totalProperties` INTEGER NOT NULL DEFAULT 0,
    `activeDealCount` INTEGER NOT NULL DEFAULT 0,
    `lastActivity` DATETIME(3) NULL,
    `rating` DECIMAL(3, 2) NULL,
    `totalDeals` INTEGER NOT NULL DEFAULT 0,
    `preferredContactMethod` ENUM('WHATSAPP', 'PHONE', 'EMAIL', 'IN_PERSON') NOT NULL DEFAULT 'WHATSAPP',
    `notes` TEXT NULL,

    UNIQUE INDEX `brokers_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `brokerId` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `messageDate` DATETIME(3) NOT NULL,
    `messageTime` VARCHAR(10) NOT NULL,
    `attachments` TEXT NULL,
    `messageType` ENUM('TEXT', 'IMAGE', 'DOCUMENT', 'VOICE', 'VIDEO', 'LINK', 'LOCATION') NOT NULL DEFAULT 'TEXT',
    `containsPropertyInfo` BOOLEAN NOT NULL DEFAULT false,
    `extractedPropertyId` INTEGER NULL,
    `sentiment` VARCHAR(50) NULL,
    `language` VARCHAR(10) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `properties` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `propertyType` ENUM('APARTMENT', 'HOUSE', 'VILLA', 'DUPLEX', 'PENTHOUSE', 'OFFICE', 'SHOP', 'WAREHOUSE', 'LAND', 'GARAGE', 'STUDIO') NOT NULL,
    `listingType` ENUM('FOR_SALE', 'FOR_RENT', 'WANTED', 'SOLD', 'RENTED') NOT NULL,
    `price` DECIMAL(15, 2) NULL,
    `pricePerMeter` DECIMAL(10, 2) NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'EGP',
    `negotiable` BOOLEAN NOT NULL DEFAULT true,
    `area` DECIMAL(10, 2) NULL,
    `location` VARCHAR(255) NULL,
    `address` TEXT NULL,
    `city` VARCHAR(100) NULL,
    `neighborhood` VARCHAR(100) NULL,
    `district` VARCHAR(100) NULL,
    `bedrooms` INTEGER NULL,
    `bathrooms` INTEGER NULL,
    `floors` INTEGER NULL,
    `floor` INTEGER NULL,
    `parking` BOOLEAN NOT NULL DEFAULT false,
    `furnished` BOOLEAN NOT NULL DEFAULT false,
    `balcony` BOOLEAN NOT NULL DEFAULT false,
    `elevator` BOOLEAN NOT NULL DEFAULT false,
    `features` TEXT NULL,
    `condition` ENUM('NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_RENOVATION') NULL,
    `buildingAge` INTEGER NULL,
    `status` ENUM('AVAILABLE', 'SOLD', 'RENTED', 'RESERVED', 'UNDER_CONSTRUCTION', 'OFF_MARKET') NOT NULL DEFAULT 'AVAILABLE',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `urgentSale` BOOLEAN NOT NULL DEFAULT false,
    `extractedFromMessage` BOOLEAN NOT NULL DEFAULT false,
    `sourceMessageId` INTEGER NULL,
    `ownerId` INTEGER NULL,
    `images` TEXT NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `inquiryCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_inquiries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `brokerId` INTEGER NOT NULL,
    `propertyId` INTEGER NOT NULL,
    `senderId` INTEGER NULL,
    `inquiryType` ENUM('GENERAL', 'VIEWING_REQUEST', 'PRICE_INQUIRY', 'AVAILABILITY_CHECK', 'NEGOTIATION', 'REFERRAL') NOT NULL DEFAULT 'GENERAL',
    `inquiryDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `message` TEXT NULL,
    `status` ENUM('PENDING', 'RESPONDED', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `budget` DECIMAL(15, 2) NULL,
    `clientRequirements` TEXT NULL,
    `urgency` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    `responseDate` DATETIME(3) NULL,
    `response` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_brokerId_fkey` FOREIGN KEY (`brokerId`) REFERENCES `brokers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_extractedPropertyId_fkey` FOREIGN KEY (`extractedPropertyId`) REFERENCES `properties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `properties` ADD CONSTRAINT `properties_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `brokers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_inquiries` ADD CONSTRAINT `property_inquiries_brokerId_fkey` FOREIGN KEY (`brokerId`) REFERENCES `brokers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_inquiries` ADD CONSTRAINT `property_inquiries_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_inquiries` ADD CONSTRAINT `property_inquiries_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `brokers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
