'use strict';
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const csv = require('@fast-csv/parse');
const mysql = require('serverless-mysql')();
const moment = require('moment');
const multipart = require('aws-lambda-multipart-parser');

mysql.config({
  host         : process.env.ENDPOINT,
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
  const Key = event.Records[0].s3.object.key;

    const s3BucketName = event.Records[0].s3.bucket.name;
    const s3ObjectKey = event.Records[0].s3.object.key;
    console.log("S3 Bucket: " , s3BucketName);
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
      console.log('BEGIN - dumping data to database');
      await mysql.connect();
      await csvParser;
      await mysql.end();
      console.log('END - dumping data to database');
    } catch (error) {
      console.log("Database import error: ", error);
    }

    return;
};
