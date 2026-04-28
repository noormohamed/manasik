mysqldump: [Warning] Using a password on the command line interface can be insecure.
-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: booking_platform
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_alerts`
--

DROP TABLE IF EXISTS `admin_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_alerts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alert_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `threshold_value` decimal(10,2) DEFAULT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `alert_type` (`alert_type`),
  KEY `idx_alert_type` (`alert_type`),
  KEY `idx_severity` (`severity`),
  KEY `idx_is_enabled` (`is_enabled`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_alerts`
--

LOCK TABLES `admin_alerts` WRITE;
/*!40000 ALTER TABLE `admin_alerts` DISABLE KEYS */;
INSERT INTO `admin_alerts` VALUES (1,'HIGH_REFUND_RATE','WARNING','High Refund Rate','Alert when refund rate exceeds threshold',10.00,1,'2026-04-27 14:21:17','2026-04-27 14:21:17'),(2,'PAYMENT_FAILURES','CRITICAL','Payment Failures','Alert when payment failure rate is high',5.00,1,'2026-04-27 14:21:17','2026-04-27 14:21:17'),(3,'SUSPICIOUS_ACTIVITY','CRITICAL','Suspicious Activity','Alert when suspicious user activity is detected',NULL,1,'2026-04-27 14:21:17','2026-04-27 14:21:17'),(4,'LOW_PLATFORM_UPTIME','CRITICAL','Low Platform Uptime','Alert when platform uptime drops below threshold',99.00,1,'2026-04-27 14:21:17','2026-04-27 14:21:17'),(5,'HIGH_BOOKING_CANCELLATION','WARNING','High Booking Cancellation','Alert when booking cancellation rate is high',15.00,1,'2026-04-27 14:21:17','2026-04-27 14:21:17'),(6,'NEGATIVE_REVIEWS','WARNING','Negative Reviews','Alert when average rating drops below threshold',3.50,1,'2026-04-27 14:21:17','2026-04-27 14:21:17');
/*!40000 ALTER TABLE `admin_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_preferences`
--

DROP TABLE IF EXISTS `admin_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_preferences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_user_id` int NOT NULL,
  `theme` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'light',
  `items_per_page` int NOT NULL DEFAULT '25',
  `notifications_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `email_alerts` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admin_user_id` (`admin_user_id`),
  KEY `idx_admin_user_id` (`admin_user_id`),
  CONSTRAINT `admin_preferences_ibfk_1` FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_preferences`
--

LOCK TABLES `admin_preferences` WRITE;
/*!40000 ALTER TABLE `admin_preferences` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_sessions`
--

DROP TABLE IF EXISTS `admin_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_user_id` int NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_admin_user_id` (`admin_user_id`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_token_hash` (`token_hash`),
  CONSTRAINT `admin_sessions_ibfk_1` FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_sessions`
--

LOCK TABLES `admin_sessions` WRITE;
/*!40000 ALTER TABLE `admin_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUPER_ADMIN',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `mfa_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `mfa_secret` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_by_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_created_by_id` (`created_by_id`),
  CONSTRAINT `admin_users_ibfk_1` FOREIGN KEY (`created_by_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agent_documents`
--

DROP TABLE IF EXISTS `agent_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agent_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `agent_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_type` enum('BUSINESS_LICENSE','TAX_ID','IDENTITY_PROOF') COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_agent_id` (`agent_id`),
  CONSTRAINT `agent_documents_ibfk_1` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agent_documents`
--

LOCK TABLES `agent_documents` WRITE;
/*!40000 ALTER TABLE `agent_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `agent_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agents`
--

DROP TABLE IF EXISTS `agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agents` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_type` enum('HOTEL','TAXI','EXPERIENCE','CAR','FOOD') COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','APPROVED','ACTIVE','SUSPENDED','INACTIVE') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `commission_rate` decimal(5,2) DEFAULT '0.00',
  `total_bookings` int DEFAULT '0',
  `total_revenue` decimal(12,2) DEFAULT '0.00',
  `average_rating` decimal(3,2) DEFAULT '0.00',
  `total_reviews` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_status` (`status`),
  KEY `idx_service_type` (`service_type`),
  CONSTRAINT `agents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `agents_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agents`
--

LOCK TABLES `agents` WRITE;
/*!40000 ALTER TABLE `agents` DISABLE KEYS */;
INSERT INTO `agents` VALUES ('agent-10-id','agent-10-id','company-agent10','HOTEL','Agent Ten','agent-10@bookingplatform.com','+966-555-9999','ACTIVE',10.00,0,0.00,0.00,0,'2026-04-27 14:33:37','2026-04-27 14:33:37');
/*!40000 ALTER TABLE `agents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alert_history`
--

DROP TABLE IF EXISTS `alert_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alert_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alert_id` int NOT NULL,
  `triggered_at` timestamp NOT NULL,
  `current_value` decimal(10,2) DEFAULT NULL,
  `acknowledged_by_id` int DEFAULT NULL,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_alert_id` (`alert_id`),
  KEY `idx_triggered_at` (`triggered_at`),
  KEY `idx_acknowledged_by_id` (`acknowledged_by_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_alert_id_triggered_at` (`alert_id`,`triggered_at`),
  CONSTRAINT `alert_history_ibfk_1` FOREIGN KEY (`alert_id`) REFERENCES `admin_alerts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `alert_history_ibfk_2` FOREIGN KEY (`acknowledged_by_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alert_history`
--

LOCK TABLES `alert_history` WRITE;
/*!40000 ALTER TABLE `alert_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `alert_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_user_id` int NOT NULL,
  `action_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` int DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_user_id` (`admin_user_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_entity_type` (`entity_type`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_entity_id` (`entity_id`),
  KEY `idx_created_at_entity_type` (`created_at`,`entity_type`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bank_details`
--

DROP TABLE IF EXISTS `bank_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `agent_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_holder` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `routing_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `agent_id` (`agent_id`),
  CONSTRAINT `bank_details_ibfk_1` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank_details`
--

LOCK TABLES `bank_details` WRITE;
/*!40000 ALTER TABLE `bank_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `bank_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_type` enum('HOTEL','TAXI','EXPERIENCE','CAR','FOOD') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED','NO_SHOW') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `booking_source` enum('DIRECT','STAFF_CREATED','BROKER','AGENT','API','ADMIN') COLLATE utf8mb4_unicode_ci DEFAULT 'DIRECT',
  `agent_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` enum('PENDING','UNPAID','PAID','PARTIALLY_PAID','REFUNDED','FAILED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `subtotal` decimal(12,2) NOT NULL,
  `tax` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  `refund_amount` decimal(12,2) DEFAULT '0.00',
  `refund_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `refunded_at` timestamp NULL DEFAULT NULL,
  `payment_link_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `staff_created_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `hold_expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_status` (`status`),
  KEY `idx_service_type` (`service_type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_booking_source` (`booking_source`),
  KEY `idx_agent_id` (`agent_id`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_refund_amount` (`refund_amount`),
  KEY `idx_refunded_at` (`refunded_at`),
  KEY `idx_payment_link_id` (`payment_link_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checkout_sessions`
--

DROP TABLE IF EXISTS `checkout_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `checkout_sessions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sessionId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bookingItems` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `totalTax` decimal(12,2) NOT NULL,
  `discountAmount` decimal(12,2) DEFAULT '0.00',
  `discountCode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `finalTotal` decimal(12,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'GBP',
  `status` enum('ACTIVE','COMPLETED','ABANDONED','EXPIRED') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `isGuest` tinyint(1) DEFAULT '0',
  `expiresAt` timestamp NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sessionId` (`sessionId`),
  KEY `idx_customerId` (`customerId`),
  KEY `idx_email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_isGuest` (`isGuest`),
  KEY `idx_expiresAt` (`expiresAt`),
  KEY `idx_createdAt` (`createdAt`),
  CONSTRAINT `checkout_sessions_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checkout_sessions`
--

LOCK TABLES `checkout_sessions` WRITE;
/*!40000 ALTER TABLE `checkout_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `checkout_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checkouts`
--

DROP TABLE IF EXISTS `checkouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `checkouts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bookingItems` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `totalTax` decimal(12,2) NOT NULL,
  `discountAmount` decimal(12,2) DEFAULT '0.00',
  `discountCode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `finalTotal` decimal(12,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'GBP',
  `status` enum('ACTIVE','COMPLETED','ABANDONED','EXPIRED') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `expiresAt` timestamp NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customerId` (`customerId`),
  KEY `idx_status` (`status`),
  KEY `idx_expiresAt` (`expiresAt`),
  KEY `idx_createdAt` (`createdAt`),
  CONSTRAINT `checkouts_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checkouts`
--

LOCK TABLES `checkouts` WRITE;
/*!40000 ALTER TABLE `checkouts` DISABLE KEYS */;
/*!40000 ALTER TABLE `checkouts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_type` enum('HOTEL','TAXI','EXPERIENCE','CAR','FOOD') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `logo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_service_type` (`service_type`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES ('company-agent10','Agent 10 Hotels','HOTEL','Hotels managed by Agent 10',NULL,NULL,'agent10@hotels.com','+966-555-9999',NULL,NULL,NULL,1,1,'2026-04-27 14:33:32','2026-04-27 14:33:32');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_admins`
--

DROP TABLE IF EXISTS `company_admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_admins` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_role` enum('OWNER','MANAGER','SUPPORT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_admin_role` (`admin_role`),
  CONSTRAINT `company_admins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `company_admins_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_admins`
--

LOCK TABLES `company_admins` WRITE;
/*!40000 ALTER TABLE `company_admins` DISABLE KEYS */;
/*!40000 ALTER TABLE `company_admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_audit_log`
--

DROP TABLE IF EXISTS `email_audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_audit_log` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','SENT','FAILED','BOUNCED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recipient_email` (`recipient_email`),
  KEY `idx_status` (`status`),
  KEY `idx_email_type` (`email_type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_audit_log`
--

LOCK TABLES `email_audit_log` WRITE;
/*!40000 ALTER TABLE `email_audit_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `haram_gates`
--

DROP TABLE IF EXISTS `haram_gates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `haram_gates` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gate_number` int NOT NULL,
  `name_english` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_arabic` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `has_direct_kaaba_access` tinyint(1) DEFAULT '0',
  `floor_level` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gate_number` (`gate_number`),
  KEY `idx_gate_number` (`gate_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `haram_gates`
--

LOCK TABLES `haram_gates` WRITE;
/*!40000 ALTER TABLE `haram_gates` DISABLE KEYS */;
INSERT INTO `haram_gates` VALUES ('gate-001',1,'King Abdul Aziz Gate','Ø¨Ø§Ø¨ Ø§Ù„Ù…Ù„Ùƒ Ø¹Ø¨Ø¯Ø§Ù„Ø¹Ø²ÙŠØ²',21.42430000,39.82590000,1,0,NULL,'2026-04-27 14:21:17','2026-04-27 14:21:17'),('gate-002',2,'Umrah Gate','Ø¨Ø§Ø¨ Ø§Ù„Ø¹Ù…Ø±Ø©',21.42950000,39.82940000,0,0,NULL,'2026-04-27 14:21:17','2026-04-27 14:21:17'),('gate-003',3,'Ajyad Gate','Ø¨Ø§Ø¨ Ø§Ù„Ø£Ø¬ÙŠØ§Ø¯',21.42250000,39.82620000,0,0,NULL,'2026-04-27 14:21:17','2026-04-27 14:21:17'),('gate-004',4,'Al-Safa Gate','Ø¨Ø§Ø¨ Ø§Ù„ØµÙØ§',21.42080000,39.82470000,0,0,NULL,'2026-04-27 14:21:17','2026-04-27 14:21:17'),('gate-005',5,'Al-Marwa Gate','Ø¨Ø§Ø¨ Ø§Ù„Ù…Ø±ÙˆØ©',21.41900000,39.82300000,0,0,NULL,'2026-04-27 14:21:17','2026-04-27 14:21:17'),('gate-006',6,'Al-Qiblatein Gate','Ø¨Ø§Ø¨ Ø§Ù„Ù‚Ø¨Ù„ØªÙŠÙ†',21.41730000,39.82150000,0,0,NULL,'2026-04-27 14:21:17','2026-04-27 14:21:17'),('gate-007',7,'Bab Al-Dhabaih Gate','Ø¨Ø§Ø¨ Ø§Ù„Ø°Ø¨Ø§ÙŠØ­',21.41550000,39.82000000,0,0,NULL,'2026-04-27 14:21:17','2026-04-27 14:21:17'),('gate-008',8,'Bab Al-Noor Gate','Ø¨Ø§Ø¨ Ø§Ù„Ù†ÙˆØ±',21.41370000,39.81850000,0,0,NULL,'2026-04-27 14:21:17','2026-04-27 14:21:17'),('gate-009',9,'Bab Al-Noor Upper Gate','Ø¨Ø§Ø¨ Ø§Ù„Ù†ÙˆØ± Ø§Ù„Ø¹Ù„ÙˆÙŠ',21.41200000,39.81700000,0,1,NULL,'2026-04-27 14:21:17','2026-04-27 14:21:17'),('gate-010',10,'Bab Ali Gate','Ø¨Ø§Ø¨ Ø¹Ù„ÙŠ',21.41020000,39.81550000,0,0,NULL,'2026-04-27 14:21:17','2026-04-27 14:21:17');
/*!40000 ALTER TABLE `haram_gates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotel_amenities`
--

DROP TABLE IF EXISTS `hotel_amenities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hotel_amenities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hotel_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amenity_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_hotel_amenity` (`hotel_id`,`amenity_name`),
  KEY `idx_hotel_id` (`hotel_id`),
  CONSTRAINT `hotel_amenities_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotel_amenities`
--

LOCK TABLES `hotel_amenities` WRITE;
/*!40000 ALTER TABLE `hotel_amenities` DISABLE KEYS */;
/*!40000 ALTER TABLE `hotel_amenities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotel_best_for_tags`
--

DROP TABLE IF EXISTS `hotel_best_for_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hotel_best_for_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hotel_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_hotel_tag` (`hotel_id`,`tag`),
  KEY `idx_hotel_id` (`hotel_id`),
  KEY `idx_tag` (`tag`),
  CONSTRAINT `hotel_best_for_tags_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotel_best_for_tags`
--

LOCK TABLES `hotel_best_for_tags` WRITE;
/*!40000 ALTER TABLE `hotel_best_for_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `hotel_best_for_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotel_filters`
--

DROP TABLE IF EXISTS `hotel_filters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hotel_filters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filter_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filter_description` text COLLATE utf8mb4_unicode_ci,
  `filter_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `filter_name` (`filter_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotel_filters`
--

LOCK TABLES `hotel_filters` WRITE;
/*!40000 ALTER TABLE `hotel_filters` DISABLE KEYS */;
/*!40000 ALTER TABLE `hotel_filters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotel_gate_assignments`
--

DROP TABLE IF EXISTS `hotel_gate_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hotel_gate_assignments` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hotel_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `closest_gate_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kaaba_gate_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hotel_id` (`hotel_id`),
  KEY `closest_gate_id` (`closest_gate_id`),
  KEY `kaaba_gate_id` (`kaaba_gate_id`),
  KEY `idx_hotel_id` (`hotel_id`),
  CONSTRAINT `hotel_gate_assignments_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hotel_gate_assignments_ibfk_2` FOREIGN KEY (`closest_gate_id`) REFERENCES `haram_gates` (`id`),
  CONSTRAINT `hotel_gate_assignments_ibfk_3` FOREIGN KEY (`kaaba_gate_id`) REFERENCES `haram_gates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotel_gate_assignments`
--

LOCK TABLES `hotel_gate_assignments` WRITE;
/*!40000 ALTER TABLE `hotel_gate_assignments` DISABLE KEYS */;
INSERT INTO `hotel_gate_assignments` VALUES ('hga-001','hotel-agent10-001','gate-001','gate-001','2026-04-27 14:37:19','2026-04-27 14:37:19'),('hga-002','hotel-agent10-002','gate-002','gate-001','2026-04-27 14:37:19','2026-04-27 14:37:19'),('hga-003','hotel-agent10-003','gate-003','gate-002','2026-04-27 14:37:19','2026-04-27 14:37:19');
/*!40000 ALTER TABLE `hotel_gate_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotel_gate_distances`
--

DROP TABLE IF EXISTS `hotel_gate_distances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hotel_gate_distances` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hotel_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gate_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `distance_meters` int DEFAULT NULL,
  `walking_time_minutes` int DEFAULT NULL,
  `is_recommended` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_hotel_gate` (`hotel_id`,`gate_id`),
  KEY `idx_hotel_id` (`hotel_id`),
  KEY `idx_gate_id` (`gate_id`),
  KEY `idx_distance_meters` (`distance_meters`),
  KEY `idx_is_recommended` (`is_recommended`),
  CONSTRAINT `hotel_gate_distances_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hotel_gate_distances_ibfk_2` FOREIGN KEY (`gate_id`) REFERENCES `haram_gates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotel_gate_distances`
--

LOCK TABLES `hotel_gate_distances` WRITE;
/*!40000 ALTER TABLE `hotel_gate_distances` DISABLE KEYS */;
/*!40000 ALTER TABLE `hotel_gate_distances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotel_images`
--

DROP TABLE IF EXISTS `hotel_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hotel_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hotel_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_hotel_id` (`hotel_id`),
  CONSTRAINT `hotel_images_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotel_images`
--

LOCK TABLES `hotel_images` WRITE;
/*!40000 ALTER TABLE `hotel_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `hotel_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotels`
--

DROP TABLE IF EXISTS `hotels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hotels` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `agent_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('DRAFT','ACTIVE','INACTIVE','SUSPENDED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `zip_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `star_rating` int DEFAULT '0',
  `total_rooms` int DEFAULT '0',
  `check_in_time` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT '14:00',
  `check_out_time` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT '11:00',
  `walking_time_to_haram` int DEFAULT NULL,
  `view_type` enum('kaaba','partial_haram','city','none') COLLATE utf8mb4_unicode_ci DEFAULT 'none',
  `is_elderly_friendly` tinyint(1) DEFAULT '0',
  `has_family_rooms` tinyint(1) DEFAULT '0',
  `manasik_score` decimal(3,1) DEFAULT NULL,
  `distance_to_haram_meters` int DEFAULT NULL,
  `nearest_gate_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `house_rules` text COLLATE utf8mb4_unicode_ci,
  `gates_assigned` tinyint(1) DEFAULT '0',
  `cancellation_policy` text COLLATE utf8mb4_unicode_ci,
  `custom_policies` json DEFAULT NULL,
  `average_rating` decimal(3,2) DEFAULT '0.00',
  `total_reviews` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_agent_id` (`agent_id`),
  KEY `idx_status` (`status`),
  KEY `idx_city` (`city`),
  KEY `idx_country` (`country`),
  KEY `idx_walking_time` (`walking_time_to_haram`),
  KEY `idx_view_type` (`view_type`),
  KEY `idx_elderly_friendly` (`is_elderly_friendly`),
  KEY `idx_family_rooms` (`has_family_rooms`),
  KEY `idx_manasik_score` (`manasik_score`),
  KEY `idx_distance_haram` (`distance_to_haram_meters`),
  CONSTRAINT `hotels_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hotels_ibfk_2` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotels`
--

LOCK TABLES `hotels` WRITE;
/*!40000 ALTER TABLE `hotels` DISABLE KEYS */;
INSERT INTO `hotels` VALUES ('hotel-agent10-001','company-agent10','agent-10-id','Al-Noor Hotel','Comfortable hotel','ACTIVE','123 St','Mecca',NULL,'Saudi Arabia',NULL,21.42000000,39.82000000,4,50,'14:00','11:00',NULL,'none',0,0,NULL,NULL,NULL,NULL,0,NULL,NULL,0.00,0,'2026-04-27 14:36:16','2026-04-27 14:36:16'),('hotel-agent10-002','company-agent10','agent-10-id','Kaaba View Plaza','Premium hotel with Kaaba view','ACTIVE','456 View Road','Mecca',NULL,'Saudi Arabia',NULL,21.42500000,39.82700000,5,100,'14:00','11:00',8,'partial_haram',1,1,NULL,800,NULL,NULL,0,NULL,NULL,0.00,0,'2026-04-27 14:36:52','2026-04-27 14:36:52'),('hotel-agent10-003','company-agent10','agent-10-id','Holy City Inn','Budget-friendly accommodation','ACTIVE','789 City Lane','Mecca',NULL,'Saudi Arabia',NULL,21.42300000,39.82400000,3,30,'14:00','11:00',12,'city',0,1,NULL,1200,NULL,NULL,0,NULL,NULL,0.00,0,'2026-04-27 14:36:52','2026-04-27 14:36:52'),('hotel-test','company-agent10','agent-10-id','Test Hotel','Test','ACTIVE','Test St','Mecca',NULL,'Saudi Arabia',NULL,NULL,NULL,4,0,'14:00','11:00',NULL,'none',0,0,NULL,NULL,NULL,NULL,0,NULL,NULL,0.00,0,'2026-04-27 14:34:01','2026-04-27 14:34:01');
/*!40000 ALTER TABLE `hotels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_attachments`
--

DROP TABLE IF EXISTS `message_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_attachments` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_message_id` (`message_id`),
  CONSTRAINT `message_attachments_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_attachments`
--

LOCK TABLES `message_attachments` WRITE;
/*!40000 ALTER TABLE `message_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `message_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sender_id` (`sender_id`),
  KEY `idx_receiver_id` (`receiver_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_links`
--

DROP TABLE IF EXISTS `payment_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_links` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('SENT','CLICKED','EXPIRED','COMPLETED') COLLATE utf8mb4_unicode_ci DEFAULT 'SENT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NOT NULL,
  `clicked_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `stripe_session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_token` (`token`),
  KEY `idx_guest_email` (`guest_email`),
  KEY `idx_status` (`status`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `payment_links_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_links`
--

LOCK TABLES `payment_links` WRITE;
/*!40000 ALTER TABLE `payment_links` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `resource` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`),
  KEY `idx_resource_action` (`resource`,`action`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'user:read','Read user information','user','read','2026-04-27 14:21:16'),(2,'user:create','Create new user','user','create','2026-04-27 14:21:16'),(3,'user:update','Update user information','user','update','2026-04-27 14:21:16'),(4,'user:delete','Delete user','user','delete','2026-04-27 14:21:16'),(5,'company:read','Read company information','company','read','2026-04-27 14:21:16'),(6,'company:create','Create new company','company','create','2026-04-27 14:21:16'),(7,'company:update','Update company information','company','update','2026-04-27 14:21:16'),(8,'company:delete','Delete company','company','delete','2026-04-27 14:21:16'),(9,'agent:read','Read agent information','agent','read','2026-04-27 14:21:16'),(10,'agent:create','Create new agent','agent','create','2026-04-27 14:21:16'),(11,'agent:update','Update agent information','agent','update','2026-04-27 14:21:16'),(12,'agent:delete','Delete agent','agent','delete','2026-04-27 14:21:16'),(13,'hotel:read','Read hotel information','hotel','read','2026-04-27 14:21:16'),(14,'hotel:create','Create new hotel','hotel','create','2026-04-27 14:21:16'),(15,'hotel:update','Update hotel information','hotel','update','2026-04-27 14:21:16'),(16,'hotel:delete','Delete hotel','hotel','delete','2026-04-27 14:21:16'),(17,'booking:read','Read booking information','booking','read','2026-04-27 14:21:16'),(18,'booking:create','Create new booking','booking','create','2026-04-27 14:21:16'),(19,'booking:update','Update booking information','booking','update','2026-04-27 14:21:16'),(20,'booking:delete','Delete booking','booking','delete','2026-04-27 14:21:16'),(21,'review:read','Read review information','review','read','2026-04-27 14:21:16'),(22,'review:create','Create new review','review','create','2026-04-27 14:21:16'),(23,'review:update','Update review information','review','update','2026-04-27 14:21:16'),(24,'review:delete','Delete review','review','delete','2026-04-27 14:21:16'),(25,'admin:read','Read admin information','admin','read','2026-04-27 14:21:16'),(26,'admin:create','Create new admin','admin','create','2026-04-27 14:21:16'),(27,'admin:update','Update admin information','admin','update','2026-04-27 14:21:16'),(28,'admin:delete','Delete admin','admin','delete','2026-04-27 14:21:16');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_type` enum('HOTEL','TAXI','EXPERIENCE','CAR','FOOD') COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `criteria` json DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','FLAGGED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `is_verified` tinyint(1) DEFAULT '0',
  `helpful_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_status` (`status`),
  KEY `idx_service_type` (`service_type`),
  KEY `idx_rating` (`rating`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_permission` (`role_id`,`permission_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (1,1,26,'2026-04-27 14:21:16'),(2,1,28,'2026-04-27 14:21:16'),(3,1,25,'2026-04-27 14:21:16'),(4,1,27,'2026-04-27 14:21:16'),(5,1,10,'2026-04-27 14:21:16'),(6,1,12,'2026-04-27 14:21:16'),(7,1,9,'2026-04-27 14:21:16'),(8,1,11,'2026-04-27 14:21:16'),(9,1,18,'2026-04-27 14:21:16'),(10,1,20,'2026-04-27 14:21:16'),(11,1,17,'2026-04-27 14:21:16'),(12,1,19,'2026-04-27 14:21:16'),(13,1,6,'2026-04-27 14:21:16'),(14,1,8,'2026-04-27 14:21:16'),(15,1,5,'2026-04-27 14:21:16'),(16,1,7,'2026-04-27 14:21:16'),(17,1,14,'2026-04-27 14:21:16'),(18,1,16,'2026-04-27 14:21:16'),(19,1,13,'2026-04-27 14:21:16'),(20,1,15,'2026-04-27 14:21:16'),(21,1,22,'2026-04-27 14:21:16'),(22,1,24,'2026-04-27 14:21:16'),(23,1,21,'2026-04-27 14:21:16'),(24,1,23,'2026-04-27 14:21:16'),(25,1,2,'2026-04-27 14:21:16'),(26,1,4,'2026-04-27 14:21:16'),(27,1,1,'2026-04-27 14:21:16'),(28,1,3,'2026-04-27 14:21:16'),(32,2,25,'2026-04-27 14:21:16'),(33,2,27,'2026-04-27 14:21:16'),(34,2,10,'2026-04-27 14:21:16'),(35,2,9,'2026-04-27 14:21:16'),(36,2,11,'2026-04-27 14:21:16'),(37,2,17,'2026-04-27 14:21:16'),(38,2,5,'2026-04-27 14:21:16'),(39,2,7,'2026-04-27 14:21:16'),(40,2,14,'2026-04-27 14:21:16'),(41,2,13,'2026-04-27 14:21:16'),(42,2,15,'2026-04-27 14:21:16'),(43,2,21,'2026-04-27 14:21:16'),(44,2,2,'2026-04-27 14:21:16'),(45,2,1,'2026-04-27 14:21:16'),(46,2,3,'2026-04-27 14:21:16'),(47,3,9,'2026-04-27 14:21:16'),(48,3,11,'2026-04-27 14:21:16'),(49,3,17,'2026-04-27 14:21:16'),(50,3,5,'2026-04-27 14:21:16'),(51,3,14,'2026-04-27 14:21:16'),(52,3,13,'2026-04-27 14:21:16'),(53,3,15,'2026-04-27 14:21:16'),(54,3,21,'2026-04-27 14:21:16'),(55,3,1,'2026-04-27 14:21:16'),(56,3,3,'2026-04-27 14:21:16'),(62,4,18,'2026-04-27 14:21:16'),(63,4,17,'2026-04-27 14:21:16'),(64,4,13,'2026-04-27 14:21:16'),(65,4,22,'2026-04-27 14:21:16'),(66,4,21,'2026-04-27 14:21:16'),(67,4,1,'2026-04-27 14:21:16'),(68,4,3,'2026-04-27 14:21:16');
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_system` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'SUPER_ADMIN','System administrator with full access',1,'2026-04-27 14:21:16','2026-04-27 14:21:16'),(2,'COMPANY_ADMIN','Company administrator who manages agents and company settings',1,'2026-04-27 14:21:16','2026-04-27 14:21:16'),(3,'AGENT','Service provider (hotel owner, taxi firm, etc.)',1,'2026-04-27 14:21:16','2026-04-27 14:21:16'),(4,'CUSTOMER','End user who makes bookings',1,'2026-04-27 14:21:16','2026-04-27 14:21:16');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_amenities`
--

DROP TABLE IF EXISTS `room_amenities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_amenities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_type_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amenity_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_room_amenity` (`room_type_id`,`amenity_name`),
  KEY `idx_room_type_id` (`room_type_id`),
  CONSTRAINT `room_amenities_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_amenities`
--

LOCK TABLES `room_amenities` WRITE;
/*!40000 ALTER TABLE `room_amenities` DISABLE KEYS */;
/*!40000 ALTER TABLE `room_amenities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_images`
--

DROP TABLE IF EXISTS `room_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_type_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_room_type_id` (`room_type_id`),
  CONSTRAINT `room_images_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_images`
--

LOCK TABLES `room_images` WRITE;
/*!40000 ALTER TABLE `room_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `room_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_types`
--

DROP TABLE IF EXISTS `room_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_types` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hotel_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `capacity` int NOT NULL,
  `is_family_room` tinyint(1) DEFAULT '0',
  `max_adults` int DEFAULT '2',
  `max_children` int DEFAULT '0',
  `has_connecting_rooms` tinyint(1) DEFAULT '0',
  `total_rooms` int NOT NULL,
  `available_rooms` int NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_hotel_id` (`hotel_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `room_types_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_types`
--

LOCK TABLES `room_types` WRITE;
/*!40000 ALTER TABLE `room_types` DISABLE KEYS */;
INSERT INTO `room_types` VALUES ('room-h1-deluxe','hotel-agent10-001','Deluxe Room',NULL,2,1,2,0,0,20,20,250.00,'USD','ACTIVE','2026-04-27 14:37:12','2026-04-27 14:37:12'),('room-h1-family','hotel-agent10-001','Family Suite',NULL,4,1,2,0,0,10,10,400.00,'USD','ACTIVE','2026-04-27 14:37:12','2026-04-27 14:37:12'),('room-h1-standard','hotel-agent10-001','Standard Room',NULL,1,0,1,0,0,20,20,150.00,'USD','ACTIVE','2026-04-27 14:37:12','2026-04-27 14:37:12'),('room-h2-penthouse','hotel-agent10-002','Penthouse',NULL,4,1,2,0,0,10,10,600.00,'USD','ACTIVE','2026-04-27 14:37:12','2026-04-27 14:37:12'),('room-h2-premium','hotel-agent10-002','Premium Suite',NULL,2,1,2,0,0,40,40,350.00,'USD','ACTIVE','2026-04-27 14:37:12','2026-04-27 14:37:12'),('room-h2-standard','hotel-agent10-002','Standard Room',NULL,1,0,1,0,0,50,50,200.00,'USD','ACTIVE','2026-04-27 14:37:12','2026-04-27 14:37:12'),('room-h3-basic','hotel-agent10-003','Basic Room',NULL,1,0,1,0,0,15,15,100.00,'USD','ACTIVE','2026-04-27 14:37:12','2026-04-27 14:37:12'),('room-h3-double','hotel-agent10-003','Double Room',NULL,2,1,2,0,0,15,15,150.00,'USD','ACTIVE','2026-04-27 14:37:12','2026-04-27 14:37:12');
/*!40000 ALTER TABLE `room_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_permissions`
--

DROP TABLE IF EXISTS `user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_permission` (`user_id`,`permission_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_permission_id` (`permission_id`),
  CONSTRAINT `user_permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_permissions`
--

LOCK TABLES `user_permissions` WRITE;
/*!40000 ALTER TABLE `user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('SUPER_ADMIN','COMPANY_ADMIN','AGENT','CUSTOMER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `service_type` enum('HOTEL','TAXI','EXPERIENCE','CAR','FOOD') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_company_id` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('agent-10-id','Agent','Ten','agent-10@bookingplatform.com','$2a$10$hPrhNiMUQbw/RnC0HGfBF.ZeoEA7iQYMtuGZj6n0HZ4i30fuq1kiy','AGENT',NULL,NULL,1,'2026-04-27 14:29:21','2026-04-27 14:29:21');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-27 17:01:27
