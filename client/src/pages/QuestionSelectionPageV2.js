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
  Link,
  Button
} from '@mui/material';
import LazyTable from '../components/LazyTable';

import { DataGrid } from '@mui/x-data-grid';

import QuestionCard from '../components/QuestionCard';

const config = require('../config.json'); // Import server configuration

export default function QuestionSelectionPageV2() {
  const predefinedSubjects = [
    'History',
    'Pop Culture',
    'Geography',
    'Sports',
    'Literature',
    'Science',
    'Vocabulary',
    'Math',
  ];

  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedSource, setSelectedSource] = useState('both'); // 'jeopardy', 'trivia', or 'both'
  const [selectedRounds, setSelectedRounds] = useState([]);
  const [valueRange, setValueRange] = useState([100, 2000]);
  const [subjects, setSubjects] = useState(predefinedSubjects);
  const [filters, setFilters] = useState({}); // Holds dynamically applied filters
  const [isShuffled, setIsShuffled] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [data, setData] = useState([]);

  const defaultValueRange = [100, 9800];

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/question_selection`)
      .then(res => res.json())
      .then(resJson => {
        console.log(resJson)
        setData(resJson);
      }).catch(err => {
        console.log(err)
      });
  }, []);

  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/question_selection?keyword=${keyword}` +
      `&subjects[]=${selectedSubjects}` +
      `&source=${selectedSource}` +
      `&valueLow=${valueRange[0]}` +
      `&valueHigh=${valueRange[1]}` +
      `&rounds[]=${selectedRounds}` 
    )
      .then(res => res.json())
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        const questionsWithId = resJson.map((question) => ({ id: question.question_id, ...question }));
        console.log(selectedSubjects);
        console.log(questionsWithId);
        console.log(`http://${config.server_host}:${config.server_port}/question_selection?keyword=${keyword}` +
      `&subjects[]=${selectedSubjects}` +
      `&source=${selectedSource}` +
      `&valueLow=${valueRange[0]}` +
      `&valueHigh=${valueRange[1]}` +
      `&rounds[]=${selectedRounds}` );
        setData(questionsWithId);
      });
  }

  // Define the columns for DataGrid
  const columns = [
    { field: 'jeopardy_or_general', headerName: 'Source', width: 100},
    { field: 'question', headerName: 'Question', width: 500, renderCell: (params) => (
      <div
        style={{
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          lineHeight: '1.5',
        }}
        onClick={() => setSelectedQuestionId(params.row.id)}
      >
        <div dangerouslySetInnerHTML={{ __html: params.value.replace(/<a /g, '<a target="_blank" ')}}/>
      </div>
    ) },
    { field: 'subject', headerName: 'Subject', width: 100 },
    { field: 'answer', headerName: 'Answer', width: 200 }
  ]

  return (
    <Container>
      {selectedQuestionId && <QuestionCard questionId={selectedQuestionId} handleClose={() => setSelectedQuestionId(null)} />}
      <h2>Search Questions</h2>
      <Grid container spacing={6}>
        {/* keyword */}
        <Grid item xs={8}>
          <TextField label='Keyword' value={keyword} onChange={(e) => setKeyword(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        {/* subjects */}
        <Grid item xs={12} sm={4} md={4}>
           <Select multiple value={selectedSubjects} onChange={(e) => setSelectedSubjects(e.target.value)}
                displayEmpty
                input={<OutlinedInput />}
                fullWidth
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '5px',
                }}
                renderValue={(selected) =>
                    selected.length > 0 ? selected.join(', ') : 'Subject'
                }
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
                  </MenuItem>
                ))}
              </Select>
        </Grid>
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
      {/* Jeopardy-specific value and round */}
      {selectedSource === 'jeopardy' && (
            <Grid
              container spacing={2} alignItems="center" justifyContent="space-between" sx={{ marginTop: '5px' }}
            >
              {/* rounds */}
              <Grid item xs={12} sm={6} md={4}>
                <Select
                  multiple
                  label='Round'
                  value={selectedRounds}
                  onChange={(e) => setSelectedRounds(e.target.value)}
                  displayEmpty
                  input={<OutlinedInput />}
                  renderValue={(selected) =>
                    selected.length > 0 ? selected.join(', ') : 'Round'
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
                  max={2000}
                  sx={{
                    color: 'gold',
                  }}
                />
              </Grid>
            </Grid>
          )}
      <Button onClick={() => search() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
        Search
      </Button>
      <h2>Results</h2>
      <DataGrid
        rows={data}
        columns={columns}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
      />
    </Container>
  );
}