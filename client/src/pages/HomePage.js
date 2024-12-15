import { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, Divider } from '@mui/material';

const config = require('../config.json');

export default function HomePage() {
  const [questionOfTheDay, setQuestionOfTheDay] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetch(`http://${config.server_host}/random`)
      .then((res) => res.json())
      .then((resJson) => {
        setQuestionOfTheDay(resJson);
      });
  }, []);

  // Function to format air date to YYYY-MM-DD
  const formatAirDate = (airDate) => {
    if (!airDate) return '';
    return airDate.split('T')[0]; // Extract only the date part
  };

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
          <Typography variant="h8" sx={{ display: 'block' }}> <strong>Category:</strong> {questionOfTheDay.category}</Typography>
          <Typography variant="h8" sx={{ display: 'block' }}> <strong>Value:</strong> {questionOfTheDay.value}</Typography>
          <Typography variant="h8" sx={{ display: 'block' }}> <strong>Air Date:</strong> {formatAirDate(questionOfTheDay.air_date)}</Typography>
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
            {/* <Button
              variant="contained"
              sx={{
                backgroundColor: 'gold',
                color: '#081484',
                '&:hover': {
                  backgroundColor: 'white',
                },
              }}
              onClick={() => setShowDetails(!showDetails)}
            > */}
              {/* {showDetails ? 'Hide Details' : 'View More'} */}
            {/* </Button> */}
          </Box>
          {/* {showDetails && (
            <Box mt={3}>
              <Typography variant="body2" mt={2} sx={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <Box>
                  <strong>Air Date:</strong> {formatAirDate(questionOfTheDay.air_date)}
                </Box>
                <Box>
                  <strong>Value:</strong> {questionOfTheDay.value}
                </Box>
              </Typography>
            </Box>
          )} */}
        </Box>
        <Divider sx={{ backgroundColor: 'gold', marginY: 3 }} />
        <Box mt={4}>
          <Typography variant="h4" align="center" gutterBottom>
            About the Site
          </Typography>
          <Typography variant="body1" align="center">
          Discover, analyze, and sharpen your trivia skills with our Jeopardy Helper! <br />
          Explore a vast collection of questions, dive into analytics, and challenge yourself to become a trivia master. <br />
          Whether you're a Jeopardy! enthusiast or just curious, we've got everything you need to elevate your game! <br /> <br />
          By Mia Kim, Lyla Waitman, Sarah Zhang and Trini Feng

          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
