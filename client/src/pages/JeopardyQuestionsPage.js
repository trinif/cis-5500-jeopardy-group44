import { useEffect, useState } from "react";
import { Box, Button, Container, Typography, TextField, Divider, Stack } from '@mui/material';
import { useAuth } from "../components/Context";

const config = require('../config.json');

/*
* "Test Yourself" page - contains random Jeopardy questions
* User can answer one at a time and receive feedback on whether they were correct or not
*/
export default function JeopardyQuestions() {

    // [total, correct, incorrect]
    const [questionsAnswered, setQuestionsAnswered] = useState([0, 0, 0]);

    const [fetchTrigger, setFetchTrigger] = useState(0);

    const [questionId, setQuestionId] = useState('');
    const [question, setQuestion] = useState('');
    const [category, setCategory] = useState('');
    const [value, setValue] = useState('');

    const [answer, setAnswer] = useState('');
    const [answerMessage, setAnswerMessage] = useState('');

    const { userId } = useAuth();

    // Checks user-inputted answer
    const checkButtonHandler = () => {
        fetch(`http://${config.server_host}/check_answer/${questionId}/${answer}`, {
            method: "POST",
        }).then(res => res.json())
          .then(resJson => {
            if (resJson.status === 'Correct') {
                setAnswerMessage('Correct!');
                setQuestionsAnswered(([total, correct, incorrect]) => [
                    total + 1,
                    correct + 1,
                    incorrect
                ]);
                fetch(`http://${config.server_host}/update_user_answer`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId, questionId, is_correct: 1 }),
                });
            } else if (resJson.status === 'Incorrect') {
                setAnswerMessage(`Incorrect! The correct answer is '${resJson.message}'`);
                setQuestionsAnswered(([total, correct, incorrect]) => [
                    total + 1,
                    correct,
                    incorrect + 1
                ]);
                fetch(`http://${config.server_host}/update_user_answer`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId, questionId, is_correct: 0 }),
                });
            }
        }).catch(err => console.log(err));
    };

    // Populates a new question from fetchTrigger
    const newQuestionButtonHandler = () => {
        setFetchTrigger(fetchTrigger + 1); // Increment the trigger
    };

    // Populates random Jeopardy question from route
    useEffect(() => {
        console.log("Fetching question...");
        fetch(`http://${config.server_host}/random`)
            .then((res) => res.json())
            .then((resJson) => {
                setQuestionId(resJson.question_id);
                setQuestion(resJson.question);
                setCategory(resJson.category);
                setValue(resJson.value);
                setAnswer('');
                setAnswerMessage('');
            })
            .catch(err => console.error("Error fetching question:", err));
    }, [fetchTrigger]); // Dependency on fetchTrigger

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
                Test Yourself
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
                        Question
                    </Typography>

                    <Typography variant="h6">{question}</Typography>
                    <Typography variant="h8" sx={{ display: 'block', marginTop: '20px', }}>
                        <strong>Category:</strong> {category}
                    </Typography>
                    <Typography variant="h8" sx={{ display: 'block' }}>
                        <strong>Value:</strong> {value}
                    </Typography>

                    <TextField
                        label="Your Answer"
                        variant="outlined"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                checkButtonHandler();
                            }
                        }}
                        sx={{
                            marginY: 3,
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
                            onClick={checkButtonHandler}
                        >
                            Check Answer
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
                            onClick={newQuestionButtonHandler}
                        >
                            Get New Question
                        </Button>
                    </Stack>

                    {answerMessage && (
                        <Typography variant="body1" mt={3}>
                            {answerMessage}
                        </Typography>
                    )}
                </Box>

                <Divider sx={{ backgroundColor: 'gold', marginY: 3 }} />

                <Box mt={4}>
                    <Typography variant="h6" align="center">
                        Number of Questions Answered: {questionsAnswered[0]}
                    </Typography>
                    <Typography variant="h6" align="center">
                        Number of Correct Answers: {questionsAnswered[1]}
                    </Typography>
                    <Typography variant="h6" align="center">
                        Number of Incorrect Answers: {questionsAnswered[2]}
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
