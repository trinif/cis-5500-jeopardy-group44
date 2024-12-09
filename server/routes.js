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

const best_worst_category = async function (req, res) {
  const user_id = req.params.user_id;

  connection.query(`
    WITH category_correct_counts AS (
      SELECT 
        q.subject,
        COUNT(CASE WHEN is_correct = B'1' THEN 1 ELSE 0 END) AS correct_count
      FROM 
        UserAnswers ua JOIN Questions q ON ua.question_id = q.question_id
      WHERE 
        ua.user_id = '${user_id}'
      GROUP BY 
        q.subject
    ),
    max_min_correct_counts AS (
      SELECT 
        MAX(correct_count) AS max_correct_count,
        MIN(correct_count) AS min_correct_count
      FROM 
        category_correct_counts
    )
    SELECT 
      c.subject,
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
          best_category = row.subject;
        } else if (row.min_category === 'Least Successful') {
          worst_category = row.subject;
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

// categories that haven't been answered
const unanswered_category = async function (req, res) {
  const user_id = req.params.user_id;
  connection.query(`
    SELECT DISTINCT q.subject
    FROM Questions q
    WHERE q.subject NOT IN
      (SELECT qu.subject
      FROM UserAnswers ua JOIN Questions qu ON ua.question_id = qu.question_id
      WHERE ua.user_id='${user_id}')
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json({})
    } else {
      console.log(data.rows)
      res.json(data.rows)
    }
  })
}

//gives all questions that are in a subject that the user has answered incorrectly before
//this seems unnecessary but could do something with incorrect answers?
const incorrect_questions_category = async function (req, res) {
  const user_id = req.params.user_id;

  connection.query(`
    WITH incorrect_questions AS (
      SELECT q.question_id, q.question, q.answer, q.subject
      FROM UserAnswers ua 
        JOIN Questions q ON ua.question_id = q.question_id
      WHERE ua.is_correct = B'0'
        AND ua.user_id = '${user_id}'
    )

    SELECT question, answer, subject
    FROM Questions q
    WHERE subject IN (SELECT q.subject FROM incorrect_questions)

  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json({})
    } else {
      console.log(data.rows)
      res.json(data.rows)
    }
  })
}

const final_jeopardy_questions = async function (req, res) {
  const user_id = req.params.user_id;
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
      console.log(data.rows);
      res.json(data.rows);
    }
  })
}

// just questions that are not in the jeopardy dataset
// route doesn't exist in server
const unanswered_categories_questions = async function (req, res) {
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
      res.json(data.rows)
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

const question_selection = async function (req, res) {
  const title = req.query.title || '';
  const valueLow = req.query.value_low ?? null;
  const valueHigh = req.query.value_high ?? null;
  const metaCategories = req.query.meta_category
    ? req.query.meta_category.split(',') // Handle multiple meta categories
    : [];
  const round = req.query.round || '';
  const source = req.query.source || 'both';

  try {
    // Base query
    let query = `
      SELECT q.question_id, q.question, q.answer, 
             CAST(q.jeopardy_or_general AS INTEGER) AS jeopardy_or_general,
             q.subject AS meta_category,
             CASE WHEN CAST(q.jeopardy_or_general AS INTEGER) = 0 THEN j.round ELSE NULL END AS round,
             CASE WHEN CAST(q.jeopardy_or_general AS INTEGER) = 0 THEN j.value ELSE NULL END AS value
      FROM questions q
      LEFT JOIN jeopardy j ON q.question_id = j.question_id
    `;

    // Dynamically construct WHERE clause and parameters
    const whereClauses = [];
    let paramIndex = 1;

    if (title) {
      whereClauses.push(`q.question ILIKE $${paramIndex++}`);
    }

    if (metaCategories.length > 0) {
      const placeholders = metaCategories.map(() => `$${paramIndex++}`).join(', ');
      whereClauses.push(`q.subject ILIKE ANY(ARRAY[${placeholders}])`);
    }

    if (round && source === 'jeopardy') {
      whereClauses.push(`j.round = $${paramIndex++}`);
    }

    if (valueLow !== null && valueHigh !== null && source === 'jeopardy') {
      whereClauses.push(`(j.value BETWEEN $${paramIndex++} AND $${paramIndex++})`);
    }

    if (source === 'jeopardy') {
      whereClauses.push('CAST(q.jeopardy_or_general AS INTEGER) = 0');
    } else if (source === 'trivia') {
      whereClauses.push('CAST(q.jeopardy_or_general AS INTEGER) = 1');
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // Add deterministic ORDER BY, LIMIT, and OFFSET
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const pageSize = parseInt(req.query.page_size, 10) || 10; // Default to 10 rows per page
    const offset = (page - 1) * pageSize;

    query += ` ORDER BY q.question_id LIMIT $${paramIndex++} OFFSET $${paramIndex}`;

    // Inline parameter assignment
    const params = [
      ...(title ? [`%${title}%`] : []),
      ...(metaCategories.length > 0 ? metaCategories.map((cat) => `%${cat}%`) : []),
      ...(round && source === 'jeopardy' ? [round] : []),
      ...(valueLow !== null && valueHigh !== null && source === 'jeopardy' ? [valueLow, valueHigh] : []),
      pageSize,
      offset,
    ];

    // Execute query
    const { rows } = await connection.query(query, params);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ message: 'Error fetching questions' });
  }
};

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
}
