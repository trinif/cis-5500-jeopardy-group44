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
  Button,
  Divider
} from '@mui/material';

import { DataGrid } from '@mui/x-data-grid';

import QuestionCard from '../components/QuestionCard';
import { useAuth } from '../components/Context';

const config = require('../config.json'); // Import server configuration

export default function QuestionSelectionPageV2() {
  const subjects = [
    'History',
    'Pop Culture',
    'Geography',
    'Sports',
    'Literature',
    'Science',
    'Vocabulary',
    'Math',
  ];

  const { userId } = useAuth()

  const [data, setData] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [pageSize, setPageSize] = useState(10);

  const [keyword, setKeyword] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [selectedSource, setSelectedSource] = useState('both')
  const [valueRange, setValueRange] = useState([100, 2000])
  const [selectedRounds, setSelectedRounds] = useState([])
  const [questionSet, setQuestionSet] = useState('all')
  const [rowStates, setRowStates] = useState({});

  const toggleAnswerSection = (rowId) => {
    setRowStates((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        showAnswerSection: !prev[rowId]?.showAnswerSection,
      },
    }));
  };

  // Function to handle input change for a row
  const handleInputChange = (rowId, value) => {
    setRowStates((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        userAnswer: value,
      },
    }));
  };

  // Function to check the answer
  const checkAnswer = (rowId, correctAnswer) => {
    const userAnswer = rowStates[rowId]?.userAnswer || '';
    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

    setRowStates((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        feedback: isCorrect ? 'Correct!' : `Incorrect!`,
      },
    }))

    const isCorrectBin = isCorrect ? 1 : 0;
    fetch(`http://${config.server_host}/update_user_answer`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, questionId: rowId, is_correct: isCorrectBin })
    });
  };

  // Toggle "Reveal/Hide Answer"
  const toggleRevealAnswer = (rowId, correctAnswer) => {
    setRowStates((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        isAnswerRevealed: !prev[rowId]?.isAnswerRevealed,
        feedback: !prev[rowId]?.isAnswerRevealed ? `Correct Answer: ${correctAnswer}` : '',
      },
    }));
  };


  const columns = [
    { field: 'jeopardy_or_general', headerName: 'Source', cellClassName: 'white-text', flex: .7},
    { field: 'question', 
      headerName: 'Question', 
      cellClassName: 'white-text', 
      flex: 4,
      renderCell: (params) => (
        <Link 
          onClick={() => setSelectedQuestionId(params.row.id)} 
          style={{ color: 'white' }}
          sx={{
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {params.value}
        </Link>
      ) 
    },
    { field: 'subject', headerName: 'Subject', cellClassName: 'white-text', flex: 1 },
    { field: 'value', headerName: 'Value', cellClassName: 'white-text', flex: .5},
    {
      field: 'answer',
      headerName: 'Answer',
      flex: 2,
      renderCell: (params) => {
        const rowId = params.row.id;
        const rowState = rowStates[rowId] || {};

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%%' }}>
            {/* Try Answering Button */}
            {!rowState.showAnswerSection ? (
              <Typography
                variant="body1"
                onClick={() => toggleAnswerSection(rowId)}
                sx={{
                  color: 'gold',
                  textDecoration: 'bold',
                  cursor: 'pointer',
                  '&:hover': { color: 'white' },
                }}
              >
                Try Answering
              </Typography>

            ) : (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    width: '100%',
                  }}
                >
                  {/* Input Field */}
                  <TextField
                    size="small"
                    value={rowState.userAnswer || ''}
                    onChange={(e) => handleInputChange(rowId, e.target.value)}
                    placeholder="Your answer"
                    sx={{
                      backgroundColor: 'white',
                      borderRadius: '5px',
                      flexGrow: 1, 
                      maxWidth: '90%',
                    }}
                  />

                  {/* Close (x) button */}
                  <Typography
                    variant="body1"
                    onClick={() => toggleAnswerSection(rowId)}
                    sx={{
                      cursor: 'pointer',
                      color: 'gold',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      marginLeft: '8px', 
                    }}
                  >
                    x
                  </Typography>
                </Box>

                {/* Buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={() => checkAnswer(rowId, params.row.answer)}
                    sx={{ backgroundColor: 'gold', color: 'black' }}
                  >
                    Check
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => toggleRevealAnswer(rowId, params.row.answer)}
                    sx={{ borderColor: 'gold', color: 'gold' }}
                  >
                    {rowState.isAnswerRevealed ? 'Hide Answer' : 'Reveal Answer'}
                  </Button>
                </Box>

                {/* Feedback */}
                {rowState.feedback && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: rowState.feedback.includes('Correct') ? 'green' : 'red',
                    }}
                  >
                    {rowState.feedback}
                  </Typography>
                )}
              </>
            )}
          </Box>
        );
      },
    }    
  ]

  useEffect(() => {
    search()
  }, [])

  const search = () => {
    fetch(`http://${config.server_host}/question_selection/${userId}?`+
      `keyword=${keyword}` +
      `&source=${selectedSource}` + 
      `&valueLow=${valueRange[0]}` + 
      `&valueHigh=${valueRange[1]}` + 
      `&subjects=${selectedSubjects}` + 
      `&rounds=${selectedRounds}` +
      `&questionSet=${questionSet}`
    )
      .then(res => res.json())
      .then(resJson => {
        setData(resJson)
      }).catch(err => {
        console.log(err)
      })
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #081484 30%, #4B0082 100%)',
        minHeight: '100vh',
        color: 'white',
        paddingTop: '20px',
        paddingBottom: '50px',
        padding: 5,
        gap: 5
      }}
    >
    <Container container rowSpacing={5}>
      {/* display QuestionCard when a question is selected (based on questionId) */}
      {selectedQuestionId && <QuestionCard questionId={selectedQuestionId} handleClose={() => setSelectedQuestionId(null)} />}
      <Typography variant="h2" align="center" gutterBottom>
          Search Questions
        </Typography>
        <Divider sx={{ backgroundColor: 'gold', marginY: 3 }} />
      <Box container rowSpacing={5}
        sx={{
          backgroundColor: '#081484',
          padding: '20px',
          borderRadius: '10px',
          border: '3px solid #FFD700',
        }}
      >
        <Grid container spacing={2}>
          {/* keyword */}
          <Grid item xs={6}>
            <TextField 
              label='Keyword' 
              value={keyword} 
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                    search();
                }
              }}
              fullWidth
              sx={{
                backgroundColor: 'white',
                borderRadius: '5px',
              }}
            />
          </Grid>

          {/* subjects */}
          <Grid item xs={5}>
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

          <Grid item xs={1} justifyContent="center" display="flex" >  
            <Button variant="contained" onClick={() => search() }
              sx={{
                backgroundColor: 'gold',
                display: 'flex',
                justifyContent: 'center',
                alignItems: "center",
                color: 'black',
                '&:hover': {
                  backgroundColor: 'gold',
                },
                '&:active': {
                  backgroundColor: 'gold',
                },
                '&:focus': {
                  backgroundColor: 'gold'
                },
              }}>
              Search
            </Button> 
          </Grid>
        </Grid>
        <Grid 
          container 
          spacing={2} 
          alignItems="center" 
          justifyContent="space-between" 
          sx={{ marginTop: '5px' }}
        >
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
                  '&.Mui-selected:hover': {
                    backgroundColor: '#FFD700',
                    color: '#2E0854',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#FFD700',
                    color: '#2E0854',
                  },
                  '&:hover': {
                    backgroundColor: '#FFD700',
                    color: '#2E0854',
                  }
                },
              }}
            >
              <ToggleButton value="jeopardy">Jeopardy</ToggleButton>
              <ToggleButton value="both">Both</ToggleButton>
              <ToggleButton value="trivia">Trivia</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {/* Toggle Button Group */}
          <Grid item xs={6}>
            <ToggleButtonGroup
              value={questionSet}
              exclusive
              onChange={(e, newSource) => {
                if (newSource !== null) {
                  setQuestionSet(newSource);
                }
              }}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  border: '1px solid #FFD700',
                  color: '#FFD700',
                  textTransform: 'capitalize',
                  fontWeight: 'bold',
                  '&.Mui-selected:hover': {
                    backgroundColor: '#FFD700',
                    color: '#2E0854',
                  },
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
              <ToggleButton value="never">Never Tried</ToggleButton>
              <ToggleButton value="past">Past Wrong Answers</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        {/* Jeopardy-specific value and round */}
        {selectedSource !== 'trivia' && (
          <Grid
            container spacing={2} alignItems="center" justifyContent="space-between" sx={{ marginTop: '5px' }}
          >
            {/* rounds */}
            <Grid item xs={6} >
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
                }}
              >
                <MenuItem value="Jeopardy!">Jeopardy!</MenuItem>
                <MenuItem value="Double Jeopardy!">Double Jeopardy!</MenuItem>
                <MenuItem value="Final Jeopardy!">Final Jeopardy!</MenuItem>
              </Select>
            </Grid>

            {/* Value Range Filter */}
            <Grid item xs={5.9} marginLeft={'2px'}>
              <Typography
                variant="caption"
                sx={{ color: 'gold', fontWeight: 'bold'}}
              >
                Value Range
              </Typography>
              <Slider
                value={valueRange}
                onChange={(e, newValue) => setValueRange(newValue)}
                valueLabelDisplay="auto"
                step={50}
                min={100}
                max={2000}
                sx={{
                  color: 'gold',
                }}
              />
            </Grid>
          </Grid>
        )}
      </Box>
      <div class="results">
        <h2>Question Table</h2>
        <DataGrid
          rows={data}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 25]}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          autoHeight
          getRowHeight={() => 'auto'}
          sx={{
            '& .MuiDataGrid-row': {
              maxHeight: 'none'
            },
            '& .MuiDataGrid-columnHeaders': {
              color: 'white',
              backgroundColor: '#081484',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',      
              fontSize: '18px' 
            },
            '& .MuiDataGrid-cell': {
              color: 'white',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              lineHeight: '1.2',
              display: 'flex',
              padding: '8px',
              alignItems: 'center'
            },
            '& .MuiDataGrid-columnSeparator': {
              visibility: 'visible', 
            },
            '& .MuiDataGrid-cell, & .MuiDataGrid-columnHeaders': {
              borderRight: '1px solid rgba(224, 224, 224, 1)',
            },
            '& .MuiDataGrid-columnHeader': {
              borderRight: '1px solid rgba(224, 224, 224, 1)',
            },
            '& .MuiDataGrid-cell:focus, & .MuiData-Grid-columnHeaders:focus': {
              outline: 'none',
              borderRight: '1px solid rgba(224, 224, 224, 1)',
            },
            '& .MuiDataGrid-cell:focus-within, & .MuiData-Grid-columnHeaders:focus-within': {
              outline: 'none',
              borderRight: '1px solid rgba(224, 224, 224, 1)',
            },
            '& .MuiDataGrid-footerContainer': {
              color: 'white', 
              backgroundColor: '#081484', 
            },
            '& .MuiTablePagination-caption': {
              color: 'gold', 
            },
            '& .MuiTablePagination-selectLabel': {
              color: 'gold',
            },
            '& .MuiTablePagination-selectIcon': {
              backgroundColor: 'white',
            },
            '& .MuiTablePagination-select': {
              backgroundColor: 'white',
            },
            '& .MuiTablePagination-displayedRows': {
              color: 'gold',
            },
            '& .MuiTablePagination-actions': {
              backgroundColor: 'white',
            },
            '& .MuiDataGrid-columnHeader .MuiDataGrid-sortIcon': {
              color: 'gold',
            },
            '& .MuiDataGrid-columnHeader .MuiDataGrid-menuIcon': {
              color: 'gold',
            },
          }}
        />
      </div>
    </Container>
    </Box>
  );
}