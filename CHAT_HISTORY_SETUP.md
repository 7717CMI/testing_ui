# Smart Search Chat History Setup

This document explains how to set up the MySQL database for Smart Search chat history.

## Database Setup

1. **Run the SQL migration script** to create the necessary tables:
   ```bash
   mysql -h 34.63.177.157 -P 3306 -u root -p chat_history < database/migrations/create_chat_sessions_mysql.sql
   ```
   Password: `Platoon@1`

2. **Environment Variables** (Optional - defaults are already set):
   
   Add these to your `.env.local` file if you want to override the defaults:
   ```env
   MYSQL_HOST=34.63.177.157
   MYSQL_PORT=3306
   MYSQL_DATABASE=chat_history
   MYSQL_USER=root
   MYSQL_PASSWORD=Platoon@1
   ```

   **Note:** The MySQL connection file (`src/lib/mysql-database.ts`) already has these values as defaults, so you don't need to set them unless you want to use different credentials.

## Features

- ✅ **Last 10 chats only**: Automatically keeps only the last 10 chat sessions per user
- ✅ **Auto-save**: Messages are automatically saved to MySQL after each exchange
- ✅ **Chat History Sidebar**: Access your chat history from the Smart Search page
- ✅ **90-day expiry**: Old chats are automatically cleaned up after 90 days
- ✅ **Smart Search only**: This feature is isolated to the Smart Search page only

## Usage

1. Navigate to the Smart Search page (`/search`)
2. Click the "History" button in the header to open the chat history sidebar
3. Your last 10 conversations will be displayed
4. Click on any conversation to load it
5. Click "New Chat" to start a fresh conversation

## Database Schema

- `chat_sessions`: Stores chat session metadata (id, user_id, title, timestamps)
- `chat_messages`: Stores individual messages (id, session_id, role, content, order)
- `chat_message_metadata`: Stores additional data like facilities (optional)

## Auto-Cleanup

The system automatically:
- Limits each user to 10 chat sessions (deletes oldest when limit exceeded)
- Cleans up expired chats (90 days) via scheduled MySQL event

