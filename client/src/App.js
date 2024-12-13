import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import QuestionSelectionPage from './pages/QuestionSelectionPage';
import QuestionSelectionPageV2 from './pages/QuestionSelectionPageV2';
import StatisticsPage from './pages/StatisticsPage';
import AlbumInfoPage from './pages/AlbumInfoPage'
import Login from "./pages/LoginPage";

import { createTheme } from "@mui/material/styles";
import JeopardyQuestions from "./pages/JeopardyQuestionsPage";
import SongsPage from "./pages/StatisticsPage";

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


// App is the root component of our application and as children contain all our pages
// We use React Router's BrowserRouter and Routes components to define the pages for
// our application, with each Route component representing a page and the common
// NavBar component allowing us to navigate between pages (with hyperlinks)
export default function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/question_selection" element={<QuestionSelectionPage />} />
          <Route path="/question_selection_v2" element={<QuestionSelectionPageV2 />} />
          <Route path="/question_selection/:album_id" element={<AlbumInfoPage />} />
          <Route path="/statistics" element={<StatisticsPage key={Date.now()}/>} />
          <Route path="/questions" element={<JeopardyQuestions />} />
          <Route path="/login" element={ <Login/> } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}