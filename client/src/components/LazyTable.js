
import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper,
  Button,
  Box,
  TextField,
  IconButton,
} from '@mui/material';

export default function LazyTable({ route, columns, defaultPageSize, rowsPerPageOptions }) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1); // 1 indexed
  const [pageSize, setPageSize] = useState(defaultPageSize ?? 10);
  const [activeQuestionId, setActiveQuestionId] = useState(null); // Tracks the active question
  const [userAnswers, setUserAnswers] = useState({}); // Tracks user inputs
  const [feedback, setFeedback] = useState({}); // Tracks feedback for each question
  const [revealedAnswers, setRevealedAnswers] = useState({}); // Tracks revealed answers

  // Fetch data when the route, page, or pageSize changes
  useEffect(() => {
    fetch(`${route}&page=${page}&page_size=${pageSize}`)
      .then((res) => res.json())
      .then((resJson) => setData(resJson))
      .catch((err) => console.error('Error fetching data:', err));
  }, [route, page, pageSize]);

  const handleChangePage = (e, newPage) => {
    if (newPage > page - 1 && data.length < pageSize) {
      // Prevent navigating to the next page if there are no more rows
      return;
    }
    setPage(newPage + 1); // Convert zero-indexed to one-indexed
  };

  const handleChangePageSize = (e) => {
    const newPageSize = parseInt(e.target.value, 10);
    setPageSize(newPageSize);
    setPage(1); // Reset to first page
  };

  const toggleInputVisibility = (questionId) => {
    setActiveQuestionId((prev) => (prev === questionId ? null : questionId)); // Toggle visibility
    setFeedback((prev) => ({
      ...prev,
      [questionId]: undefined, // Reset feedback when toggling
    }));
    setRevealedAnswers((prev) => ({
      ...prev,
      [questionId]: false, // Reset revealed answer state when toggling
    }));
  };

  const handleInputChange = (questionId, value) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleCheckAnswer = (questionId, correctAnswer) => {
    const userAnswer = userAnswers[questionId]?.trim().toLowerCase() || '';
    const isCorrect = userAnswer === correctAnswer.trim().toLowerCase();

    setFeedback((prev) => ({
      ...prev,
      [questionId]: isCorrect ? 'Correct!' : 'Incorrect.',
    }));
  };

  const toggleRevealAnswer = (questionId) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [questionId]: !prev[questionId], // Toggle revealed state
    }));
  };

  const renderAnswerCell = (row) => {
    const questionId = row.question_id;
  
    if (activeQuestionId !== questionId) {
      return (
        <Button
          variant="text"
          size="small"
          onClick={() => toggleInputVisibility(questionId)}
          sx={{
            color: '#FFD700',
            textTransform: 'none',
            fontWeight: 'bold',
          }}
        >
          Try Answering
        </Button>
      );
    }
  
    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%', // Ensures it stays inside its table cell
        }}
      >
        {/* Close Button */}
        <IconButton
          size="small"
          onClick={() => toggleInputVisibility(questionId)}
          sx={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '4px',
            color: '#FFD700',
            fontSize: '1rem',
            zIndex: 10,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>×</span>
        </IconButton>
  
        {/* Input Field */}
        <TextField
          variant="outlined"
          size="small"
          placeholder="Enter your answer"
          value={userAnswers[questionId] || ''}
          onChange={(e) => handleInputChange(questionId, e.target.value)}
          sx={{
            input: { color: 'white' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#FFD700' },
              '&:hover fieldset': { borderColor: '#FFD700' },
              '&.Mui-focused fieldset': { borderColor: '#FFD700' },
            },
            width: '100%',
            marginBottom: '12px',
          }}
        />
  
        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: '12px', // Space between buttons
            justifyContent: 'center',
            marginBottom: '8px',
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={() => handleCheckAnswer(questionId, row.answer)}
            sx={{
              backgroundColor: '#FFD700',
              color: '#2E0854',
              fontWeight: 'bold',
              borderRadius: '4px',
              padding: '6px 12px',
              textTransform: 'capitalize',
              fontSize: '0.8rem',
            }}
          >
            Check
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => toggleRevealAnswer(questionId)}
            sx={{
              backgroundColor: revealedAnswers[questionId] ? '#FF5733' : '#FFD700', // Change color on toggle
              color: '#2E0854',
              fontWeight: 'bold',
              borderRadius: '4px',
              padding: '6px 12px',
              textTransform: 'capitalize',
              fontSize: '0.8rem',
            }}
          >
            {revealedAnswers[questionId] ? 'Hide' : 'Reveal'}
          </Button>
        </Box>
  
        {/* Feedback */}
        {feedback[questionId] && (
          <Box
            sx={{
              color: feedback[questionId] === 'Correct!' ? '#00FF00' : '#FF0000',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              textAlign: 'center',
            }}
          >
            {feedback[questionId]}
          </Box>
        )}
  
        {/* Correct Answer */}
        {revealedAnswers[questionId] && (
          <Box sx={{ color: 'white', fontStyle: 'italic', fontSize: '0.85rem', textAlign: 'center' }}>
            Correct Answer: {row.answer}
          </Box>
        )}
      </Box>
    );
  };  

  const defaultRenderCell = (col, row) => {
    if (col.field === 'answerCheck') {
      return renderAnswerCell(row); 
    }
    return <div>{row[col.field]}</div>; 
  };  

  return (
    <Box
      sx={{
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
      }}
    >
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions ?? [1, 5, 10]}
        count={-1} // -1 indicates we don't know the total number of rows
        rowsPerPage={pageSize}
        page={page - 1} // Convert 1-indexed to 0-indexed for pagination
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangePageSize}
        sx={{
          backgroundColor: 'transparent',
          display: 'flex', // Make the component flexible
          justifyContent: 'flex-end', // Align the pagination to the right
          padding: 0, 
          color: 'white',
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            color: '#FFD700',
          },
          '.MuiTablePagination-actions button': {
            color: '#FFD700',
          },
        }}
        nextIconButtonProps={{
          disabled: data.length < pageSize, // Disable "next" if fewer rows are fetched
        }}
        backIconButtonProps={{
          disabled: page === 1, // Disable "back" if on the first page
        }}
      />
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: '#081484',
          color: 'white',
          borderRadius: '10px',
        }}
      >
        <Table
          sx={{
            width: '100%',
          }}
        >
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.headerName}
                  sx={{
                    backgroundColor: '#4B0082',
                    width: col.width,
                    color: '#FFD700',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: '1rem',
                    minWidth: col.field === 'answerCheck' ? '200px' : 'auto', // Wider column for the Answer field
                  }}
                >
                  {col.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow
                key={idx}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: '#081484' },
                  '&:nth-of-type(even)': { backgroundColor: '#4B0082' },
                  '&:hover': { backgroundColor: '#2E0854' },
                }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.headerName}
                    sx={{
                      width: col.width,
                      color: 'white',
                      textAlign: 'center',
                      fontSize: '0.9rem',
                      border: '1px solid #FFD700',
                    }}
                  >
                    {col.renderCell ? col.renderCell(row) : defaultRenderCell(col, row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
