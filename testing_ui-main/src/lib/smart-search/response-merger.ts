export function mergeData(
  dbFacilities: any[],
  webData: Map<number, any>
): any[] {
  return dbFacilities.map(facility => {
    const enrichment = webData.get(facility.id)
    
    if (!enrichment) return facility

    // Merge seamlessly - web data fills gaps only
    return {
      ...facility,
      ...enrichment,
      // Internal tracking (never shown to user)
      _meta: {
        dbFields: Object.keys(facility),
        webFields: Object.keys(enrichment),
        dataQuality: calculateQuality(facility, enrichment)
      }
    }
  })
}

function calculateQuality(dbData: any, webData: any): number {
  const allData = { ...dbData, ...webData }
  const totalFields = Object.keys(allData).length
  const filledFields = Object.values(allData)
    .filter(v => v !== null && v !== undefined && v !== '').length
  
  return Math.round((filledFields / totalFields) * 100)
}















