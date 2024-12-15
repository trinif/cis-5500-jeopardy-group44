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
SELECT *
FROM best_category, worst_category
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
SELECT *
FROM best_category, worst_category


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

//gives all questions answered incorrectly
const incorrect_questions_category = async function(req, res) {
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

// Route: GET /question_selection
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
  ];
  const user_id = req.params.user_id;
  const keyword = (req.query.keyword || '').toLowerCase();
  const selected_source = req.query.source || 'both';
  const value_low = req.query.valueLow ? parseInt(req.query.valueLow, 10) : 5;
  const value_high = req.query.valueHigh ? parseInt(req.query.valueHigh, 10) : 18000;
  const subjects = req.query.subjects && req.query.subjects != '' ? req.query.subjects.split(',') : defaultSubjects;
  const rounds = req.query.rounds && req.query.rounds != '' ? req.query.rounds.split(',') : ['Jeopardy!', 'Double Jeopardy!', 'Final Jeopardy!'];
  const question_set = !user_id.startsWith('guest_') ? req.query.questionSet : 'all';

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

  query += `
  SELECT *
  FROM defaultQuestions
  WHERE id IN (SELECT * FROM questions_filtered)
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
      )
  `

  /* query += `
    SELECT Questions.question_id AS id,
      SUBSTRING(Questions.question_id, 2, 10) AS id_substring,
      CASE
        WHEN Questions.jeopardy_or_general = B'0' THEN 'Jeopardy'
        ELSE 'Trivia'
        END AS jeopardy_or_general,
      Questions.question AS question,
      Questions.answer AS answer,
      Questions.subject AS subject,
      Jeopardy.value AS value
    FROM questions_filtered
      JOIN Questions ON questions_filtered.question_id = Questions.question_id
      LEFT JOIN Jeopardy ON Questions.question_id = Jeopardy.question_id
    WHERE LOWER(Questions.question) LIKE '%${keyword}%'
      AND ('${selected_source}' = 'both' 
        OR ('${selected_source}' = 'jeopardy' AND Questions.jeopardy_or_general = B'0') 
        OR ('${selected_source}' = 'trivia' AND Questions.jeopardy_or_general = B'1')
      )
      AND (value IS NULL 
        OR (value >= ${value_low} AND value <= ${value_high})
      )    
      AND subject IN ('${subjects.join(`','`)}')
      AND (round IS NULL 
        OR round IN ('${rounds.join(`','`)}')
      )
    ORDER BY id_substring
    LIMIT 10
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
//       q.question_id,
//       q.question,
//       q.subject,
//       COUNT(ua.is_correct) AS total_answers,
//       COUNT(CASE WHEN ua.is_correct = B'1' THEN 1 END) AS correct_answers,
//       ROUND((COUNT(CASE WHEN ua.is_correct = B'1' THEN 1 END) * 100.0 / COUNT(ua.is_correct)),2) AS accuracy
//     FROM 
//       UserAnswers ua
//     JOIN 
//       Questions q ON ua.question_id = q.question_id
//     WHERE 
//       ua.user_id IN (SELECT user_id FROM top_users)
//     GROUP BY 
//       q.question_id, q.question, q.subject
//     ORDER BY 
//       accuracy ASC, q.subject
//     LIMIT 3;
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

  const hardest_question_from_network = async function(req, res) {
    const user_id = req.params.user_id;
    connection.query(`
      WITH FollowedUsersPerformance AS (
        SELECT
            ua.user_id,
            ua.question_id,
            ROUND((COUNT(CASE WHEN ua.is_correct = B'1' THEN 1 END) * 100.0 / COUNT(ua.is_correct)), 2) AS accuracy
        FROM
            UserAnswers ua
        JOIN
            Following f ON ua.user_id = f.person_of_interest
        WHERE
            f.following = '${user_id}'
        GROUP BY
            ua.user_id, ua.question_id)
      SELECT
        q.question_id,
        q.question,
        q.subject,
        COUNT(ua.is_correct) AS total_answers,
        COUNT(CASE WHEN ua.is_correct = B'1' THEN 1 END) AS correct_answers,
        ROUND((COUNT(CASE WHEN ua.is_correct = B'1' THEN 1 END) * 100.0 / COUNT(ua.is_correct)), 2) AS accuracy
      FROM
        Questions q
      JOIN
        UserAnswers ua ON q.question_id = ua.question_id
      JOIN
        FollowedUsersPerformance fup ON q.question_id = fup.question_id
      WHERE
        fup.accuracy <= ALL (
            SELECT fup2.accuracy
            FROM FollowedUsersPerformance fup2
            WHERE fup2.question_id != fup.question_id
        )
      GROUP BY
        q.question_id, q.question, q.subject
      LIMIT 1;
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
  question,
  question_jeopardy,
  question_trivia,
  questions,
  following_worst_questions,
  hardest_question_from_network,
}
