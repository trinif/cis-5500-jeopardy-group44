import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useAuth } from './Context'; // Import the useAuth hook

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
  const { userId } = useAuth(); // Get the current user ID from the AuthContext

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
          justifyContent: 'center', // Center all items in the toolbar
          padding: '0',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between', // Evenly distribute items
            alignItems: 'center',
            width: '100%',
            maxWidth: '1200px', // Limit max width for the nav bar content
            padding: '0 20px', // Add some padding on the sides
          }}
        >
          {/* Navigation Links */}
          <NavText href="/" text="Home" />
          <NavText href="/question_selection" text="Question Selection" />
          <NavText href="/statistics" text="Statistics" />
          {userId && !userId.startsWith('guest_') ? (
            // Show the username if logged in
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Anton, sans-serif',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: '#FFD700',
              }}
            >
              {`${userId}`}
            </Typography>
          ) : (
            // Show Login | Signup if not logged in
            <NavText href="/login" text="Login | Signup" />
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
