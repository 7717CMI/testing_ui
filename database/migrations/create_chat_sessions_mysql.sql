-- MySQL Database Schema for Smart Search Chat History
-- Database: chat_history
-- Run this SQL script in your MySQL instance

-- Table 1: Chat Sessions (Smart Search only)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id CHAR(36) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  
  INDEX idx_user_id (user_id),
  INDEX idx_updated_at (updated_at DESC),
  INDEX idx_user_updated (user_id, updated_at DESC),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 2: Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id CHAR(36) PRIMARY KEY,
  session_id CHAR(36) NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  message_order INT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
  INDEX idx_session_id (session_id),
  INDEX idx_session_order (session_id, message_order),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 3: Message Metadata (optional - for facilities, analysis results, etc.)
CREATE TABLE IF NOT EXISTS chat_message_metadata (
  id CHAR(36) PRIMARY KEY,
  message_id CHAR(36) NOT NULL,
  metadata_type VARCHAR(50) NOT NULL,
  metadata_value JSON NOT NULL,
  
  FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
  INDEX idx_message_id (message_id),
  INDEX idx_metadata_type (metadata_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stored Procedure: Limit user chat sessions to 10 (delete oldest)
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS limit_user_chat_sessions(IN p_user_id VARCHAR(255))
BEGIN
  DECLARE chat_count INT;
  SELECT COUNT(*) INTO chat_count FROM chat_sessions WHERE user_id = p_user_id;
  
  IF chat_count > 10 THEN
    DELETE FROM chat_sessions
    WHERE id IN (
      SELECT id FROM (
        SELECT id FROM chat_sessions 
        WHERE user_id = p_user_id 
        ORDER BY updated_at ASC 
        LIMIT (chat_count - 10)
      ) AS temp
    );
  END IF;
END //
DELIMITER ;

-- Stored Procedure: Cleanup expired chat sessions (90 days)
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS cleanup_expired_chat_sessions()
BEGIN
  DELETE FROM chat_sessions WHERE expires_at < NOW();
END //
DELIMITER ;

-- Event: Auto-cleanup expired chats (runs daily at 2 AM)
SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS cleanup_expired_chats
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY + INTERVAL 2 HOUR
DO
  CALL cleanup_expired_chat_sessions();


