import { useEffect, useState } from 'react';
import { useAuth } from '../components/Context';

const config = require('../config.json');

export default function SongsPage() {
  const { userId } = useAuth();

  const [overallUserAccuracy, setOverallUserAccuracy] = useState('')
  const [categoryUserAccuracy, setCategoryUserAccuracy] = useState([])

  const [overallAccuracy, setOverallAccuracy] = useState('')
  const [categoricalAccuracy, setCategoricalAccuracy] = useState([])

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/overall_accuracy/${userId}`)
      .then(res => res.json())
      .then(resJson => {
        setOverallUserAccuracy(resJson.accuracy)
      }).catch(err => {
        console.log(err)
      })
  })


  return (
    <>
      <div className="user statistics">
        <p>User Statistics</p>
        <p>Overall Accuracy: {overallUserAccuracy}</p>
        <p>Categorical Accuracy:</p>
        {/* some way to format categorical accuracy */}
      </div>

      <div className="overall statistics">
        <p>Overall Statistics</p>
        <p>Overall Accuracy: {overallAccuracy}</p>
        <p>Categorical Accuracy:</p>
        {/* some way to format */}
      </div>

      <div className="leaderboard">
        
      </div>
    </>
  );
}