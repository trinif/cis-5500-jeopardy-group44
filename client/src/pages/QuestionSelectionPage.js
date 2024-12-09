import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  OutlinedInput,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Chip,
  Slider,
  Button,
} from '@mui/material';
import LazyTable from '../components/LazyTable';

const config = require('../config.json'); // Import server configuration

export default function QuestionSelectionPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMetaCategories, setSelectedMetaCategories] = useState([]);
  const [selectedSource, setSelectedSource] = useState('both'); // 'jeopardy', 'trivia', or 'both'
  const [selectedRounds, setSelectedRounds] = useState([]);
  const [valueRange, setValueRange] = useState([100, 9800]);
  const [metaCategories, setMetaCategories] = useState([]);
  const [filters, setFilters] = useState({}); // Holds dynamically applied filters

  const defaultValueRange = [100, 9800];

  // Predefined metaCategories
  useEffect(() => {
    const predefinedMetaCategories = [
      'History',
      'Pop Culture',
      'Geography',
      'Sports',
      'Literature',
      'Science',
      'Vocabulary',
      'Math',
    ];
    setMetaCategories(predefinedMetaCategories);
  }, []);

  // Dynamically apply filters except for search
  useEffect(() => {
    setFilters({
      searchTerm,
      metaCategories: selectedMetaCategories,
      source: selectedSource,
      rounds: selectedRounds,
      valueRange: selectedSource === 'jeopardy' ? valueRange : null, // Only apply value range for Jeopardy
    });
  }, [selectedMetaCategories, selectedSource, selectedRounds, valueRange]);

  // Define the columns for LazyTable
  const columns = [
    { headerName: 'Question', field: 'question' },
    { headerName: 'Meta Category', field: 'meta_category' },
    ...(selectedSource === 'jeopardy'
      ? [
          { headerName: 'Round', field: 'round' },
          { headerName: 'Value', field: 'value' },
        ]
      : []),
    { headerName: 'Answer', field: 'answerCheck' },
    {
      headerName: 'Source',
      field: 'jeopardy_or_general',
      renderCell: (row) =>
        row.jeopardy_or_general === 0 ? 'Jeopardy' : 'Trivia',
    },
  ];

  // Build the route dynamically based on filters
  const buildRoute = () => {
    const params = new URLSearchParams({
      title: filters.searchTerm || '',
      meta_category: (filters.metaCategories || []).join(',') || '',
      source: filters.source || 'both',
      round: (filters.rounds || []).join(',') || '',
      value_low: filters.valueRange ? filters.valueRange[0] : null,
      value_high: filters.valueRange ? filters.valueRange[1] : null,
    });
    return `http://${config.server_host}:${config.server_port}/question_selection?${params.toString()}`;
  };

  // Apply the search function
  const applySearch = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      searchTerm,
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      applySearch();
    }
  };

  const handleDeleteMetaCategory = (metaCategory) => {
    setSelectedMetaCategories(
      selectedMetaCategories.filter((m) => m !== metaCategory)
    );
  };

  const handleDeleteRound = (round) => {
    setSelectedRounds(selectedRounds.filter((r) => r !== round));
  };

  const handleDeleteValueRange = () => {
    setValueRange(defaultValueRange);
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #081484 30%, #4B0082 100%)',
        minHeight: '100vh',
        color: 'white',
        paddingTop: '20px',
      }}
    >
      <Container>
        <Typography variant="h2" align="center" gutterBottom>
          Select Your Question
        </Typography>

        {/* Filter Bar */}<Box
          sx={{
            backgroundColor: '#081484',
            padding: '20px',
            borderRadius: '10px',
            border: '3px solid #FFD700',
            marginBottom: '20px',
          }}
        >
          {/* Top Row: Search Bar, Meta Categories, and Source Filter */}
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            {/* Search Field */}
            <Grid item xs={12} sm={4} md={4}>
              <TextField
                variant="outlined"
                placeholder="Search by keyword"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '5px',
                }}
              />
            </Grid>

            {/* Meta Categories */}
            <Grid item xs={12} sm={4} md={4}>
              <Select
                multiple
                value={selectedMetaCategories}
                onChange={(e) => setSelectedMetaCategories(e.target.value)}
                displayEmpty
                input={<OutlinedInput />}
                renderValue={(selected) =>
                  selected.length > 0 ? selected.join(', ') : 'Search by Meta Category'
                }
                fullWidth
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '5px',
                }}
              >
                {metaCategories.map((metaCategory) => (
                  <MenuItem key={metaCategory} value={metaCategory}>
                    {metaCategory}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* Source Filter */}
            <Grid item xs={12} sm={4} md={4}>
              <ToggleButtonGroup
                value={selectedSource}
                exclusive
                onChange={(e, newSource) => {
                  if (newSource !== null) setSelectedSource(newSource);
                }}
                fullWidth
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '5px',
                  display: 'flex',
                  justifyContent: 'space-around',
                  border: '1px solid #FFD700',
                }}
              >
                <ToggleButton value="jeopardy">Jeopardy</ToggleButton>
                <ToggleButton value="both">Both</ToggleButton>
                <ToggleButton value="trivia">Trivia</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>

          {/* Bottom Row: Jeopardy-Specific Filters */}
          {selectedSource === 'jeopardy' && (
            <Grid
              container
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
              sx={{ marginTop: '15px' }}
            >
              {/* Round Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <Select
                  multiple
                  value={selectedRounds}
                  onChange={(e) => setSelectedRounds(e.target.value)}
                  displayEmpty
                  input={<OutlinedInput />}
                  renderValue={(selected) =>
                    selected.length > 0 ? selected.join(', ') : 'Filter by Round'
                  }
                  fullWidth
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: '5px',
                  }}
                >
                  <MenuItem value="Jeopardy!">Jeopardy!</MenuItem>
                  <MenuItem value="Double Jeopardy!">Double Jeopardy!</MenuItem>
                  <MenuItem value="Final Jeopardy!">Final Jeopardy!</MenuItem>
                </Select>
              </Grid>

              {/* Value Range Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography
                  variant="caption"
                  sx={{ color: 'gold', fontWeight: 'bold', marginBottom: '5px' }}
                >
                  Value Range
                </Typography>
                <Slider
                  value={valueRange}
                  onChange={(e, newValue) => setValueRange(newValue)}
                  valueLabelDisplay="auto"
                  min={100}
                  max={9800}
                  sx={{
                    color: 'gold',
                  }}
                />
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Selected Filters (Chips) */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          {selectedMetaCategories.map((metaCategory) => (
            <Chip
              key={metaCategory}
              label={metaCategory}
              onDelete={() => handleDeleteMetaCategory(metaCategory)}
              sx={{ backgroundColor: '#FFD700', color: '#081484' }}
            />
          ))}
          {selectedRounds.map((round) => (
            <Chip
              key={round}
              label={`Round: ${round}`}
              onDelete={() => handleDeleteRound(round)}
              sx={{ backgroundColor: '#FFD700', color: '#081484' }}
            />
          ))}
          {selectedSource === 'jeopardy' && (
            <Chip
              label={`Value: $${valueRange[0]} - $${valueRange[1]}`}
              onDelete={handleDeleteValueRange}
              sx={{ backgroundColor: '#FFD700', color: '#081484' }}
            />
          )}
        </Box>

        {/* Questions Table */}
        <LazyTable
          route={buildRoute()}
          columns={columns}
          defaultPageSize={10}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Container>
    </Box>
  );
}
