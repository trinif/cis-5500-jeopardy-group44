import { useEffect, useState } from 'react';
import { Box, Typography, Container, Divider, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { useAuth } from '../components/Context';

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

  const followHandler = (user_id) => {
    fetch(`http://${config.server_host}:${config.server_port}/follow_user/${userId}/${user_id}`, { method: 'POST' })
      .then((res) => res.json())
      .then(() => setTriggerEffect(!triggerEffect))
      .catch((err) => console.log(err));
  };

  const unfollowHandler = (user_id) => {
    fetch(`http://${config.server_host}:${config.server_port}/unfollow_user/${userId}/${user_id}`, { method: 'POST' })
      .then((res) => res.json())
      .then(() => setTriggerEffect(!triggerEffect))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/overall_accuracy/${userId}`)
      .then((res) => res.json())
      .then((resJson) => setOverallUserAccuracy(resJson.accuracy))
      .catch((err) => console.log(err));

    fetch(`http://${config.server_host}:${config.server_port}/category_accuracy/${userId}`)
      .then((res) => res.json())
      .then((resJson) => setCategoryUserAccuracy(resJson))
      .catch((err) => console.log(err));

    fetch(`http://${config.server_host}:${config.server_port}/best_worst_category/${userId}`)
      .then((res) => res.json())
      .then((resJson) => {
        setBestCategoryAccuracy(resJson.best_category);
        setWorstCategoryAccuracy(resJson.worst_category);
      })
      .catch((err) => console.log(err));

    fetch(`http://${config.server_host}:${config.server_port}/overall_accuracy_universal`)
      .then((res) => res.json())
      .then((resJson) => setOverallAccuracy(resJson.accuracy))
      .catch((err) => console.log(err));

    fetch(`http://${config.server_host}:${config.server_port}/category_accuracy_universal`)
      .then((res) => res.json())
      .then((resJson) => setcategoryAccuracy(resJson))
      .catch((err) => console.log(err));

    fetch(`http://${config.server_host}:${config.server_port}/best_worst_category_universal`)
      .then((res) => res.json())
      .then((resJson) => {
        setBestCategoryAccuracyUniversal(resJson.best_category);
        setWorstCategoryAccuracyUniversal(resJson.worst_category);
      })
      .catch((err) => console.log(err));

    fetch(`http://${config.server_host}:${config.server_port}/top_users`)
      .then((res) => res.json())
      .then((resJson) => setTopUsers(resJson))
      .catch((err) => console.log(err));

    fetch(`http://${config.server_host}:${config.server_port}/top_users_friends/${userId}`)
      .then((res) => res.json())
      .then((resJson) => setTopUsersFriends(resJson))
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
                backgroundColor: 'rgba(200, 180, 255, 0.4)',
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
                backgroundColor: 'rgba(200, 180, 255, 0.4)',
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
      </Container>
    </Box>
  );
}
