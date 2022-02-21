'use strict';
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const csv = require('@fast-csv/parse');
const mysql = require('serverless-mysql')();
const moment = require('moment');
const multipart = require('aws-lambda-multipart-parser');

mysql.config({
  host     : process.env.ENDPOINT,
  database     : process.env.DATABASE,
  user         : process.env.DB_USER,
  password     : process.env.DB_PASSWORD,
});

const insertToDB = async (voucher) => {
  const results = await mysql.query('select * from vouchers;');
  const currentMoment =  moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

  let insertresults = await mysql.transaction()
  .query('INSERT INTO vouchers (voucher_code,created_at) VALUES(?,?)', [voucher,currentMoment])
  .commit();
  return insertresults;
}

/**
 * This lambda read CSV file from S3
 * Then import to AWS RDS (MySQL)
 * @param {*} event: which is triggered by S3's event
 * @returns
 */
exports.handler = async (event) => {
  console.log('Worker: Read CSV and import to database');
  return;
};
