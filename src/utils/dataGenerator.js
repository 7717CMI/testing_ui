// Generate vaccine market data similar to Python implementation
const generateComprehensiveData = () => {
  const years = Array.from({ length: 15 }, (_, i) => 2021 + i);
  const regions = ["North America", "Europe", "APAC", "Latin America", "Middle East", "Africa"];
  
  const diseases = ["HBV", "Herpes", "TCV", "HPV", "Influenza", "Pneumococcal", "MMR", "Rotavirus", 
                   "Meningococcal", "Varicella"];
  
  const brandMap = {
    "HBV": ["Engerix-B", "Heplisav-B", "Recombivax HB", "Twinrix"],
    "Herpes": ["Shingrix", "Zostavax"],
    "TCV": ["Typbar TCV", "Typhim Vi", "Vivotif"],
    "HPV": ["Gardasil 9", "Cervarix"],
    "Influenza": ["Fluzone", "Flucelvax", "FluMist", "Fluad"],
    "Pneumococcal": ["Prevnar 13", "Prevnar 20", "Pneumovax 23", "Synflorix"],
    "MMR": ["M-M-R II", "Priorix"],
    "Rotavirus": ["RotaTeq", "Rotarix"],
    "Meningococcal": ["Bexsero", "Trumenba", "MenACWY"],
    "Varicella": ["Varivax", "ProQuad"]
  };
  
  const companies = ["Pfizer", "GSK", "Merck", "Sanofi", "AstraZeneca", "Moderna", "Bharat Biotech", 
                     "Serum Institute"];
  
  const countryIncomeMap = {
    "North America": {
      "USA": "High Income", "Canada": "High Income", "Mexico": "Middle Income"
    },
    "Europe": {
      "Germany": "High Income", "UK": "High Income", "France": "High Income", 
      "Spain": "High Income", "Italy": "High Income", "Poland": "Middle Income",
      "Romania": "Middle Income"
    },
    "APAC": {
      "Japan": "High Income", "Australia": "High Income", "Singapore": "High Income",
      "China": "Middle Income", "India": "Middle Income", "Thailand": "Middle Income",
      "Pakistan": "Low Income", "Bangladesh": "Low Income", "Nepal": "Low Income"
    },
    "Latin America": {
      "Brazil": "Middle Income", "Argentina": "Middle Income", "Chile": "Middle Income", 
      "Colombia": "Middle Income", "Peru": "Middle Income"
    },
    "Middle East": {
      "UAE": "High Income", "Saudi Arabia": "High Income", "Israel": "High Income", 
      "Egypt": "Middle Income", "Iraq": "Middle Income"
    },
    "Africa": {
      "South Africa": "Middle Income", "Nigeria": "Low Income", "Kenya": "Low Income", 
      "Ethiopia": "Low Income", "Ghana": "Low Income"
    }
  };
  
  const ageGroups = ["Pediatric", "Adult", "Elderly", "All Ages"];
  const roaTypes = ["IM", "SC", "Oral", "Intranasal"];
  const fdfTypes = ["Vial", "Prefilled Syringe", "Multi-dose Vial", "Oral Solution"];
  const procurementTypes = ["UNICEF", "GAVI", "PAHO", "Hospital", "Private Clinic", "Government"];
  
  const data = [];
  let recordId = 100000;
  
  // Use a seeded random function for consistency
  let seed = 42;
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  for (const year of years) {
    for (const region of regions) {
      for (const [country, incomeType] of Object.entries(countryIncomeMap[region])) {
        for (const disease of diseases) {
          const brands = brandMap[disease];
          for (const brand of brands) {
            for (const ageGroup of ageGroups) {
              for (const gender of ["Male", "Female"]) {
                // Further scaled down values (divided by 10) to get 220M instead of 2200M
                const prevalence = Math.floor((1 + seededRandom() * 49) * (1 + (year - 2021) * 0.05));
                const incidence = Math.floor((2 + seededRandom() * 78) * (1 + (year - 2021) * 0.03));
                const vaccinationRate = 5 + seededRandom() * 90;
                const price = 2 + seededRandom() * 148; // Price range 2-150 USD
                const priceElasticity = 5 + seededRandom() * 45;
                const volumeUnits = Math.floor(1 + seededRandom() * 199); // Volume reduced
                const revenue = price * volumeUnits; // Revenue reduced
                const marketValueUsd = revenue * (0.8 + seededRandom() * 0.4); // Market value reduced
                const marketSharePct = 1 + seededRandom() * 24;
                const cagr = -2 + seededRandom() * 17; // CAGR in percentage
                const yoyGrowth = -5 + seededRandom() * 25; // YoY in percentage
                const qty = Math.floor(1 + seededRandom() * 99); // Quantity reduced
                
                const roa = roaTypes[Math.floor(seededRandom() * roaTypes.length)];
                const fdf = fdfTypes[Math.floor(seededRandom() * fdfTypes.length)];
                const procurement = procurementTypes[Math.floor(seededRandom() * procurementTypes.length)];
                const company = companies[Math.floor(seededRandom() * companies.length)];
                
                data.push({
                  recordId,
                  year,
                  region,
                  country,
                  incomeType,
                  disease,
                  market: disease,
                  brand,
                  company,
                  ageGroup,
                  gender,
                  segment: ["Gender", "Brand", "Age", "ROA", "FDF"][Math.floor(seededRandom() * 5)],
                  segmentBy: ["male", "female", brand, ageGroup][Math.floor(seededRandom() * 4)],
                  roa,
                  fdf,
                  formulation: fdf,
                  procurement,
                  publicPrivate: ["UNICEF", "GAVI", "PAHO", "Government"].includes(procurement) ? "Public" : "Private",
                  prevalence,
                  incidence,
                  vaccinationRate: Math.round(vaccinationRate * 100) / 100,
                  coverageRate: Math.round(vaccinationRate * (0.8 + seededRandom() * 0.3) * 100) / 100,
                  price: Math.round(price * 100) / 100,
                  priceElasticity: Math.round(priceElasticity * 100) / 100,
                  priceClass: price > 50 ? "Premium" : (price > 20 ? "Standard" : "Budget"),
                  volumeUnits,
                  qty,
                  revenue: Math.round(revenue * 100) / 100,
                  marketValueUsd: Math.round(marketValueUsd * 100) / 100,
                  value: Math.round(marketValueUsd * 100) / 100,
                  marketSharePct: Math.round(marketSharePct * 100) / 100,
                  share: Math.round(marketSharePct * 100) / 100,
                  cagr: Math.round(cagr * 100) / 100,
                  yoyGrowth: Math.round(yoyGrowth * 100) / 100,
                  yoy: Math.round(yoyGrowth * 100) / 100,
                  efficacyPct: Math.round((60 + seededRandom() * 38) * 100) / 100,
                });
                
                recordId++;
              }
            }
          }
        }
      }
    }
  }
  
  return data;
};

