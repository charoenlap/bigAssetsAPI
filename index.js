const express = require('express');
const { connect, sql,config } = require('./db');
const app = express();
const bodyParser = require("body-parser")
// Connect to the database
connect();
app.use(bodyParser.urlencoded({
  extended:true
}));
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
  const { usergroup_id, position_id, username, password, name, lastname, phone, sex, date_create } = req.body;
  const values = [usergroup_id, position_id, username, password, name, lastname, phone, sex, date_create];
  
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('usergroup_id', sql.Int, usergroup_id)
      .input('position_id', sql.Int, position_id)
      .input('username', sql.NVarChar(15), username)
      .input('password', sql.NVarChar(15), password)
      .input('name', sql.NVarChar(20), name)
      .input('lastname', sql.NVarChar(30), lastname)
      .input('phone', sql.NVarChar(10), phone)
      .input('sex', sql.NVarChar(2), sex)
      .output('message', sql.NVarChar(50))
      .execute('InserUser', function(err, returnValue) {
        if (err){
          const errorResult = {
            code: 'E0001',
            message: err
          };
        
          // Send the error response as a JSON object
          res.status(500).json({
            success: false,
            error: errorResult
          });
        }
        console.log(returnValue);
        message = returnValue.output.message;
        res.status(200).json({
          success: true,
          message: message,
          data: values
        });
    });
  } catch (error) {
      const errorResult = {
        code: 'E0001',
        message: 'An error occurred while retrieving data'
      };
    
      // Send the error response as a JSON object
      res.status(500).json({
        success: false,
        error: errorResult
      });
  }
});

app.put('/users/:id', (req, res) => {
  const { usergroup_id, position_id, username, password, name, lastname, phone, sex } = req.body;
  const { id } = req.params;
  let message = '';

  sql.connect(config).then(pool => {
    return pool.request()
      .input('user_id', sql.Int, id)
      .input('usergroup_id', sql.Int, usergroup_id)
      .input('position_id', sql.Int, position_id)
      .input('username', sql.NVarChar(15), username)
      .input('password', sql.NVarChar(15), password)
      .input('name', sql.NVarChar(20), name)
      .input('lastname', sql.NVarChar(30), lastname)
      .input('phone', sql.NVarChar(10), phone)
      .input('sex', sql.NVarChar(2), sex)
      .output('message', sql.NVarChar(50))
      .execute('UserUpdate');
  }).then(result => {
    message = result.output.message;
    res.status(200).json({
      success: true,
      message: message
    });
  }).catch(err => {
    console.log(err);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the user'
    });
  });
});


app.delete('/users/:id', (req, res) => {
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('user_id', sql.Int, req.params.id)
      .output('message', sql.NVarChar(50))
      .execute('UserDelete', function(err, returnValue) {
        if (err){
          const errorResult = {
            code: 'E0001',
            message: err
          };
        
          // Send the error response as a JSON object
          res.status(500).json({
            success: false,
            error: errorResult
          });
        }
        console.log(returnValue);
        message = returnValue.output.message;
        res.status(200).json({
          success: true,
          message: message
        });
    });
  } catch (error) {
      const errorResult = {
        code: 'E0001',
        message: 'An error occurred while retrieving data'
      };
    
      // Send the error response as a JSON object
      res.status(500).json({
        success: false,
        error: errorResult
      });
  }
});


// Start the server
app.listen(3003, () => {
  console.log('Server started on port 3003');
});