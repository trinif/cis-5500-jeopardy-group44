import { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Modal } from '@mui/material';
//maybe won't need all these charts but it looks cool?
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { NavLink } from 'react-router-dom';

import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');

// modal (a common example of a modal is a dialog window).
// Typically, modals will conditionally appear (specified by the Modal's open property)
// but in our implementation whether the Modal is open is handled by the parent component
// (see HomePage.js for example), since it depends on the state (selectedSongId) of the parent
export default function QuestionCard({ questionId, handleClose }) {
  const [questionData, setQuestionData] = useState({});

  //maybe won't need
  const [barRadar, setBarRadar] = useState(true);

  useEffect(() => {
    //change fetch server
    fetch(`http://${config.server_host}:${config.server_port}/question/${questionId}/`)
      .then(res => res.json())
      .then(questionData => {
        console.log(questionData);
        setQuestionData(questionData);
        console.log(questionId);
        console.log(questionData);
        //maybe won't need
        /* fetch(`http://${config.server_host}:${config.server_port}/album/${resJson.album_id}`)
          .then(res => res.json())
          .then(resJson => setAlbumData(resJson)); */
      })
  }, [questionId]);

  /* const chartData = [
    { name: 'Danceability', value: songData.danceability },
    { name: 'Energy', value: songData.energy },
    { name: 'Valence', value: songData.valence },
  ]; */

  const handleGraphChange = () => {
    setBarRadar(!barRadar);
  };

  return (
    <Modal
      open={true}
      onClose={handleClose}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Box
        p={3}
        style={{ background: 'white', borderRadius: '16px', border: '2px solid #000', width: 600 }}
      >
        <h1>{questionData.question}</h1>
        <h2>{questionData.subject}</h2>
        
      </Box>
    </Modal>
  );
}