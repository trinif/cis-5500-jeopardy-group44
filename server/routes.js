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

// Route 1: GET /overall_accuracy
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

  connection.query(`
    WITH category_correct_counts AS (
    SELECT 
        j.category,
        COUNT(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_count
    FROM 
        UserAnswers ua JOIN Questions q ON ua.question_id == q.question_id
    GROUP BY 
        j.category
    )

    SELECT 
        CASE WHEN c.correct_count = MAX(correct_count) THEN 'Most Successful' END AS best_category,
        CASE WHEN c.correct_count = MIN(correct_count) THEN 'Least Successful' END AS worst_category
    FROM 
        category_correct_counts c
    WHERE 
        correct_count >= ALL(SELECT correct_count FROM category_correct_counts) 
        OR correct_count <= ALL (SELECT correct_count FROM category_correct_counts


  `, (err, data) => {
    if (err) {
      res.json({})
    } else {
      res.json({
        best_category: '',
        worst_category: ''
      })
    }
  })
}

module.exports = {
  overall_accuracy,
  best_worst_category
}
