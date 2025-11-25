import { NextRequest, NextResponse } from 'next/server'
import { getDbPool } from '@/lib/db-config'

// Get shared database pool

async function getFacilityTypes(categoryId: number) {
  const pool = getDbPool()
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        ft.id,
        ft.code as name,
        ft.name as display_name,
        ft.description,
        ft.category_id,
        fc.name as category_name,
        COALESCE(provider_counts.count, 0) as provider_count
      FROM healthcare_production.facility_types ft
      JOIN healthcare_production.facility_categories fc ON fc.id = ft.category_id
      LEFT JOIN (
        SELECT 
          facility_type_id,
          COUNT(*) as count
        FROM healthcare_production.healthcare_providers
        WHERE is_active = true
        GROUP BY facility_type_id
      ) provider_counts ON ft.id = provider_counts.facility_type_id
      WHERE ft.category_id = $1
      ORDER BY ft.name
    `, [categoryId])

    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      display_name: row.display_name,
      description: row.description,
      category_id: row.category_id,
      category_name: row.category_name,
      provider_count: parseInt(row.provider_count)
    }))
  } finally {
    client.release()
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId: categoryIdStr } = await params
    const categoryId = parseInt(categoryIdStr)

    if (isNaN(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid category ID',
          message: 'Category ID must be a number'
        },
        { status: 400 }
      )
    }

    const facilityTypes = await getFacilityTypes(categoryId)

    return NextResponse.json({
      success: true,
      message: `Found ${facilityTypes.length} facility types in category ${categoryId}`,
      data: {
        category_id: categoryId,
        facility_types: facilityTypes,
        total_types: facilityTypes.length
      }
    })
  } catch (error) {
    const err = error as Error
    console.error('Error fetching facility types:', err)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch facility types',
        message: err.message
      },
      { status: 500 }
    )
  }
}
