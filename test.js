const express = require('express');
const sql = require('mssql');
const app = express();

// Create a configuration object for the database connection
const config = {
  user: 'BIG_EES_USER',
  password: 'BigEes@2565',
  server: '43.254.133.31',
  database: 'BIG_EES_DB',
  options: {
    encrypt: true, // use SSL encryption
    trustServerCertificate: true // accept the server's SSL certificate
  }
};

// Allow GET requests
app.get('/users', (req, res) => {
  // Open a connection to the database
  
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }

    // Define a SQL query
    const query = "SELECT * FROM [dbo].[user]";

    // Execute the query
    sql.query(query, (err, result) => {
      console.log(result);
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }

      res.send(result.recordset);
    });
  });
});

// Allow POST requests
app.post('/users', (req, res) => {
  // Open a connection to the database
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }

    // Get the user data from the request body
    const { username, password, name, lastname } = req.body;

    // Define a SQL query
    const query = `INSERT INTO user (username, password, name, lastname) VALUES ('${username}', '${password}', '${name}', '${lastname}')`;

    // Execute the query
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }

      res.send('User added successfully');
    });
  });
});

// Allow PUT requests
app.put('/users/:username', (req, res) => {
  // Open a connection to the database
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }

    // Get the username from the request parameters
    const { username } = req.params;

    // Get the user data from the request body
    const { password, name, lastname } = req.body;

    // Define a SQL query
    const query = `UPDATE user SET password = '${password}', name = '${name}', lastname = '${lastname}' WHERE username = '${username}'`;

    // Execute the query
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }

      res.send('User updated successfully');
    });
  });
});

// Allow DELETE requests
app.delete('/delete', (req, res) => {
  // Handle DELETE request here
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});