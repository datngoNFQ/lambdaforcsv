'use strict';
const mysql = require('serverless-mysql')();
const moment = require('moment');

mysql.config({
  host         : process.env.ENDPOINT,
  database     : process.env.DATABASE,
  user         : process.env.DB_USER,
  password     : process.env.DB_PASSWORD,
});

exports.handler = async (event) => {
  const data = JSON.parse(event.body);
  let errResponse = {
    statusCode: 400,
    body: ''
  }

  const {voucher, customer_id} = data;
  if( !voucher ) {
    return {...errResponse, body: JSON.stringify({"message": "Param voucher is invalid"})}
  }
  if( !customer_id ) {
    return {...errResponse, body: JSON.stringify({"message": "Param customer_id is invalid"})}
  }

  console.log('BEGIN - Save voucher as used into database');
  await mysql.connect();
  const connection = mysql.getClient();
  const currentMoment =  moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

  let results = await mysql.transaction()
  .query('SELECT * FROM vouchers WHERE voucher_code = ? and used = ? LIMIT 1 FOR UPDATE', [voucher, false])

  .query((result) => {
    if (result.length === 0) {
      errResponse = {
        statusCode: 502,
        body: JSON.stringify({"message": "Voucher is not valid or had been used!"})
      };
      return null;
    }
    else {
      return ['UPDATE vouchers SET customer_id=?, used = ?, updated_at=? WHERE voucher_code = ?', [customer_id, true, currentMoment, voucher]];
    }
  })
  .rollback(e => {
    console.log('DB record update error: ', e);
    errResponse = {
      statusCode: 502,
      body: JSON.stringify({"message": "Param voucher is invalid"})}
  })
  .commit();

  await mysql.end();
  console.log('END - Save voucher as used into database');
  if (errResponse.statusCode === 502) {
    return errResponse;
  };

  const response = {
    statusCode: 201,
    body: JSON.stringify(data)
  };
  return response;
};
