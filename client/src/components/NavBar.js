import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { NavLink } from 'react-router-dom';


function NavText({ href, text }) {
  return (
    <Typography
      variant="h6"
      noWrap
      sx={{
        fontFamily: 'Anton, sans-serif',
        fontWeight: 700,
        letterSpacing: '.3rem',
        color: 'inherit',
        textDecoration: 'none',
        textAlign: 'center',
        flex: 1,
        position: 'relative',
        '&:hover': {
          color: '#FFD700', // Gold on hover
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -5,
          left: 0,
          width: 0,
          height: 3,
          backgroundColor: '#FFD700', // Gold underline effect
          transition: 'width 0.3s ease-in-out',
        },
        '&:hover::after': {
          width: '100%',
        },
      }}
    >
      <NavLink
        to={href}
        style={{
          color: 'inherit',
          textDecoration: 'none',
        }}
      >
        {text}
      </NavLink>
    </Typography>
  );
}

export default function NavBar() {
  return (
    <AppBar
      position="static"
      sx={{
        background: 'linear-gradient(90deg, #081484 0%, #4B0082 100%)', // Gradient background
        padding: '10px 0',
        borderBottom: '4px solid #FFD700', // Golden border
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-evenly',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-evenly', width: '100%' }}>
          {/* Navigation Links */}
          <NavText href="/" text="Home" />
          <NavText href="/question_selection" text="Question Selection" />
          <NavText href="/statistics" text="Statistics" />
          <NavText href="/login" text="Login | Signup"
        </Box>
      </Toolbar>
    </AppBar>
  );
}
