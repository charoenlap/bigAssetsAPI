const express = require('express');
const { connect, sql } = require('./db');
const app = express();

// Connect to the database
connect();

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
// Allow POST requests to add a new user
app.post('/users', (req, res) => {
  // Open a connection to the database
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }

    // Extract the user data from the request body
    const { id, password, name, lastname } = req.body;

    // Define a SQL query
    const query = `INSERT INTO [dbo].[user] (id, password, name, lastname) VALUES ('${id}', '${password}', '${name}', '${lastname}')`;

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

// Allow PUT requests to update an existing user
app.put('/users/:id', (req, res) => {
  // Open a connection to the database
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }

    // Extract the updated user data from the request body
    const { password, name, lastname } = req.body;

    // Extract the id from the request parameters
    const { id } = req.params;

    // Define a SQL query
    const query = `UPDATE [dbo].[user] SET password = '${password}', name = '${name}', lastname = '${lastname}' WHERE id = '${id}'`;

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
app.delete('/users/:id', (req, res) => {
  // Open a connection to the database
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }

    // Extract the user ID from the request parameters
    const { id } = req.params;

    // Define a SQL query to delete the specified user
    const query = `DELETE FROM [dbo].[user] WHERE id = '${id}'`;

    // Execute the query
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }

      res.send('User deleted successfully');
    });
  });
});

// Start the server
app.listen(3003, () => {
  console.log('Server started on port 3003');
});