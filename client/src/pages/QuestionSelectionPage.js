import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Slider,
  TextField,
  Chip,
  Button,
  MenuItem,
  Select,
  OutlinedInput,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

const config = require('../config.json');

export default function QuestionSelectionPage() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [metaCategories, setMetaCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMetaCategories, setSelectedMetaCategories] = useState([]);
  const [selectedRounds, setSelectedRounds] = useState([]);
  const [valueRange, setValueRange] = useState([100, 9800]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'single'

  const defaultValueRange = [100, 9800];

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/question_selection`)
      .then((res) => res.json())
      .then((resJson) => setQuestions(resJson));

    fetch(`http://${config.server_host}:${config.server_port}/categories`)
      .then((res) => res.json())
      .then((resJson) => setCategories(resJson));

    fetch(`http://${config.server_host}:${config.server_port}/meta_categories`)
      .then((res) => res.json())
      .then((resJson) => setMetaCategories(resJson));
  }, []);

  useEffect(() => {
    const filtered = questions.filter((question) => {
      const matchesSearchTerm = question.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(question.category);
      const matchesMetaCategory =
        selectedMetaCategories.length === 0 ||
        selectedMetaCategories.includes(question.meta_category);
      const matchesRound =
        selectedRounds.length === 0 || selectedRounds.includes(question.round);
      const matchesValue = question.value >= valueRange[0] && question.value <= valueRange[1];

      return (
        matchesSearchTerm && matchesCategory && matchesMetaCategory && matchesRound && matchesValue
      );
    });
    setFilteredQuestions(filtered);
  }, [
    questions,
    searchTerm,
    selectedCategories,
    selectedMetaCategories,
    selectedRounds,
    valueRange,
  ]);

  const handleDeleteCategory = (category) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== category));
  };

  const handleDeleteMetaCategory = (metaCategory) => {
    setSelectedMetaCategories(selectedMetaCategories.filter((m) => m !== metaCategory));
  };

  const handleDeleteRound = (round) => {
    setSelectedRounds(selectedRounds.filter((r) => r !== round));
  };

  const valueMarks = [
    { value: 100, label: '100' },
    { value: 5000, label: '5000' },
    { value: 9800, label: '9800' },
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % filteredQuestions.length);
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

        {/* View Mode Selection */}
        <Box mb={2} textAlign="center">
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('table')}
            sx={{
              marginRight: '10px',
              backgroundColor: viewMode === 'table' ? '#FFD700' : undefined,
              color: viewMode === 'table' ? '#081484' : 'white',
            }}
          >
            View as Table
          </Button>
          <Button
            variant={viewMode === 'single' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('single')}
            sx={{
              backgroundColor: viewMode === 'single' ? '#FFD700' : undefined,
              color: viewMode === 'single' ? '#081484' : 'white',
            }}
          >
            View One at a Time
          </Button>
        </Box>

        {/* Filter Bar */}
        <Box
          sx={{
            backgroundColor: '#081484',
            padding: '20px',
            borderRadius: '10px',
            border: '3px solid #FFD700',
            marginBottom: '20px',
          }}
        >
          <Grid container spacing={2}>
            {/* Search Bar */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                variant="outlined"
                placeholder="Search by keyword"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '5px',
                }}
              />
            </Grid>

            {/* Categories */}
            <Grid item xs={12} sm={6} md={4}>
              <Select
                multiple
                value={selectedCategories}
                onChange={(e) => setSelectedCategories(e.target.value)}
                displayEmpty
                input={<OutlinedInput />}
                renderValue={() => 'Search by Category'}
                fullWidth
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '5px',
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* Meta Categories */}
            <Grid item xs={12} sm={6} md={4}>
              <Select
                multiple
                value={selectedMetaCategories}
                onChange={(e) => setSelectedMetaCategories(e.target.value)}
                displayEmpty
                input={<OutlinedInput />}
                renderValue={() => 'Search by Meta Category'}
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

            {/* Jeopardy Rounds */}
            <Grid item xs={12} sm={6} md={4}>
              <Select
                multiple
                value={selectedRounds}
                onChange={(e) => setSelectedRounds(e.target.value)}
                displayEmpty
                input={<OutlinedInput />}
                renderValue={() => 'Search by Round'}
                fullWidth
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '5px',
                }}
              >
                <MenuItem value="Jeopardy">Jeopardy</MenuItem>
                <MenuItem value="Double Jeopardy">Double Jeopardy</MenuItem>
                <MenuItem value="Final Jeopardy">Final Jeopardy</MenuItem>
              </Select>
            </Grid>

            {/* Value Slider */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" sx={{ color: 'gold', fontWeight: 'bold' }}>
                Value Range
              </Typography>
              <Slider
                value={valueRange}
                onChange={(e, newValue) => setValueRange(newValue)}
                valueLabelDisplay="auto"
                min={100}
                max={9800}
                marks={valueMarks}
                step={100}
                sx={{
                  color: 'gold',
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Selected Filters */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          {selectedCategories.map((category) => (
            <Chip
              key={category}
              label={category}
              onDelete={() => handleDeleteCategory(category)}
              sx={{ backgroundColor: '#FFD700', color: '#081484' }}
            />
          ))}
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
          {JSON.stringify(valueRange) !== JSON.stringify(defaultValueRange) && (
            <Chip
              label={`Value: $${valueRange[0]} - $${valueRange[1]}`}
              onDelete={() => setValueRange(defaultValueRange)}
              sx={{ backgroundColor: '#FFD700', color: '#081484' }}
            />
          )}
        </Box>

        {/* Results - Render based on View Mode */}
        {viewMode === 'table' ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Round</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question.question_id}>
                    <TableCell>{question.title}</TableCell>
                    <TableCell>{question.category}</TableCell>
                    <TableCell>${question.value}</TableCell>
                    <TableCell>{question.round}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box
            key={filteredQuestions[currentQuestionIndex]?.question_id}
            sx={{
              backgroundColor: '#FFD700',
              color: '#081484',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '20px',
              border: '3px solid #4B0082',
            }}
          >
            {filteredQuestions.length > 0 ? (
              <>
                <Typography variant="h5">
                  {filteredQuestions[currentQuestionIndex].title}
                </Typography>
                <Typography>Category: {filteredQuestions[currentQuestionIndex].category}</Typography>
                <Typography>Value: ${filteredQuestions[currentQuestionIndex].value}</Typography>
                <Typography>Round: {filteredQuestions[currentQuestionIndex].round}</Typography>
                <Box
                  sx={{
                    marginTop: '10px',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                  }}
                >
                  <TextField
                    placeholder="Type your answer here"
                    variant="outlined"
                    fullWidth
                    sx={{
                      backgroundColor: 'white',
                      borderRadius: '5px',
                    }}
                  />
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#4B0082',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#081484',
                      },
                    }}
                    onClick={handleNextQuestion}
                  >
                    Next Question
                  </Button>
                </Box>
              </>
            ) : (
              <Typography>No questions match your filters.</Typography>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