// Cache the data
let dataCache = null;

export const getData = () => {
  if (!dataCache) {
    console.log("[INFO] Generating vaccine market data...");
    try {
      dataCache = generateComprehensiveData();
      console.log(`[OK] Generated ${dataCache.length.toLocaleString()} records`);
    } catch (error) {
      console.error("[ERROR] Failed to generate data:", error);
      // Return empty array if generation fails
      dataCache = [];
    }
  }
  return dataCache;
};

export const filterDataframe = (data, filters) => {
  let filtered = [...data];
  
  for (const [field, values] of Object.entries(filters)) {
    if (values && values.length > 0) {
      filtered = filtered.filter(item => values.includes(item[field]));
    }
  }
  
  return filtered;
};

export const formatNumber = (num) => {
  if (num >= 1_000_000_000) {
    const formatted = (num / 1_000_000_000).toFixed(1);
    return `${parseFloat(formatted).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B`;
  } else if (num >= 1_000_000) {
    const formatted = (num / 1_000_000).toFixed(1);
    return `${parseFloat(formatted).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  } else if (num >= 1_000) {
    const formatted = (num / 1_000).toFixed(1);
    return `${parseFloat(formatted).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}K`;
  }
  return Math.round(num).toLocaleString('en-US');
};

// Function to format with suffix and commas (for KPIs)
export const formatWithCommas = (num, decimals = 1) => {
  const value = parseFloat(num.toFixed(decimals));
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

// Function to add comma separators to any number
export const addCommas = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return num;
  }
  return Number(num).toLocaleString('en-US', { maximumFractionDigits: 2 });
};

