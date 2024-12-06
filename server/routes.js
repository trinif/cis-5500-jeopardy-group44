const { Pool, types } = require('pg');
const config = require('./config.json');

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

const signup = async function(req, res) {
  const {username, password} = req.body
  connection.query(`
    SELECT *
    FROM Users
    WHERE Users.user_id = '${username}'
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.status(500).json({})
    } else if (data.rows.length != 0) {
      res.status(201).json({status: 'Account already exists.', username: username})
    } else {
      connection.query(`
        INSERT INTO Users(user_id, password)
        VALUES ('${username}', '${password}')
      `, (err, data) => {
          if (err) {
              console.log(err)
              res.status(500).json({})
          } else {
              res.status(201).json({status: 'Success', username: username})
          }
      })
    }
  })
}

const login = async function(req, res) {
  const {username, password} = req.body;
  connection.query(`
      SELECT password
      FROM Users
      WHERE Users.user_id = '${username}'
  `, (err, data) => {
      if (err) {
          console.log(err)
          res.status(500)
      } else {
          if (data.rows.length == 0) {
              res.status(201).json({status: `Username doesn't exists.`, username, username})
          } else if (data.rows[0].password == password) {
              res.status(201).json({status: 'Success', username: username})
          } else {
              res.status(201).json({status: `Password is incorrect.`, username: username})
          }
      }
  })
}

const update_user_answer = async function(req, res) {
  const {userId, questionId, is_correct} = req.body;

  // first check if user_id exists in users table
  // if not, then add guest user_id to users table
  connection.query(`
    SELECT *
    FROM Users
    WHERE user_id = '${userId}'
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json({})
    } else if (data.rows.length == 0) {
      connection.query(`
        INSERT INTO Users(user_id, password)
        VALUES ('${userId}', '${userId}')
      `)
    }
  })

  connection.query(`
    SELECT *
    FROM UserAnswers
    WHERE question_id = '${questionId}'
      AND user_id = '${userId}'
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json({})
    } else if (data.rows.length == 0) {
      // question_id and user_id don't exist yet
      connection.query(`
        INSERT INTO UserAnswers (question_id, user_id, is_correct)
        VALUES ('${questionId}', '${userId}', B'${is_correct}')
      `, (err, data) => {
        if (err) {
          console.log(err)
        }
        res.json({})
      })
    } else {
      // user_id and question_id already exist
      connection.query(`
        UPDATE UserAnswers
        SET is_correct = B'${is_correct}'
        WHERE user_id = '${userId}'
          AND question_id = '${questionId}'
      `, (err, data) => {
        if (err) {
          console.log(err)
        }
        res.json({})
      })
    }
  })
}

const check_answer = async function(req, res) {
  const question_id = req.params.question_id;
  const answer = req.params.answer;
  connection.query(`
    SELECT answer
    FROM Questions
    WHERE Questions.question_id = '${question_id}'
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.status(500).json({message: 'Error'})
    } else if (data.rows[0].answer == answer) {
      res.status(201).json({status: 'Correct', message: data.rows[0].answer})
    } else {
      res.status(201).json({status: 'Incorrect', message: data.rows[0].answer})
    }
  })
}



// 1
const overall_accuracy = async function(req, res) {
  const user_id = req.params.user_id;

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

// not working
const best_worst_category = async function (req, res) {
  const user_id = req.query.user_id;

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

      console.log(best_category);
      console.log(worst_category);

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
    SELECT c.category
    FROM Categories c
    WHERE NOT EXISTS (
    SELECT 1
    FROM UserAnswers ua
    WHERE ua.category = c.category
    AND ua.is_correct = 1
  )
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
    SELECT j.question_id,
      j.question, 
      j.answer
    FROM Jeopardy j 
      JOIN UserAnswers ua ON j.question_id = ua.question_id
    WHERE ua.user_id = '${user_id}' 
      AND j.round = 'Final Jeopardy!'
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json({});
    } else{
      res.json(data.rows);
    }
  })
}

// just questions that are not in the jeopardy dataset
const unanswered_categories_questions = async function (req, res) {
  const user_id = req.query.user_id;
  connection.query(`
    SELECT g.question_id, 
      g.question, 
      g.answer
    FROM GeneralQuestions g
      LEFT JOIN Jeopardy j ON g.question = j.question
    WHERE j.question IS NULL
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json({})
    } else {
      res.json({})
    }
  })
}

// Route: GET /random
const random = async function(req, res) {
  connection.query(`
    SELECT *
    FROM Jeopardy
    ORDER BY RANDOM()
    LIMIT 1
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json({});
    } else {
      res.json(data.rows[0]);
    }
  });
}

// Route: GET /question_selection
// need to update req fields
const question_selection = async function(req, res) {
   connection.query(`
     SELECT *
     FROM Jeopardy
     LIMIT 1
   `, (err, data) => {
     if (err) {
       console.log(err);
       res.json({ message: 'Error fetching questions' });
     } else {
       res.json(data.rows[0]);
     }
   });
 };

// // Route: GET /meta_categories
// const meta_categories = async function(req, res) {
//   connection.query(`
//     SELECT DISTINCT meta_category
//     FROM Jeopardy
//     ORDER BY meta_category ASC
//   `, (err, data) => {
//     if (err) {
//       console.log("Error fetching meta categories:", err);
//       res.status(500).json({ message: 'Error fetching meta categories' });
//     } else {
//       const metaCategoriesList = data.rows.map(row => row.meta_category);
//       res.status(200).json(metaCategoriesList);
//     }
//   });
// };






module.exports = {
  signup,
  login,
  update_user_answer,
  check_answer,
  overall_accuracy,
  best_worst_category,
  unanswered_category,
  incorrect_questions_category,
  final_jeopardy_questions,
  unanswered_categories_questions,
  random,
  question_selection,
  //meta_categories
}
