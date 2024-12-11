const express = require('express');
const cors = require('cors');

const session = require('express-session');
const cookieParser = require('cookie-parser');

const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

app.use(express.json())

// app.use(session({
//     secret: 'loginSecretKey',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: false,
//       httpOnly: true,
//       maxAge: 60*60*1000
//     }
//   }),
// );

app.use(cookieParser());


// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js

app.post('/signup', routes.signup);
app.post('/login', routes.login);
app.post('/update_user_answer', routes.update_user_answer);

app.post('/check_answer/:question_id/:answer', routes.check_answer);

app.get('/question/:question_id', routes.question);
app.get('/questions', routes.questions);

app.get('/overall_accuracy/:user_id', routes.overall_accuracy);

app.get('/best_worst_category/:user_id', routes.best_worst_category);
app.get('/unanswered_category/:user_id', routes.unanswered_category);
app.get('/incorrect_questions_category/:user_id', routes.incorrect_questions_category);
app.get('/final_jeopardy_questions/:user_id', routes.final_jeopardy_questions);
app.get('/general_trivia_questions', routes.general_trivia_questions);
app.get('/unanswered_categories_questions/:user_id', routes.unanswered_categories_questions);
app.get('/category_accuracy/:user_id', routes.category_accuracy);

app.get('/random', routes.random);
app.get('/question_selection', routes.question_selection);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
