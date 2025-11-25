import { NextRequest, NextResponse } from 'next/server'
import { getMySQLPool } from '@/lib/mysql-database'
import { initializeDatabase } from '@/lib/mysql-utils'
import { v4 as uuidv4 } from 'uuid'

// GET: Fetch user's last 10 chat sessions
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      )
    }

    let pool
    try {
      pool = await getMySQLPool()
    } catch (connectionError: any) {
      // Handle connection errors
      console.error('[Chat Sessions GET] MySQL connection error:', {
        code: connectionError.code,
        message: connectionError.message,
        host: connectionError.host,
      })

      // Check for specific error types
      if (connectionError.code === 'ECONNREFUSED' || connectionError.code === 'ETIMEDOUT') {
        return NextResponse.json({
          success: true,
          sessions: [],
          message: 'Chat history temporarily unavailable. Cannot connect to MySQL database. Please check your connection settings and firewall rules.',
          connectionError: true
        })
      }

      // Check for authentication errors
      if (connectionError.code === 'ER_ACCESS_DENIED_ERROR' || 
          connectionError.code === 'ER_ACCESS_DENIED' ||
          connectionError.message?.includes('Access denied')) {
        console.error('[Chat Sessions GET] Authentication error - check MySQL user permissions in GCP Console')
        return NextResponse.json({
          success: true,
          sessions: [],
          message: 'MySQL authentication failed. Please check your MySQL user credentials and permissions in GCP Console. Ensure the user has access from your IP address.',
          authError: true,
          error: process.env.NODE_ENV === 'development' ? connectionError.message : undefined
        })
      }

      if (connectionError.code === 'ER_BAD_DB_ERROR' || connectionError.message?.includes('Unknown database')) {
        return NextResponse.json({
          success: true,
          sessions: [],
          message: 'Chat history database not initialized. Click "Initialize Database" to set it up.',
          needsInit: true
        })
      }

      // Generic connection error
      return NextResponse.json({
        success: true,
        sessions: [],
        message: 'Chat history temporarily unavailable. Please check your MySQL connection.',
        connectionError: true
      })
    }

    try {
      // Get last 10 sessions for user
      const [sessions] = await pool.execute(
        `SELECT 
          id,
          user_id,
          title,
          created_at,
          updated_at,
          (SELECT COUNT(*) FROM chat_messages WHERE session_id = chat_sessions.id) as message_count
        FROM chat_sessions 
        WHERE user_id = ? 
        ORDER BY updated_at DESC 
        LIMIT 10`,
        [userId]
      )

      return NextResponse.json({
        success: true,
        sessions: sessions as any[]
      })
    } catch (dbError: any) {
      // Check if it's a table doesn't exist error
      if (dbError.code === 'ER_NO_SUCH_TABLE' || dbError.message?.includes('doesn\'t exist') || dbError.message?.includes("Table 'chat_history.chat_sessions' doesn't exist")) {
        console.error('[Chat Sessions GET] Database tables not found:', dbError.message)
        return NextResponse.json({
          success: true,
          sessions: [],
          message: 'Chat history database not initialized. Click "Initialize Database" to set it up.',
          needsInit: true
        })
      }
      
      // Check if it's a database doesn't exist error
      if (dbError.code === 'ER_BAD_DB_ERROR' || dbError.message?.includes('Unknown database')) {
        console.error('[Chat Sessions GET] Database not found:', dbError.message)
        return NextResponse.json({
          success: true,
          sessions: [],
          message: 'Chat history database not initialized. Click "Initialize Database" to set it up.',
          needsInit: true
        })
      }
      
      // Re-throw other errors to be caught by outer catch
      throw dbError
    }
  } catch (error: any) {
    console.error('[Chat Sessions GET] ❌ Unexpected error:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      name: error.name,
      constructor: error.constructor?.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
    
    // Check if it's a database/table error that we might have missed
    const errorMessage = error.message?.toLowerCase() || ''
    const errorCode = error.code || ''
    
    if (errorCode === 'ER_BAD_DB_ERROR' || 
        errorCode === 'ER_NO_SUCH_TABLE' || 
        errorMessage.includes('unknown database') ||
        errorMessage.includes("doesn't exist") ||
        errorMessage.includes('table') && errorMessage.includes('doesn\'t exist')) {
      console.log('[Chat Sessions GET] Detected database/table error in outer catch')
      return NextResponse.json({
        success: true,
        sessions: [],
        message: 'Chat history database not initialized. Click "Initialize Database" to set it up.',
        needsInit: true
      })
    }
    
    // Check for authentication errors
    if (errorCode === 'ER_ACCESS_DENIED_ERROR' || 
        errorCode === 'ER_ACCESS_DENIED' ||
        errorMessage.includes('Access denied') ||
        errorMessage.includes('access denied')) {
      console.log('[Chat Sessions GET] Detected authentication error in outer catch')
      return NextResponse.json({
        success: true,
        sessions: [],
        message: 'MySQL authentication failed. Please check your MySQL user credentials and permissions in GCP Console. Ensure the user has access from your IP address.',
        authError: true,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }

    // Check for connection errors
    if (errorCode === 'ECONNREFUSED' || 
        errorCode === 'ETIMEDOUT' ||
        errorCode === 'ENOTFOUND' ||
        errorMessage.includes('connect') ||
        errorMessage.includes('timeout')) {
      console.log('[Chat Sessions GET] Detected connection error in outer catch')
      return NextResponse.json({
        success: true,
        sessions: [],
        message: 'Chat history temporarily unavailable. Cannot connect to MySQL database. Please check your connection settings and firewall rules.',
        connectionError: true
      })
    }
    
    // Return success with empty array and helpful message (default case)
    return NextResponse.json({
      success: true,
      sessions: [],
      message: 'Chat history database not initialized. Click "Initialize Database" to set it up.',
      needsInit: true,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// POST: Create new chat session
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const { title, firstMessage } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      )
    }

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    let pool
    try {
      pool = await getMySQLPool()
    } catch (dbError: any) {
      // Check if it's a database/table doesn't exist error
      if (dbError.code === 'ER_BAD_DB_ERROR' || dbError.code === 'ER_NO_SUCH_TABLE' || dbError.message?.includes('doesn\'t exist')) {
        console.log('[Chat Sessions POST] Database/tables not found. Attempting auto-initialization...')
        const initResult = await initializeDatabase()
        if (initResult.success) {
          // Retry after initialization
          pool = await getMySQLPool()
        } else {
          return NextResponse.json({
            success: false,
            error: 'Database not initialized. Please initialize the database first.',
            needsInit: true,
            initError: initResult.error,
          }, { status: 503 })
        }
      } else {
        throw dbError
      }
    }

    const sessionId = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 90) // 90 days expiry

    // Create session
    await pool.execute(
      `INSERT INTO chat_sessions (id, user_id, title, expires_at)
       VALUES (?, ?, ?, ?)`,
      [sessionId, userId, title, expiresAt]
    )

    // If first message provided, save it
    if (firstMessage) {
      const messageId = uuidv4()
      await pool.execute(
        `INSERT INTO chat_messages (id, session_id, role, content, message_order)
         VALUES (?, ?, ?, ?, ?)`,
        [messageId, sessionId, firstMessage.role, firstMessage.content, 1]
      )
    }

    // Limit to 10 sessions per user
    await pool.execute('CALL limit_user_chat_sessions(?)', [userId])

    return NextResponse.json({
      success: true,
      session: {
        id: sessionId,
        user_id: userId,
        title,
        created_at: new Date(),
        updated_at: new Date()
      }
    })
  } catch (error: any) {
    console.error('[Chat Sessions POST] Error:', error)
    
    // Handle specific MySQL errors
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return NextResponse.json({
        success: false,
        error: 'Database tables not found. Please initialize the database.',
        needsInit: true,
      }, { status: 503 })
    }
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      return NextResponse.json({
        success: false,
        error: 'Database not found. Please initialize the database.',
        needsInit: true,
      }, { status: 503 })
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return NextResponse.json({
        success: false,
        error: 'Cannot connect to MySQL. Please check your connection settings and firewall rules.',
        connectionError: true,
      }, { status: 503 })
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create chat session',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}

// PUT: Update chat session (add messages)
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const { sessionId, messages } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      )
    }

    if (!sessionId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Session ID and messages array are required' },
        { status: 400 }
      )
    }

    const pool = await getMySQLPool()

    // Verify session belongs to user
    const [sessions] = await pool.execute(
      'SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    )

    if (!Array.isArray(sessions) || sessions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get current message count
    const [messageCounts] = await pool.execute(
      'SELECT COUNT(*) as count FROM chat_messages WHERE session_id = ?',
      [sessionId]
    )
    const currentCount = (messageCounts as any[])[0]?.count || 0

    // Insert new messages
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      const messageId = uuidv4()
      await pool.execute(
        `INSERT INTO chat_messages (id, session_id, role, content, message_order)
         VALUES (?, ?, ?, ?, ?)`,
        [messageId, sessionId, message.role, message.content, currentCount + i + 1]
      )

      // Save metadata if present
      if (message.metadata) {
        const metadataId = uuidv4()
        await pool.execute(
          `INSERT INTO chat_message_metadata (id, message_id, metadata_type, metadata_value)
           VALUES (?, ?, ?, ?)`,
          [metadataId, messageId, 'facilities', JSON.stringify(message.metadata)]
        )
      }
    }

    // Update session updated_at timestamp
    await pool.execute(
      'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [sessionId]
    )

    // Limit to 10 sessions per user
    await pool.execute('CALL limit_user_chat_sessions(?)', [userId])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Chat Sessions PUT] Error:', error)
    
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
      return NextResponse.json({
        success: false,
        error: 'Database not initialized. Please initialize the database.',
        needsInit: true,
      }, { status: 503 })
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update chat session',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}

