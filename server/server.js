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

app.use(cookieParser());


// POST methods: signup, login, update user answer

app.post('/signup', routes.signup);
app.post('/login', routes.login);
app.post('/update_user_answer', routes.update_user_answer);

// GET methods for questions based on question ID

app.get('/question/:question_id', routes.question);
app.get('/question_jeopardy/:question_id', routes.question_jeopardy)
app.get('/question_trivia/:question_id', routes.question_trivia)

// POST methods for checking answer
app.post('/check_answer/:question_id/:answer', routes.check_answer);

// GET method for checking following status
app.get('/check_follow_status/:following/:person_of_interest', routes.check_follow_status)

// POST methods for following and unfollowing
app.post('/follow_user/:following/:person_of_interest', routes.follow_user)
app.post('/unfollow_user/:following/:person_of_interest', routes.unfollow_user)

// GET methods for top overall users and top users based on who user ID is following
app.get('/top_users', routes.top_users);
app.get('/top_users_friends/:user_id', routes.top_users_friends)

// GET methods for overall accuracy and accuracy based on user iD
app.get('/overall_accuracy/:user_id', routes.overall_accuracy);
app.get('/overall_accuracy_universal', routes.overall_accuracy_universal);

// GET methods for best and worst category (overall and based on user ID)
app.get('/best_worst_category/:user_id', routes.best_worst_category);
app.get('/best_worst_category_universal', routes.best_worst_category_universal);

// GET methods for category accuracy (based on user ID and overall)
app.get('/category_accuracy_universal', routes.category_accuracy_universal);
app.get('/category_accuracy/:user_id', routes.category_accuracy);

// GET method for random Jeopardy question
app.get('/random', routes.random);

// GET method for question selection (params in fetch)
app.get('/question_selection/:user_id', routes.question_selection);

// GET method for least accurate questions for top users
app.get('/least_accurate_questions_top_users', routes.least_accurate_questions_top_users);

// GET method for the worst questions from the users that the user ID is following
app.get('/following_worst_questions/:user_id', routes.following_worst_questions);

app.listen(8080, () => {
  console.log(`Server running at http://${config.server_host}/`)
});

module.exports = app;
