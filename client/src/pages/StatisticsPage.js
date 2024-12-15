import { useEffect, useState } from 'react';
import { Box, Typography, Container, Divider, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { useAuth } from '../components/Context';
import { Link as RouterLink } from 'react-router-dom'; 

const config = require('../config.json');

export default function StatisticsPage() {
  const { userId } = useAuth();

  const [overallUserAccuracy, setOverallUserAccuracy] = useState('');
  const [categoryUserAccuracy, setCategoryUserAccuracy] = useState([]);
  const [bestCategoryAccuracy, setBestCategoryAccuracy] = useState('');
  const [worstCategoryAccuracy, setWorstCategoryAccuracy] = useState('');

  const [overallAccuracy, setOverallAccuracy] = useState('');
  const [categoryAccuracy, setcategoryAccuracy] = useState([]);
  const [bestCategoryAccuracyUniversal, setBestCategoryAccuracyUniversal] = useState('');
  const [worstCategoryAccuracyUniversal, setWorstCategoryAccuracyUniversal] = useState('');

  const [topUsers, setTopUsers] = useState([]);
  const [topUsersFriends, setTopUsersFriends] = useState([]);
  const [triggerEffect, setTriggerEffect] = useState(false);

  const [followingWorstQuestions, setFollowingWorstQuestions] = useState([]);
  const [leastAccurateQuestions, setLeastAccurateQuestions] = useState([]);

  const followHandler = (user_id) => {
    fetch(`http://${config.server_host}/follow_user/${userId}/${user_id}`, { method: 'POST' })
      .then((res) => res.json())
      .then(() => setTriggerEffect(!triggerEffect))
      .catch((err) => console.log(err));
  };

  const unfollowHandler = (user_id) => {
    fetch(`http://${config.server_host}/unfollow_user/${userId}/${user_id}`, { method: 'POST' })
      .then((res) => res.json())
      .then(() => setTriggerEffect(!triggerEffect))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetch(`http://${config.server_host}/overall_accuracy/${userId}`)
      .then((res) => res.json())
      .then((resJson) => setOverallUserAccuracy(resJson.accuracy))
      .catch((err) => console.log(err));

    fetch(`http://${config.server_host}/category_accuracy/${userId}`)
      .then((res) => res.json())
      .then((resJson) => setCategoryUserAccuracy(resJson))
      .catch((err) => console.log(err));

    fetch(`http://${config.server_host}/best_worst_category/${userId}`)
      .then((res) => res.json())
      .then((resJson) => {
        setBestCategoryAccuracy(resJson.best_category);
        setWorstCategoryAccuracy(resJson.worst_category);
      })
      .catch((err) => console.log(err));

    fetch(`http://${config.server_host}/overall_accuracy_universal`)
      .then((res) => res.json())
      .then((resJson) => setOverallAccuracy(resJson.accuracy))
      .catch((err) => console.log(err));

    fetch(`http://${config.server_host}/category_accuracy_universal`)
      .then((res) => res.json())
      .then((resJson) => setcategoryAccuracy(resJson))
      .catch((err) => console.log(err));

    fetch(`http://${config.server_host}/best_worst_category_universal`)
      .then((res) => res.json())
      .then((resJson) => {
        setBestCategoryAccuracyUniversal(resJson.best_category);
        setWorstCategoryAccuracyUniversal(resJson.worst_category);
      })
      .catch((err) => console.log(err));

    fetch(`http://${config.server_host}/top_users`)
      .then((res) => res.json())
      .then((resJson) => setTopUsers(resJson))
      .catch((err) => console.log(err));
      
    if (!userId.startsWith('guest_')) {
      Promise.all(
        topUsers.map(async (row) => {
          let top_user_id = row.user_id
          try {
            let res = await fetch(`http://${config.server_host}/check_follow_status/${userId}/${top_user_id}`)
            let resJson = await res.json()
            return { ...row, follow: resJson.length > 0 }; 
          } catch (err) {
            console.log(err)
            return
          } 
        })
      ).then(updatedUsers => {
        setTopUsers(updatedUsers)
      }).catch(err => {
        console.log(err)
      })
    }   


    fetch(`http://${config.server_host}/top_users_friends/${userId}`)
      .then((res) => res.json())
      .then((resJson) => setTopUsersFriends(resJson))
      .catch((err) => console.log(err));

    fetch(`http://${config.server_host}/following_worst_questions/${userId}`)
      .then((res) => res.json())
      .then((resJson) => setFollowingWorstQuestions(resJson))
      .catch((err) => console.log(err));

    fetch(`http://${config.server_host}/least_accurate_questions_top_users/`)
      .then((res) => res.json())
      .then((resJson) => setLeastAccurateQuestions(resJson))
      .catch((err) => console.log(err));
  }, [userId, triggerEffect]);

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #081484 30%, #4B0082 100%)',
        minHeight: '100vh',
        color: 'white',
        paddingTop: '20px',
        paddingBottom: '50px',
      }}
    >
      <Container>
        <Typography variant="h2" align="center" gutterBottom>
          User Statistics
        </Typography>
        <Divider sx={{ backgroundColor: 'gold', marginY: 3 }} />

        {userId.startsWith('guest_') && (
          <Typography
            variant="h6"
            align="center"
            sx={{
              //backgroundColor: 'rgba(255, 255, 255, 0.2)', // Optional background for emphasis
              color: 'gold',
              borderRadius: '8px',
              padding: '10px',
              marginBottom: '20px',
            }}
          >
            <span> 
              <RouterLink
                to="/login" 
                style={{
                  color: 'gold',
                  textDecoration: 'underline',
                }}
              >
                Log in or Sign up
              </RouterLink>
              {" "}to access user-dependent features.
            </span>
          </Typography>
        )}

        {/* Performance Statistics Section */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: '#081484',
              borderRadius: '10px',
              padding: '16px',
              border: '3px solid #FFD700',
              height: '100%',
            }}
          >
            <Typography variant="h4" align="center" sx={{ color: '#FFD700', lineHeight: 1.2 }}>
              My Performance
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{
                marginTop: '8px',
                lineHeight: 1.4,
              }}
            >
              <strong>Overall Accuracy:</strong> {overallUserAccuracy}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                marginTop: '8px', 
                marginBottom: '16px',
              }}
            >
              <Typography variant="body1" sx={{ lineHeight: 1.4 }}>
                <strong>Best Category:</strong> {bestCategoryAccuracy}
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.4 }}>
                <strong>Worst Category:</strong> {worstCategoryAccuracy}
              </Typography>
            </Box>
            <Box
              sx={{
                backgroundColor: 'rgba(180, 150, 200, 0.4)',
                borderRadius: '8px',
                padding: '8px',
              }}
            >
              <BarChart
                xAxis={[
                  {
                    scaleType: 'band',
                    data: categoryUserAccuracy.map((row) => row.subject),
                  },
                ]}
                series={[
                  {
                    data: categoryUserAccuracy.map((row) => row.accuracy),
                    color: '#FFD700',
                  },
                ]}
                width={550} 
                height={280} 
              />
            </Box>
          </Box>
          </Grid>

          <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: '#081484',
              borderRadius: '10px',
              padding: '16px',
              border: '3px solid #FFD700',
              height: '100%',
            }}
          >
            <Typography variant="h4" align="center" sx={{ color: '#FFD700', lineHeight: 1.2 }}>
              Overall Performance
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{
                marginTop: '8px',
                lineHeight: 1.4,
              }}
            >
              <strong>Overall Accuracy:</strong> {overallAccuracy}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                marginTop: '8px', 
                marginBottom: '16px',
              }}
            >
              <Typography variant="body1" sx={{ lineHeight: 1.4 }}>
                <strong>Best Category:</strong> {bestCategoryAccuracyUniversal}
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.4 }}>
                <strong>Worst Category:</strong> {worstCategoryAccuracyUniversal}
              </Typography>
            </Box>
            <Box
              sx={{
                backgroundColor: 'rgba(180, 150, 200, 0.4)',
                borderRadius: '8px',
                padding: '8px',
              }}
            >
              <BarChart
                xAxis={[
                  {
                    scaleType: 'band',
                    data: categoryAccuracy.map((row) => row.subject),
                  },
                ]}
                series={[
                  {
                    data: categoryAccuracy.map((row) => row.accuracy),
                    color: '#FFD700',
                  },
                ]}
                width={550} 
                height={280} 
              />
            </Box>
          </Box>
          </Grid>
        </Grid>

        {/* Leaderboards */}
        <Grid container spacing={2} sx={{ marginTop: 3 }}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                backgroundColor: '#081484',
                borderRadius: '10px',
                padding: '20px',
                border: '3px solid #FFD700',
                height: '100%',
              }}
            >
              <Typography variant="h4" align="center" sx={{ color: '#FFD700' }}>Leaderboard</Typography>
              <TableContainer component={Paper} sx={{ backgroundColor: '#FFD700', marginTop: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {!userId.startsWith('guest_') && <TableCell sx={{ color: '#081484', fontWeight: 'bold' }}>Action</TableCell>}
                      <TableCell sx={{ color: '#081484', fontWeight: 'bold' }}>Username</TableCell>
                      <TableCell sx={{ color: '#081484', fontWeight: 'bold' }}>Accuracy</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topUsers.map((row, idx) => (
                      <TableRow key={idx}>
                        {!userId.startsWith('guest_') && (
                          <TableCell>
                            {row.follow ? (
                              <Button variant="contained" sx={{ backgroundColor: '#FFD700', color: '#081484' }} onClick={() => unfollowHandler(row.user_id)}>
                                Unfollow
                              </Button>
                            ) : (
                              <Button variant="contained" sx={{ backgroundColor: '#FFD700', color: '#081484' }} onClick={() => followHandler(row.user_id)}>
                                Follow
                              </Button>
                            )}
                          </TableCell>
                        )}
                        <TableCell sx={{ color: '#081484' }}>{row.user_id}</TableCell>
                        <TableCell sx={{ color: '#081484' }}>{row.accuracy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                backgroundColor: '#081484',
                borderRadius: '10px',
                padding: '20px',
                border: '3px solid #FFD700',
                height: '100%',
              }}
            >
              <Typography variant="h4" align="center" sx={{ color: '#FFD700' }}>Friend Leaderboard</Typography>
              <TableContainer component={Paper} sx={{ backgroundColor: '#FFD700', marginTop: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#081484', fontWeight: 'bold' }}>Username</TableCell>
                      <TableCell sx={{ color: '#081484', fontWeight: 'bold' }}>Accuracy</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topUsersFriends.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ color: '#081484' }}>{row.user_id}</TableCell>
                        <TableCell sx={{ color: '#081484' }}>{row.accuracy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>
        </Grid>
        
        <Grid container spacing={2} sx={{ marginTop: 3 }}>
        {/* Tough Questions Section */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: '#081484',
              borderRadius: '10px',
              padding: '20px',
              border: '3px solid #FFD700',
              height: '100%',
            }}
          >
            <Typography variant="h4" align="center" sx={{ color: '#FFD700' }}>
              Toughest Questions from your Friends!
            </Typography>
            <TableContainer component={Paper} sx={{ backgroundColor: '#FFD700', marginTop: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#081484', fontWeight: 'bold' }}>Question</TableCell>
                    <TableCell sx={{ color: '#081484', fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell sx={{ color: '#081484', fontWeight: 'bold' }}>Total Answers</TableCell>
                    <TableCell sx={{ color: '#081484', fontWeight: 'bold' }}>Correct Answers</TableCell>
                    <TableCell sx={{ color: '#081484', fontWeight: 'bold' }}>Accuracy</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {followingWorstQuestions.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ color: '#081484' }}>{row.question}</TableCell>
                      <TableCell sx={{ color: '#081484' }}>{row.subject}</TableCell>
                      <TableCell sx={{ color: '#081484' }}>{row.total_answers}</TableCell>
                      <TableCell sx={{ color: '#081484' }}>{row.correct_answers}</TableCell>
                      <TableCell sx={{ color: '#081484' }}>{row.accuracy}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: '#081484',
              borderRadius: '10px',
              padding: '20px',
              border: '3px solid #FFD700',
              height: '100%',
            }}
          >
            <Typography variant="h4" align="center" sx={{ color: '#FFD700' }}>
              Toughest Questions from Our Top Users!
            </Typography>
            <TableContainer component={Paper} sx={{ backgroundColor: '#FFD700', marginTop: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#081484', fontWeight: 'bold' }}>Question</TableCell>
                    <TableCell sx={{ color: '#081484', fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell sx={{ color: '#081484', fontWeight: 'bold' }}>Total Answers</TableCell>
                    <TableCell sx={{ color: '#081484', fontWeight: 'bold' }}>Correct Answers</TableCell>
                    <TableCell sx={{ color: '#081484', fontWeight: 'bold' }}>Accuracy</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leastAccurateQuestions.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ color: '#081484' }}>{row.question}</TableCell>
                      <TableCell sx={{ color: '#081484' }}>{row.subject}</TableCell>
                      <TableCell sx={{ color: '#081484' }}>{row.total_answers}</TableCell>
                      <TableCell sx={{ color: '#081484' }}>{row.correct_answers}</TableCell>
                      <TableCell sx={{ color: '#081484' }}>{row.accuracy}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>
      </Grid>



      </Container>
    </Box>
  );
}
