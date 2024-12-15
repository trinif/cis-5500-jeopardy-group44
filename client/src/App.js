import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import QuestionSelectionPage from './pages/QuestionSelectionPage';
import StatisticsPage from './pages/StatisticsPage';
import Login from "./pages/LoginPage";

import { createTheme } from "@mui/material/styles";
import JeopardyQuestions from "./pages/JeopardyQuestionsPage";

export const theme = createTheme({
  palette: {
    primary: { main: '#081484' }, // Jeopardy Blue
    secondary: { main: '#FFD700' }, // Gold
    background: { default: '#F2F2F2' },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h5: {
      fontWeight: 'bold',
      color: '#FFD700',
    },
    h6: {
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
  },
});


// Contains all pages for app
export default function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/question_selection" element={<QuestionSelectionPage />} />
          <Route path="/statistics" element={<StatisticsPage/>} />
          <Route path="/questions" element={<JeopardyQuestions />} />
          <Route path="/login" element={ <Login/> } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}