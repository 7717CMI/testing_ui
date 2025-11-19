import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase, getDatabaseStatus } from '@/lib/mysql-utils'

/**
 * GET /api/chat-sessions/init
 * Get database initialization status
 */
export async function GET(request: NextRequest) {
  try {
    const status = await getDatabaseStatus()
    
    return NextResponse.json({
      success: true,
      status: {
        connected: status.connected,
        databaseExists: status.databaseExists,
        tablesExist: status.tablesExist,
        tables: status.tables,
        error: status.error,
        errorCode: status.errorCode,
      },
      message: status.connected && status.databaseExists && status.tablesExist
        ? 'Database is ready'
        : 'Database needs initialization',
    })
  } catch (error: any) {
    console.error('[Init GET] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check database status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/chat-sessions/init
 * Initialize database and tables
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Init POST] Starting database initialization...')
    
    const result = await initializeDatabase()
    
    if (result.success) {
      console.log('[Init POST] ✅ Database initialization successful')
      console.log(`   Database created: ${result.databaseCreated}`)
      console.log(`   Tables created: ${result.tablesCreated.join(', ')}`)
      
      return NextResponse.json({
        success: true,
        message: 'Database initialized successfully',
        databaseCreated: result.databaseCreated,
        tablesCreated: result.tablesCreated,
      })
    } else {
      console.error('[Init POST] ❌ Database initialization failed:', result.error)
      
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to initialize database',
          databaseCreated: result.databaseCreated,
          tablesCreated: result.tablesCreated,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('[Init POST] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Initialization failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}



