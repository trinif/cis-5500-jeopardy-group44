# cis-5500-jeopardy-group44
Description: This website allows Jeopardy enthusiasts and players-to-be to select various categories and difficulty levels and get recommended Jeopardy and General Trivia questions to practice, based on related data. This data includes evidence documents (shown as URLs) and descriptions to learn common associations in categories. The core functionality of this application is to be able to get feedback and view supporting information when answering Jeopardy and General Trivia questions and to be able to see individual and site-wide performance statistics to evaluate how a user is performing in relation to other users.
-- In this website, users can login and follow other users to track their progress. They can also answer random questions in the "Test Yourself" section or select specific questions in "Question Selection". Users can see statistics, both of their performance and overall, in the "Statistics" page.

-- How to Run Locally: --
The backend uses Node.js with Express.js to handle the server logic and database operations; it updates and queries the database using PostgreSQL based on the inputted request and query parameters. To run this application locally, run ‘npm install’ and ‘npm start’ in both the /client and /server directory.

First connect to the PostgreSQL database in DataGrip following the config.json information.

Host: project-group-44.chmdvh9oumy7.us-east-1.rds.amazonaws.com
Port: 5432
User: group44
Password: lylamiatrinisarah266
Database: postgres

Data tables can be accessed in the postgres database.

Then the server should be runnable on [localhost:8080 ](http://localhost:8080/) after running npm start.

The client server should run on localhost:3000.

