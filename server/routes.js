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
    } else{
      const returned_answer = data.rows[0].answer
        .replace(/\([^)]*\)/g, '')
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()

      if (returned_answer == answer.toLowerCase()) {
        res.json({status: 'Correct', message: data.rows[0].answer})
      } else {
        res.json({status: 'Incorrect', message: data.rows[0].answer})
      }
    }
  })
}

const check_follow_status = async function(req, res) {
  const following = req.params.following;
  const person_of_interest = req.params.person_of_interest;

  console.log("check follow status")

  connection.query(`
    SELECT *
    FROM Following
    WHERE following = '${following}'
      AND person_of_interest = '${person_of_interest}'
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json({})
    } else {
      res.json(data.rows)
    }
  })
}

const follow_user = async function(req, res) {
  const following = req.params.following;
  const person_of_interest = req.params.person_of_interest;

  connection.query(`
    INSERT INTO Following (following, person_of_interest)
    VALUES ('${following}', '${person_of_interest}')
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json({})
    } else {
      res.json({})
    }
  })
}

const unfollow_user = async function(req, res) {
  const following = req.params.following;
  const person_of_interest = req.params.person_of_interest;

  connection.query(`
    DELETE FROM Following
    WHERE following = '${following}'
      AND person_of_interest = '${person_of_interest}'
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json({})
    } else {
      res.json({})
    }
  })
}

const top_users = async function(req, res) {
  connection.query(`
    SELECT user_id,
      ROUND(COUNT(*) FILTER (WHERE is_correct = B'1') * 100.0 / COUNT(*), 2) AS accuracy
    FROM UserAnswers
    WHERE user_id NOT LIKE 'guest_%'
    GROUP BY user_id
    ORDER BY accuracy DESC
    LIMIT 5
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json([])
    } else {
      res.json(data.rows)
    }
  })
}

const top_users_friends = async function(req, res) {
  const user_id = req.params.user_id
  connection.query(`
    SELECT user_id,
      ROUND(COUNT(*) FILTER (WHERE is_correct = B'1') * 100.0 / COUNT(*), 2) AS accuracy
    FROM UserAnswers
      JOIN Following ON UserAnswers.user_id = following.person_of_interest
    WHERE user_id NOT LIKE 'guest_%'
      AND Following.following = '${user_id}'
    GROUP BY user_id
    ORDER BY accuracy DESC
    LIMIT 5
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json([])
    } else {
      res.json(data.rows)
    }
  })
}

const question = async function(req, res) {
  const question_id = req.params.question_id;
  connection.query(`
    SELECT *
    FROM Questions
    WHERE Questions.question_id = '${question_id}'
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.status(500).json({message: 'Error'})
    } else {
      res.json(data.rows[0])
    }
  })
}

