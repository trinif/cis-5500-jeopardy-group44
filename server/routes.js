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

/* Signs up user if a new username is given
If username already exists, reports that account already exists
Otherwise, inserts id and password into Users table
*/
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

/*
Checks that user ID and password match with database
Reports if username doesn't exist or password is incorrect
Otherwise, logs user in
*/
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
              res.status(201).json({status: `Username doesn't exist.`, username, username})
          } else if (data.rows[0].password == password) {
              res.status(201).json({status: 'Success', username: username})
          } else {
              res.status(201).json({status: `Password is incorrect.`, username: username})
          }
      }
  })
}

/*
Adds userID, questionID, and if user was correct to UserAnswers table
Validation for user - if user does not exist, then adds as a guest
*/
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

/*
Checks if given answer was correct and trims answer to check
*/
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
    } else {
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

/*
checks if user param is following another user param
*/
const check_follow_status = async function(req, res) {
  const following = req.params.following;
  const person_of_interest = req.params.person_of_interest;

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

/*
inserts into Following table the user that is doing the following (the active user)
and the user they want to follow
*/
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

/*
deletes entry from Following table so that user is no longer following another specific user
*/
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

/*
finds top users by accuracy
users have to be present in UserAnswers and do not include guests
*/
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

/*
returns top 5 users in terms of accuracy who the current user is following
*/
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



// finds overall accuracy (percentage of questions gotten correct) of a specific user
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

/*
finds overall accuracy of all users in UserAnswers
*/
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

/*
* Groups accuracy by categories for a specific user
* Finds the best category (accuracy is greater than all other categories)
* Finds the worst category (accuracy is less than all other categories)
*/
const best_worst_category = async function (req, res) {
  const user_id = req.params.user_id;

  connection.query(`
WITH category_accuracy AS (
    SELECT subject,
           COUNT(*) FILTER (WHERE UserAnswers.is_correct = B'1') * 100.0 / COUNT(*) AS accuracy
    FROM Questions
        JOIN UserAnswers ON Questions.question_id = UserAnswers.question_id
    WHERE UserAnswers.user_id = '${user_id}'
    GROUP BY subject
), best_category AS (
    SELECT subject
    FROM category_accuracy
    WHERE accuracy >= ALL (SELECT accuracy FROM category_accuracy)
    LIMIT 1
), worst_category AS (
    SELECT subject
    FROM category_accuracy
    WHERE accuracy <= ALL (SELECT accuracy FROM category_accuracy)
    LIMIT 1
)
SELECT best_category.subject AS best_category,
    worst_category.subject AS worst_category
FROM best_category, worst_category
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json({})
    } else {
      res.json(data.rows[0]);
    }
  })
}

/*
* Similar to best worst category, but not just for a specific user 
* aggregates for all UserAnswers data
*/
const best_worst_category_universal = async function (req, res) {
  connection.query(`
WITH category_accuracy AS (
    SELECT subject,
           COUNT(*) FILTER (WHERE UserAnswers.is_correct = B'1') * 100.0 / COUNT(*) AS accuracy
    FROM Questions
        JOIN UserAnswers ON Questions.question_id = UserAnswers.question_id
    GROUP BY subject
), best_category AS (
    SELECT subject
    FROM category_accuracy
    WHERE accuracy >= ALL (SELECT accuracy FROM category_accuracy)
    LIMIT 1
), worst_category AS (
    SELECT subject
    FROM category_accuracy
    WHERE accuracy <= ALL (SELECT accuracy FROM category_accuracy)
    LIMIT 1
)
SELECT best_category.subject AS best_category,
    worst_category.subject AS worst_category
FROM best_category, worst_category


  `, (err, data) => {
    if (err) {
      console.log(err)
      res.json({})
    } else {
      res.json(data.rows[0]);
    }
  })
}

/*
* Finds accuracy for each category for all UserAnswers data
*/
const category_accuracy_universal = async function(req, res) {
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

// Find category accuracy for a specific user based on UserAnswers datas
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
// Returns a random Jeopardy question
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

/* 
* Used in QuestionCard: fetches information about the question based on the specific ID
*/
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

/*
* Used in QuestionCard: fetches Jeopardy specific information about the question
* Assumes that question is in Jeopardy dataset (checked before calling)
*/
const question_jeopardy = async function(req, res) {
  const question_id = req.params.question_id;
  connection.query(`
    SELECT *
    FROM Jeopardy
    WHERE Jeopardy.question_id = '${question_id}'
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.status(500).json({message: 'Error'})
    } else {
      res.json(data.rows[0])
    }
  })
}

/*
* Used in QuestionCard: fetches GeneralQuestions-specific information (URLs, descriptions) about the question
* Assumes that question is in GeneralQuestions dataset (checked before calling)
*/
const question_trivia = async function(req, res) {
  const question_id = req.params.question_id;
  connection.query(`
    WITH trivia_descriptions AS (
      SELECT STRING_AGG(description, ';;;') AS descriptions
      FROM GeneralQuestionsDescription
      WHERE question_id = '${question_id}'
      GROUP BY question_id
    ), trivia_urls AS (
      SELECT STRING_AGG(url, ';;;') AS urls
      FROM generalquestionsurl
      WHERE question_id = '${question_id}'
      GROUP BY question_id
    )

    SELECT *
    FROM trivia_descriptions, trivia_urls
  `, (err, data) => {
    if (err) {
      console.log(err)
      res.status(500).json({message: 'Error'})
    } else {
      console.log(data.rows[0])
      res.json(data.rows[0])
    }
  })
}



