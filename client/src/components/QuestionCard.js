import { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Modal, Grid } from '@mui/material';
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

  const [extraInformation, setExtraInformation] = useState(null)

  const { userId } = useAuth();

  useEffect(() => {
    //change fetch server
    fetch(`http://${config.server_host}/question/${questionId}/`)
      .then(res => res.json())
      .then(resJson => {
        setQuestionData(resJson);
      }).catch(err => {
        console.log(err)
      })
  }, [questionId]);

const checkButtonHandler = () => {
    fetch(`http://${config.server_host}/check_answer/${questionId}/${answer}`, {
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
          body: JSON.stringify({userId, questionId, is_correct: 1}),
        })
      } else if (resJson.status == 'Incorrect') {
        setAnswerMessage(`Incorrect! The correct answer is '${resJson.message}'`)
        fetch(`http://${config.server_host}/update_user_answer`, {
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
        fetch(`http://${config.server_host}/question_jeopardy/${questionId}`)
            .then(res => res.json())
            .then(resJson => {
                setExtraData(resJson)
                console.log(resJson)
            }).catch(err => {

            })
    } else { // general trivia
        fetch(`http://${config.server_host}/question_trivia/${questionId}`)
            .then(res => res.json())
            .then(resJson => {
                resJson.descriptions = resJson.descriptions.split(';;;')
                resJson.urls = resJson.urls.split(';;;')
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
      {questionData && (
        <Grid
          style={{
            display: 'flex',
            flexDirection: 'row'
          }}
        >
          <Grid
            p={3}
            style={{ background: 'white', borderRadius: '16px', border: '2px solid #000', width: 600 }}
          >
            <h1>{questionData.question}</h1>
            <h2>{questionData.subject}</h2>

            {extraData && (
              questionData.jeopardy_or_general == '0' ? (
                <>
                  <p>Category: {extraData.category}</p>
                  <p>Round: {extraData.round}</p>
                  <p>Value: {extraData.value}</p>
                  <p>Air Date: {formatAirDate(extraData.air_date)}</p>
                </>
              ) : questionData.jeopardy_or_general == '1' ? (
                <>
                  {/* extraData.descriptions.map((row, idx) => {
                    return <p>Description {idx}: {row}</p>
                  }) */}

                  {extraData.urls.map((row, idx) => {
                    return <div>{idx}: <a href={row} target="_blank" rel="noopener noreferrer">{row}</a></div>
                  })}
                </>
                ) : null
            )}

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
              {answerMessage && (
                <>
                  <p>{answerMessage}</p>
                  <button onClick={e => setExtraInformation('hello')}>See similar information</button>
                </>
              )}
            </div> 
          </Grid>

          {extraInformation && (
            <Grid
              p={3}
              style={{ background: 'white', borderRadius: '16px', border: '2px solid #000', width: 600 }}
            >
              <h1>Hello</h1>

            </Grid>
          )}
        </Grid>
      )}
    </Modal>
  );
}