// DELETE: Delete chat session
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      )
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    let pool
    try {
      pool = await getMySQLPool()
    } catch (dbError: any) {
      if (dbError.code === 'ER_BAD_DB_ERROR' || dbError.code === 'ER_NO_SUCH_TABLE') {
        return NextResponse.json({
          success: true, // Return success if database doesn't exist (nothing to delete)
          message: 'Database not initialized',
        })
      }
      throw dbError
    }

    // Verify session belongs to user before deleting
    const [sessions] = await pool.execute(
      'SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    )

    if (!Array.isArray(sessions) || sessions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    // Delete session (CASCADE will delete messages and metadata)
    await pool.execute('DELETE FROM chat_sessions WHERE id = ?', [sessionId])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Chat Sessions DELETE] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete chat session' },
      { status: 500 }
    )
  }
}

// GET: Fetch messages for a specific session
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const { sessionId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      )
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    let pool
    try {
      pool = await getMySQLPool()
    } catch (dbError: any) {
      if (dbError.code === 'ER_BAD_DB_ERROR' || dbError.code === 'ER_NO_SUCH_TABLE') {
        return NextResponse.json({
          success: false,
          error: 'Database not initialized. Please initialize the database.',
          needsInit: true,
        }, { status: 503 })
      }
      throw dbError
    }

    // Verify session belongs to user
    const [sessions] = await pool.execute(
      'SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    )

    if (!Array.isArray(sessions) || sessions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    // Fetch messages with metadata
    const [messages] = await pool.execute(
      `SELECT 
        m.id,
        m.role,
        m.content,
        m.message_order,
        m.timestamp,
        COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'type', md.metadata_type,
              'value', md.metadata_value
            )
          ),
          JSON_ARRAY()
        ) as metadata
      FROM chat_messages m
      LEFT JOIN chat_message_metadata md ON m.id = md.message_id
      WHERE m.session_id = ?
      GROUP BY m.id, m.role, m.content, m.message_order, m.timestamp
      ORDER BY m.message_order ASC`,
      [sessionId]
    )

    return NextResponse.json({
      success: true,
      messages: (messages as any[]).map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        metadata: msg.metadata && msg.metadata.length > 0 ? msg.metadata[0]?.value : null
      }))
    })
  } catch (error: any) {
    console.error('[Chat Sessions PATCH] Error:', error)
    
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
      return NextResponse.json({
        success: false,
        error: 'Database not initialized. Please initialize the database.',
        needsInit: true,
      }, { status: 503 })
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch messages',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}

