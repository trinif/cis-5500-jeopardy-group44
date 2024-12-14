import { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Modal } from '@mui/material';
//maybe won't need all these charts but it looks cool?
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { NavLink } from 'react-router-dom';

import { useAuth } from './Context';
const config = require('../config.json');

// modal (a common example of a modal is a dialog window).
// Typically, modals will conditionally appear (specified by the Modal's open property)
// but in our implementation whether the Modal is open is handled by the parent component
// (see HomePage.js for example), since it depends on the state (selectedSongId) of the parent
export default function QuestionCard({ questionId, handleClose }) {
  const [questionData, setQuestionData] = useState({});

  const [extraData, setExtraData] = useState(null);

  const [answer, setAnswer] = useState('')
  const [answerMessage, setAnswerMessage] = useState('')

  const { userId } = useAuth();

  useEffect(() => {
    //change fetch server
    fetch(`http://${config.server_host}:${config.server_port}/question/${questionId}/`)
      .then(res => res.json())
      .then(questionData => {
        setQuestionData(questionData);
      })
  }, [questionId]);

  const checkButtonHandler = () => {
    fetch(`http://${config.server_host}:${config.server_port}/check_answer/${questionId}/${answer}`, {
      method: "POST",
    }).then(res => {
      return res.json()
    }).then(resJson => {
      if (resJson.status == 'Correct') {
        setAnswerMessage('Correct!')
        fetch(`http://${config.server_host}:${config.server_port}/update_user_answer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({userId, questionId, is_correct: 1}),
        })
      } else if (resJson.status == 'Incorrect') {
        setAnswerMessage(`Incorrect! The correct answer is '${resJson.message}'`)
        fetch(`http://${config.server_host}:${config.server_port}/update_user_answer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({userId, questionId, is_correct: 0}),
        })
    }
    }).catch(err => {
        console.log(err)
    })
  }

  useEffect(() => {
    if (questionData.jeopardy_or_general === '0') { // jeopardy
        fetch(`http://${config.server_host}:${config.server_port}/question_jeopardy/${questionId}`)
            .then(res => res.json())
            .then(resJson => {
                setExtraData(resJson)
            }).catch(err => {

            })
    } else { // general trivia
        fetch(`http://${config.server_host}:${config.server_port}/question_trivia/${questionId}`)
            .then(res => res.json())
            .then(resJson => {
                setExtraData(resJson)
            }).catch(err => {

            })
    }
  }, [questionData])

  const formatAirDate = (airDate) => {
    if (!airDate) return '';
    return airDate.split('T')[0]; // Extract only the date part
  };

  return (
    <Modal
      open={true}
      onClose={handleClose}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      {questionData && 
        <Box
            p={3}
            style={{ background: 'white', borderRadius: '16px', border: '2px solid #000', width: 600 }}
        >
            <h1>{questionData.question}</h1>
            <h2>{questionData.subject}</h2>

            <input type='text' 
                value={answer} 
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    checkButtonHandler();
                    }
                }}>
            </input>
            <button onClick={checkButtonHandler}>Check</button>
            <div>
                {answerMessage && <p>{answerMessage}</p>}
            </div>
            
        </Box>
      }
    </Modal>
  );
}