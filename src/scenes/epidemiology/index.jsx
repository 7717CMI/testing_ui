import React, { useState, useMemo } from 'react';
import { Box, Grid, Button, useTheme, Dialog, DialogTitle, DialogContent, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import FilterDropdown from "../../components/FilterDropdown";
import BarChart from "../../components/BarChart";
import PieChart from "../../components/PieChart";
import LineChart from "../../components/LineChart";
import DemoNotice from "../../components/DemoNotice";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import { getData, filterDataframe, formatWithCommas } from "../../utils/dataGenerator";

function Epidemiology() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  
  const data = getData();
  
  const [filters, setFilters] = useState({
    year: [],
    disease: [],
    region: [],
    incomeType: [],
    country: [],
  });

  const [openModal, setOpenModal] = useState(null); // 'prevalence' or 'incidence' or null

  const filteredData = useMemo(() => {
    return filterDataframe(data, {
      year: filters.year,
      disease: filters.disease,
      region: filters.region,
      incomeType: filters.incomeType,
      country: filters.country,
    });
  }, [data, filters]);

  const uniqueOptions = useMemo(() => {
    return {
      years: [...new Set(data.map(d => d.year))].sort(),
      diseases: [...new Set(data.map(d => d.disease))].sort(),
      regions: [...new Set(data.map(d => d.region))].sort(),
      incomeTypes: [...new Set(data.map(d => d.incomeType))].sort(),
      countries: [...new Set(data.map(d => d.country))].sort(),
    };
  }, [data]);

  const kpis = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        marketSize: "N/A",
        totalPrevalence: "N/A",
        totalIncidence: "N/A",
        topDisease: "N/A",
      };
    }

    // Market Size in US$ Million
    const marketSize = filteredData.reduce((sum, d) => sum + (d.marketValueUsd / 1000), 0); // Convert to millions
    const totalPrevalence = filteredData.reduce((sum, d) => sum + d.prevalence, 0);
    const totalIncidence = filteredData.reduce((sum, d) => sum + d.incidence, 0);
    const diseaseGroups = filteredData.reduce((acc, d) => {
      acc[d.disease] = (acc[d.disease] || 0) + d.prevalence;
      return acc;
    }, {});
    const topDisease = Object.entries(diseaseGroups).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return {
      marketSize: `${formatWithCommas(marketSize)}M`,
      totalPrevalence: `${formatWithCommas(totalPrevalence / 1000)}K`, // In thousands
      totalIncidence: `${formatWithCommas(totalIncidence / 1000)}K`, // In thousands
      topDisease,
    };
  }, [filteredData]);

  const chartData1 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      acc[d.disease] = (acc[d.disease] || 0) + d.prevalence;
      return acc;
    }, {});
    return Object.entries(grouped).map(([disease, prevalence]) => ({
      disease,
      prevalence,
    })).sort((a, b) => b.prevalence - a.prevalence);
  }, [filteredData]);

  const chartData2 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      acc[d.region] = (acc[d.region] || 0) + d.incidence;
      return acc;
    }, {});
    return Object.entries(grouped).map(([region, incidence]) => ({
      region,
      incidence,
    }));
  }, [filteredData]);

  const chartData3 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      if (!acc[d.year]) {
        acc[d.year] = { prevalence: 0, incidence: 0 };
      }
      acc[d.year].prevalence += d.prevalence;
      acc[d.year].incidence += d.incidence;
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([year, values]) => ({
        year: parseInt(year),
        prevalence: values.prevalence,
        incidence: values.incidence,
      }))
      .sort((a, b) => a.year - b.year);
  }, [filteredData]);

  // Pie chart data for disease breakdown by prevalence
  const prevalencePieData = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      acc[d.disease] = (acc[d.disease] || 0) + d.prevalence;
      return acc;
    }, {});
    const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);
    return Object.entries(grouped)
      .map(([disease, prevalence]) => ({
        disease,
        value: prevalence,
        percent: total > 0 ? ((prevalence / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // Pie chart data for disease breakdown by incidence
  const incidencePieData = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      acc[d.disease] = (acc[d.disease] || 0) + d.incidence;
      return acc;
    }, {});
    const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);
    return Object.entries(grouped)
      .map(([disease, incidence]) => ({
        disease,
        value: incidence,
        percent: total > 0 ? ((incidence / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
            "&:hover": {
              backgroundColor: colors.blueAccent[800],
            },
          }}
        >
          Back to Home
        </Button>
      </Box>

      <Header title="Epidemiology Analysis" subtitle="Disease prevalence and incidence trends" />

      <DemoNotice />

      {/* Filters */}
      <Box
        sx={{
          backgroundColor: colors.primary[400],
          padding: "20px",
          borderRadius: "8px",
          mb: "20px",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown
              label="Year"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              options={uniqueOptions.years}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown
              label="Disease"
              value={filters.disease}
              onChange={(e) => setFilters({ ...filters, disease: e.target.value })}
              options={uniqueOptions.diseases}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown
              label="Region"
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              options={uniqueOptions.regions}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown
              label="Income Type"
              value={filters.incomeType}
              onChange={(e) => setFilters({ ...filters, incomeType: e.target.value })}
              options={uniqueOptions.incomeTypes}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown
              label="Country"
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              options={uniqueOptions.countries}
            />
          </Grid>
        </Grid>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: "20px" }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              backgroundColor: colors.primary[400],
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <StatBox
              title={kpis.marketSize}
              subtitle="Market Size (US$ Million)"
              icon={<LocalHospitalOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
              progress={null}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              backgroundColor: colors.primary[400],
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <StatBox
              title={kpis.totalPrevalence}
              subtitle="Total Prevalence (000s)"
              icon={<LocalHospitalOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
              progress="0.75"
              onCircleClick={() => setOpenModal('prevalence')}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              backgroundColor: colors.primary[400],
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <StatBox
              title={kpis.totalIncidence}
              subtitle="Total Incidence (000s)"
              icon={<LocalHospitalOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
              progress="0.70"
              onCircleClick={() => setOpenModal('incidence')}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              backgroundColor: colors.primary[400],
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <StatBox
              title={kpis.topDisease}
              subtitle="Top Disease"
              icon={<LocalHospitalOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
              progress={null}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: colors.primary[400],
              padding: "20px",
              borderRadius: "8px",
              height: "400px",
            }}
          >
            <BarChart
              data={chartData1}
              dataKey="prevalence"
              nameKey="disease"
              color={colors.blueAccent[500]}
              xAxisLabel="Vaccine Type"
              yAxisLabel="Number of People (in thousands)"
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: colors.primary[400],
              padding: "20px",
              borderRadius: "8px",
              height: "400px",
            }}
          >
            <PieChart
              data={chartData2}
              dataKey="incidence"
              nameKey="region"
              title="Incidence by Region (% Distribution)"
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              backgroundColor: colors.primary[400],
              padding: "20px",
              borderRadius: "8px",
              height: "400px",
            }}
          >
            <LineChart
              data={chartData3}
              dataKeys={["prevalence", "incidence"]}
              nameKey="year"
              colors={[colors.blueAccent[500], colors.greenAccent[500]]}
              xAxisLabel="Year"
              yAxisLabel="Number of Cases"
            />
          </Box>
        </Grid>
      </Grid>

      {/* Pie Chart Modal for Disease Breakdown */}
      <Dialog
        open={openModal !== null}
        onClose={() => setOpenModal(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.mode === "dark" ? colors.primary[400] : "#ffffff",
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          color: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
          pb: 1
        }}>
          <Typography variant="h4" fontWeight="bold" sx={{ 
            color: theme.palette.mode === "dark" ? "#ffffff" : "#000000" 
          }}>
            {openModal === 'prevalence' ? 'Total Prevalence by Disease' : 'Total Incidence by Disease'}
          </Typography>
          <IconButton 
            onClick={() => setOpenModal(null)}
            sx={{ color: theme.palette.mode === "dark" ? "#ffffff" : "#000000" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: "500px", mt: 2 }}>
            <PieChart
              data={openModal === 'prevalence' ? prevalencePieData : incidencePieData}
              dataKey="value"
              nameKey="disease"
              colors={[
                colors.blueAccent[500],
                colors.greenAccent[500],
                colors.redAccent[500],
                colors.blueAccent[300],
                colors.greenAccent[300],
                colors.redAccent[300],
              ]}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Epidemiology;

