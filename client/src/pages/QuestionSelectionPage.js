import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Slider,
  Checkbox,
  FormGroup,
  FormControlLabel,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from '@mui/material';

const config = require('../config.json');

export default function QuestionSelectionPage() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [metaCategories, setMetaCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMetaCategories, setSelectedMetaCategories] = useState([]);
  const [jeopardyRound, setJeopardyRound] = useState('');
  const [valueRange, setValueRange] = useState([100, 9800]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

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
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(question.category);
      const matchesMetaCategory =
        selectedMetaCategories.length === 0 || selectedMetaCategories.includes(question.meta_category);
      const matchesRound = jeopardyRound ? question.round === jeopardyRound : true;
      const matchesValue = question.value >= valueRange[0] && question.value <= valueRange[1];

      return matchesCategory && matchesMetaCategory && matchesRound && matchesValue;
    });
    setFilteredQuestions(filtered);
  }, [questions, selectedCategories, selectedMetaCategories, jeopardyRound, valueRange]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const valueMarks = [
    { value: 100, label: '100' },
    { value: 5000, label: '5000' },
    { value: 9800, label: '9800' },
  ];

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
        <Box
          display="flex"
          sx={{
            backgroundColor: '#081484',
            borderRadius: '10px',
            padding: '20px',
            border: '3px solid #FFD700',
            overflow: 'hidden',
          }}
        >
          {/* Sidebar Filters */}
          <Box
            sx={{
              width: '300px',
              marginRight: '20px',
              backgroundColor: '#4B0082',
              padding: '20px',
              borderRadius: '10px',
              color: 'white',
            }}
          >
            <Typography variant="h4" gutterBottom>
              Filters
            </Typography>

            {/* Categories */}
            <Typography variant="h6" gutterBottom>
              Categories
            </Typography>
            <FormGroup>
              {categories.map((category) => (
                <FormControlLabel
                  key={category}
                  control={
                    <Checkbox
                      checked={selectedCategories.includes(category)}
                      onChange={(e) => {
                        const newSelected = e.target.checked
                          ? [...selectedCategories, category]
                          : selectedCategories.filter((c) => c !== category);
                        setSelectedCategories(newSelected);
                      }}
                      sx={{ color: 'gold' }}
                    />
                  }
                  label={category}
                />
              ))}
            </FormGroup>

            {/* Meta Categories */}
            <Typography variant="h6" gutterBottom>
              Meta Categories
            </Typography>
            <FormGroup>
              {metaCategories.map((metaCategory) => (
                <FormControlLabel
                  key={metaCategory}
                  control={
                    <Checkbox
                      checked={selectedMetaCategories.includes(metaCategory)}
                      onChange={(e) => {
                        const newSelected = e.target.checked
                          ? [...selectedMetaCategories, metaCategory]
                          : selectedMetaCategories.filter((m) => m !== metaCategory);
                        setSelectedMetaCategories(newSelected);
                      }}
                      sx={{ color: 'gold' }}
                    />
                  }
                  label={metaCategory}
                />
              ))}
            </FormGroup>

            {/* Jeopardy Round */}
            <Typography variant="h6" gutterBottom>
              Jeopardy Round
            </Typography>
            <TextField
              select
              fullWidth
              variant="outlined"
              value={jeopardyRound}
              onChange={(e) => setJeopardyRound(e.target.value)}
              sx={{ backgroundColor: 'white', marginBottom: '20px', borderRadius: '5px' }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Jeopardy">Jeopardy</MenuItem>
              <MenuItem value="Double Jeopardy">Double Jeopardy</MenuItem>
              <MenuItem value="Final Jeopardy">Final Jeopardy</MenuItem>
            </TextField>

            {/* Value Slider */}
            <Typography variant="h6" gutterBottom>
              Value
            </Typography>
            <Slider
              value={valueRange}
              onChange={(e, newValue) => setValueRange(newValue)}
              valueLabelDisplay="auto"
              min={100}
              max={9800}
              marks={valueMarks}
              step={100}
              sx={{ color: 'gold' }}
            />
          </Box>

          {/* Question Results Table */}
          <Box
            sx={{
              flexGrow: 1,
              backgroundColor: '#4B0082',
              borderRadius: '10px',
              padding: '20px',
              border: '3px solid #FFD700',
            }}
          >
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ color: 'white', backgroundColor: '#081484' }}>Title</TableCell>
                    <TableCell style={{ color: 'white', backgroundColor: '#081484' }}>Category</TableCell>
                    <TableCell style={{ color: 'white', backgroundColor: '#081484' }}>Value</TableCell>
                    <TableCell style={{ color: 'white', backgroundColor: '#081484' }}>Round</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredQuestions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((question) => (
                      <TableRow key={question.question_id}>
                        <TableCell>{question.title}</TableCell>
                        <TableCell>{question.category}</TableCell>
                        <TableCell>${question.value}</TableCell>
                        <TableCell>{question.round}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[10, 25]}
                component="div"
                count={filteredQuestions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
              />
            </TableContainer>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
