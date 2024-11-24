const { Pool, types } = require('pg');
const config = require('./config.json')

// Override the default parsing for BIGINT (PostgreSQL type ID 20)
types.setTypeParser(20, val => parseInt(val, 10)); //DO NOT DELETE THIS

// Create PostgreSQL connection using database credentials provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = new Pool({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
  ssl: {
    rejectUnauthorized: false,
  },
});
connection.connect((err) => err && console.log(err));

// 1
const overall_accuracy = async function(req, res) {
  const user_id = req.query.user_id;

  connection.query(`
    SELECT 
      (COUNT(*) FILTER (WHERE is_correct = B'1') * 100.0 / COUNT(*)) AS accuracy
    FROM UserAnswers
    WHERE user_id = '${user_id}';
  `, (err, data) => {
    if (err) {
      res.json({})
    } else {
      const accuracy = parseFloat(data.rows[0].accuracy).toFixed(2)
      res.json({
        accuracy: accuracy
      })
    }
  })
}

const best_worst_category = async function (req, res) {
  const user_id = req.query.user_id

  connection.query(`
    WITH category_correct_counts AS (
      SELECT 
        q.category,
        COUNT(CASE WHEN is_correct = B'1' THEN 1 ELSE 0 END) AS correct_count
      FROM 
        UserAnswers ua JOIN Questions q ON ua.question_id = q.question_id
      WHERE 
        ua.user_id = '${user_id}'
      GROUP BY 
        q.category
    ),
    max_min_correct_counts AS (
      SELECT 
        MAX(correct_count) AS max_correct_count,
        MIN(correct_count) AS min_correct_count
      FROM 
        category_correct_counts
    )
    SELECT 
      c.category,
      c.correct_count,
      CASE WHEN c.correct_count = m.max_correct_count THEN 'Most Successful' END AS max_category,
      CASE WHEN c.correct_count = m.min_correct_count THEN 'Least Successful' END AS min_category
    FROM 
      category_correct_counts c, max_min_correct_counts m;

  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json({})
    } else {
      let best_category, worst_category;

      data.rows.forEach(row => {
        console.log(row)
        if (row.max_category === 'Most Successful') {
          best_category = row.category;
        } else if (row.min_category === 'Least Successful') {
          worst_category = row.category;
        }
      });

      console.log(best_category)
      console.log(worst_category)

      res.json({
        best_category,
        worst_category
      });
    }
  })
}

const unanswered_category = async function (req, res) {
  const user_id = req.query.user_id;
  connection.query(`
    SELECT DISTINCT c.label
    FROM Categories c
    WHERE EXISTS (SELECT ua.category
      FROM UserAnswers ua
      WHERE ua.category = c.category
      GROUP BY ua.category
      HAVING COUNT(ua.is_correct) = 0)
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json({})
    } else {
      res.json({})
    }
  })
}

const incorrect_questions_category = async function (req, res) {
  const user_id = req.query.user_id;

  connection.query(`
    WITH incorrect_questions AS (
      SELECT q.question_id, q.question, q.answer, q.category, c.label
      FROM UserAnswers ua 
        JOIN Questions q ON ua.question_id = q.question_id
        JOIN Categories c ON q.category = c.category
      WHERE ua.is_correct = B'0'
        AND ua.user_id = '${user_id}'
    )

    SELECT q.question, q.answer, c.category
    FROM Questions q JOIN Categories c ON q.category = c.category
    WHERE c.label IN (SELECT label FROM incorrect_questions)

  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json({})
    } else {
      res.json(data.rows)
    }
  })
}

const final_jeopardy_questions = async function (req, res) {
  const user_id = req.query.user_id;
  connection.query(`
    SELECT 
      j.question_id,
      j.question, 
      j.answer
    FROM Jeopardy j 
      JOIN UserAnswers ua ON j.question_id = ua.question_id
    WHERE ua.user_id = '${user_id}' 
      AND j.round = 'Final Jeopardy!'
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json({})
    } else{
      res.json(data.rows)
    }
  })
}

// 6
const general_questions_not_in_jeopardy = function(req, res) {
  connection.query(`
    SELECT g.question_id, g.question, g.answer
    FROM GeneralQuestions g
    LEFT JOIN Jeopardy j ON g.question = j.question
    WHERE j.question IS NULL
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json({})
    } else {
      res.json(data.rows)
    }
  })
}

// 7
const unanswered_categories_questions = function(req, res) {
  const userId = req.query.user_id;
  connection.query(`
    WITH unfamiliar_categories AS (
      SELECT DISTINCT category AS not_answered_category
      FROM Jeopardy
      WHERE category NOT IN (
        SELECT DISTINCT category
        FROM UserAnswers
        WHERE user_id = '${userId}'
      )
    )
    SELECT question_id, question, answer
    FROM Jeopardy j
    WHERE j.category IN (SELECT not_answered_category FROM unfamiliar_categories)
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json({})
    } else {
        res.json(data.rows)
    }
  })
}

module.exports = {
  overall_accuracy,
  best_worst_category,
  unanswered_category,
  incorrect_questions_category,
  final_jeopardy_questions
}
