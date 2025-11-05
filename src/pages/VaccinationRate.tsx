import { useState, useMemo } from 'react'
import { ArrowLeft, Heart, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { getData, filterDataframe, formatWithCommas, FilterOptions } from '../utils/dataGenerator'
import { StatBox } from '../components/StatBox'
import { FilterDropdown } from '../components/FilterDropdown'
import { GroupedBarChart } from '../components/GroupedBarChart'
import { CountryDiseaseStackedBarChart } from '../components/CountryDiseaseStackedBarChart'
import { LineChart } from '../components/LineChart'
import { DemoNotice } from '../components/DemoNotice'
import { useTheme } from '../context/ThemeContext'
import { InfoTooltip } from '../components/InfoTooltip'
import { getChartColors } from '../utils/chartColors'

interface VaccinationRateProps {
  onNavigate: (page: string) => void
}

export function VaccinationRate({ onNavigate }: VaccinationRateProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const data = getData()
  
  const [filters, setFilters] = useState<FilterOptions>(() => {
    const availableYears = [...new Set(data.map(d => d.year))].sort()
    const availableCountries = [...new Set(data.map(d => d.country))].sort()
    const availableDiseases = [...new Set(data.map(d => d.disease))].sort()
    
    const year2025 = availableYears.includes(2025) ? [2025] : (availableYears.length > 0 ? [availableYears[availableYears.length - 1]] : [])
    const defaultCountries = availableCountries.includes('USA') && availableCountries.includes('Canada')
      ? ['USA', 'Canada']
      : availableCountries.slice(0, 2)
    
    // Select two diseases: Influenza and HPV (or first two available)
    const defaultDiseases = availableDiseases.includes('Influenza') && availableDiseases.includes('HPV')
      ? ['Influenza', 'HPV']
      : availableDiseases.length >= 2
        ? availableDiseases.slice(0, 2)
        : availableDiseases.length === 1
          ? [availableDiseases[0]]
          : []
    
    return {
      year: year2025,
      disease: defaultDiseases,
      country: defaultCountries,
    }
  })

  const filteredData = useMemo(() => {
    return filterDataframe(data, filters)
  }, [data, filters])

  const selectedCountries = filters.country && filters.country.length > 0 ? filters.country : []

  const uniqueOptions = useMemo(() => {
    return {
      years: [...new Set(data.map(d => d.year))].sort(),
      diseases: [...new Set(data.map(d => d.disease))].sort(),
      countries: [...new Set(data.map(d => d.country))].sort(),
    }
  }, [data])

  // Always use expanded layout - graphs displayed one by one vertically
  const gridClass = useMemo(() => {
    return 'grid grid-cols-1 gap-10 w-full'  // Always full width, stacked vertically
  }, [])

  // Increased chart height for better visibility
  const chartHeight = useMemo(() => {
    return 'h-[700px]'  // Increased height for larger graphs
  }, [])

  // Active filters label helper
  const activeFiltersLabel = useMemo(() => {
    return {
      year: filters.year && filters.year.length > 0 
        ? filters.year.map(y => String(y)).join(', ')
        : 'All Years',
      diseases: filters.disease && filters.disease.length > 0 
        ? filters.disease 
        : [],
      countries: filters.country && filters.country.length > 0 
        ? filters.country.join(', ') 
        : 'All Countries',
    }
  }, [filters])

  // KPIs
  const kpis = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        avgVaccinationRate: 'N/A',
        patientsVaccinated: 'N/A',
        avgCoverageRate: 'N/A',
        topDisease: 'N/A',
      }
    }

    const avgVaccinationRate = filteredData.reduce((sum, d) => sum + d.vaccinationRate, 0) / filteredData.length
    const totalPrevalence = filteredData.reduce((sum, d) => sum + d.prevalence, 0)
    const avgCoverageRate = filteredData.reduce((sum, d) => sum + d.coverageRate, 0) / filteredData.length
    const patientsVaccinated = (totalPrevalence * avgVaccinationRate) / 100
    
    const diseaseGroups = filteredData.reduce((acc: Record<string, number>, d) => {
      acc[d.disease] = (acc[d.disease] || 0) + d.vaccinationRate
      return acc
    }, {})
    const topDisease = Object.entries(diseaseGroups).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    return {
      avgVaccinationRate: `${formatWithCommas(avgVaccinationRate, 1)}%`,
      patientsVaccinated: `${formatWithCommas(patientsVaccinated / 1000, 1)}K`,
      avgCoverageRate: `${formatWithCommas(avgCoverageRate, 1)}%`,
      topDisease,
    }
  }, [filteredData])

  // Country-wise granular charts: Vaccination Rate by Country for each Disease - Per Year
  const countryVaccinationRateByDisease = useMemo(() => {
    const diseases = filters.disease && filters.disease.length > 0 
      ? filters.disease 
      : [...new Set(filteredData.map(d => d.disease))].sort()
    
    const selectedCountriesList = filters.country && filters.country.length > 0 
      ? filters.country 
      : [...new Set(filteredData.map(d => d.country))].sort()
    
    return diseases.map((disease) => {
      const diseaseData = filteredData.filter(d => d.disease === disease)
      
      const dataByYearAndCountry = diseaseData
        .filter(d => selectedCountriesList.includes(d.country))
        .map((d) => ({
          year: d.year,
          country: d.country,
          vaccinationRate: d.vaccinationRate,
        }))
      
      return {
        disease,
        data: dataByYearAndCountry,
      }
    })
  }, [filteredData, filters.disease, filters.country])

  // Country-wise granular charts: Coverage Rate by Country for each Disease - Per Year
  const countryCoverageRateByDisease = useMemo(() => {
    const diseases = filters.disease && filters.disease.length > 0 
      ? filters.disease 
      : [...new Set(filteredData.map(d => d.disease))].sort()
    
    const selectedCountriesList = filters.country && filters.country.length > 0 
      ? filters.country 
      : [...new Set(filteredData.map(d => d.country))].sort()
    
    return diseases.map((disease) => {
      const diseaseData = filteredData.filter(d => d.disease === disease)
      
      const dataByYearAndCountry = diseaseData
        .filter(d => selectedCountriesList.includes(d.country))
        .map((d) => ({
          year: d.year,
          country: d.country,
          coverageRate: d.coverageRate,
        }))
      
      return {
        disease,
        data: dataByYearAndCountry,
      }
    })
  }, [filteredData, filters.disease, filters.country])

  // Country-Disease Stacked Bar Chart: Vaccination Rate by Country with Diseases stacked
  const countryDiseaseVaccinationData = useMemo(() => {
    return filteredData.map((d) => ({
      country: d.country,
      disease: d.disease,
      vaccinationRate: d.vaccinationRate,
    }))
  }, [filteredData])

  // Country-Disease Stacked Bar Chart: Coverage Rate by Country with Diseases stacked
  const countryDiseaseCoverageData = useMemo(() => {
    return filteredData.map((d) => ({
      country: d.country,
      disease: d.disease,
      coverageRate: d.coverageRate,
    }))
  }, [filteredData])

  // Vaccination Rate Trends Over Time - Country-wise breakdown, separated by disease
  // Single country: Combined graph with both vaccination rate and coverage rate
  // Multiple countries: Separate graphs for vaccination rate and coverage rate
  // NOTE: Now separated by disease - each disease gets its own YoY graph
  const vaccinationTrendsDataByDisease = useMemo(() => {
    const selectedCountriesList = filters.country && filters.country.length > 0 
      ? filters.country 
      : [...new Set(filteredData.map(d => d.country))].sort()
    const selectedDiseases = filters.disease && filters.disease.length > 0 
      ? filters.disease 
      : [...new Set(filteredData.map(d => d.disease))].sort()
    
    // Group by disease, year, and country
    const grouped: Record<string, Record<number, Record<string, { vaccinationRate: number; coverageRate: number }>>> = {}
    
    filteredData.forEach((d) => {
      if (!grouped[d.disease]) {
        grouped[d.disease] = {}
      }
      if (!grouped[d.disease][d.year]) {
        grouped[d.disease][d.year] = {}
      }
      if (!grouped[d.disease][d.year][d.country]) {
        grouped[d.disease][d.year][d.country] = { vaccinationRate: 0, coverageRate: 0 }
      }
      if (selectedCountriesList.includes(d.country) && selectedDiseases.includes(d.disease)) {
        grouped[d.disease][d.year][d.country].vaccinationRate += d.vaccinationRate
        grouped[d.disease][d.year][d.country].coverageRate += d.coverageRate
      }
    })
    
    // Transform to array format with YoY calculations, separated by disease
    const result: Record<string, Array<Record<string, number | string | null>>> = {}
    
    selectedDiseases.forEach((disease) => {
      if (!grouped[disease]) return
      
      const years = Object.keys(grouped[disease]).map(y => parseInt(y)).sort()
      const diseaseData: Array<Record<string, number | string | null>> = []
      
      years.forEach((year, index) => {
        const entry: Record<string, number | string | null> = { year }
        
        selectedCountriesList.forEach((country) => {
          if (grouped[disease][year][country]) {
            const currentVaccinationRate = grouped[disease][year][country].vaccinationRate
            const currentCoverageRate = grouped[disease][year][country].coverageRate
            
            entry[`${country}_vaccinationRate`] = currentVaccinationRate
            entry[`${country}_coverageRate`] = currentCoverageRate
            
            // Calculate YoY if previous year exists
            if (index > 0 && grouped[disease][years[index - 1]][country]) {
              const prevVaccinationRate = grouped[disease][years[index - 1]][country].vaccinationRate
              const prevCoverageRate = grouped[disease][years[index - 1]][country].coverageRate
              
              const yoyVaccinationRate = prevVaccinationRate > 0 
                ? ((currentVaccinationRate - prevVaccinationRate) / prevVaccinationRate) * 100 
                : 0
              const yoyCoverageRate = prevCoverageRate > 0 
                ? ((currentCoverageRate - prevCoverageRate) / prevCoverageRate) * 100 
                : 0
              
              entry[`${country}_vaccinationRate_yoy`] = yoyVaccinationRate
              entry[`${country}_coverageRate_yoy`] = yoyCoverageRate
            }
          }
        })
        diseaseData.push(entry)
      })
      
      result[disease] = diseaseData
    })
    
    return result
  }, [filteredData, filters.country, filters.disease])

  // Get selected diseases
  const selectedDiseases = useMemo(() => {
    return filters.disease && filters.disease.length > 0 
      ? filters.disease 
      : [...new Set(filteredData.map(d => d.disease))].sort()
  }, [filteredData, filters.disease])

  // Single country: Combined graph data (vaccination rate + coverage rate) - separated by disease
  const combinedVaccinationTrendsDataByDisease = useMemo(() => {
    if (selectedCountries.length !== 1) return {}
    
    const country = selectedCountries[0]
    const result: Record<string, Array<{year: number | string, vaccinationRate: number, coverageRate: number, vaccinationRate_yoy: number | null, coverageRate_yoy: number | null}>> = {}
    
    selectedDiseases.forEach((disease) => {
      const diseaseData = vaccinationTrendsDataByDisease[disease] || []
      result[disease] = diseaseData.map((entry) => ({
        year: entry.year,
        vaccinationRate: entry[`${country}_vaccinationRate`] as number || 0,
        coverageRate: entry[`${country}_coverageRate`] as number || 0,
        vaccinationRate_yoy: entry[`${country}_vaccinationRate_yoy`] as number || null,
        coverageRate_yoy: entry[`${country}_coverageRate_yoy`] as number || null,
      }))
    })
    
    return result
  }, [vaccinationTrendsDataByDisease, selectedCountries, selectedDiseases])

  // Multiple countries: Vaccination Rate data with YoY - separated by disease
  const vaccinationRateTrendsDataByDisease = useMemo(() => {
    if (selectedCountries.length < 2) return {}
    
    const result: Record<string, Array<Record<string, number | string | null>>> = {}
    
    selectedDiseases.forEach((disease) => {
      const diseaseData = vaccinationTrendsDataByDisease[disease] || []
      if (diseaseData.length === 0) return
      
      const years = diseaseData.map(d => d.year).filter((v, i, a) => a.indexOf(v) === i).sort()
      result[disease] = years.map((year, index) => {
        const entry: Record<string, number | string | null> = { year }
        selectedCountries.forEach((country) => {
          const currentData = diseaseData.find(d => d.year === year)
          const value = currentData?.[`${country}_vaccinationRate`] as number || 0
          entry[country] = value
          
          // Calculate YoY if previous year exists
          if (index > 0) {
            const prevData = diseaseData.find(d => d.year === years[index - 1])
            const prevValue = prevData?.[`${country}_vaccinationRate`] as number || 0
            if (prevValue > 0) {
              entry[`${country}_yoy`] = ((value - prevValue) / prevValue) * 100
            } else {
              entry[`${country}_yoy`] = null
            }
          }
        })
        return entry
      })
    })
    
    return result
  }, [vaccinationTrendsDataByDisease, selectedCountries, selectedDiseases])

  // Multiple countries: Coverage Rate data with YoY - separated by disease
  const coverageRateTrendsDataByDisease = useMemo(() => {
    if (selectedCountries.length < 2) return {}
    
    const result: Record<string, Array<Record<string, number | string | null>>> = {}
    
    selectedDiseases.forEach((disease) => {
      const diseaseData = vaccinationTrendsDataByDisease[disease] || []
      if (diseaseData.length === 0) return
      
      const years = diseaseData.map(d => d.year).filter((v, i, a) => a.indexOf(v) === i).sort()
      result[disease] = years.map((year, index) => {
        const entry: Record<string, number | string | null> = { year }
        selectedCountries.forEach((country) => {
          const currentData = diseaseData.find(d => d.year === year)
          const value = currentData?.[`${country}_coverageRate`] as number || 0
          entry[country] = value
          
          // Calculate YoY if previous year exists
          if (index > 0) {
            const prevData = diseaseData.find(d => d.year === years[index - 1])
            const prevValue = prevData?.[`${country}_coverageRate`] as number || 0
            if (prevValue > 0) {
              entry[`${country}_yoy`] = ((value - prevValue) / prevValue) * 100
            } else {
              entry[`${country}_yoy`] = null
            }
          }
        })
        return entry
      })
    })
    
    return result
  }, [vaccinationTrendsDataByDisease, selectedCountries, selectedDiseases])

  // Get dataKeys for LineChart based on selected countries
  const combinedTrendsDataKeys = useMemo(() => {
    if (selectedCountries.length !== 1) return []
    return ['vaccinationRate', 'coverageRate']
  }, [selectedCountries])

  const vaccinationRateTrendsDataKeys = useMemo(() => {
    if (selectedCountries.length < 2) return []
    return selectedCountries
  }, [selectedCountries])

  const coverageRateTrendsDataKeys = useMemo(() => {
    if (selectedCountries.length < 2) return []
    return selectedCountries
  }, [selectedCountries])

  const updateFilter = (key: keyof FilterOptions, value: string[] | string | number[] | number | (string | number)[]) => {
    // Convert based on filter type: year needs numbers, others need strings
    let normalizedValue: any
    if (key === 'year') {
      normalizedValue = Array.isArray(value) 
        ? value.map(v => Number(v))
        : [Number(value)]
    } else {
      normalizedValue = Array.isArray(value) 
        ? value.map(v => String(v))
        : [String(value)]
    }
    
    const newFilters = { ...filters, [key]: normalizedValue }
    
    // Prevent clearing the last item in each filter category
    if (key === 'year' && Array.isArray(normalizedValue) && normalizedValue.length === 0 && uniqueOptions.years.length > 0) {
      const defaultYear = uniqueOptions.years.includes(2025) 
        ? 2025 
        : uniqueOptions.years[uniqueOptions.years.length - 1]
      newFilters.year = [defaultYear]
    } else if (key === 'disease' && Array.isArray(normalizedValue) && normalizedValue.length === 0 && uniqueOptions.diseases.length > 0) {
      newFilters.disease = [uniqueOptions.diseases[0]]
    } else if (key === 'country' && Array.isArray(normalizedValue) && normalizedValue.length === 0 && uniqueOptions.countries.length > 0) {
      newFilters.country = [uniqueOptions.countries[0]]
    }
    
    // Final safety check: If all filters are somehow empty, restore defaults
    const finalHasYear = newFilters.year && Array.isArray(newFilters.year) && newFilters.year.length > 0
    const finalHasDisease = newFilters.disease && Array.isArray(newFilters.disease) && newFilters.disease.length > 0
    const finalHasCountry = newFilters.country && Array.isArray(newFilters.country) && newFilters.country.length > 0
    
    if (!finalHasYear && uniqueOptions.years.length > 0) {
      const defaultYear = uniqueOptions.years.includes(2025) 
        ? 2025 
        : uniqueOptions.years[uniqueOptions.years.length - 1]
      newFilters.year = [defaultYear]
    }
    if (!finalHasDisease && uniqueOptions.diseases.length > 0) {
      newFilters.disease = [uniqueOptions.diseases[0]]
    }
    if (!finalHasCountry && uniqueOptions.countries.length > 0) {
      newFilters.country = [uniqueOptions.countries[0]]
    }
    
    setFilters(newFilters)
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('Home')}
          className="flex items-center gap-2 px-5 py-2.5 bg-electric-blue text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
        >
          <ArrowLeft size={20} />
          Back to Home
        </motion.button>
      </div>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <InfoTooltip content="• Provides insights into vaccination coverage and rates\n• Analyze data by country, disease, and year (granular view)\n• Use filters to explore vaccination performance\n• Charts show vaccination rate and coverage rate by country\n• Understand vaccination program effectiveness at country level">
          <h1 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-3 cursor-help">
            Vaccination Rate Analysis
          </h1>
        </InfoTooltip>
        <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark">
          Vaccination coverage and rate trends across countries and years
        </p>
      </motion.div>

      <DemoNotice />

      {/* Filters Section */}
      <div className={`p-8 rounded-2xl mb-8 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'}`}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
            <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Filter Data
            </h3>
          </div>
          <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
            Select year, disease(s), and country/countries to analyze. Changes will update all charts below.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <FilterDropdown
            label="Year"
            value={filters.year || []}
            onChange={(value) => updateFilter('year', value)}
            options={uniqueOptions.years}
          />
          <FilterDropdown
            label="Disease"
            value={filters.disease || []}
            onChange={(value) => updateFilter('disease', value)}
            options={uniqueOptions.diseases}
          />
          <FilterDropdown
            label="Country"
            value={filters.country || []}
            onChange={(value) => updateFilter('country', value)}
            options={uniqueOptions.countries}
          />
        </div>
        {/* Active Filters Display */}
        {((filters.year && filters.year.length > 0) || (filters.disease && filters.disease.length > 0) || (filters.country && filters.country.length > 0)) && (
          <div className="mt-6 pt-6 border-t-2 border-gray-300 dark:border-navy-light">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-navy-dark' : 'bg-blue-50'}`}>
              <p className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                Currently Viewing:
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Year:</span>
                  <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">{activeFiltersLabel.year}</span>
                </div>
                <div>
                  <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Disease:</span>
                  <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">{Array.isArray(activeFiltersLabel.diseases) ? activeFiltersLabel.diseases.join(', ') : activeFiltersLabel.diseases}</span>
                </div>
                <div>
                  <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Countries:</span>
                  <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">{activeFiltersLabel.countries}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="mb-10">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Key Metrics
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`p-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
            <StatBox
              title={kpis.avgVaccinationRate}
              subtitle="Average Vaccination Rate"
              icon={<Heart className="text-electric-blue dark:text-cyan-accent" size={28} />}
            />
          </div>
          <div className={`p-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
            <StatBox
              title={kpis.patientsVaccinated}
              subtitle="Patients Vaccinated"
              icon={<Heart className="text-electric-blue dark:text-cyan-accent" size={28} />}
            />
          </div>
          <div className={`p-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
            <StatBox
              title={kpis.avgCoverageRate}
              subtitle="Average Coverage Rate"
              icon={<Activity className="text-electric-blue dark:text-cyan-accent" size={28} />}
            />
          </div>
          <div className={`p-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
            <StatBox
              title={kpis.topDisease}
              subtitle="Top Disease"
              icon={<Activity className="text-electric-blue dark:text-cyan-accent" size={28} />}
            />
          </div>
        </div>
      </div>

      {/* Country-wise Granular Charts: Vaccination Rate by Country for each Disease */}
      {countryVaccinationRateByDisease.length > 0 && (
        <div className="mb-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
              <InfoTooltip content="• Shows vaccination rate (percentage vaccinated) by country for each disease\n• Grouped by year with country breakdown\n• Each year group shows bars for each country\n• Compare country-level vaccination rates across years\n• Identify countries with highest vaccination rates for each disease">
                <h2 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                  Vaccination Rate Analysis
                </h2>
              </InfoTooltip>
            </div>
            <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
              Vaccination rate grouped by year and country
            </p>
          </div>
          <div className={gridClass}>
            {countryVaccinationRateByDisease.map((chart) => (
              <div key={chart.disease} className={`p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${chartHeight} w-full flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {chart.disease} Vaccination Rate by Year & Country
                  </h3>
                  {selectedCountries.length > 0 && (
                    <p className={`text-lg font-semibold mt-2 px-4 py-2 rounded-lg inline-block ${isDark ? 'bg-navy-dark border-2 border-cyan-accent text-text-primary-dark' : 'bg-blue-50 border-2 border-electric-blue text-electric-blue'}`}>
                      Countries: {selectedCountries.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                  <GroupedBarChart
                    data={chart.data}
                    dataKey="vaccinationRate"
                    xAxisLabel="Year"
                    yAxisLabel="Vaccination Rate (%)"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Country-wise Granular Charts: Coverage Rate by Country for each Disease */}
      {countryCoverageRateByDisease.length > 0 && (
        <div className="mb-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
              <InfoTooltip content="• Shows coverage rate (program coverage) by country for each disease\n• Grouped by year with country breakdown\n• Each year group shows bars for each country\n• Compare country-level coverage rates across years\n• Identify countries with highest coverage rates for each disease">
                <h2 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                  Coverage Rate Analysis
                </h2>
              </InfoTooltip>
            </div>
            <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
              Coverage rate grouped by year and country
            </p>
          </div>
          <div className={gridClass}>
            {countryCoverageRateByDisease.map((chart) => (
              <div key={chart.disease} className={`p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${chartHeight} w-full flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {chart.disease} Coverage Rate by Year & Country
                  </h3>
                  {selectedCountries.length > 0 && (
                    <p className={`text-lg font-semibold mt-2 px-4 py-2 rounded-lg inline-block ${isDark ? 'bg-navy-dark border-2 border-cyan-accent text-text-primary-dark' : 'bg-blue-50 border-2 border-electric-blue text-electric-blue'}`}>
                      Countries: {selectedCountries.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                  <GroupedBarChart
                    data={chart.data}
                    dataKey="coverageRate"
                    xAxisLabel="Year"
                    yAxisLabel="Coverage Rate (%)"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Country-Disease Stacked Bar Charts */}
      <div className="mb-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
            <h2 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Country Overview
            </h2>
          </div>
          <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
            Country distribution with disease breakdown
          </p>
        </div>
        <div className={gridClass}>
          <div className={`p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${chartHeight} w-full flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Disease Distribution by Country
              </h3>
              <p className={`text-lg font-semibold mt-2 px-4 py-2 rounded-lg inline-block ${isDark ? 'bg-navy-dark border-2 border-cyan-accent text-text-primary-dark' : 'bg-blue-50 border-2 border-electric-blue text-electric-blue'}`}>
                Vaccination Rate Breakdown
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
              <CountryDiseaseStackedBarChart
                data={countryDiseaseVaccinationData}
                dataKey="vaccinationRate"
                xAxisLabel="Country"
                yAxisLabel="Vaccination Rate (%)"
              />
            </div>
          </div>
          <div className={`p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${chartHeight} w-full flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Disease Distribution by Country
              </h3>
              <p className={`text-lg font-semibold mt-2 px-4 py-2 rounded-lg inline-block ${isDark ? 'bg-navy-dark border-2 border-cyan-accent text-text-primary-dark' : 'bg-blue-50 border-2 border-electric-blue text-electric-blue'}`}>
                Coverage Rate Breakdown
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
              <CountryDiseaseStackedBarChart
                data={countryDiseaseCoverageData}
                dataKey="coverageRate"
                xAxisLabel="Country"
                yAxisLabel="Coverage Rate (%)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vaccination Rate Trends Over Time */}
      <div className="mb-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
            <InfoTooltip content="• Tracks vaccination rate and coverage rate trends over time\n• Single country: Combined graph with both metrics\n• Multiple countries: Separate graphs for each metric\n• YoY (Year-over-Year) percentage shown in tooltips\n• Identify trends and program effectiveness">
              <h2 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                Vaccination Trends Over Time
              </h2>
            </InfoTooltip>
          </div>
          <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
            {selectedCountries.length === 1 
              ? `Track vaccination trends for ${selectedCountries[0]} with vaccination rate and coverage rate on one graph`
              : `Track vaccination trends across ${selectedCountries.length} countries with separate graphs for vaccination rate and coverage rate`
            }
          </p>
        </div>
        
        {/* Single Country: Combined Graph - Separated by Disease */}
        {selectedCountries.length === 1 && Object.keys(combinedVaccinationTrendsDataByDisease).length > 0 && (
          <div className={gridClass}>
            {selectedDiseases.map((disease) => {
              const diseaseData = combinedVaccinationTrendsDataByDisease[disease] || []
              if (diseaseData.length === 0) return null
              
              return (
                <div key={disease} className={`p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${chartHeight} w-full flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                  <div className="mb-6">
                    <h3 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                      {selectedCountries[0]} - {disease} Vaccination Rate & Coverage Rate Trends
                    </h3>
                    <p className={`text-lg font-semibold mt-2 px-4 py-2 rounded-lg inline-block ${isDark ? 'bg-navy-dark border-2 border-cyan-accent text-text-primary-dark' : 'bg-blue-50 border-2 border-electric-blue text-electric-blue'}`}>
                      Disease: {disease}
                    </p>
                    <p className={`text-lg font-semibold mt-2 px-4 py-2 rounded-lg inline-block ml-2 ${isDark ? 'bg-navy-dark border-2 border-cyan-accent text-text-primary-dark' : 'bg-blue-50 border-2 border-electric-blue text-electric-blue'}`}>
                      Country: {selectedCountries[0]}
                    </p>
                    <p className="text-base text-gray-500 dark:text-gray-500 mt-2">
                      Hover over data points to see Year-over-Year (YoY) percentage changes
                    </p>
                  </div>
                  <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                    <LineChart
                      data={diseaseData}
                      dataKeys={combinedTrendsDataKeys}
                      nameKey="year"
                      colors={getChartColors(2)}
                      xAxisLabel="Year"
                      yAxisLabel="Rate (%)"
                      showCountry={selectedCountries}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Multiple Countries: Separate Graphs - Separated by Disease */}
        {selectedCountries.length >= 2 && (
          <div className={gridClass}>
            {selectedDiseases.map((disease) => {
              const vaccinationData = vaccinationRateTrendsDataByDisease[disease] || []
              const coverageData = coverageRateTrendsDataByDisease[disease] || []
              
              return (
                <div key={disease} className={gridClass}>
                  {/* Vaccination Rate Graph for this disease */}
                  {vaccinationData.length > 0 && (
                    <div className={`p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${chartHeight} w-full flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                      <div className="mb-6">
                        <h3 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                          {disease} - Vaccination Rate Trends by Country
                        </h3>
                        <p className={`text-lg font-semibold mt-2 px-4 py-2 rounded-lg inline-block ${isDark ? 'bg-navy-dark border-2 border-cyan-accent text-text-primary-dark' : 'bg-blue-50 border-2 border-electric-blue text-electric-blue'}`}>
                          Disease: {disease}
                        </p>
                        {selectedCountries.length > 0 && (
                          <p className={`text-lg font-semibold mt-2 px-4 py-2 rounded-lg inline-block ml-2 ${isDark ? 'bg-navy-dark border-2 border-cyan-accent text-text-primary-dark' : 'bg-blue-50 border-2 border-electric-blue text-electric-blue'}`}>
                            Countries: {selectedCountries.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                        <LineChart
                          data={vaccinationData}
                          dataKeys={vaccinationRateTrendsDataKeys}
                          nameKey="year"
                          colors={getChartColors(vaccinationRateTrendsDataKeys.length)}
                          xAxisLabel="Year"
                          yAxisLabel="Vaccination Rate (%)"
                          showCountry={selectedCountries}
                        />
                      </div>
                    </div>
                  )}

                  {/* Coverage Rate Graph for this disease */}
                  {coverageData.length > 0 && (
                    <div className={`p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${chartHeight} w-full flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                      <div className="mb-6">
                        <h3 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                          {disease} - Coverage Rate Trends by Country
                        </h3>
                        <p className={`text-lg font-semibold mt-2 px-4 py-2 rounded-lg inline-block ${isDark ? 'bg-navy-dark border-2 border-cyan-accent text-text-primary-dark' : 'bg-blue-50 border-2 border-electric-blue text-electric-blue'}`}>
                          Disease: {disease}
                        </p>
                        {selectedCountries.length > 0 && (
                          <p className={`text-lg font-semibold mt-2 px-4 py-2 rounded-lg inline-block ml-2 ${isDark ? 'bg-navy-dark border-2 border-cyan-accent text-text-primary-dark' : 'bg-blue-50 border-2 border-electric-blue text-electric-blue'}`}>
                            Countries: {selectedCountries.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                        <LineChart
                          data={coverageData}
                          dataKeys={coverageRateTrendsDataKeys}
                          nameKey="year"
                          colors={getChartColors(coverageRateTrendsDataKeys.length)}
                          xAxisLabel="Year"
                          yAxisLabel="Coverage Rate (%)"
                          showCountry={selectedCountries}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
