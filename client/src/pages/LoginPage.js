import { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Divider } from '@mui/material';
import { useAuth } from '../components/Context';

const config = require('../config.json');

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const[status, setStatus] = useState('')

    const { userId, setUserId } = useAuth();

    // Handles registration
    const registerButtonHandler = () => {
        fetch(`http://${config.server_host}:${config.server_port}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username, password}),
            credentials: 'same-origin'
        }).then(res => {
            return res.json()
        }).then(resJson => {
            if (resJson.status == 'Success') {
                setUserId(resJson.username)
                setStatus(`Registration successful! You are now logged in as ${resJson.username}`)
            } else {
                setStatus(resJson.status)
            }
        }).catch(err => {
            console.log(err)
        })
    };

    // Handles login
    const loginButtonHandler = () => {
        fetch(`http://${config.server_host}:${config.server_port}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username, password}),
            credentials: 'same-origin'
        }).then(res => {
            return res.json()
        }).then(resJson => {
            if (resJson.status == 'Success') {
                setUserId(resJson.username)
                setStatus(`Login successful! You are now logged in as ${resJson.username}`)
            } else {
                console.log(resJson.status)
                setStatus(resJson.status)
            }
        }).catch(err => {
            console.log(err)
        })
    };

    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #081484 30%, #4B0082 100%)', // Match gradient
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                padding: '20px',
            }}
        >
            <Container
                maxWidth="sm"
                sx={{
                    backgroundColor: '#081484',
                    borderRadius: '10px',
                    padding: '30px',
                    border: '3px solid #FFD700',
                    textAlign: 'center',
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Login or Register
                </Typography>
                <Divider sx={{ backgroundColor: 'gold', marginY: 2 }} />
                <Box mb={3}>
                    <TextField
                        fullWidth
                        label="Username"
                        variant="outlined"
                        onChange={(e) => setUsername(e.target.value)}
                        InputProps={{
                            sx: { color: 'white' },
                        }}
                        InputLabelProps={{
                            sx: { color: 'white' },
                        }}
                        sx={{
                            marginBottom: 2,
                            input: { color: 'white' },
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                            sx: { color: 'white' },
                        }}
                        InputLabelProps={{
                            sx: { color: 'white' },
                        }}
                        sx={{
                            marginBottom: 2,
                            input: { color: 'white' },
                        }}
                    />
                </Box>
                <Box>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: 'gold',
                            color: '#081484',
                            '&:hover': {
                                backgroundColor: 'white',
                                color: '#081484',
                            },
                            marginRight: 2,
                        }}
                        onClick={loginButtonHandler}
                    >
                        Login
                    </Button>
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
                        onClick={registerButtonHandler}
                    >
                        Register
                    </Button>
                </Box>
            </Container>

            {status && <p>{status}</p>}
        </Box>
    );
}
