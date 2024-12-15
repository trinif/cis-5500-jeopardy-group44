import { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Modal, Grid } from '@mui/material';
import { NavLink } from 'react-router-dom';

import { useAuth } from './Context';
const config = require('../config.json');

/*
* QuestionCard is populated when user clicks on a question in the table
* Shows extra information about the question and allows the user to answer
*/
export default function QuestionCard({ questionId, handleClose }) {
  const [questionData, setQuestionData] = useState({});

  const [extraData, setExtraData] = useState(null);

  const [answer, setAnswer] = useState('')
  const [answerMessage, setAnswerMessage] = useState('')

  const [extraInformation, setExtraInformation] = useState(null)

  const { userId } = useAuth();

  useEffect(() => {
    fetch(`http://${config.server_host}/question/${questionId}/`)
      .then(res => res.json())
      .then(resJson => {
        setQuestionData(resJson);
      }).catch(err => {
        console.log(err)
      })
  }, [questionId]);

// Checks user-inputted answer and says if it is correct or not based on fetching routes
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
            {/* Shows question and subject fields no matter what, adds further information if it is Jeopardy or GeneralQuestions */}
            <h1>{questionData.question}</h1>
            <h2>{questionData.subject}</h2> 

            {/* Jeopardy-specific information (category, round, value, air date) */}
            {extraData && (
              questionData.jeopardy_or_general == '0' ? (
                <>
                  <p>Category: {extraData.category}</p>
                  <p>Round: {extraData.round}</p>
                  <p>Value: {extraData.value}</p>
                  <p>Air Date: {formatAirDate(extraData.air_date)}</p>
                </>
              ) : null
            )}

            {/* If user hits "Enter" on keyboard or clicks Check, will automatically check */}
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
                  {extraData && extraData.urls ? (
                    <p>
                      {extraData.urls.map((row, idx) => { //populates URLs after answer, if they exist
                        if (idx < 3) {
                          return <div>{idx+1}. <a href={row} target="_blank" rel="noopener noreferrer">{row}</a></div>
                        }
                      })}
                    </p>
                  ) : (null)}
                </>
              )}
            </div> 
          </Grid>
        </Grid>
      )}
    </Modal>
  );
}