// Route: GET /question_selection
/* Route used for filtering questions based on user's search parameters
* Filters first on user-specific filters: past incorrect questions, questions that have not seen before
* Uses a materialized view to query information from the large dataset
*/
const question_selection = async function (req, res) {
  const defaultSubjects = [
    'History',
    'Pop Culture',
    'Geography',
    'Sports',
    'Literature',
    'Science',
    'Vocabulary',
    'Math',
  ]; //default subjects if the user does not select any
  const user_id = req.params.user_id;
  const keyword = (req.query.keyword || '').toLowerCase(); //input validation
  const selected_source = req.query.source || 'both'; //defaults to 'both' if no source is selected
  const value_low = req.query.valueLow ? parseInt(req.query.valueLow, 10) : 5; //defaults to lowest question value of 5
  const value_high = req.query.valueHigh ? parseInt(req.query.valueHigh, 10) : 18000; //defaults to greatest question value of 18000
  const subjects = req.query.subjects && req.query.subjects != '' ? req.query.subjects.split(',') : defaultSubjects; //parses selected subjects
  const rounds = req.query.rounds && req.query.rounds != '' ? req.query.rounds.split(',') : ['Jeopardy!', 'Double Jeopardy!', 'Final Jeopardy!']; //parses selected rounds
  const question_set = !user_id.startsWith('guest_') ? req.query.questionSet : 'all'; //user-specific filter, ignored if user is a guest

  let query = ``
  
  if (question_set === 'past') { // past wrong
    query += `WITH questions_filtered AS (
      SELECT question_id
      FROM UserAnswers
      WHERE is_correct = B'0'
        AND user_id = '${user_id}'
    )\n`
  } else if (question_set === 'never') { // never tried
    query += `
      WITH questions_filtered AS (
        SELECT question_id
        FROM Questions
        WHERE question_id NOT IN (
          SELECT question_id
          FROM UserAnswers
          WHERE user_id = '${user_id}'
        )
      )\n
    `
  } else { // all questions
    query += `WITH questions_filtered AS (
      SELECT question_id FROM Questions
    )\n`
  }

  //adds on query from materialized view, filtering on question-specific filters
  query += `
  SELECT *
  FROM defaultQuestions
  WHERE EXISTS (SELECT * FROM questions_filtered WHERE defaultQuestions.id = questions_filtered.question_id)
      AND LOWER(question) LIKE '%${keyword}%'
      AND (('${selected_source}' = 'both') 
        OR ('${selected_source}' = LOWER(jeopardy_or_general)) 
      )
      AND (value IS NULL 
        OR (value >= ${value_low} AND value <= ${value_high})
      )    
      AND subject IN ('${subjects.join(`','`)}')
      AND (round IS NULL 
        OR round IN ('${rounds.join(`','`)}')
      );
  `

  console.log(query)
  
  connection.query(query, (err, data) => {
    if (err) {
      console.log(err)
      res.json([])
    } else {
      res.json(data.rows)
    }
  })
};

/*
* Uses view of top users, selects top 3 questions that users aggregated have the worst accuracy on
* Questions have to be tried by the users (present in UserAnswers table)
*/
const least_accurate_questions_top_users = async function(req, res) {
    connection.query(`
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
        ua.user_id IN (SELECT user_id FROM top_users_accuracy)
      GROUP BY 
        q.question_id, q.question, q.subject
      ORDER BY 
        accuracy ASC, q.subject
      LIMIT 3;
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    });
  };

/*
* Gets the other users that the user follows
* Finds performance of users on questions that they've answered and averages out performance among all users followed
* Selects the 3 questions with the lowest accuracy
*/
const following_worst_questions = async function(req, res) {
    const user_id = req.params.user_id;
    connection.query(`
      WITH followed_users AS (
        SELECT person_of_interest AS followed_user_id
        FROM Following
        WHERE following = '${user_id}'
      ),
      UserPerformance AS (
        SELECT
          ua.user_id,
          ua.question_id,
          ROUND((COUNT(CASE WHEN ua.is_correct = B'1' THEN 1 END) * 100.0 / COUNT(ua.is_correct)),2) AS accuracy
        FROM UserAnswers ua
        JOIN followed_users fu ON ua.user_id = fu.followed_user_id
        GROUP BY ua.user_id, ua.question_id
      ),
      QuestionAccuracy AS (
        SELECT
          up.question_id,
          AVG(up.accuracy) AS avg_accuracy
        FROM UserPerformance up
        GROUP BY up.question_id
      )
      SELECT
        q.question_id,
        q.question,
        q.subject,
        COUNT(ua.is_correct) AS total_answers,
        COUNT(CASE WHEN ua.is_correct = B'1' THEN 1 END) AS correct_answers,
        ROUND((COUNT(CASE WHEN ua.is_correct = B'1' THEN 1 END) * 100.0 / COUNT(ua.is_correct)), 2) AS accuracy
      FROM
        UserAnswers ua
      JOIN Questions q ON ua.question_id = q.question_id
      JOIN QuestionAccuracy qa ON q.question_id = qa.question_id
      WHERE ua.user_id IN (SELECT followed_user_id FROM followed_users)
      GROUP BY q.question_id, q.question, q.subject
      ORDER BY accuracy ASC
      LIMIT 3;
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
  overall_accuracy,
  overall_accuracy_universal,
  best_worst_category,
  best_worst_category_universal,
  category_accuracy_universal,
  category_accuracy,
  random,
  question_selection,
  least_accurate_questions_top_users,
  question,
  question_jeopardy,
  question_trivia,
  following_worst_questions,
}
