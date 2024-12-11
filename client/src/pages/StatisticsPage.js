import { useEffect, useState } from 'react';
import { useAuth } from '../components/Context';

const config = require('../config.json');

export default function SongsPage() {
  const { userId } = useAuth();

  const [overallUserAccuracy, setOverallUserAccuracy] = useState('')
  const [categoryUserAccuracy, setCategoryUserAccuracy] = useState([])

  const [overallAccuracy, setOverallAccuracy] = useState('')
  const [categoryAccuracy, setcategoryAccuracy] = useState([])

  const [topUsers, setTopUsers] = useState([])
  const [topUsersFriends, setTopUsersFriends] = useState([])

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/overall_accuracy/${userId}`)
      .then(res => res.json())
      .then(resJson => {
        setOverallUserAccuracy(resJson.accuracy)
      }).catch(err => {
        console.log(err)
      })
    
    fetch(`http://${config.server_host}:${config.server_port}/category_accuracy/${userId}`)
      .then(res => res.json())
      .then(resJson => {
        setCategoryUserAccuracy(resJson)
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

    fetch(`http://${config.server_host}:${config.server_port}/category_accuracy_universal`)
      .then(res => res.json())
      .then(resJson => {
        setcategoryAccuracy(resJson)
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
    
    fetch(`http://${config.server_host}:${config.server_port}/top_users_friends/${userId}`)
      .then(res => res.json())
      .then(resJson => {
        setTopUsersFriends(resJson)
      }).catch(err => {
        console.log(err)
      })
  }, [])

  const followHandler = (user_id) => {
    console.log(user_id)
    fetch(`http://${config.server_host}:${config.server_port}/follow_user/${userId}/${user_id}`, {
      method: 'POST'
    })
      .then(res => res.json())
      .then(resJson => {
      }).catch(err => {
        console.log(err)
      })
  }


  return (
    <>
      <div className="user statistics">
        <h1>User Statistics</h1>
        <p>Overall Accuracy: {overallUserAccuracy}</p>
        <p>Categorical Accuracy:</p>
        {categoryUserAccuracy && 
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {categoryUserAccuracy.map((row, idx) => {
                return (
                  <tr
                    key={idx}
                  >
                    <td>{row.subject}</td>
                    <td>{row.accuracy}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        }
      </div>

      <div className="overall statistics">
        <h1>Overall Statistics</h1>
        <p>Overall Accuracy: {overallAccuracy}</p>
        <p>Categorical Accuracy:</p>
        {categoryUserAccuracy && 
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {categoryAccuracy.map((row, idx) => {
                return (
                  <tr
                    key={idx}
                  > 
                    <td>{row.subject}</td>
                    <td>{row.accuracy}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        }
      </div>

      <div className="leaderboard">
        <h1>Leaderboard</h1>
        {topUsers && 
          <table>
            <thead>
              <tr>
                <th></th>
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
                    <td><button onClick={e => {
                      followHandler(row.user_id)
                    }}>Follow</button></td>
                    <td>{row.user_id}</td>
                    <td>{row.accuracy}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        }

        <h1>Friend Leaderboard</h1>
        {topUsersFriends && 
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {topUsersFriends.map((row, idx) => {
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
        }
      </div>
    </>
  );
}