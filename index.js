const express = require('express');
const { connect, sql,config } = require('./db');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const { MAX } = require('mssql');
connect();
app.use(cors());
app.use(bodyParser.urlencoded({
  extended:true
}));
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  const request = new sql.Request();
  request.input('PageNum', sql.Int, 1);
  request.input('PageSize', sql.Int, 10);
  request.input('UserIds', sql.NVarChar(sql.MAX), userId);
  request.execute('SelectUser', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('User not found');
    }
    res.send(result.recordset[0]);
  });
});
app.get('/users', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const query = `EXEC [dbo].[SelectUser] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
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
      .execute('AddUser', function(err, returnValue) {
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
          message: message,
          data: values
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
      .execute('UpdateUser');
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
      .execute('DeleteUser', function(err, returnValue) {
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

app.get('/actions/:id', (req, res) => {
  const actionId = req.params.id;
  const request = new sql.Request();
  request.input('PageNum', sql.Int, 1);
  request.input('PageSize', sql.Int, 10);
  request.input('ActionIds', sql.NVarChar(sql.MAX), actionId);
  request.execute('[dbo].[SelectAction]', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('Action not found');
    }
    res.send(result.recordset[0]);
  });
});
app.get('/actions', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const query = `EXEC [dbo].[SelectAction] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
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
app.post('/actions', (req, res) => {
  const { name, path, url } = req.body;
  const values = [name, path, url];
  
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('name', sql.NVarChar(100), name)
      .input('path', sql.NVarChar(100), path)
      .input('url', sql.NVarChar(100), url)
      .output('message', sql.NVarChar(50))
      .execute('AddAction', function(err, returnValue) {
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
          message: message,
          data: values
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
app.put('/actions/:id', (req, res) => {
  const { name, path, url } = req.body;
  const { id } = req.params;
  let message = '';

  sql.connect(config).then(pool => {
    return pool.request()
      .input('action_id', sql.Int, id)
      .input('name', sql.NVarChar(100), name)
      .input('path', sql.NVarChar(100), path)
      .input('url', sql.NVarChar(100), url)
      .output('message', sql.NVarChar(50))
      .execute('UpdateAction');
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
      message: 'An error occurred while updating the action'
    });
  });
});
app.delete('/actions/:id', (req, res) => {
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('action_id', sql.Int, req.params.id)
      .output('message', sql.NVarChar(50))
      .execute('DeleteAction', function(err, returnValue) {
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

app.get('/advances/:id', (req, res) => {
  const advanceId = req.params.id;
  const request = new sql.Request();
  request.input('PageNum', sql.Int, 1);
  request.input('PageSize', sql.Int, 10);
  request.input('AdvanceIds', sql.NVarChar(sql.MAX), advanceId);
  request.execute('[dbo].[SelectAdvance]', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('Advance not found');
    }
    res.send(result.recordset[0]);
  });
});
app.get('/advances', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const query = `EXEC [dbo].[SelectAdvance] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
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
app.post('/advances', (req, res) => {
  const { flag_draff, advance_no, advance_date, status, del, advance_by_user_id, advance_for_user_id, pay_to_id, total_amount, total_base_vat, total_vat, total_withholding_tax, total_withholding_tax_big_absorb, total_expense, direct_to_user_id, note, posting_date, baseline_date, send_sap, finance, account, advance_type_id } = req.body;
  const values = [flag_draff, advance_no, advance_date, status, del, advance_by_user_id, advance_for_user_id, pay_to_id, total_amount, total_base_vat, total_vat, total_withholding_tax, total_withholding_tax_big_absorb, total_expense, direct_to_user_id, note, posting_date, baseline_date, send_sap, finance, account, advance_type_id];

  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('flag_draff', sql.Int, flag_draff)
      .input('advance_no', sql.NVarChar(10), advance_no)
      .input('advance_date', sql.DateTime, advance_date)
      .input('status', sql.Int, status)
      .input('del', sql.Int, del)
      .input('advance_by_user_id', sql.Int, advance_by_user_id)
      .input('advance_for_user_id', sql.Int, advance_for_user_id)
      .input('pay_to_id', sql.Int, pay_to_id)
      .input('total_amount', sql.Float, total_amount)
      .input('total_base_vat', sql.Float, total_base_vat)
      .input('total_vat', sql.Float, total_vat)
      .input('total_withholding_tax', sql.Float, total_withholding_tax)
      .input('total_withholding_tax_big_absorb', sql.Float, total_withholding_tax_big_absorb)
      .input('total_expense', sql.Float, total_expense)
      .input('direct_to_user_id', sql.Int, direct_to_user_id)
      .input('note', sql.NVarChar(sql.MAX), note)
      .input('posting_date', sql.DateTime, posting_date)
      .input('baseline_date', sql.DateTime, baseline_date)
      .input('send_sap', sql.Int, send_sap)
      .input('finance', sql.Int, finance)
      .input('account', sql.Int, account)
      .input('advance_type_id', sql.Int, advance_type_id)
      .output('message', sql.NVarChar(50))
      .execute('AddAdvance', function(err, returnValue) {
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
          message: message,
          data: values
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
app.put('/advances/:id', (req, res) => {
  const { flag_draff, advance_no, advance_date, status, del, advance_by_user_id, advance_for_user_id, pay_to_id, total_amount, total_base_vat, total_vat, total_withholding_tax, total_withholding_tax_big_absorb, total_expense, direct_to_user_id, note, posting_date, baseline_date, send_sap, finance, account, advance_type_id } = req.body;
  const { id } = req.params;
  let message = '';

  sql.connect(config).then(pool => {
    return pool.request()
      .input('advance_id', sql.Int, id)
      .input('flag_draff', sql.Int, flag_draff)
      .input('advance_no', sql.NVarChar(10), advance_no)
      .input('advance_date', sql.DateTime, advance_date)
      .input('status', sql.Int, status)
      .input('del', sql.Int, del)
      .input('advance_by_user_id', sql.Int, advance_by_user_id)
      .input('advance_for_user_id', sql.Int, advance_for_user_id)
      .input('pay_to_id', sql.Int, pay_to_id)
      .input('total_amount', sql.Float, total_amount)
      .input('total_base_vat', sql.Float, total_base_vat)
      .input('total_vat', sql.Float, total_vat)
      .input('total_withholding_tax', sql.Float, total_withholding_tax)
      .input('total_withholding_tax_big_absorb', sql.Float, total_withholding_tax_big_absorb)
      .input('total_expense', sql.Float, total_expense)
      .input('direct_to_user_id', sql.Int, direct_to_user_id)
      .input('note', sql.NVarChar(sql.MAX), note)
      .input('posting_date', sql.DateTime, posting_date)
      .input('baseline_date', sql.DateTime, baseline_date)
      .input('send_sap', sql.Int, send_sap)
      .input('finance', sql.Int, finance)
      .input('account', sql.Int, account)
      .input('advance_type_id', sql.Int, advance_type_id)
      .output('message', sql.NVarChar(50))
      .execute('UpdateAdvance');
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
      message: 'An error occurred while updating the advance'
    });
  });
});
app.delete('/advances/:id', (req, res) => {
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('advance_id', sql.Int, req.params.id)
      .output('message', sql.NVarChar(50))
      .execute('DeleteAdvance', function(err, returnValue) {
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

app.get('/advance-attachments/:id', (req, res) => {
  const attachId = req.params.id;
  const request = new sql.Request();
  request.input('PageNum', sql.Int, 1);
  request.input('PageSize', sql.Int, 10);
  request.input('AdvanceAttachIds', sql.NVarChar(sql.MAX), attachId);
  request.execute('[dbo].[SelectAdvanceAttach]', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('Advance attachment not found');
    }
    res.send(result.recordset[0]);
  });
});
app.get('/advance-attachments', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const query = `EXEC [dbo].[SelectAdvanceAttach] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
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
app.post('/advance-attachments', (req, res) => {
  const { advance_attach_id, name, path, date_create } = req.body;
  const values = [advance_attach_id, name, path, date_create];

  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('advance_attach_id', sql.Int, advance_attach_id)
      .input('name', sql.NVarChar(100), name)
      .input('path', sql.NVarChar(100), path)
      .input('date_create', sql.DateTime, date_create)
      .output('message', sql.NVarChar(50))
      .execute('AddAdvanceAttach', function(err, returnValue) {
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
          message: message,
          data: values
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
app.put('/advances-attachments/:id', (req, res) => {
  const { advance_attach_id, name, path, date_create } = req.body;
  const { id } = req.params;
  let message = '';

  sql.connect(config).then(pool => {
    return pool.request()
      .input('advance_attach_id', sql.Int, advance_attach_id)
      .input('name', sql.NVarChar(100), name)
      .input('path', sql.NVarChar(100), path)
      .input('date_create', sql.DateTime, date_create)
      .input('id', sql.Int, id)
      .output('message', sql.NVarChar(50))
      .execute('UpdateAdvanceAttach');
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
      message: 'An error occurred while updating the advance attachment'
    });
  });
});
app.delete('/advances-attachments/:id', (req, res) => {
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('advance_attach_id', sql.Int, req.params.id)
      .output('message', sql.NVarChar(50))
      .execute('DeleteAdvanceAttach', function(err, returnValue) {
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

app.get('/advance-detail/:id', (req, res) => {
  const attachId = req.params.id;
  const request = new sql.Request();
  request.input('PageNum', sql.Int, 1);
  request.input('PageSize', sql.Int, 10);
  request.input('AdvanceDetailIds', sql.NVarChar(sql.MAX), attachId);
  request.execute('[dbo].[SelectAdvanceDetail]', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('Advance attachment not found');
    }
    res.send(result.recordset[0]);
  });
});
app.get('/advance-detail', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const query = `EXEC [dbo].[SelectAdvanceDetail] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
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
app.post('/advance-detail', (req, res) => {
  const { advance_id, descreption, cost_center, amount, base_vat, vat, absorb, wht, date_create } = req.body;
  const values = [advance_id, descreption, cost_center, amount, base_vat, vat, absorb, wht, date_create];
  
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('advance_id', sql.Int, advance_id)
      .input('descreption', sql.NVarChar(sql.MAX), descreption)
      .input('cost_center', sql.Float, cost_center)
      .input('amount', sql.Float, amount)
      .input('base_vat', sql.Float, base_vat)
      .input('vat', sql.Float, vat)
      .input('absorb', sql.Float, absorb)
      .input('wht', sql.Float, wht)
      .input('date_create', sql.DateTime, date_create)
      .output('message', sql.NVarChar(50))
      .execute('AddAdvanceDetail', function(err, returnValue) {
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
          message: message,
          data: values
        });
    });
  } catch (error) {
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
app.put('/advance-detail/:id', (req, res) => {
  const { advance_id, description, cost_center, amount, base_vat, vat, absorb, wht, date_create } = req.body;
  const { id } = req.params;
  let message = '';

  sql.connect(config).then(pool => {
    return pool.request()
      .input('detail_id', sql.Int, id)
      .input('advance_id', sql.Int, advance_id)
      .input('description', sql.NVarChar(sql.MAX), description)
      .input('cost_center', sql.Float, cost_center)
      .input('amount', sql.Float, amount)
      .input('base_vat', sql.Float, base_vat)
      .input('vat', sql.Float, vat)
      .input('absorb', sql.Float, absorb)
      .input('wht', sql.Float, wht)
      .input('date_create', sql.DateTime, date_create)
      .output('message', sql.NVarChar(50))
      .execute('UpdateAdvanceDetail');
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
      message: 'An error occurred while updating the advance detail'
    });
  });
});
app.delete('/advance-detail/:id', (req, res) => {
  let pool = sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('advance_id', sql.Int, req.params.id)
      .output('message', sql.NVarChar(50))
      .execute('DeleteAdvance', function (err, returnValue) {
        if (err) {
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

app.get('/advance-log/:id', (req, res) => {
  const attachId = req.params.id;
  const request = new sql.Request();
  request.input('PageNum', sql.Int, 1);
  request.input('PageSize', sql.Int, 10);
  request.input('AdvanceLogIds', sql.NVarChar(sql.MAX), attachId);
  request.execute('[dbo].[SelectAdvanceLog]', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('Advance attachment not found');
    }
    res.send(result.recordset[0]);
  });
});
app.get('/advance-log', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const query = `EXEC [dbo].[SelectAdvanceLog] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
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
app.post('/advance-log', (req, res) => {
  const { advance_id, note, date_create } = req.body;
  const values = [advance_id, note, date_create];
  
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('advance_id', sql.Int, advance_id)
      .input('note', sql.NVarChar(sql.MAX), descreption)
      .input('date_create', sql.DateTime, date_create)
      .output('message', sql.NVarChar(50))
      .execute('AddAdvanceLog', function(err, returnValue) {
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
          message: message,
          data: values
        });
    });
  } catch (error) {
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
app.put('/advance-log/:id', (req, res) => {
  const { advance_id, note, date_create } = req.body;
  const { id } = req.params;
  let message = '';

  sql.connect(config).then(pool => {
    return pool.request()
      .input('advance_id', sql.Int, advance_id)
      .input('note', sql.NVarChar(sql.MAX), description)
      .input('date_create', sql.DateTime, date_create)
      .output('message', sql.NVarChar(50))
      .execute('UpdateAdvanceLog');
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
      message: 'An error occurred while updating the advance detail'
    });
  });
});
app.delete('/advance-log/:id', (req, res) => {
  let pool = sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('advance_log_id', sql.Int, req.params.id)
      .output('message', sql.NVarChar(50))
      .execute('DeleteAdvance', function (err, returnValue) {
        if (err) {
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

app.get('/advance-pay-to/:id', (req, res) => {
  const attachId = req.params.id;
  const request = new sql.Request();
  request.input('PageNum', sql.Int, 1);
  request.input('PageSize', sql.Int, 10);
  request.input('AdvancePayToIds', sql.NVarChar(sql.MAX), attachId);
  request.execute('[dbo].[SelectAdvancePayTo]', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('Advance attachment not found');
    }
    res.send(result.recordset[0]);
  });
});
app.get('/advance-pay-to', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const query = `EXEC [dbo].[SelectAdvancePayTo] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
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
app.post('/advance-pay-to', (req, res) => {
  const { advance_id, name, date_create } = req.body;
  const values = [advance_id, name, date_create];
  
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('advance_id', sql.Int, advance_id)
      .input('name', sql.NVarChar(sql.MAX), descreption)
      .input('date_create', sql.DateTime, date_create)
      .output('message', sql.NVarChar(50))
      .execute('AddAdvancePayTo', function(err, returnValue) {
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
          message: message,
          data: values
        });
    });
  } catch (error) {
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
app.put('/advance-pay-to/:id', (req, res) => {
  const { advance_id, note, date_create } = req.body;
  const { id } = req.params;
  let message = '';

  sql.connect(config).then(pool => {
    return pool.request()
      .input('advance_pay_to_id', sql.Int, advance_id)
      .input('name', sql.NVarChar(sql.MAX), description)
      .input('date_create', sql.DateTime, date_create)
      .output('message', sql.NVarChar(50))
      .execute('UpdateAdvancePayTo');
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
      message: 'An error occurred while updating the advance detail'
    });
  });
});
app.delete('/advance-pay-to/:id', (req, res) => {
  let pool = sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('advance_pay_to_id', sql.Int, req.params.id)
      .output('message', sql.NVarChar(50))
      .execute('DeleteAdvance', function (err, returnValue) {
        if (err) {
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

app.get('/advance-type/:id', (req, res) => {
  const attachId = req.params.id;
  const request = new sql.Request();
  request.input('PageNum', sql.Int, 1);
  request.input('PageSize', sql.Int, 10);
  request.input('AdvanceTypeIds', sql.NVarChar(sql.MAX), attachId);
  request.execute('[dbo].[SelectAdvanceType]', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('Advance attachment not found');
    }
    res.send(result.recordset[0]);
  });
});
app.get('/advance-type', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const query = `EXEC [dbo].[SelectAdvanceType] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
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
app.post('/advance-type', (req, res) => {
  const { advance_type_id, name, date_create } = req.body;
  const values = [advance_type_id, name, date_create];
  
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('advance_type_id', sql.Int, advance_type_id)
      .input('name', sql.NVarChar(sql.MAX), descreption)
      .input('date_create', sql.DateTime, date_create)
      .output('message', sql.NVarChar(50))
      .execute('AddAdvanceType', function(err, returnValue) {
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
          message: message,
          data: values
        });
    });
  } catch (error) {
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
app.put('/advance-type/:id', (req, res) => {
  const { advance_type_id, name, date_create } = req.body;
  const { id } = req.params;
  let message = '';

  sql.connect(config).then(pool => {
    return pool.request()
      .input('advance_type_id', sql.Int, advance_type_id)
      .input('name', sql.NVarChar(sql.MAX), description)
      .input('date_create', sql.DateTime, date_create)
      .output('message', sql.NVarChar(50))
      .execute('UpdateAdvanceType');
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
      message: 'An error occurred while updating the advance detail'
    });
  });
});
app.delete('/advance-type/:id', (req, res) => {
  let pool = sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('advance_type_id', sql.Int, req.params.id)
      .output('message', sql.NVarChar(50))
      .execute('DeleteAdvanceType', function (err, returnValue) {
        if (err) {
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

app.get('/expenses/:id', async (req, res) => {
  try {
    const expenseId = req.params.id;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('PageNum', sql.Int, 1)
      .input('PageSize', sql.Int, 10)
      .input('ExpenseIds', sql.NVarChar(sql.MAX), expenseId)
      // .execute('[dbo].[SelectExpense]');
      .execute('[dbo].[SelectTEExpense]');
    
    if (result.recordset.length === 0) {
      return res.status(404).send('Expense not found');
    }
    
    res.send(result.recordset[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error executing stored procedure');
  }
});
app.get('/expenses', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const result = await pool.request()
      .input('PageNum', sql.Int, pageNum)
      .input('PageSize', sql.Int, pageSize)
      // .execute('[dbo].[SelectExpense]');
      .execute('[dbo].[SelectTEExpense]');
    
    res.send(result.recordset);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error executing stored procedure');
  }
});
app.post('/expenses', async (req, res) => {
  const { te_expense_type_id, flag_draft, claim_no, claim_date, initials, amount, km, allowance, status, del, te_expense_by_user_id, te_expense_for_user_id, cost_center_user_id, finance_status, account_status, date_add, expense_type } = req.body;
  const values = [te_expense_type_id, flag_draft, claim_no, claim_date, initials, amount, km, allowance, status, del, te_expense_by_user_id, te_expense_for_user_id, cost_center_user_id, finance_status, account_status, date_add, expense_type];
  
  try {
    const pool = await sql.connect(config);
    let message = "";
    const result = await pool.request()
      .input('te_expense_type_id', sql.Int, te_expense_type_id)
      .input('flag_draft', sql.Int, flag_draft)
      .input('claim_no', sql.NVarChar(10), claim_no)
      .input('claim_date', sql.DateTime, claim_date)
      .input('initials', sql.NVarChar(15), initials)
      .input('amount', sql.Float(53), amount)
      .input('km', sql.Float(53), km)
      .input('allowance', sql.Float(53), allowance)
      .input('status', sql.Int, status)
      .input('del', sql.Int, del)
      .input('te_expense_by_user_id', sql.Int, te_expense_by_user_id)
      .input('te_expense_for_user_id', sql.Int, te_expense_for_user_id)
      .input('cost_center_user_id', sql.Int, cost_center_user_id)
      .input('finance_status', sql.Int, finance_status)
      .input('account_status', sql.Int, account_status)
      .input('date_add', sql.DateTime, date_add)
      .input('expense_type', sql.NVarChar(10), expense_type)
      .output('message', sql.NVarChar(50))
      .execute('[dbo].[AddExpense]');
    
    message = result.output.message;
    res.status(200).json({
      success: true,
      message: message,
      data: values
    });
  } catch (err) {
    console.log(err);
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
app.put('/expenses/:id', async (req, res) => {
  const expenseId = req.params.id;
  const { expense_type_id, flag_draft, claim_no, claim_date, initials, amount, km, allowance, status, del, expense_by_user_id, expense_for_user_id, cost_center_user_id, finance_status, account_status } = req.body;
  const values = [expense_type_id, flag_draft, claim_no, claim_date, initials, amount, km, allowance, status, del, expense_by_user_id, expense_for_user_id, cost_center_user_id, finance_status, account_status];
  
  try {
    const pool = await sql.connect(config);
    let message = "";
    const result = await pool.request()
      .input('te_expense_id', sql.Int, expenseId)
      .input('expense_type_id', sql.Int, expense_type_id)
      .input('flag_draft', sql.Int, flag_draft)
      .input('claim_no', sql.NVarChar(10), claim_no)
      .input('claim_date', sql.DateTime, claim_date)
      .input('initials', sql.NVarChar(15), initials)
      .input('amount', sql.Float(53), amount)
      .input('km', sql.Float(53), km)
      .input('allowance', sql.Float(53), allowance)
      .input('status', sql.Int, status)
      .input('del', sql.Int, del)
      .input('expense_by_user_id', sql.Int, expense_by_user_id)
      .input('expense_for_user_id', sql.Int, expense_for_user_id)
      .input('cost_center_user_id', sql.Int, cost_center_user_id)
      .input('finance_status', sql.Int, finance_status)
      .input('account_status', sql.Int, account_status)
      .output('message', sql.NVarChar(50))
      .execute('[dbo].[UpdateExpense]');
    
    message = result.output.message;
    res.status(200).json({
      success: true,
      message: message,
      data: values
    });
  } catch (err) {
    console.log(err);
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
app.delete('/expenses/:id', async (req, res) => {
  const expenseId = req.params.id;

  try {
    const pool = await sql.connect(config);
    let message = "";
    const result = await pool.request()
      .input('te_expense_id', sql.Int, expenseId)
      .output('message', sql.NVarChar(50))
      .execute('[dbo].[DeleteExpense]');

    message = result.output.message;
    res.status(200).json({
      success: true,
      message: message,
    });
  } catch (err) {
    console.log(err);
    const errorResult = {
      code: 'E0001',
      message: 'An error occurred while deleting data'
    };
    res.status(500).json({
      success: false,
      error: errorResult
    });
  }
});

app.get('/expenses_ees', async (req, res) => {
  try {
    const expenseId = req.params.id;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('PageNum', sql.Int, 1)
      .input('PageSize', sql.Int, 10)
      .input('TEExpenseEEIds', sql.NVarChar(sql.MAX), expenseId)
      .execute('[dbo].[SelectTEExpenseEEs]');
    
    if (result.recordset.length === 0) {
      return res.status(404).send('Expense not found');
    }
    
    res.send(result.recordset[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error executing stored procedure');
  }
});
app.get('/expenses_ees/:id', async (req, res) => {
  try {
    const expenseId = req.params.id;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('PageNum', sql.Int, 1)
      .input('PageSize', sql.Int, 10)
      .input('TEExpenseEEIds', sql.NVarChar(sql.MAX), expenseId)
      .execute('[dbo].[SelectTEExpenseEEs]');
    
    if (result.recordset.length === 0) {
      return res.status(404).send('Expense not found');
    }
    
    // res.send(result.recordset[0]);
    res.send(result.recordset);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error executing stored procedure');
  }
});
app.post('/expenses_ees', async (req, res) => {
  const { te_expense_id, date, cost_center, expense_type, gl_account, sales_org, dc, plant, product, ship_to, work_order_no, wbs_no, network, activity, invoice_date, invoice, vat, total_amount, wht, amount_before_vat, vat_total, big_absorb_wht, amount_withholding_tax, descriptions, additional_notes, date_create } = req.body;
  const values = [te_expense_id, date, cost_center, expense_type, gl_account, sales_org, dc, plant, product, ship_to, work_order_no, wbs_no, network, activity, invoice_date, invoice, vat, total_amount, wht, amount_before_vat, vat_total, big_absorb_wht, amount_withholding_tax, descriptions, additional_notes, date_create];

  
  try {
    const pool = await sql.connect(config);
    let message = "";
    const result = await pool.request()
      // .input('te_expense_id', sql.Int, te_expense_id)
      // .input('date', sql.DateTime, date)
      // .input('type', sql.NVarChar(15), type)
      // .input('invoice', sql.NVarChar(15), invoice)
      // .input('descreption', sql.NVarChar(sql.MAX), descreption)
      // .input('amount', sql.Float(53), amount)
      // .input('vat', sql.Float(53), vat)
      // .input('wht', sql.Float(53), wht)
      // .input('total_amount', sql.Float(53), total_amount)
      // .input('total_base_vat', sql.Float(53), total_base_vat)
      // .input('total_vat', sql.Float(53), total_vat)
      // .input('total_withholding_tax', sql.Float(53), total_withholding_tax)
      // .input('total_withholding_tax_big_absorb', sql.Float(53), total_withholding_tax_big_absorb)
      // .input('total_expense', sql.Float(53), total_expense)
      // .input('date_create', sql.DateTime, date_create)
      .input('te_expense_id', sql.Int, te_expense_id)
      .input('date', sql.DateTime, date)
      .input('cost_center', sql.VarChar(255), cost_center)
      .input('expense_type', sql.VarChar(255), expense_type)
      .input('gl_account', sql.VarChar(255), gl_account)
      .input('sales_org', sql.VarChar(255), sales_org)
      .input('dc', sql.VarChar(255), dc)
      .input('plant', sql.VarChar(255), plant)
      .input('product', sql.VarChar(255), product)
      .input('ship_to', sql.VarChar(255), ship_to)
      .input('work_order_no', sql.VarChar(15), work_order_no)
      .input('wbs_no', sql.VarChar(15), wbs_no)
      .input('network', sql.VarChar(255), network)
      .input('activity', sql.VarChar(255), activity)
      .input('invoice_date', sql.DateTime, invoice_date)
      .input('invoice', sql.VarChar(15), invoice)
      .input('vat', sql.VarChar(15), vat)
      .input('total_amount', sql.VarChar(15), total_amount)
      .input('wht', sql.VarChar(15), wht)
      .input('amount_before_vat', sql.VarChar(15), amount_before_vat)
      .input('vat_total', sql.VarChar(15), vat_total)
      .input('big_absorb_wht', sql.VarChar(15), big_absorb_wht)
      .input('amount_withholding_tax', sql.VarChar(15), amount_withholding_tax)
      .input('descriptions', sql.VarChar(MAX), descriptions)
      .input('additional_notes', sql.VarChar(MAX), additional_notes)
      .input('date_create', sql.DateTime, date_create)
      .output('message', sql.NVarChar(50))
      // .execute('[dbo].[AddTEExpenseEES]');
      .execute('[dbo].[AddExpenseEes]');
    
    message = result.output.message;
    res.status(200).json({
      success: true,
      message: message,
      data: values
    });
  } catch (err) {
    console.log(err);
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
app.put('/expenses_ees/:id', async (req, res) => {
  const expenseId = req.params.id;
  const { expense_type_id, flag_draft, claim_no, claim_date, initials, amount, km, allowance, status, del, expense_by_user_id, expense_for_user_id, cost_center_user_id, finance_status, account_status } = req.body;
  const values = [expense_type_id, flag_draft, claim_no, claim_date, initials, amount, km, allowance, status, del, expense_by_user_id, expense_for_user_id, cost_center_user_id, finance_status, account_status];
  
  try {
    const pool = await sql.connect(config);
    let message = "";
    const result = await pool.request()
      .input('te_expense_id', sql.Int, te_expense_id)
      .input('date', sql.DateTime, date)
      .input('type', sql.NVarChar(15), type)
      .input('invoice', sql.NVarChar(15), invoice)
      .input('descreption', sql.NVarChar(sql.MAX), descreption)
      .input('amount', sql.Float(53), amount)
      .input('vat', sql.Float(53), vat)
      .input('wht', sql.Float(53), wht)
      .input('total_amount', sql.Float(53), total_amount)
      .input('total_base_vat', sql.Float(53), total_base_vat)
      .input('total_vat', sql.Float(53), total_vat)
      .input('total_withholding_tax', sql.Float(53), total_withholding_tax)
      .input('total_withholding_tax_big_absorb', sql.Float(53), total_withholding_tax_big_absorb)
      .input('total_expense', sql.Float(53), total_expense)
      .input('date_create', sql.DateTime, date_create)
      .output('message', sql.NVarChar(50))
      .execute('[dbo].[UpdateTEExpenseEES]');
    
    message = result.output.message;
    res.status(200).json({
      success: true,
      message: message,
      data: values
    });
  } catch (err) {
    console.log(err);
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
app.delete('/expenses_ees/:id', async (req, res) => {
  const expenseId = req.params.id;

  try {
    const pool = await sql.connect(config);
    let message = "";
    const result = await pool.request()
      .input('te_expense_id', sql.Int, expenseId)
      .output('message', sql.NVarChar(50))
      .execute('[dbo].[DeleteTEExpenseEES]');

    message = result.output.message;
    res.status(200).json({
      success: true,
      message: message,
    });
  } catch (err) {
    console.log(err);
    const errorResult = {
      code: 'E0001',
      message: 'An error occurred while deleting data'
    };
    res.status(500).json({
      success: false,
      error: errorResult
    });
  }
});

app.get('/expenses_ees_attach', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('PageNum', sql.Int, 1)
      .input('PageSize', sql.Int, 10)
      .execute('[dbo].[SelectTEExpenseAttachment]');
    
    if (result.recordset.length === 0) {
      return res.status(404).send('Expense not found');
    }
    
    res.send(result.recordset[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error executing stored procedure');
  }
});
app.get('/expenses_ees_attach/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('PageNum', sql.Int, 1)
      .input('PageSize', sql.Int, 10)
      .input('@TEExpenseEEsAttatchIds', sql.NVarChar(sql.MAX), id)
      .execute('[dbo].[SelectTEExpenseAttachment]');
    
    if (result.recordset.length === 0) {
      return res.status(404).send('Expense not found');
    }
    
    res.send(result.recordset[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error executing stored procedure');
  }
});
app.post('/expenses_ees_attach', async (req, res) => {
  const { te_expense_ees_id, name, path, date_create } = req.body;
  const values = [te_expense_ees_id, name, path, date_create];

  try {
    const pool = await sql.connect(config);
    let message = "";
    const result = await pool.request()
    request.input('te_expense_ees_id', sql.Int, te_expense_ees_id)
    .input('name', sql.NVarChar(100), name)
    .input('path', sql.NVarChar(100), path)
    .input('date_create', sql.DateTime, date_create)
    .output('message', sql.NVarChar(50))
    .execute('[dbo].[AddTEExpenseAttachment]');
    
    message = result.output.message;
    res.status(200).json({
      success: true,
      message: message,
      data: values
    });
  } catch (err) {
    console.log(err);
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
app.put('/expenses_ees_attach/:id', async (req, res) => {
  const { id } = req.params;
  const { te_expense_ees_id, name, path, date_create } = req.body;
  const values = [te_expense_ees_id, name, path, date_create];

  try {
    const pool = await sql.connect(config);
    let message = "";
    const result = await pool.request()
      .input('te_expense_ees_attach_id', sql.Int, id)
      .input('name', sql.NVarChar(100), name)
      .input('path', sql.NVarChar(100), path)
      .input('date_create', sql.DateTime, date_create)
      .output('message', sql.NVarChar(50))
      .execute('[dbo].[UpdateTEExpenseAttachment]');
    
    message = result.output.message;
    res.status(200).json({
      success: true,
      message: message,
      data: values
    });
  } catch (err) {
    console.log(err);
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
app.delete('/expenses_ees_attach/:id', async (req, res) => {
  const expenseId = req.params.id;

  try {
    const pool = await sql.connect(config);
    let message = "";
    const result = await pool.request()
      .input('te_expense_id', sql.Int, expenseId)
      .output('message', sql.NVarChar(50))
      .execute('[dbo].[DeleteTEExpenseAttachment]');

    message = result.output.message;
    res.status(200).json({
      success: true,
      message: message,
    });
  } catch (err) {
    console.log(err);
    const errorResult = {
      code: 'E0001',
      message: 'An error occurred while deleting data'
    };
    res.status(500).json({
      success: false,
      error: errorResult
    });
  }
});

app.get('/expenses_log', async (req, res) => {
  try {
    const expenseId = req.params.id;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('PageNum', sql.Int, 1)
      .input('PageSize', sql.Int, 10)
      .input('@@TEExpenseIds', sql.NVarChar(sql.MAX), expenseId)
      .execute('[dbo].[SelectTEExpenseLog]');
    
    if (result.recordset.length === 0) {
      return res.status(404).send('Expense not found');
    }
    
    res.send(result.recordset[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error executing stored procedure');
  }
});
app.get('/expenses_log/:id', async (req, res) => {
  try {
    const expenseId = req.params.id;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('PageNum', sql.Int, 1)
      .input('PageSize', sql.Int, 10)
      .input('@@TEExpenseIds', sql.NVarChar(sql.MAX), expenseId)
      .execute('[dbo].[SelectTEExpenseLog]');
    
    if (result.recordset.length === 0) {
      return res.status(404).send('Expense not found');
    }
    
    res.send(result.recordset[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error executing stored procedure');
  }
});
app.post('/expenses_log', async (req, res) => {
  const { te_expense_id, note, date_create } = req.body;
  const values = [te_expense_id, note, date_create];

  try {
    const pool = await sql.connect(config);
    let message = "";
    const result = await pool.request()
    .input('te_expense_id', sql.Int, te_expense_id)
    .input('note', sql.NVarChar(100), note)
    .input('date_create', sql.DateTime, date_create)
    // .output('te_expense_log_id', sql.Int)
    // .execute('[dbo].[AddTEExpenseLog]');
    .output('message',sql.NVarChar(50))
    .execute('[dbo].[AddExpenseLog]');
    
    message = result.output.message;
    res.status(200).json({
      success: true,
      message: message,
      data: values
    });
  } catch (err) {
    console.log(err);
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
app.put('/expenses_log/:id', async (req, res) => {
  const expenseId = req.params.id;
  const { te_expense_log_id, note, date_create } = req.body;
  const values = [te_expense_id, note, date_create];

  try {
    const pool = await sql.connect(config);
    let message = "";
    const result = await pool.request()
      .input('te_expense_log_id', sql.Int, te_expense_log_id)
      .input('note', sql.NVarChar(100), note)
      .input('date_create', sql.DateTime, date_create)
      .output('message', sql.NVarChar(50))
      .execute('[dbo].[UpdateTEExpenseLog]');
    
    message = result.output.message;
    res.status(200).json({
      success: true,
      message: message,
      data: values
    });
  } catch (err) {
    console.log(err);
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
app.delete('/expenses_log/:id', async (req, res) => {
  const expenseId = req.params.id;

  try {
    const pool = await sql.connect(config);
    let message = "";
    const result = await pool.request()
      .input('te_expense_log_id', sql.Int, expenseId)
      .output('message', sql.NVarChar(50))
      .execute('[dbo].[DeleteTEExpenseLog]');

    message = result.output.message;
    res.status(200).json({
      success: true,
      message: message,
    });
  } catch (err) {
    console.log(err);
    const errorResult = {
      code: 'E0001',
      message: 'An error occurred while deleting data'
    };
    res.status(500).json({
      success: false,
      error: errorResult
    });
  }
});

app.get('/expenses_process/:id', (req, res) => {
  const userId = req.params.id;
  const request = new sql.Request();
  request.input('PageNum', sql.Int, 1);
  request.input('PageSize', sql.Int, 10);
  request.input('UserIds', sql.NVarChar(sql.MAX), userId);
  request.execute('SelectTEExpenseProcess', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('User not found');
    }
    res.send(result.recordset[0]);
  });
});
app.get('/expenses_process', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const query = `EXEC [dbo].[SelectTEExpenseProcess] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
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
app.post('/expenses_process', (req, res) => {
  const { te_expense_id, account_approve, hc_approve } = req.body;
  const values = [te_expense_id, account_approve, hc_approve];
  
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('te_expense_id', sql.Int, te_expense_id)
      .input('account_approve', sql.Int, account_approve)
      .input('hc_approve', sql.Int, hc_approve)
      .output('message', sql.NVarChar(50))
      // .execute('AddTEExpenseProcess', function(err, returnValue) {
      .execute('AddExpenseProcess', function(err, returnValue) {
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
          message: message,
          data: values
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
app.put('/expenses_process/:id', (req, res) => {
  const { te_expense_id, account_approve, hc_approve } = req.body;
  const { id } = req.params;
  let message = '';

  sql.connect(config).then(pool => {
    return pool.request()
      .input('te_expense_process_id', sql.Int, id)
      .input('te_expense_id', sql.Int, te_expense_id)
      .input('account_approve', sql.Int, account_approve)
      .input('hc_approve', sql.Int, hc_approve)
      .output('message', sql.NVarChar(50))
      .execute('UpdateTEExpenseProcess');
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
      message: 'An error occurred while updating the TEExpenseProcess'
    });
  });
});
app.delete('/expenses_process/:id', (req, res) => {
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('te_expense_process_id', sql.Int, req.params.id)
      .output('message', sql.NVarChar(50))
      .execute('DeleteTEExpenseProcess', function(err, returnValue) {
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

app.get('/expenses_travelling/:id', (req, res) => {
  const ExpenseTravellingIds = req.params.id;
  const request = new sql.Request();
  request.input('PageNum', sql.Int, 1);
  request.input('PageSize', sql.Int, 10);
  request.input('ExpenseTravellingIds', sql.NVarChar(sql.MAX), ExpenseTravellingIds);
  // request.execute('SelectTEExpenseTravelling', (err, result) => {
  request.execute('SelectExpenseTravelling', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('TEExpenseTravelling not found');
    }
    // res.send(result.recordset[0]);
    res.send(result.recordset);
  });
});
app.get('/expenses_travelling', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const query = `EXEC [dbo].[SelectTEExpenseTravelling] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
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
app.post('/expenses_travelling', (req, res) => {
  const { te_expense_id, date, objectives, travelling_form, travelling_to, km, cost_all_days, claim, round_trip, unit_rate, request_perdium, total_perdium, date_start, date_end } = req.body;
  const values = [te_expense_id, date, objectives, travelling_form, travelling_to, km, cost_all_days, claim, round_trip, unit_rate, request_perdium, total_perdium, date_start, date_end];
  
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
        .input('te_expense_id', sql.Int, te_expense_id)
        .input('date', sql.DateTime, date)
        .input('objectives', sql.NVarChar(15), objectives)
        .input('travelling_form', sql.NVarChar(15), travelling_form)
        .input('travelling_to', sql.NVarChar(15), travelling_to)
        .input('km', sql.Float(53), km)
        .input('cost_all_days', sql.Float(53), cost_all_days)
        .input('claim', sql.NVarChar(10), claim)
        .input('round_trip', sql.NVarChar(10), round_trip)
        .input('unit_rate', sql.NVarChar(10), unit_rate)
        .input('request_perdium', sql.NVarChar(10), request_perdium)
        .input('total_perdium', sql.NVarChar(10), total_perdium)
        .input('date_start', sql.DateTime, date_start)
        .input('date_end', sql.DateTime, date_end)
        // .output('te_expense_travelling_id', sql.Int)
        // .execute('[dbo].[AddTEExpenseTravelling]');
        .output('message', sql.NVarChar(50))
        .execute('[dbo].[AddExpenseTravelling]');
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
          message: message,
          data: values
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
app.put('/expenses_travelling/:id', (req, res) => {
  const { te_expense_id, date, objectives, travelling_form, travelling_to, km, cost_all_days } = req.body;
  const { id } = req.params;
  let message = '';

  sql.connect(config).then(pool => {
    return pool.request()
      .input('user_id', sql.Int, id)
      .input('te_expenses_travelling_id', sql.Int, id)
      .input('date', sql.DateTime, date)
      .input('objectives', sql.NVarChar(15), objectives)
      .input('travelling_form', sql.NVarChar(15), travelling_form)
      .input('travelling_to', sql.NVarChar(15), travelling_to)
      .input('km', sql.Float(53), km)
      .input('cost_all_days', sql.Float(53), cost_all_days)
      .output('message', sql.NVarChar(50))
      .execute('UpdateTEExpenseTravelling');
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
      message: 'An error occurred while updating the TEExpenseTravelling'
    });
  });
});
app.delete('/expenses_travelling/:id', (req, res) => {
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
      .execute('DeleteTEExpenseTravelling', function(err, returnValue) {
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

app.get('/expenses_travelling_attach/:id', (req, res) => {
  const userId = req.params.id;
  const request = new sql.Request();
  request.input('PageNum', sql.Int, 1);
  request.input('PageSize', sql.Int, 10);
  request.input('ExpenseTravellingAttachIds', sql.NVarChar(sql.MAX), userId);
  request.execute('SelectExpenseTravellingAttachment', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('ExpenseTravellingAttachment not found');
    }
    res.send(result.recordset[0]);
  });
});
app.get('/expenses_travelling_attach', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const query = `EXEC [dbo].[SelectExpenseTravellingAttachment] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
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
app.post('/expenses_travelling_attach', (req, res) => {
  const { request_te_expense_id, name, path, date_create } = req.body;
  const values = [request_te_expense_id, name, path, date_create];
  
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('request_te_expense_id', sql.Int, request_te_expense_id)
      .input('name', sql.NVarChar(15), name)
      .input('path', sql.NVarChar(15), path)
      .input('date_create', sql.DateTime, date_create)
      .output('message', sql.NVarChar(50))
      .execute('AddExpenseTravellingAttachment', function(err, returnValue) {
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
          message: message,
          data: values
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
app.put('/expenses_travelling_attach/:id', (req, res) => {
  const { usergroup_id, position_id, username, password, name, lastname, phone, sex } = req.body;
  const { id } = req.params;
  let message = '';

  sql.connect(config).then(pool => {
    return pool.request()
      .input('te_expense_travelling_attatch_id', sql.Int, id)
      .input('request_te_expense_id', sql.Int, request_te_expense_id)
      .input('name', sql.NVarChar(15), name)
      .input('path', sql.NVarChar(15), path)
      .input('date_create', sql.DateTime, date_create)
      .output('message', sql.NVarChar(50))
      .execute('UpdateExpenseTravellingAttachment');
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
      message: 'An error occurred while updating the ExpenseTravellingAttachment'
    });
  });
});
app.delete('/expenses_travelling_attach/:id', (req, res) => {
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('te_expense_travelling_attatch_id', sql.Int, req.params.id)
      .output('message', sql.NVarChar(50))
      .execute('DeleteExpenseTravellingAttachment', function(err, returnValue) {
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

app.get('/expenses_type/:id', (req, res) => {
  const userId = req.params.id;
  const request = new sql.Request();
  request.input('PageNum', sql.Int, 1);
  request.input('PageSize', sql.Int, 10);
  request.input('ExpenseTypeIds', sql.NVarChar(sql.MAX), userId);
  request.execute('SelectExpenseType', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('ExpenseType not found');
    }
    res.send(result.recordset[0]);
  });
});
app.get('/expenses_type', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const query = `EXEC [dbo].[SelectExpenseType] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
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
app.post('/expenses_type', (req, res) => {
  const { request_te_expense_id, name, date_create } = req.body;
  const values = [request_te_expense_id, name, date_create];
  
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('request_te_expense_id', sql.Int, request_te_expense_id)
      .input('name', sql.NVarChar(15), name)
      .input('path', sql.NVarChar(15), path)
      .input('date_create', sql.DateTime, date_create)    
      .output('message', sql.NVarChar(50))
      .execute('AddExpenseType', function(err, returnValue) {
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
          message: message,
          data: values
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
app.put('/expenses_type/:id', (req, res) => {
  const { request_te_expense_id, name, date_create } = req.body;
  const { id } = req.params;
  let message = '';

  sql.connect(config).then(pool => {
    return pool.request()
      .input('te_expense_type_id', sql.Int, id)
      .input('request_te_expense_id', sql.Int, request_te_expense_id)
      .input('name', sql.NVarChar(15), name)
      .input('path', sql.NVarChar(15), path)
      .input('date_create', sql.DateTime, date_create) 
      .output('message', sql.NVarChar(50))
      .execute('UpdateExpenseType');
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
      message: 'An error occurred while updating the ExpenseType'
    });
  });
});
app.delete('/expenses_type/:id', (req, res) => {
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('te_expense_type_id', sql.Int, req.params.id)
      .output('message', sql.NVarChar(50))
      .execute('DeleteExpenseType', function(err, returnValue) {
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

app.get('/news/:id', (req, res) => {
  const userId = req.params.id;
  const request = new sql.Request();
  request.input('PageNum', sql.Int, 1);
  request.input('PageSize', sql.Int, 10);
  request.input('NewsIds', sql.NVarChar(sql.MAX), userId);
  request.execute('SelectNews', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('User not found');
    }
    res.send(result.recordset[0]);
  });
});
app.get('/news', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const query = `EXEC [dbo].[SelectNews] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
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
app.post('/news', (req, res) => {
  const { news_title, news_detail, seq, del } = req.body;
  const values = [news_title, news_detail, seq, del];
  
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('news_title', sql.NVarChar(255), news_title)
      .input('news_detail', sql.NVarChar(sql.MAX), news_detail)
      .input('seq', sql.Int, seq)
      .input('del', sql.Int, del)
      .output('message', sql.NVarChar(50))
      .execute('AddNews', function(err, returnValue) {
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
          message: message,
          data: values
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
app.put('/news/:id', (req, res) => {
  const { news_title, news_detail, seq, del } = req.body;
  const { id } = req.params;
  let message = '';

  sql.connect(config).then(pool => {
    return pool.request()
      .input('news_id', sql.Int, id)
      .input('news_title', sql.NVarChar(255), news_title)
      .input('news_detail', sql.NVarChar(sql.MAX), news_detail)
      .input('seq', sql.Int, seq)
      .input('del', sql.Int, del)
      .output('message', sql.NVarChar(50))
      .execute('UpdateNews');
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
      message: 'An error occurred while updating the news'
    });
  });
});
app.delete('/news/:id', (req, res) => {
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('news_id', sql.Int, req.params.id)
      .output('message', sql.NVarChar(50))
      .execute('DeleteUser', function(err, returnValue) {
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

app.get('/notification/:id', (req, res) => {
  const request = new sql.Request();
  request.input('PageNum', sql.Int, 1);
  request.input('PageSize', sql.Int, 10);
  request.input('NotificationIds', sql.NVarChar(sql.MAX), req.params.id);
  request.execute('SelectNotification', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('Notification not found');
    }
    res.send(result.recordset[0]);
  });
});
app.get('/notification', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const query = `EXEC [dbo].[SelectNotification] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
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
app.post('/notification', (req, res) => {
  const { notification_id, user_id, title, description, flag_view, date_create } = req.body;
  const values = [notification_id, user_id, title, description, flag_view, date_create];
  
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('user_id', sql.Int, user_id)
      .input('title', sql.NVarChar(100), title)
      .input('description', sql.NVarChar(sql.MAX), description)
      .input('flag_view', sql.Int, flag_view)
      .input('date_create', sql.DateTime, date_create)
      .input('usergroup_id', sql.Int, usergroup_id)
      .input('position_id', sql.Int, position_id)
      .output('message', sql.NVarChar(50))
      .execute('AddNotification', function(err, returnValue) {
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
          message: message,
          data: values
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
app.put('/notification/:id', (req, res) => {
  const { notification_id, user_id, title, description, flag_view, date_create } = req.body;
  const { id } = req.params;
  let message = '';

  sql.connect(config).then(pool => {
    return pool.request()
      .input('notification_id', sql.Int, notification_id)
      .input('user_id', sql.Int, user_id)
      .input('title', sql.NVarChar(100), title)
      .input('description', sql.NVarChar(sql.MAX), description)
      .input('flag_view', sql.Int, flag_view)
      .input('date_create', sql.DateTime, date_create)
      .input('usergroup_id', sql.Int, usergroup_id)
      .input('position_id', sql.Int, position_id)
      .output('message', sql.NVarChar(50))
      .execute('UpdateNotification');
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
      message: 'An error occurred while updating the notification'
    });
  });
});
app.delete('/notification/:id', (req, res) => {
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('notification_id', sql.Int, req.params.id)
      .output('message', sql.NVarChar(50))
      .execute('DeleteNotification', function(err, returnValue) {
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

app.get('/userGroup/:id', (req, res) => {
  const userId = req.params.id;
  const request = new sql.Request();
  request.input('PageNum', sql.Int, 1);
  request.input('PageSize', sql.Int, 10);
  request.input('GroupIds', sql.NVarChar(sql.MAX), userId);
  request.execute('SelectUserGroup', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('User not found');
    }
    res.send(result.recordset[0]);
  });
});
app.get('/userGroup', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const query = `EXEC [dbo].[SelectUserGroup] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
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
app.post('/userGroup', (req, res) => {
  const { group_id, group_name } = req.body;
  const values = [group_id, group_name];
  
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('group_name', sql.NVarChar(15), group_name)
      .execute('AddUserGroup', function(err, returnValue) {
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
          message: message,
          data: values
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
app.put('/userGroup/:id', (req, res) => {
  const { group_name } = req.body;
  const { id } = req.params;
  let message = '';

  sql.connect(config).then(pool => {
    return pool.request()
      .input('group_id', sql.Int, id)
      .input('group_name', sql.NVarChar(50))
      .output('message', sql.NVarChar(50))
      .execute('UpdateUserGroup');
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
app.delete('/userGroup/:id', (req, res) => {
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('group_id', sql.Int, req.params.id)
      .output('message', sql.NVarChar(50))
      .execute('DeletUserGroup', function(err, returnValue) {
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

app.get('/userPermissionPage/:id', (req, res) => {
  const userId = req.params.id;
  const request = new sql.Request();
  request.input('PageNum', sql.Int, 1);
  request.input('PageSize', sql.Int, 10);
  request.input('PermissionPageIds', sql.NVarChar(sql.MAX), userId);
  request.execute('SelectUserPermissionPage', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('User not found');
    }
    res.send(result.recordset[0]);
  });
});
app.get('/userPermissionPage', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const query = `EXEC [dbo].[SelectUserPermissionPage] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
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
app.post('/userPermissionPage', (req, res) => {
  const { permission_page_id, group_id, user_add, user_edit, user_delete } = req.body;
  const values = [permission_page_id, group_id, user_add, user_edit, user_delete];
  
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('permission_page_id', sql.Int, permission_page_id)
      .input('group_id', sql.Int, group_id)
      .input('user_add', sql.NVarChar(15), user_add)
      .input('user_edit', sql.NVarChar(15), user_edit)
      .input('user_delete', sql.NVarChar(15), user_delete)
      .output('message', sql.NVarChar(50))
      .execute('AddUserPermissionPage', function(err, returnValue) {
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
          message: message,
          data: values
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
app.put('/userPermissionPage/:id', (req, res) => {
  const { permission_page_id, group_id, user_add, user_edit, user_delete } = req.body;
  const { id } = req.params;
  let message = '';

  sql.connect(config).then(pool => {
    return pool.request()
      .input('permission_page_id', sql.Int, permission_page_id)
      .input('group_id', sql.Int, group_id)
      .input('user_add', sql.NVarChar(15), user_add)
      .input('user_edit', sql.NVarChar(15), user_edit)
      .input('user_delete', sql.NVarChar(15), user_delete)
      .output('message', sql.NVarChar(50))
      .execute('UpdateUserPermissionPage');
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
app.delete('/userPermissionPage/:id', (req, res) => {
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('permission_page_id', sql.Int, req.params.id)
      .output('message', sql.NVarChar(50))
      .execute('DeleteUserPermissionPage', function(err, returnValue) {
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

app.get('/userPosition/:id', (req, res) => {
  const userId = req.params.id;
  const request = new sql.Request();
  request.input('PageNum', sql.Int, 1);
  request.input('PageSize', sql.Int, 10);
  request.input('PositionIds', sql.NVarChar(sql.MAX), userId);
  request.execute('SelectUserPosition', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('User not found');
    }
    res.send(result.recordset[0]);
  });
});
app.get('/userPosition', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const query = `EXEC [dbo].[SelectUserPosition] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
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
app.post('/userPosition', (req, res) => {
  const { position_id, privilege_level, position_name, max_withdraw, max_approve } = req.body;
  const values = [position_id, privilege_level, position_name, max_withdraw, max_approve];
  
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('position_id', sql.Int, position_id)
      .input('privilege_level', sql.Int, privilege_level)
      .input('position_name', sql.NVarChar(15), position_name)
      .input('max_withdraw', sql.Float, max_withdraw)
      .input('max_approve', sql.Float, max_approve)
      .output('message', sql.NVarChar(50))
      .execute('AddUserPosition', function(err, returnValue) {
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
          message: message,
          data: values
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
app.put('/userPosition/:id', (req, res) => {
  const { position_id, privilege_level, position_name, max_withdraw, max_approve } = req.body;
  const { id } = req.params;
  let message = '';

  sql.connect(config).then(pool => {
    return pool.request()
      .input('position_id', sql.Int, position_id)
      .input('privilege_level', sql.Int, privilege_level)
      .input('position_name', sql.NVarChar(15), position_name)
      .input('max_withdraw', sql.Float, max_withdraw)
      .input('max_approve', sql.Float, max_approve)
      .output('message', sql.NVarChar(50))
      .execute('UpdateUserPosition');
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
app.delete('/userPosition/:id', (req, res) => {
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('position_id', sql.Int, req.params.id)
      .output('message', sql.NVarChar(50))
      .execute('DeleteUserPosition', function(err, returnValue) {
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

// new flash
// Gl Account
app.get('/glAccount/:id', (req, res) => {
  const expense_type = req.params.id;
  const request = new sql.Request();
  request.input('expense_type', sql.NVarChar(255), expense_type);
  request.execute('SelectGlAccount', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('GL Account not found');
    }
    res.send(result.recordset);
  });
});

// Cost Center
app.get('/costCenter', (req, res) => {
  const request = new sql.Request();
  request.execute('SelectCostCenter', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('GL Account not found');
    }
    res.send(result.recordset);
  });
});


// select te 
app.get('/selectTEprocessUser/:id', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "SELECT a.*,b.account_approve as status_account,b.hc_approve as status_hc FROM dbo.db_te_expense a LEFT JOIN dbo.db_te_expense_process b ON a.te_expense_id = b.te_expense_id";
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
app.get('/selectTEprocess/:account_approve/:hc_approve', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const account_approve = req.params.account_approve;
    const hc_approve = req.params.hc_approve;
    const query = "SELECT a.* FROM dbo.db_te_expense a LEFT JOIN dbo.db_te_expense_process b ON a.te_expense_id = b.te_expense_id WHERE a.flag_draft = 0 AND b.account_approve ="+account_approve+" AND b.hc_approve ="+hc_approve+"";
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
app.get('/approveTEprocess/:id/:account_approve/:hc_approve', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const te_expense_id = req.params.id;
    const account_approve = req.params.account_approve;
    const hc_approve = req.params.hc_approve;
    const query = "UPDATE db_te_expense_process SET account_approve = "+account_approve+", hc_approve = "+hc_approve+" WHERE te_expense_id ="+te_expense_id+"";
    sql.query(query, (err, result) => {
      console.log(result);
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.rowsAffected);
    });
  });
});

app.listen(3003, () => {
  console.log('Server started on port 3003');
});