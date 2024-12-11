import { useEffect, useState } from 'react';
import { useAuth } from '../components/Context';

const config = require('../config.json');

export default function SongsPage() {
  const { userId } = useAuth();

  const [overallUserAccuracy, setOverallUserAccuracy] = useState('')
  const [categoryUserAccuracy, setCategoryUserAccuracy] = useState([])

  const [overallAccuracy, setOverallAccuracy] = useState('')
  const [categoricalAccuracy, setCategoricalAccuracy] = useState([])

  const [topUsers, setTopUsers] = useState([])

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/overall_accuracy/${userId}`)
      .then(res => res.json())
      .then(resJson => {
        setOverallUserAccuracy(resJson.accuracy)
      }).catch(err => {
        console.log(err)
      })
    
    fetch(`http://${config.server_host}:${config.server_port}/overall_accuracy_universal`)
      .then(res => res.json())
      .then(resJson => {
        setOverallAccuracy(resJson.accuracy)
      }).catch(err => {
        console.log(err)
      })
      
      fetch(`http://${config.server_host}:${config.server_port}/top_users`)
        .then(res => res.json())
        .then(resJson => {
          setTopUsers(resJson)
        }).catch(err => {
          console.log(err)
        })
  })


  return (
    <>
      <div className="user statistics">
        <h1>User Statistics</h1>
        <p>Overall Accuracy: {overallUserAccuracy}</p>
        <p>Categorical Accuracy:</p>
        {/* some way to format categorical accuracy */}
      </div>

      <div className="overall statistics">
        <h1>Overall Statistics</h1>
        <p>Overall Accuracy: {overallAccuracy}</p>
        <p>Categorical Accuracy:</p>
        {/* some way to format */}
      </div>

      <div className="leaderboard">
        <h1>Leaderboard</h1>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {topUsers.map((row, idx) => {
              return (
                <tr
                  key={idx}
                >
                  <td>{row.user_id}</td>
                  <td>{row.accuracy}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}