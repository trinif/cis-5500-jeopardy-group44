import { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, Divider } from '@mui/material';

const config = require('../config.json');

export default function HomePage() {
  const [questionOfTheDay, setQuestionOfTheDay] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/random`)
      .then((res) => res.json())
      .then((resJson) => setQuestionOfTheDay(resJson));
  }, []);

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #081484 30%, #4B0082 100%)', // Jeopardy gradient
        minHeight: '100vh',
        color: 'white',
        paddingTop: '20px',
      }}
    >
      <Container>
        <Typography variant="h2" align="center" gutterBottom>
          Welcome to Jeopardy Helper!
        </Typography>
        <Divider sx={{ backgroundColor: 'gold', marginY: 3 }} />
        <Box
          sx={{
            backgroundColor: '#081484',
            borderRadius: '10px',
            padding: '20px',
            border: '3px solid #FFD700',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Question of the Day
          </Typography>
          <Typography variant="h6">{questionOfTheDay.question}</Typography>
          {showAnswer && (
            <Typography variant="body1" mt={2}>
              <strong>Answer:</strong> {questionOfTheDay.answer}
            </Typography>
          )}
          <Box mt={2}>
            <Button
              variant="outlined"
              sx={{
                borderColor: 'gold',
                color: 'gold',
                '&:hover': {
                  backgroundColor: 'gold',
                  color: '#081484',
                },
                marginRight: '10px',
              }}
              onClick={() => setShowAnswer(!showAnswer)}
            >
              {showAnswer ? 'Hide Answer' : 'See Answer'}
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: 'gold',
                color: '#081484',
                '&:hover': {
                  backgroundColor: 'white',
                },
              }}
            >
              View More
            </Button>
          </Box>
        </Box>
        <Divider sx={{ backgroundColor: 'gold', marginY: 3 }} />
        <Box mt={4}>
          <Typography variant="h4" align="center" gutterBottom>
            About the Site
          </Typography>
          <Typography variant="body1" align="center">
            Explore questions, track analytics, and test your knowledge with our Jeopardy Helper!
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
