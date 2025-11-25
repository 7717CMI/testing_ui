import { NextRequest, NextResponse } from 'next/server'
import { getDbPool } from '@/lib/db-config'

/**
 * GET /api/v1/catalog/categories/[idOrSlug]
 * 
 * Fetch a single category by ID (numeric) or slug (string)
 * This handles both cases to avoid routing conflicts
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ categoryId: string }> }
) {
    let idOrSlug: string = ''
    try {
        const resolvedParams = await params
        idOrSlug = resolvedParams.categoryId

        if (!idOrSlug) {
            return NextResponse.json(
                { success: false, error: 'Category ID or slug is required' },
                { status: 400 }
            )
        }

        const pool = getDbPool()
        const client = await pool.connect()

        try {
            // Check if it's a strictly numeric ID
            const isNumeric = /^\d+$/.test(idOrSlug)

            console.log(`[API] Lookup category: "${idOrSlug}" (isNumeric: ${isNumeric})`)

            let result

            if (isNumeric) {
                // Query by ID - optimized with subqueries to avoid temp file issues
                result = await client.query(`
          SELECT 
            fc.id,
            fc.code as name,
            fc.name as display_name,
            fc.description,
            COALESCE((SELECT COUNT(*) FROM healthcare_production.healthcare_providers hp 
                      WHERE hp.facility_category_id = fc.id AND hp.is_active = true), 0) as provider_count,
            COALESCE((SELECT COUNT(*) FROM healthcare_production.facility_types ft 
                      WHERE ft.category_id = fc.id), 0) as facility_types_count
          FROM healthcare_production.facility_categories fc
          WHERE fc.id = $1
        `, [parseInt(idOrSlug)])
            } else {
                // Query by slug - optimized with subqueries to avoid temp file issues
                const normalizedSlug = idOrSlug.toLowerCase().trim()
                result = await client.query(`
          SELECT 
            fc.id,
            fc.code as name,
            fc.name as display_name,
            fc.description,
            COALESCE((SELECT COUNT(*) FROM healthcare_production.healthcare_providers hp 
                      WHERE hp.facility_category_id = fc.id AND hp.is_active = true), 0) as provider_count,
            COALESCE((SELECT COUNT(*) FROM healthcare_production.facility_types ft 
                      WHERE ft.category_id = fc.id), 0) as facility_types_count,
            CASE 
              WHEN LOWER(REPLACE(REPLACE(REPLACE(fc.name, ' ', '-'), '&', 'and'), '_', '-')) = $1 THEN 1
              WHEN LOWER(REPLACE(REPLACE(REPLACE(fc.code, ' ', '-'), '&', 'and'), '_', '-')) = $1 THEN 2
              WHEN LOWER(fc.name) = $1 THEN 3
              WHEN LOWER(fc.code) = $1 THEN 4
              ELSE 5
            END as match_priority
          FROM healthcare_production.facility_categories fc
          WHERE LOWER(REPLACE(REPLACE(REPLACE(fc.name, ' ', '-'), '&', 'and'), '_', '-')) = $1
             OR LOWER(REPLACE(REPLACE(REPLACE(fc.code, ' ', '-'), '&', 'and'), '_', '-')) = $1
             OR LOWER(REPLACE(REPLACE(REPLACE(fc.name, ' ', '-'), '&', 'and'), '_', '-')) LIKE $2
             OR LOWER(REPLACE(REPLACE(REPLACE(fc.code, ' ', '-'), '&', 'and'), '_', '-')) LIKE $2
             OR LOWER(fc.name) = $1
             OR LOWER(fc.code) = $1
             OR LOWER(fc.name) LIKE $2
             OR LOWER(fc.code) LIKE $2
          ORDER BY match_priority
          LIMIT 1
        `, [normalizedSlug, `${normalizedSlug}%`])
            }

            if (result.rows.length === 0) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Category not found',
                        message: `No category found for: ${idOrSlug}`
                    },
                    { status: 404 }
                )
            }

            const category = result.rows[0]

            return NextResponse.json({
                success: true,
                data: {
                    id: category.id,
                    name: category.name,
                    display_name: category.display_name,
                    description: category.description,
                    provider_count: parseInt(category.provider_count) || 0,
                    facility_types_count: parseInt(category.facility_types_count) || 0
                }
            })
        } finally {
            client.release()
        }
    } catch (error) {
        const err = error as Error
        console.error('[Category API] Error fetching category:', {
            idOrSlug: idOrSlug || 'unknown',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        })
        
        // Provide more specific error messages
        let errorMessage = 'Failed to fetch category'
        if (err.message.includes('temp_file_limit')) {
            errorMessage = 'Database query exceeded temporary file limit. The query is being optimized.'
        } else if (err.message.includes('connection')) {
            errorMessage = 'Database connection error. Please try again.'
        } else if (err.message) {
            errorMessage = err.message
        }
        
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch category',
                message: errorMessage,
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            },
            { status: 500 }
        )
    }
}