const questions = async function(req, res) {
  const keyword = req.query.keyword || '';
  const valueLow = req.query.value_low ? parseInt(req.query.value_low, 10) : 100;
  const valueHigh = req.query.value_high ? parseInt(req.query.value_high, 10) : 2000;  
  /* const subjects = req.query.subject
    ? req.query.subject.split(',')
    : []; */
  const subjects = req.query.subjects;
  const rounds = req.query.rounds;
  /* const rounds = req.query.round
    ? req.query.round.split(',')
    : []; */
  const source = req.query.source || 'both';
  const shuffle = req.query.shuffle === 'true';
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.page_size, 10) || 10;
  const offset = (page - 1) * pageSize;
  
  connection.query(`
    SELECT *
    FROM Questions
    WHERE question LIKE '%${keyword}%'
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.status(500).json({message: 'Error'})
    } else {
      res.json(data.rows)
    }
  })
}

const search_questions = async function(req, res) {
  const keyword = req.query.keyword || '';
  const valueLow = req.query.value_low ? parseInt(req.query.value_low, 10) : 100;
  const valueHigh = req.query.value_high ? parseInt(req.query.value_high, 10) : 2000;  
  /* const subjects = req.query.subject
    ? req.query.subject.split(',')
    : []; */
  const subjects = req.query.subjects;
  const rounds = req.query.rounds;
  /* const rounds = req.query.round
    ? req.query.round.split(',')
    : []; */
  const source = req.query.source || 'both';
  const shuffle = req.query.shuffle === 'true';
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.page_size, 10) || 10;
  const offset = (page - 1) * pageSize;

  connection.query(`
    SELECT *
    FROM Questions
    WHERE keyword LIKE '%${keyword}%'
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.status(500).json({message: 'Error'})
    } else {
      res.json(data.rows)
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

const overall_accuracy_universal = async function(req, res) {
  connection.query(`
    SELECT 
      (COUNT(*) FILTER (WHERE is_correct = B'1') * 100.0 / COUNT(*)) AS accuracy
    FROM UserAnswers
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json({})
    } else {
      const accuracy = parseFloat(data.rows[0].accuracy).toFixed(2)
      res.json({
        accuracy: accuracy
      })
    }
  })
}

//DONE
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
        }
        if (row.min_category === 'Least Successful') {
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

//DONE
const best_worst_category_universal = async function (req, res) {
  connection.query(`
    WITH category_correct_counts AS (
      SELECT 
        q.subject,
        COUNT(CASE WHEN is_correct = B'1' THEN 1 ELSE 0 END) AS correct_count
      FROM 
        UserAnswers ua JOIN Questions q ON ua.question_id = q.question_id
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
        }
        if (row.min_category === 'Least Successful') {
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
//change to incorrect answers
const incorrect_questions_category = async function (req, res) {
  const user_id = req.params.user_id;
  connection.query(`
    SELECT q.question_id, q.question, q.answer, q.subject
      FROM UserAnswers ua 
        JOIN Questions q ON ua.question_id = q.question_id
      WHERE ua.is_correct = B'0'
        AND ua.user_id = '${user_id}'
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json({});
    } else {
      console.log(data.rows);
      res.json(data.rows);
    }
  });
};

// //this seems unnecessary but could do something with incorrect answers?
// const incorrect_questions_category = async function (req, res) {
//   const user_id = req.params.user_id;

//   connection.query(`
//     WITH incorrect_questions AS (
//       SELECT q.question_id, q.question, q.answer, q.subject
//       FROM UserAnswers ua 
//         JOIN Questions q ON ua.question_id = q.question_id
//       WHERE ua.is_correct = B'0'
//         AND ua.user_id = '${user_id}'
//     )

//     SELECT question, answer, subject
//     FROM Questions q
//     WHERE subject IN (SELECT q.subject FROM incorrect_questions)

//   `, (err, data) => {
//     if (err) {
//       console.log(err)
//       res.json({})
//     } else {
//       console.log(data.rows)
//       res.json(data.rows)
//     }
//   })
// }

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
const general_trivia_questions = async function (req, res) {
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


// connection.query(`
//   WITH unanswered_categories AS (
//     SELECT DISTINCT q.subject
//     FROM Questions q
//     WHERE q.subject NOT IN
//       (SELECT qu.subject
//       FROM UserAnswers ua JOIN Questions qu ON ua.question_id = qu.question_id
//       WHERE ua.user_id='${user_id}'
//   ),
//   SELECT q.question_id, q.question, q.answer
//   FROM Questions q
//   WHERE q.subject IN (SELECT q.subject FROM uanswered_categories)
// `,

// const unanswered_categories_questions = async function (req, res) {
//   const user_id = req.params.user_id;
//   connection.query(`
//   WITH unanswered_categories AS (
//     SELECT DISTINCT q.subject
//     FROM Questions q
//     WHERE q.subject NOT IN
//       (SELECT qu.subject
//       FROM UserAnswers ua JOIN Questions qu ON ua.question_id = qu.question_id
//       WHERE ua.user_id='${user_id}'
//   ),
//   SELECT q.question_id, q.question, q.answer
//   FROM Questions q
//   WHERE q.subject IN (SELECT q.subject FROM uanswered_categories)
//   `,
//   (err, data) => {
//     if (err) {
//       console.log(err)
//       res.json({})
//     } else {
//       console.log(data.rows)
//       res.json(data.rows)
//     }
//   })
// }

// DONE
const unanswered_categories_questions = async function (req, res) {
  const user_id = req.params.user_id;
  connection.query(`
    WITH not_answered_cats AS (
      SELECT DISTINCT q.subject
      FROM Questions q
      WHERE q.subject NOT IN
        (SELECT qu.subject
        FROM UserAnswers ua JOIN Questions qu ON ua.question_id = qu.question_id
        WHERE ua.user_id='${user_id}'))
    SELECT q.question_id, q.question, q.answer, q.subject
      FROM Questions q
      WHERE q.subject IN (SELECT na.subject FROM not_answered_cats na)
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json({});
    } else {
      console.log(data.rows);
      res.json(data.rows);
    }
  });
}

const category_accuracy_universal = async function(req, res) {
  const user_id = req.params.user_id;
  connection.query(`
    SELECT 
      q.subject,
      (COUNT(*) FILTER (WHERE ua.is_correct = B'1') * 100.0 / COUNT(*)) AS accuracy
    FROM 
      UserAnswers ua JOIN Questions q ON ua.question_id = q.question_id
    GROUP BY 
      q.subject;
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json({});
    } else {
      const result = data.rows.map(row => ({
        subject: row.subject,
        accuracy: parseFloat(row.accuracy).toFixed(2)
      }));
      
      res.json(result);  // Send the result as a JSON array
    }
  });
};

// DONE
const category_accuracy = async function(req, res) {
  const user_id = req.params.user_id;
  connection.query(`
    SELECT 
      q.subject,
      (COUNT(*) FILTER (WHERE ua.is_correct = B'1') * 100.0 / COUNT(*)) AS accuracy
    FROM 
      UserAnswers ua JOIN Questions q ON ua.question_id = q.question_id
    WHERE 
      ua.user_id = '${user_id}'
    GROUP BY 
      q.subject;
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json({});
    } else {
      const result = data.rows.map(row => ({
        subject: row.subject,
        accuracy: parseFloat(row.accuracy).toFixed(2)
      }));
      
      res.json(result);  // Send the result as a JSON array
    }
  });
};

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
const question_selection = async function (req, res) {
  const predefinedSubjects = [
    'History',
    'Pop Culture',
    'Geography',
    'Sports',
    'Literature',
    'Science',
    'Vocabulary',
    'Math',
  ];

  const keyword = req.query.keyword || '';
  const valueLow = req.query.valueLow ? parseInt(req.query.valueLow, 10) : 100;
  const valueHigh = req.query.valueHigh ? parseInt(req.query.valueHigh, 10) : 2000;  
  /* const subjects = req.query.subject
    ? req.query.subject.split(',')
    : []; */
  const subjects = req.query.subjects ?? predefinedSubjects;
  //console.log(req.query.subjects);
  console.log(subjects);
  //this works on the first query, but on the subsequent ones, the default is '' rather than null/undefined
  //have to case for that?
  const rounds = req.query.rounds ?? ['Jeopardy!', 'Double Jeopardy!', 'Final Jeopardy!'];
  console.log(rounds);
  /* const rounds = req.query.round
    ? req.query.round.split(',')
    : []; */
  const source = req.query.source || 'both';
  console.log(source);
  const shuffle = req.query.shuffle === 'true';
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.page_size, 10) || 10;
  const offset = (page - 1) * pageSize;

  //need to fix for multiple elements
  console.log(`subject IN ('${subjects.join('","').replace(/"/g, "'")}');`);
  console.log(`SELECT *
    FROM base_questions
    WHERE question LIKE '%${keyword}%'
    AND subject IN ('${subjects.join('","').replace(/"/g, "'")}')
    AND ('${source}' = 'both' OR ('${source}' = 'jeopardy' AND jeopardy_or_general = 0) OR ('${source}' = 'trivia' AND jeopardy_or_general = 1))
    AND (value IS NULL OR (value >= ${valueLow} AND value <= ${valueHigh}))
    AND (rounds IS NULL OR rounds IN ('${rounds.join('","').replace(/"/g, "'")}'));`);

  connection.query(`
    WITH base_questions AS (
        SELECT 
          q.question_id, 
          q.question, 
          q.answer,
          CAST(q.jeopardy_or_general AS INTEGER) AS jeopardy_or_general,
          q.subject AS subject,
          j.round,
          j.value
        FROM 
          questions q
          LEFT JOIN jeopardy j ON q.question_id = j.question_id
      )
    
    SELECT *
    FROM base_questions
    WHERE question LIKE '%${keyword}%'
    AND subject IN ('${subjects.join('","').replace(/"/g, "'")}')
    AND ('${source}' = 'both' OR ('${source}' = 'jeopardy' AND jeopardy_or_general = 0) OR ('${source}' = 'trivia' AND jeopardy_or_general = 1))
    AND (value IS NULL OR (value >= ${valueLow} AND value <= ${valueHigh}))
    AND (round IS NULL OR round IN ('${rounds.join('","').replace(/"/g, "'")}'));
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data.rows);
    }
  });

  /* try {
    const query = `
      WITH base_questions AS (
        SELECT 
          q.question_id AS base_question_id,
          q.question, 
          q.answer,
          CAST(q.jeopardy_or_general AS INTEGER) AS jeopardy_or_general,
          q.subject AS subject,
          j.round,
          j.value,
          j.category
        FROM 
          questions q
          LEFT JOIN jeopardy j ON q.question_id = j.question_id
      ),
      user_attempts AS (
        SELECT 
          question_id AS user_question_id,
          CASE 
            WHEN is_correct = B'1' THEN TRUE 
            WHEN is_correct = B'0' THEN FALSE 
            ELSE NULL 
          END AS is_correct
        FROM 
          useranswers
        WHERE 
          user_id = $9
      ),
      filtered_questions AS (
        SELECT 
          b.base_question_id AS question_id,
          b.question,
          b.answer,
          b.jeopardy_or_general,
          b.meta_category,
          b.round,
          b.value,
          b.category,
          u.is_correct
        FROM base_questions b
        LEFT JOIN user_attempts u ON b.base_question_id = u.user_question_id
        WHERE 
          ($1::text IS NULL OR b.question ILIKE $1)
          AND ($2::text[] IS NULL OR b.meta_category ILIKE ANY($2))
          AND ($3::text[] IS NULL OR b.round = ANY($3))
          AND ($4::int IS NULL OR $5::int IS NULL OR b.value BETWEEN $4 AND $5)
          AND (
            $6::text = 'both' OR
            ($6::text = 'jeopardy' AND b.jeopardy_or_general = 0) OR
            ($6::text = 'trivia' AND b.jeopardy_or_general = 1)
          )
          AND (
            $8::text = 'all' OR
            ($8::text = 'never_tried' AND u.user_question_id IS NULL) OR
            ($8::text = 'wrong' AND u.is_correct = FALSE)
          )
      )
      SELECT 
        *,
        COUNT(*) OVER() AS total_count
      FROM filtered_questions
      ${shuffle ? 'ORDER BY RANDOM()' : 'ORDER BY question_id'}
      LIMIT $7 OFFSET $10;
    `;

    const params = [
      title ? `%${title}%` : null,
      metaCategories.length > 0 ? metaCategories.map((cat) => `%${cat}%`) : null,
      rounds.length > 0 ? rounds : null,
      valueLow,
      valueHigh,
      source,
      pageSize,
      pastQuestionsFilter,
      userId,
      offset,
    ];

    const { rows } = await connection.query(query, params);
    res.status(200).json({
      total: rows.length > 0 ? rows[0].total_count : 0,
      data: rows,
    });
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ message: 'Error fetching questions' });
  } */
};


// gets the questions that the top 5 users (on leaderboard) did worst on
// const least_accurate_questions_top_users = async function(req, res) {
//   connection.query(`
//     WITH top_users AS (
//      SELECT user_id,
//       ROUND(COUNT(*) FILTER (WHERE is_correct = B'1') * 100.0 / COUNT(*), 2) AS accuracy
//     FROM UserAnswers
//     WHERE user_id NOT LIKE 'guest_%'
//     GROUP BY user_id
//     ORDER BY accuracy DESC
//     LIMIT 5
//     )
//     SELECT 
//       ua.user_id,
//       q.question_id,
//       q.question,
//       q.subject,
//       COUNT(ua.is_correct) AS total_answers,
//       COUNT(CASE WHEN ua.is_correct = B'1' THEN 1 END) AS correct_answers,
//       (COUNT(CASE WHEN ua.is_correct = B'1' THEN 1 END) * 100.0 / COUNT(ua.is_correct)) AS accuracy
//     FROM 
//       UserAnswers ua
//     JOIN 
//       Questions q ON ua.question_id = q.question_id
//     WHERE 
//       ua.user_id IN (SELECT user_id FROM top_users)
//     GROUP BY 
//       ua.user_id, q.question_id, q.question, q.subject
//     ORDER BY 
//       accuracy ASC
//   `, (err, data) => {
//     if (err) {
//       console.log(err);
//       res.json([]);
//     } else {
//       res.json(data.rows);
//     }
//   });
// };

const least_accurate_questions_top_users = async function(req, res) {
    connection.query(`
      WITH top_users AS (
       SELECT user_id,
        ROUND(COUNT(*) FILTER (WHERE is_correct = B'1') * 100.0 / COUNT(*), 2) AS accuracy
      FROM UserAnswers
      WHERE user_id NOT LIKE 'guest_%'
      GROUP BY user_id
      ORDER BY accuracy DESC
      LIMIT 5
      )
      SELECT 
        q.question_id,
        q.question,
        q.subject,
        COUNT(ua.is_correct) AS total_answers,
        COUNT(CASE WHEN ua.is_correct = B'1' THEN 1 END) AS correct_answers,
        ROUND((COUNT(CASE WHEN ua.is_correct = B'1' THEN 1 END) * 100.0 / COUNT(ua.is_correct)),2) AS accuracy
      FROM 
        UserAnswers ua
      JOIN 
        Questions q ON ua.question_id = q.question_id
      WHERE 
        ua.user_id IN (SELECT user_id FROM top_users)
      GROUP BY 
        q.question_id, q.question, q.subject
      ORDER BY 
        accuracy ASC
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    });
  };


module.exports = {
  signup,
  login,
  update_user_answer,
  check_answer,
  check_follow_status,
  follow_user,
  unfollow_user,
  top_users,
  top_users_friends,
  question,
  questions,
  overall_accuracy,
  overall_accuracy_universal,
  best_worst_category,
  best_worst_category_universal,
  unanswered_category,
  incorrect_questions_category,
  final_jeopardy_questions,
  general_trivia_questions,
  unanswered_categories_questions,
  category_accuracy_universal,
  category_accuracy,
  random,
  question_selection,
  least_accurate_questions_top_users,
}
