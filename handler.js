'use strict';
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const csv = require('@fast-csv/parse');
const mysql = require('serverless-mysql')();
const moment = require('moment');

mysql.config({
  // host     : process.env.ENDPOINT, TODO: using config from rdsconfig.json
  host     : 'voucherdb-instance.coc4ywccjzkl.us-east-1.rds.amazonaws.com',
  database : 'voucher',
  user     : 'admin',
  password : 'voucher123#' // Proposal: Using AWS secret k-v service
});


const insertToDB = async (voucher) => {
  const results = await mysql.query('select * from vouchers;');
  console.log("es6 helper == ", voucher);
  console.log("query result in subfunc == ", results);
  const currentMoment =  moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  console.log("currentMoment == ", currentMoment);

  let insertresults = await mysql.transaction()
  .query('INSERT INTO vouchers (voucher_code,created_at) VALUES(?,?)', [voucher,currentMoment])
  .commit()
  console.log("insertresult == ", insertresults);
}

module.exports.readS3File = async (event) => {
  const Key = event.Records[0].s3.object.key;

    const s3BucketName = event.Records[0].s3.bucket.name;
    const s3ObjectKey = event.Records[0].s3.object.key;
    const params = {
      Bucket: s3BucketName,
      Key: s3ObjectKey,
    };
    const csvFile = s3.getObject(params).createReadStream();

    let csvParser = new Promise((resolve, reject) => {
      const parser = csv
        .parseStream(csvFile, { headers: true })
        .on("data", function (readdata) {
          const { VoucherCode } = readdata;
          insertToDB(VoucherCode);
        })
        .on("end", function () {
          resolve("CSV parsing finished");
        })
        .on("error", function () {
          reject("CSV parsing failed");
        });
    });

    try {
      // BEGIN RDS
      console.log('BEGIN mysql ... ');
      await mysql.connect();
      await csvParser;

      // console.log('BEGIN query');
      // const results = await mysql.query('select * from vouchers;');
      // console.log('END query');
      // console.log(results);
      // const results1 = await mysql.query('select CURRENT_TIMESTAMP');
      // console.log('END query for current timestamp');
      // console.log(results1);
      await mysql.end();
      // END RDS
    } catch (error) {
      console.log("Get Error: ", error);
    }

    return;
};
// TODO
/**
 * 1. count csv rows
 * 2. after import, select count
 * 3. compare count must === between 1 & 2
 * 4. Return report as JSON
 */