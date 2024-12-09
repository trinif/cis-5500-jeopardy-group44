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
} from '@mui/material';

export default function LazyTable({ route, columns, defaultPageSize, rowsPerPageOptions }) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1); // 1 indexed
  const [pageSize, setPageSize] = useState(defaultPageSize ?? 10);
  const [answersVisible, setAnswersVisible] = useState({}); // Tracks visibility for answers

  // Fetch data when the route, page, or pageSize changes
  useEffect(() => {
    console.log('Fetching data from:', `${route}&page=${page}&page_size=${pageSize}`);
    fetch(`${route}&page=${page}&page_size=${pageSize}`)
      .then((res) => res.json())
      .then((resJson) => {
        console.log('Fetched Data:', resJson); // Debug the fetched data
        setData(resJson);
      })
      .catch((err) => console.error('Error fetching data:', err));
  }, [route, page, pageSize]);

  const handleChangePage = (e, newPage) => {
    if (newPage < page || data.length === pageSize) {
      setPage(newPage + 1); // Convert zero-indexed page to one-indexed
    }
  };
  
  const handleChangePageSize = (e) => {
    const newPageSize = parseInt(e.target.value, 10);
    setPageSize(newPageSize);
    setPage(1); // Reset to first page
  };

  const toggleAnswerVisibility = (id) => {
    setAnswersVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const defaultRenderCell = (col, row) => {
    if (col.field === 'answer') {
      return (
        <Box textAlign="center">
          {answersVisible[row.question_id] ? (
            <div>
              <span>{row.answer}</span>
              <Button
                variant="text"
                size="small"
                onClick={() => toggleAnswerVisibility(row.question_id)}
                sx={{
                  color: '#FFD700',
                  textTransform: 'none',
                  fontWeight: 'bold',
                }}
              >
                Hide Answer
              </Button>
            </div>
          ) : (
            <Button
              variant="text"
              size="small"
              onClick={() => toggleAnswerVisibility(row.question_id)}
              sx={{
                color: '#FFD700',
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              Show Answer
            </Button>
          )}
        </Box>
      );
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
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: '#081484',
          color: 'white',
          borderRadius: '10px',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.headerName}
                  sx={{
                    backgroundColor: '#4B0082',
                    color: '#FFD700',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: '1rem',
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
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions ?? [5, 10, 25]}
        count={-1} // -1 indicates we don't know the total number of rows
        rowsPerPage={pageSize}
        page={page - 1} // Convert 1-indexed to 0-indexed for pagination
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangePageSize}
        sx={{
          backgroundColor: '#081484',
          color: 'white',
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            color: '#FFD700',
          },
          '.MuiTablePagination-actions button': {
            color: '#FFD700',
          },
        }}
      />
    </Box>
  );
}
