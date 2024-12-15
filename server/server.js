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

app.get('/question/:question_id', routes.question);
app.get('/questions', routes.questions);
app.get('/question_jeopardy/:question_id', routes.question_jeopardy)
app.get('/question_trivia/:question_id', routes.question_trivia)


app.post('/check_answer/:question_id/:answer', routes.check_answer);
app.get('/check_follow_status/:following/:person_of_interest', routes.check_follow_status)
app.post('/follow_user/:following/:person_of_interest', routes.follow_user)
app.post('/unfollow_user/:following/:person_of_interest', routes.unfollow_user)


app.get('/top_users', routes.top_users);
app.get('/top_users_friends/:user_id', routes.top_users_friends)

app.get('/overall_accuracy/:user_id', routes.overall_accuracy);
app.get('/overall_accuracy_universal', routes.overall_accuracy_universal);

app.get('/best_worst_category/:user_id', routes.best_worst_category);
app.get('/best_worst_category_universal', routes.best_worst_category_universal);
app.get('/unanswered_category/:user_id', routes.unanswered_category);
app.get('/incorrect_questions_category/:user_id', routes.incorrect_questions_category);
app.get('/final_jeopardy_questions/:user_id', routes.final_jeopardy_questions);
app.get('/general_trivia_questions', routes.general_trivia_questions);
app.get('/unanswered_categories_questions/:user_id', routes.unanswered_categories_questions);
app.get('/category_accuracy_universal', routes.category_accuracy_universal);
app.get('/category_accuracy/:user_id', routes.category_accuracy);

app.get('/random', routes.random);
app.get('/question_selection/:user_id', routes.question_selection);

app.get('/least_accurate_questions_top_users', routes.least_accurate_questions_top_users);
app.get('/following_worst_questions/:user_id', routes.following_worst_questions);

app.listen(8080, () => {
  console.log(`Server running at http://${config.server_host}/`)
});

module.exports = app;
