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

  const handleInputChange = (id, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [id]: value,
    }));
  };

  const { userId } = useAuth()

  const [data, setData] = useState([])
  const [selectedQuestionId, setSelectedQuestionId] = useState(null)
  const [pageSize, setPageSize] = useState(10);

  const [inputValues, setInputValues] = useState({});
  const [answer, setAnswer] = useState('')
  const [answerMessage, setAnswerMessage] = useState('')

  const [keyword, setKeyword] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [selectedSource, setSelectedSource] = useState('both')
  const [valueRange, setValueRange] = useState([200, 1000])
  const [selectedRounds, setSelectedRounds] = useState([])
  const [questionSet, setQuestionSet] = useState('all')

  const checkButtonHandler = () => {
    fetch(`http://${config.server_host}/check_answer/${selectedQuestionId}/${answer}`, {
      method: "POST",
    }).then(res => {
      return res.json()
    }).then(resJson => {
      if (resJson.status == 'Correct') {
        setAnswerMessage('Correct!')
        fetch(`http://${config.server_host}/update_user_answer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({userId, selectedQuestionId, is_correct: 1}),
        })
      } else if (resJson.status == 'Incorrect') {
        setAnswerMessage(`Incorrect! The correct answer is '${resJson.message}'`)
        fetch(`http://${config.server_host}/update_user_answer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({userId, selectedQuestionId, is_correct: 0}),
        })
    }
    }).catch(err => {
        console.log(err)
    })
  }

  const columns = [
    { field: 'jeopardy_or_general', headerName: 'Source', cellClassName: 'white-text', flex: 1},
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
    { field: 'answer', headerName: 'Answer', cellClassName: 'white-text', flex: 2,
      renderCell: (params) => (
        <Box variant="contained"
          sx={{
            height: '100%',
          }}
        >
          <TextField
          variant="outlined"
          size="small"
          placeholder="Enter your answer"
          value={inputValues[params.row.id] || ''}
          onChange={(e) => handleInputChange(params.row.id, e.target.value)}
          sx={{
            input: { color: 'white' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#FFD700' },
              '&:hover fieldset': { borderColor: '#FFD700' },
              '&.Mui-focused fieldset': { borderColor: '#FFD700' },
            },
            width: '100%',
            height: '50%',
            marginBottom: '12px',
            justifyContent: 'center',
          }}
          />
          <Button variant="contained" onClick={() => search() }
            sx={{
              backgroundColor: 'gold',
              borderRadius: '5px',
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
        </Box>
      ),
    } // delete this later
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
      <h2>Search Questions</h2>
      <Box container rowSpacing={5}
        sx={{
          backgroundColor: '#081484',
          padding: '20px',
          borderRadius: '10px',
          border: '3px solid #FFD700',
        }}
      >
        <Grid container spacing={2} sx={{ marginBottom: '10px' }}>
          {/* keyword */}
          <Grid item xs={8}>
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
          <Grid item xs={4}>
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
        </Grid>
        <Grid item xs={12} sm={4} md={4} marginBottom={2}>
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

        {/* Jeopardy-specific value and round */}
        {selectedSource !== 'trivia' && (
          <Grid
            container spacing={4} alignItems="center" justifyContent="space-between" sx={{ marginTop: '5px' }}
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

        {/* i wanted to put the search and toggle button group on the same line */}
        <Grid container containerSpacing="2px" marginTop="5px" justifyContent="center" display="flex">  
          <Button variant="contained" onClick={() => search() }
            sx={{
              backgroundColor: 'gold',
              borderRadius: '5px',
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

          <ToggleButtonGroup
            value={questionSet}
            exclusive
            onChange={(e, newSource) => {
              if (newSource !== null) {
                setQuestionSet(newSource)
              }
            }}
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                border: '1px solid #FFD700',
                color: '#FFD700',
                textTransform: 'capitalize',
                fontWeight: 'bold',
                margin: '4px',
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
            <ToggleButton value="all">All Questions</ToggleButton>
            <ToggleButton value="never">Never Tried</ToggleButton>
            <ToggleButton value="past">Past Wrong Answers</ToggleButton>
          </ToggleButtonGroup>          
        </Grid>
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
          sx={{
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