import { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, Divider, TextField, Stack } from '@mui/material';
import { useAuth } from "../components/Context";

const config = require('../config.json');

export default function HomePage() {
  const [questionOfTheDay, setQuestionOfTheDay] = useState({});
  const [question_id, setQuestionId] = useState('');
  const [answer, setAnswer] = useState('');
  const [answerMessage, setAnswerMessage] = useState('');

  useEffect(() => {
    fetch(`https://${config.server_host}/random`)
      .then((res) => res.json())
      .then((resJson) => {
        // Save question and today's date to localStorage
        const today = new Date().toDateString();
        localStorage.setItem('qotd', JSON.stringify(resJson));
        localStorage.setItem('qotdDate', today);
        setQuestionOfTheDay(resJson);
        setQuestionId(resJson.question_id);
      })
      .catch((err) => console.error('Error fetching question:', err));
  };

  useEffect(() => {
    const savedQuestion = localStorage.getItem('qotd');
    const savedDate = localStorage.getItem('qotdDate');
    const today = new Date().toDateString();

    if (savedQuestion && savedDate === today) {
      // Use the saved question if it's for today
      setQuestionOfTheDay(JSON.parse(savedQuestion));
    } else {
      // Fetch a new question if no valid saved question exists
      fetchNewQuestion();
    }
  }, []);

  const checkAnswerHandler = () => {
    fetch(`https://${config.server_host}/check_answer/${questionOfTheDay.question_id}/${answer}`, {
      method: "POST",
    })
      .then(res => res.json())
      .then(resJson => {
        if (resJson.status === 'Correct') {
          setAnswerMessage('Correct!');
          fetch(`https://${config.server_host}/update_user_answer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, question_id, is_correct: 1 }),
          });
        } else if (resJson.status === 'Incorrect') {
          setAnswerMessage(`Incorrect! The correct answer is '${resJson.message}'`);
          fetch(`https://${config.server_host}/update_user_answer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, question_id, is_correct: 0 }),
          });
        }
      })
      .catch(err => console.error(err));
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
          <Typography variant="h8" sx={{ display: 'block', marginTop: '20px', }}>
            <strong>Category:</strong> {questionOfTheDay.category}
          </Typography>
          <Typography variant="h8" sx={{ display: 'block' }}>
            <strong>Value:</strong> {questionOfTheDay.value}
          </Typography>

          <TextField
            label="Your Answer"
            variant="outlined"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                checkAnswerHandler();
              }
            }}
            sx={{
              marginTop: 3,
              marginBottom: 2,
              backgroundColor: 'white',
              borderRadius: '5px',
              maxWidth: '340px',
              width: '100%',
            }}
          />
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              sx={{
                borderColor: 'gold',
                color: 'gold',
                '&:hover': {
                  backgroundColor: 'gold',
                  color: '#081484',
                },
              }}
              onClick={checkAnswerHandler}
            >
              Check Answer
            </Button>  
          </Stack>

          {answerMessage && (
            <Typography variant="body1" mt={2}>
              {answerMessage}
            </Typography>
          )}
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
