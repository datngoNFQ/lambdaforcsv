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
  const currentMoment =  moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

  let insertresults = await mysql.transaction()
  .query('INSERT INTO vouchers (voucher_code,created_at) VALUES(?,?)', [voucher,currentMoment])
  .commit();
  return insertresults;
}

module.exports.applyvoucher = async (event) => {
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

  console.log('Begin processing');
  await mysql.connect();
  const connection = mysql.getClient();
  const currentMoment =  moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

  let results = await mysql.transaction()
  .query('SELECT * FROM vouchers WHERE voucher_code = ? and used = ? LIMIT 1 FOR UPDATE', [voucher, false])
  // .query('UPDATE vouchers SET customer_id=?, used = ?, updated_at=? WHERE voucher_code = ?', [customer_id, true, currentMoment, voucher])
  .query((r) => {
    console.log("r == ",r);
    if (r.length === 0) {
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
  console.log('End processing');
  console.log('errResponse == ', errResponse);
  if (errResponse.statusCode === 502) {
    return errResponse;
  };

  const response = {
    statusCode: 201,
    body: JSON.stringify(data)
  };
  return response;
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
      console.log('Begin processing');
      await mysql.connect();
      await csvParser;
      await mysql.end();
      console.log('End processing');
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