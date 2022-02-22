'use strict';
const mysql = require('serverless-mysql')();
const moment = require('moment');

mysql.config({ // LG: where are these env variables defined? Not in the serverless.yml / this codebase at least
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
  if( !voucher ) { // LG: voucher should not be in the request's payload in the first place
    return {...errResponse, body: JSON.stringify({"message": "Param voucher is invalid"})}
  }
  if( !customer_id ) {
    return {...errResponse, body: JSON.stringify({"message": "Param customer_id is invalid"})}
  }

  console.log('BEGIN - Save voucher as used into database');
  await mysql.connect(); // LG: useless, since the query method does this anyway
  const connection = mysql.getClient(); // LG: unused -> useless
  const currentMoment =  moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

  let results = await mysql.transaction() // LG: results is unused => unnecessary variable; Also never overridden, therfor should have been const
  .query('SELECT * FROM vouchers WHERE voucher_code = ? and used = ? LIMIT 1 FOR UPDATE', [voucher, false]) // LG: query should return any voucher code that has not been used yet
  .query((result) => { // LG: can all be done synchronously after awaiting the initial query (reduces complexity) ```const result = await mysql.query('SELECT ...');```
    if (result.length === 0) {
      errResponse = {
        statusCode: 502, // LG: bad gateway?!
        body: JSON.stringify({"message": "Voucher is not valid or had been used!"})
      };
      return null;
    }
    else { // LG: the "else"-keyword is unnecessary as the block above returns
      return ['UPDATE vouchers SET customer_id=?, used = ?, updated_at=? WHERE voucher_code = ?', [customer_id, true, currentMoment, voucher]]; // LG: currentMoment can be replaced with MySQL Function NOW() - removes the momentJS dependency for good
    }
  })
  .rollback(e => {
    console.log('DB record update error: ', e);
    errResponse = {
      statusCode: 502,
      body: JSON.stringify({"message": "Param voucher is invalid"})} // LG: imprecise error message, it doesn't necessarily have to be the "voucher" that is causing the issue?
  })
  .commit();

  await mysql.end(); // LG: see lambdas/worker/importToDB.js:63
  console.log('END - Save voucher as used into database');
  if (errResponse.statusCode === 502) {
    return errResponse;
  }; // LG: semicolon after block scoping curly braces

  const response = { // LG: can be returned immediately
    statusCode: 201,
    body: JSON.stringify(data)
  };
  return response;
};
