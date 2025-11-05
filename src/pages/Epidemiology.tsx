import { useState, useMemo } from 'react'
import { ArrowLeft, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { getData, filterDataframe, formatWithCommas, FilterOptions } from '../utils/dataGenerator'
import { StatBox } from '../components/StatBox'
import { FilterDropdown } from '../components/FilterDropdown'
import { PieChart } from '../components/PieChart'
import { LineChart } from '../components/LineChart'
import { GroupedBarChart } from '../components/GroupedBarChart'
import { CountryDiseaseStackedBarChart } from '../components/CountryDiseaseStackedBarChart'
import { DemoNotice } from '../components/DemoNotice'
import { useTheme } from '../context/ThemeContext'
import { InfoTooltip } from '../components/InfoTooltip'
import { getChartColors } from '../utils/chartColors'

interface EpidemiologyProps {
  onNavigate: (page: string) => void
}

export function Epidemiology({ onNavigate }: EpidemiologyProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const data = getData()
  
    // Set default filters: One year (2025), two diseases (Influenza and HPV), and 2 countries (USA and Canada) to prevent clustering
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
      region: [],
      incomeType: [],
      country: defaultCountries,
    }
  })

  const [openModal, setOpenModal] = useState<'prevalence' | 'incidence' | null>(null)

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

  // Helper to get active filter labels for display
  const activeFiltersLabel = useMemo(() => {
    const diseases = filters.disease && filters.disease.length > 0 
      ? filters.disease 
      : 'All Diseases'
    const countries = filters.country && filters.country.length > 0 
      ? filters.country.length === 1 
        ? filters.country[0]
        : filters.country.length <= 3
          ? filters.country.join(', ')
          : `${filters.country.length} Countries`
      : 'All Countries'
    const year = filters.year && filters.year.length > 0 
      ? filters.year.length === 1 
        ? String(filters.year[0])
        : `${filters.year.length} Years`
      : 'All Years'
    
    return { diseases, countries, year }
  }, [filters])

  const kpis = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        marketSize: 'N/A',
        totalPrevalence: 'N/A',
        totalIncidence: 'N/A',
        topDisease: 'N/A',
      }
    }

    const marketSize = filteredData.reduce((sum, d) => sum + (d.marketValueUsd / 1000), 0)
    const totalPrevalence = filteredData.reduce((sum, d) => sum + d.prevalence, 0)
    const totalIncidence = filteredData.reduce((sum, d) => sum + d.incidence, 0)
    const diseaseGroups = filteredData.reduce((acc: Record<string, number>, d) => {
      acc[d.disease] = (acc[d.disease] || 0) + d.prevalence
      return acc
    }, {})
    const topDisease = Object.entries(diseaseGroups).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    return {
      marketSize: `${formatWithCommas(marketSize)}M`,
      totalPrevalence: `${formatWithCommas(totalPrevalence / 1000)}K`,
      totalIncidence: `${formatWithCommas(totalIncidence / 1000)}K`,
      topDisease,
    }
  }, [filteredData])

  // Country-wise granular charts: Prevalence by Country for each Disease - Per Year
  const countryPrevalenceByDisease = useMemo(() => {
    const diseases = filters.disease && filters.disease.length > 0 
      ? filters.disease 
      : [...new Set(filteredData.map(d => d.disease))].sort()
    
    // Get selected countries or all countries in filtered data
    const selectedCountriesList = filters.country && filters.country.length > 0 
      ? filters.country 
      : [...new Set(filteredData.map(d => d.country))].sort()
    
    return diseases.map((disease) => {
      const diseaseData = filteredData.filter(d => d.disease === disease)
      
      // Group by year and country
      const dataByYearAndCountry = diseaseData
        .filter(d => selectedCountriesList.includes(d.country))
        .map((d) => ({
          year: d.year,
          country: d.country,
          prevalence: d.prevalence,
        }))
      
      return {
        disease,
        data: dataByYearAndCountry,
      }
    })
  }, [filteredData, filters.disease, filters.country])

  // Country-wise granular charts: Incidence by Country for each Disease - Per Year
  const countryIncidenceByDisease = useMemo(() => {
    const diseases = filters.disease && filters.disease.length > 0 
      ? filters.disease 
      : [...new Set(filteredData.map(d => d.disease))].sort()
    
    // Get selected countries or all countries in filtered data
    const selectedCountriesList = filters.country && filters.country.length > 0 
      ? filters.country 
      : [...new Set(filteredData.map(d => d.country))].sort()
    
    return diseases.map((disease) => {
      const diseaseData = filteredData.filter(d => d.disease === disease)
      
      // Group by year and country
      const dataByYearAndCountry = diseaseData
        .filter(d => selectedCountriesList.includes(d.country))
        .map((d) => ({
          year: d.year,
          country: d.country,
          incidence: d.incidence,
        }))
      
      return {
        disease,
        data: dataByYearAndCountry,
      }
    })
  }, [filteredData, filters.disease, filters.country])

  // Country-Disease Stacked Bar Chart: Prevalence by Country with Diseases stacked
  const countryDiseasePrevalenceData = useMemo(() => {
    return filteredData.map((d) => ({
      country: d.country,
      disease: d.disease,
      prevalence: d.prevalence,
    }))
  }, [filteredData])

  // Country-Disease Stacked Bar Chart: Incidence by Country with Diseases stacked
  const countryDiseaseIncidenceData = useMemo(() => {
    return filteredData.map((d) => ({
      country: d.country,
      disease: d.disease,
      incidence: d.incidence,
    }))
  }, [filteredData])

  // Case Burden Graph: Prevalence and Incidence Trends Over Time - Country-wise breakdown, separated by disease
  // Single country: Combined graph with both prevalence and incidence
  // Multiple countries: Separate graphs for prevalence and incidence
  // NOTE: Now separated by disease - each disease gets its own YoY graph
  const caseBurdenDataByDisease = useMemo(() => {
    const selectedCountriesList = filters.country && filters.country.length > 0 
      ? filters.country 
      : [...new Set(filteredData.map(d => d.country))].sort()
    const selectedDiseases = filters.disease && filters.disease.length > 0 
      ? filters.disease 
      : [...new Set(filteredData.map(d => d.disease))].sort()
    
    // Group by disease, year, and country
    const grouped: Record<string, Record<number, Record<string, { prevalence: number; incidence: number }>>> = {}
    
    filteredData.forEach((d) => {
      if (!grouped[d.disease]) {
        grouped[d.disease] = {}
      }
      if (!grouped[d.disease][d.year]) {
        grouped[d.disease][d.year] = {}
      }
      if (!grouped[d.disease][d.year][d.country]) {
        grouped[d.disease][d.year][d.country] = { prevalence: 0, incidence: 0 }
      }
      if (selectedCountriesList.includes(d.country) && selectedDiseases.includes(d.disease)) {
        grouped[d.disease][d.year][d.country].prevalence += d.prevalence
        grouped[d.disease][d.year][d.country].incidence += d.incidence
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
            const currentPrevalence = grouped[disease][year][country].prevalence
            const currentIncidence = grouped[disease][year][country].incidence
            
            entry[`${country}_prevalence`] = currentPrevalence
            entry[`${country}_incidence`] = currentIncidence
            
            // Calculate YoY if previous year exists
            if (index > 0 && grouped[disease][years[index - 1]][country]) {
              const prevPrevalence = grouped[disease][years[index - 1]][country].prevalence
              const prevIncidence = grouped[disease][years[index - 1]][country].incidence
              
              const yoyPrevalence = prevPrevalence > 0 
                ? ((currentPrevalence - prevPrevalence) / prevPrevalence) * 100 
                : 0
              const yoyIncidence = prevIncidence > 0 
                ? ((currentIncidence - prevIncidence) / prevIncidence) * 100 
                : 0
              
              entry[`${country}_prevalence_yoy`] = yoyPrevalence
              entry[`${country}_incidence_yoy`] = yoyIncidence
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

  // Single country: Combined graph data (prevalence + incidence) - separated by disease
  const combinedCaseBurdenDataByDisease = useMemo(() => {
    if (selectedCountries.length !== 1) return {}
    
    const country = selectedCountries[0]
    const result: Record<string, Array<{year: number | string, prevalence: number, incidence: number, prevalence_yoy: number | null, incidence_yoy: number | null}>> = {}
    
    selectedDiseases.forEach((disease) => {
      const diseaseData = caseBurdenDataByDisease[disease] || []
      result[disease] = diseaseData.map((entry) => ({
        year: entry.year as number | string,
        prevalence: entry[`${country}_prevalence`] as number || 0,
        incidence: entry[`${country}_incidence`] as number || 0,
        prevalence_yoy: entry[`${country}_prevalence_yoy`] as number || null,
        incidence_yoy: entry[`${country}_incidence_yoy`] as number || null,
      }))
    })
    
    return result
  }, [caseBurdenDataByDisease, selectedCountries, selectedDiseases])

  // Multiple countries: Prevalence data with YoY - separated by disease
  const prevalenceCaseBurdenDataByDisease = useMemo(() => {
    if (selectedCountries.length < 2) return {}
    
    const result: Record<string, Array<Record<string, number | string | null>>> = {}
    
    selectedDiseases.forEach((disease) => {
      const diseaseData = caseBurdenDataByDisease[disease] || []
      if (diseaseData.length === 0) return
      
      const years = diseaseData.map(d => d.year).filter((v, i, a) => a.indexOf(v) === i).sort()
      result[disease] = years.map((year, index) => {
        const entry: Record<string, number | string | null> = { year }
        selectedCountries.forEach((country) => {
          const currentData = diseaseData.find(d => d.year === year)
          const value = currentData?.[`${country}_prevalence`] as number || 0
          entry[country] = value
          
          // Calculate YoY if previous year exists
          if (index > 0) {
            const prevData = diseaseData.find(d => d.year === years[index - 1])
            const prevValue = prevData?.[`${country}_prevalence`] as number || 0
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
  }, [caseBurdenDataByDisease, selectedCountries, selectedDiseases])

  // Multiple countries: Incidence data with YoY - separated by disease
  const incidenceCaseBurdenDataByDisease = useMemo(() => {
    if (selectedCountries.length < 2) return {}
    
    const result: Record<string, Array<Record<string, number | string | null>>> = {}
    
    selectedDiseases.forEach((disease) => {
      const diseaseData = caseBurdenDataByDisease[disease] || []
      if (diseaseData.length === 0) return
      
      const years = diseaseData.map(d => d.year).filter((v, i, a) => a.indexOf(v) === i).sort()
      result[disease] = years.map((year, index) => {
        const entry: Record<string, number | string | null> = { year }
        selectedCountries.forEach((country) => {
          const currentData = diseaseData.find(d => d.year === year)
          const value = currentData?.[`${country}_incidence`] as number || 0
          entry[country] = value
          
          // Calculate YoY if previous year exists
          if (index > 0) {
            const prevData = diseaseData.find(d => d.year === years[index - 1])
            const prevValue = prevData?.[`${country}_incidence`] as number || 0
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
  }, [caseBurdenDataByDisease, selectedCountries, selectedDiseases])

  // Get dataKeys for LineChart based on selected countries
  const combinedLineChartDataKeys = useMemo(() => {
    if (selectedCountries.length !== 1) return []
    return ['prevalence', 'incidence']
  }, [selectedCountries])

  const prevalenceLineChartDataKeys = useMemo(() => {
    if (selectedCountries.length < 2) return []
    return selectedCountries
  }, [selectedCountries])

  const incidenceLineChartDataKeys = useMemo(() => {
    if (selectedCountries.length < 2) return []
    return selectedCountries
  }, [selectedCountries])

  const prevalencePieData = useMemo(() => {
    const grouped = filteredData.reduce((acc: Record<string, number>, d) => {
      acc[d.disease] = (acc[d.disease] || 0) + d.prevalence
      return acc
    }, {})
    const total = Object.values(grouped).reduce((sum, val) => sum + val, 0)
    return Object.entries(grouped)
      .map(([disease, prevalence]) => ({
        disease,
        value: prevalence,
        percent: total > 0 ? ((prevalence / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.value - a.value)
  }, [filteredData])

  const incidencePieData = useMemo(() => {
    const grouped = filteredData.reduce((acc: Record<string, number>, d) => {
      acc[d.disease] = (acc[d.disease] || 0) + d.incidence
      return acc
    }, {})
    const total = Object.values(grouped).reduce((sum, val) => sum + val, 0)
    return Object.entries(grouped)
      .map(([disease, incidence]) => ({
        disease,
        value: incidence,
        percent: total > 0 ? ((incidence / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.value - a.value)
  }, [filteredData])

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
    
    // Ensure at least one filter is always selected (minimum 1 year, 1 disease, 1 country)
    const newFilters = { ...filters, [key]: normalizedValue }
    
    // Prevent clearing the last item in each filter category
    if (key === 'year' && Array.isArray(normalizedValue) && normalizedValue.length === 0 && uniqueOptions.years.length > 0) {
      // Keep at least the last year (2025 or most recent)
      const defaultYear = uniqueOptions.years.includes(2025) 
        ? 2025 
        : uniqueOptions.years[uniqueOptions.years.length - 1]
      newFilters.year = [defaultYear]
    } else if (key === 'disease' && Array.isArray(normalizedValue) && normalizedValue.length === 0 && uniqueOptions.diseases.length > 0) {
      // Keep at least the first disease
      newFilters.disease = [uniqueOptions.diseases[0]]
    } else if (key === 'country' && Array.isArray(normalizedValue) && normalizedValue.length === 0 && uniqueOptions.countries.length > 0) {
      // Keep at least the first country
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
        <InfoTooltip content="• Provides insights into disease prevalence and incidence rates\n• Analyze data by country and disease (granular view)\n• Use filters to explore trends and compare diseases\n• Charts show prevalence (existing cases) and incidence (new cases) by country\n• Understand disease burden at country level">
          <h1 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-3 cursor-help">
            Epidemiology Analysis
          </h1>
        </InfoTooltip>
        <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark">
          Disease prevalence and incidence trends across countries and years
        </p>
      </motion.div>

      <DemoNotice />

      {/* Filters Section - More Prominent */}
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
        {/* Active Filters Display - More Prominent */}
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

      {/* KPI Cards Section */}
      <div className="mb-10">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Key Metrics
            </h2>
          </div>
          <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
            Summary statistics based on your selected filters
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`p-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
            <StatBox
              title={kpis.totalPrevalence}
              subtitle="Total Prevalence (000s)"
              icon={<Activity className="text-electric-blue dark:text-cyan-accent" size={28} />}
              progress={0.75}
              onCircleClick={() => setOpenModal('prevalence')}
            />
          </div>
          <div className={`p-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
            <StatBox
              title={kpis.totalIncidence}
              subtitle="Total Incidence (000s)"
              icon={<Activity className="text-electric-blue dark:text-cyan-accent" size={28} />}
              progress={0.70}
              onCircleClick={() => setOpenModal('incidence')}
            />
          </div>
          <div className={`p-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
            <StatBox
              title={kpis.topDisease}
              subtitle="Disease with largest population"
              icon={<Activity className="text-electric-blue dark:text-cyan-accent" size={28} />}
            />
          </div>
          <div className={`p-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
            <StatBox
              title={kpis.marketSize}
              subtitle="Market Size (US$ Million)"
              icon={<Activity className="text-electric-blue dark:text-cyan-accent" size={28} />}
            />
          </div>
        </div>
      </div>

      {/* Country-wise Granular Charts: Prevalence by Country for each Disease */}
      {countryPrevalenceByDisease.length > 0 && (
        <div className="mb-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
              <InfoTooltip content="• Shows prevalence (existing cases) by country for each disease\n• Grouped by year with country breakdown\n• Each year group shows bars for each country\n• Compare country-level prevalence patterns across years\n• Identify countries with highest prevalence for each disease">
                <h2 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                  Prevalence Analysis
                </h2>
              </InfoTooltip>
            </div>
            <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
              Existing cases grouped by year and country
            </p>
          </div>
          <div className={gridClass}>
            {countryPrevalenceByDisease.map((chart) => (
              <div key={chart.disease} className={`p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${chartHeight} w-full flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {chart.disease} Prevalence by Year & Country
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
                    dataKey="prevalence"
                    xAxisLabel="Year"
                    yAxisLabel="Prevalence"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Country-wise Granular Charts: Incidence by Country for each Disease */}
      {countryIncidenceByDisease.length > 0 && (
        <div className="mb-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
              <InfoTooltip content="• Shows incidence (new cases) by country for each disease\n• Grouped by year with country breakdown\n• Each year group shows bars for each country\n• Compare country-level incidence patterns across years\n• Identify countries with highest incidence for each disease">
                <h2 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                  Incidence Analysis
                </h2>
              </InfoTooltip>
            </div>
            <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
              New cases grouped by year and country
            </p>
          </div>
          <div className={gridClass}>
            {countryIncidenceByDisease.map((chart) => (
              <div key={chart.disease} className={`p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${chartHeight} w-full flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {chart.disease} Incidence by Year & Country
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
                    dataKey="incidence"
                    xAxisLabel="Year"
                    yAxisLabel="Incidence"
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
                Prevalence Breakdown
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
              <CountryDiseaseStackedBarChart
                data={countryDiseasePrevalenceData}
                dataKey="prevalence"
                xAxisLabel="Country"
                yAxisLabel="Prevalence"
              />
            </div>
          </div>
          <div className={`p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${chartHeight} w-full flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Disease Distribution by Country
              </h3>
              <p className={`text-lg font-semibold mt-2 px-4 py-2 rounded-lg inline-block ${isDark ? 'bg-navy-dark border-2 border-cyan-accent text-text-primary-dark' : 'bg-blue-50 border-2 border-electric-blue text-electric-blue'}`}>
                Incidence Breakdown
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
              <CountryDiseaseStackedBarChart
                data={countryDiseaseIncidenceData}
                dataKey="incidence"
                xAxisLabel="Country"
                yAxisLabel="Incidence"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Case Burden Trends */}
      <div className="mb-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
            <InfoTooltip content="• Tracks prevalence and incidence trends over time\n• Single country: Combined graph with both metrics\n• Multiple countries: Separate graphs for each metric\n• YoY (Year-over-Year) percentage shown in tooltips\n• Identify trends, seasonal patterns, and outbreaks">
              <h2 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                Case Burden Trends Over Time
              </h2>
            </InfoTooltip>
          </div>
          <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
            {selectedCountries.length === 1 
              ? `Track disease burden trends for ${selectedCountries[0]} with prevalence and incidence on one graph`
              : `Track disease burden trends across ${selectedCountries.length} countries with separate graphs for prevalence and incidence`
            }
          </p>
        </div>
        
        {/* Single Country: Combined Graph - Separated by Disease */}
        {selectedCountries.length === 1 && Object.keys(combinedCaseBurdenDataByDisease).length > 0 && (
          <div className={gridClass}>
            {selectedDiseases.map((disease) => {
              const diseaseData = combinedCaseBurdenDataByDisease[disease] || []
              if (diseaseData.length === 0) return null
              
              return (
                <div key={disease} className={`p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${chartHeight} w-full flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                  <div className="mb-6">
                    <h3 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                      {selectedCountries[0]} - {disease} Prevalence & Incidence Trends
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
                      dataKeys={combinedLineChartDataKeys}
                      nameKey="year"
                      colors={getChartColors(2)}
                      xAxisLabel="Year"
                      yAxisLabel="Cases"
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
              const prevalenceData = prevalenceCaseBurdenDataByDisease[disease] || []
              const incidenceData = incidenceCaseBurdenDataByDisease[disease] || []
              
              return (
                <div key={disease} className={gridClass}>
                  {/* Prevalence Graph for this disease */}
                  {prevalenceData.length > 0 && (
                    <div className={`p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${chartHeight} w-full flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                      <div className="mb-6">
                        <h3 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                          {disease} - Prevalence Trends by Country
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
                          data={prevalenceData}
                          dataKeys={prevalenceLineChartDataKeys}
                          nameKey="year"
                          colors={getChartColors(prevalenceLineChartDataKeys.length)}
                          xAxisLabel="Year"
                          yAxisLabel="Prevalence"
                          showCountry={selectedCountries}
                        />
                      </div>
                    </div>
                  )}

                  {/* Incidence Graph for this disease */}
                  {incidenceData.length > 0 && (
                    <div className={`p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${chartHeight} w-full flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                      <div className="mb-6">
                        <h3 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                          {disease} - Incidence Trends by Country
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
                          data={incidenceData}
                          dataKeys={incidenceLineChartDataKeys}
                          nameKey="year"
                          colors={getChartColors(incidenceLineChartDataKeys.length)}
                          xAxisLabel="Year"
                          yAxisLabel="Incidence"
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


      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`max-w-2xl w-full rounded-lg p-6 ${isDark ? 'bg-navy-card' : 'bg-white'}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                {openModal === 'prevalence' ? 'Total Prevalence by Disease' : 'Total Incidence by Disease'}
              </h2>
              <button
                onClick={() => setOpenModal(null)}
                className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
              >
                ✕
              </button>
            </div>
            <div className="h-[500px]">
              <PieChart
                data={openModal === 'prevalence' ? prevalencePieData : incidencePieData}
                dataKey="value"
                nameKey="disease"
                colors={getChartColors(10)}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

