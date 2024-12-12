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
} from '@mui/material';
import LazyTable from '../components/LazyTable';
import { useAuth } from '../components/Context'; // Import the useAuth hook

const config = require('../config.json'); // Import server configuration

export default function QuestionSelectionPage() {
  const { userId } = useAuth(); // Access userId from context
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMetaCategories, setSelectedMetaCategories] = useState([]);
  const [selectedSource, setSelectedSource] = useState('both'); // 'jeopardy', 'trivia', or 'both'
  const [selectedRounds, setSelectedRounds] = useState([]);
  const [valueRange, setValueRange] = useState([100, 9800]);
  const [metaCategories, setMetaCategories] = useState([]);
  const [filters, setFilters] = useState({}); // Holds dynamically applied filters
  const [isShuffled, setIsShuffled] = useState(false);
  const [pastQuestionsFilter, setPastQuestionsFilter] = useState('all'); // Add filter state for "all", "never_tried", and "wrong"
  const [page, setPage] = useState(1); // Add page state

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
  }, [searchTerm, selectedMetaCategories, selectedSource, selectedRounds, valueRange]);

  useEffect(() => {
    setPage(1); // Reset to the first page whenever filters change
  }, [filters]);

  // Define the columns for LazyTable
  const columns = [
    ...(selectedSource === 'both'
      ? [
          {
            headerName: 'Source',
            field: 'jeopardy_or_general',
            width: '8%',
            renderCell: (row) =>
              row.jeopardy_or_general === 0 ? 'Jeopardy' : 'Trivia',
          },
        ]
      : []),
    {
      headerName: 'Question',
      field: 'question',
      width: selectedSource === 'jeopardy' ? '42%' : selectedSource === 'both' ? '50%' : '68%',
    },
    ...(selectedSource === 'jeopardy'
      ? [
          { headerName: 'Round', field: 'round', width: '8%' },
          { headerName: 'Value', field: 'value', width: '8%' },
        ]
      : []),
    ...(selectedSource !== 'trivia'
      ? [
          {
            headerName: 'Category',
            field: 'category',
            width: '10%',
            renderCell: (row) =>
              row.jeopardy_or_general === 1 // Check if the question is Trivia
                ? '' // Blank for Trivia
                : row.category // Display the category for Jeopardy
                ? row.category
                : 'N/A', // Default to "N/A" if no category exists
          },
        ]
      : []),
    { headerName: 'Meta Category', field: 'meta_category', width: '10%' },
    { headerName: 'Answer', field: 'answerCheck', width: '22%' },
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
      shuffle: isShuffled,
      pastQuestionsFilter, // Pass the selected filter
      user_id: userId,
      page
    });
    return `http://${config.server_host}:${config.server_port}/question_selection?${params.toString()}`;
  };

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

  const toggleShuffle = () => {
    setIsShuffled((prev) => !prev);
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #081484 30%, #4B0082 100%)',
        minHeight: '100vh',
        color: 'white',
        paddingTop: '20px',
        paddingBottom: '50px',
      }}
    >
      <Container>
        <Typography variant="h2" align="center" gutterBottom>
          Select Your Question
        </Typography>

        <Box
          sx={{
            backgroundColor: '#081484',
            padding: '20px',
            borderRadius: '10px',
            border: '3px solid #FFD700',
          }}
        >
          {/* First Row */}
          <Grid container spacing={2} sx={{ marginBottom: '10px' }}>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={5.25}>
              <Select
                multiple
                value={selectedMetaCategories}
                onChange={(e) => setSelectedMetaCategories(e.target.value)}
                displayEmpty
                input={<OutlinedInput />}
                renderValue={(selected) =>
                  selected.length > 0 ? selected.join(', ') : 'Filter by Meta Category'
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
            <Grid item xs={.75} sm={.75} sx={{ display: 'flex', justifyContent: 'flex-end'}}>
              <Box
                onClick={toggleShuffle}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  backgroundColor: isShuffled ? '#FFD700' : 'transparent',
                  borderRadius: '50%',
                  border: '2px solid #FFD700',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#FFD700',
                  },
                }}
              >
                <img
                  src="/shuffle.png"
                  alt="Shuffle"
                  style={{
                    width: '24px',
                    height: '24px',
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Second Row */}
          <Grid container spacing={2} sx={{ marginBottom: '10px' }}>
            <Grid item xs={6}>
              <ToggleButtonGroup
                value={pastQuestionsFilter}
                exclusive
                onChange={(e, newFilter) => {
                  if (newFilter !== null) setPastQuestionsFilter(newFilter);
                }}
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': {
                    border: '1px solid #FFD700',
                    color: '#FFD700',
                    textTransform: 'capitalize',
                    fontWeight: 'bold',
                    '&.Mui-selected': {
                      backgroundColor: '#FFD700',
                      color: '#2E0854',
                    },
                    '&:hover': {
                      backgroundColor: '#FFD700',
                      color: '#2E0854',
                    },
                  },
                }}
              >
                <ToggleButton value="all">All Questions</ToggleButton>
                <ToggleButton value="never_tried">Never Tried</ToggleButton>
                <ToggleButton value="wrong">Past Wrong Answers</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={6}>
              <ToggleButtonGroup
                value={selectedSource}
                exclusive
                onChange={(e, newSource) => {
                  if (newSource !== null) setSelectedSource(newSource);
                }}
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': {
                    border: '1px solid #FFD700',
                    color: '#FFD700',
                    textTransform: 'capitalize',
                    fontWeight: 'bold',
                    '&.Mui-selected': {
                      backgroundColor: '#FFD700',
                      color: '#2E0854',
                    },
                    '&:hover': {
                      backgroundColor: '#FFD700',
                      color: '#2E0854',
                    },
                  },
                }}
              >
                <ToggleButton value="jeopardy">Jeopardy</ToggleButton>
                <ToggleButton value="both">Both</ToggleButton>
                <ToggleButton value="trivia">Trivia</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>

          {/* Third Row (Jeopardy Specific Filters) */}
        {selectedSource === 'jeopardy' && (
          <Grid container spacing={2} sx={{ marginBottom: '10px' }}>
            {/* Filter by Round */}
            <Grid item xs={12} sm={6}>
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

            {/* Value Range */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'gold',
                    fontWeight: 'bold',
                    marginRight: '10px',
                    minWidth: '80px', // Ensures alignment
                  }}
                >
                  Value Range
                </Typography>
                <Slider
                  value={valueRange}
                  onChange={(e, newValue) => setValueRange(newValue)}
                  valueLabelDisplay="auto"
                  min={100}
                  max={9800}
                  step={100} // Snap slider to increments of 100
                  marks // Adds visual markers
                  sx={{
                    color: 'gold',
                    flexGrow: 1, // Makes the slider stretch
                  }}
                />
              </Box>
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
            marginTop: '10px',
            marginBottom: '10px',
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
          {selectedSource === 'jeopardy' &&
            (valueRange[0] !== defaultValueRange[0] ||
              valueRange[1] !== defaultValueRange[1]) && (
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
          rowsPerPageOptions={[1, 5, 10]}
        />
      </Container>
    </Box>
  );
}
