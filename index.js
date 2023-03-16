const express = require('express');
const { connect, sql,config } = require('./db');
const app = express();
const bodyParser = require("body-parser")
connect();
app.use(bodyParser.urlencoded({
  extended:true
}));
app.get('/users', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const query = "SELECT * FROM [dbo].[user]";
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
app.post('/users', async (req, res) => {
  try {
    const inputs = req.body;
    const pool = sql.connect(config);
    const request = pool.request();
    const output = { message: sql.NVarChar(50) };

    for (const [key, value] of Object.entries(inputs)) {
      request.input(key, sql.NVarChar(value.length), value);
    }

    request.output('message', sql.NVarChar(50));

    const result = await request.execute('InsertUser');

    const message = result.output.message;
    const values = [usergroup_id, position_id, username, password, name, lastname, phone, sex, date_create];
    res.status(200).json({
      success: true,
      message: message,
      data: values
    });
  } catch (err) {
    console.log(err);
    const errorResult = {
      code: 'E0001',
      message: 'An error occurred while inserting data'
    };
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
      res.status(500).json({
        success: false,
        error: errorResult
      });
  }
});

app.listen(3003, () => {
  console.log('Server started on port 3003');
});