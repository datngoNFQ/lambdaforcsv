'use strict'; // why commonjs and no es6 imports?
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const csv = require('@fast-csv/parse');
const mysql = require('serverless-mysql')();
const moment = require('moment');
const multipart = require('aws-lambda-multipart-parser'); // LG: unused

mysql.config({
  host         : process.env.ENDPOINT,
  database     : process.env.DATABASE,
  user         : process.env.DB_USER,
  password     : process.env.DB_PASSWORD,
});

const insertToDB = async (voucher) => {
  const results = await mysql.query('select * from vouchers;'); // LG: unused variable and therefor useless database query
  const currentMoment =  moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

  let insertresults = await mysql.transaction() // LG: can be returned immediately
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
  const Key = event.Records[0].s3.object.key; // LG: duplicate variable - this one is not even used

    const s3BucketName = event.Records[0].s3.bucket.name;
    const s3ObjectKey = event.Records[0].s3.object.key; // LG: duplicate variable (ll. 34)
    const params = {
      Bucket: s3BucketName,
      Key: s3ObjectKey,
    };
    const csvFile = s3.getObject(params).createReadStream();

    let csvParser = new Promise((resolve, reject) => { // LG: Why are you wrapping this in a Promise? Can't this just be a plain synchronous method call
      const parser = csv // LG: unused variable
        .parseStream(csvFile, { headers: true })
        .on("data", function (readdata) {
          const { VoucherCode } = readdata;
          insertToDB(VoucherCode); // LG: don't execute a transaction on EVERY record. Gather all and do one request maybe?
        })
        .on("end", function () {
          resolve("CSV parsing finished"); // LG: responses are not used
        })
        .on("error", function () {
          reject("CSV parsing failed"); // LG: responses are not used
        });
    });

    try {
      console.log('BEGIN - dumping data to database');
      await mysql.connect(); // LG: useless
      await csvParser;
      await mysql.end(); // LG: would suggest to use quit() to ensure the connection is terminated
      console.log('END - dumping data to database');
    } catch (error) {
      console.log("Database import error: ", error);
    }

    return; // LG: useless return statement
};
